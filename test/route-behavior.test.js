const test = require('node:test');
const assert = require('node:assert/strict');
const { loadWithMocks } = require('./support/route-test-helpers');
const AuthenticateUser = require('../src/application/auth/AuthenticateUser');
const RegisterUser = require('../src/application/auth/RegisterUser');
const UpdateProfile = require('../src/application/profile/UpdateProfile');
const ManageShowtimes = require('../src/application/admin/ManageShowtimes');
const GetSalesSummary = require('../src/application/admin/GetSalesSummary');
const BookSeats = require('../src/application/booking/BookSeats');
const TicketReservation = require('../src/domain/booking/TicketReservation');
const createBookingController = require('../src/interfaces/http/controllers/bookingController');

test('authentication use case handles admin, confirmed and unconfirmed accounts', async () => {
    const users = {
        findByEmail: async email => email === 'confirmed@example.com'
            ? { id: 27, passwordHash: 'hash', emailConfirmed: true }
            : email === 'pending@example.com'
                ? { id: 28, passwordHash: 'hash', emailConfirmed: false }
                : null,
    };
    const authenticate = new AuthenticateUser({
        users,
        verifyPassword: async (password, hash) => password === 'secret' && hash === 'hash',
    });

    assert.deepEqual(await authenticate.execute({ email: 'Admin123@gmail.com', password: '123456' }), { kind: 'admin' });
    assert.deepEqual(await authenticate.execute({ email: 'confirmed@example.com', password: 'secret' }), {
        kind: 'authenticated', userId: 27,
    });
    assert.deepEqual(await authenticate.execute({ email: 'pending@example.com', password: 'secret' }), { kind: 'unconfirmed' });
    assert.deepEqual(await authenticate.execute({ email: 'missing@example.com', password: 'secret' }), { kind: 'invalid-credentials' });
});

test('registration use case checks uniqueness, hashes passwords and emails a code', async () => {
    const created = [];
    const sent = [];
    const register = new RegisterUser({
        users: {
            findByEmail: async email => email === 'used@example.com' ? { id: 1 } : null,
            findByPhone: async phone => phone === '111' ? { id: 2 } : null,
            create: async account => { created.push(account); return { id: 3, ...account }; },
        },
        hashPassword: async password => `hash:${password}`,
        sendEmail: async (...args) => sent.push(args),
        generateCode: () => 'A1b2C3d4E5',
    });

    assert.equal((await register.execute({ email: 'used@example.com' })).kind, 'email-taken');
    assert.equal((await register.execute({ email: 'new@example.com', phone: '111' })).kind, 'phone-taken');
    const result = await register.execute({ email: 'new@example.com', password: 'secret', name: 'A', phone: '222' });
    assert.equal(result.kind, 'registered');
    assert.equal(created[0].passwordHash, 'hash:secret');
    assert.equal(created[0].verificationCode, 'A1b2C3d4E5');
    assert.equal(sent.length, 1);
});

test('profile update use case maps password changes through the hasher', async () => {
    const updates = [];
    const profile = new UpdateProfile({
        profiles: { updateField: async (...args) => updates.push(args) },
        hashPassword: async password => `hashed:${password}`,
    });

    assert.deepEqual(await profile.execute({ userId: null, field: 'name', value: 'A' }), { kind: 'unauthenticated' });
    await profile.execute({ userId: 7, field: 'password', value: 'secret' });
    assert.deepEqual(updates, [[7, 'passwordHash', 'hashed:secret']]);
});

test('profile update use case accepts only the known account fields', async () => {
    const updates = [];
    const profile = new UpdateProfile({
        profiles: { updateField: async (...args) => updates.push(args) },
        hashPassword: async value => value,
    });
    for (const field of ['name', 'phone', 'email', 'address']) {
        assert.deepEqual(await profile.execute({ userId: 8, field, value: field }), { kind: 'updated' });
    }
    assert.deepEqual(await profile.execute({ userId: 8, field: 'unknown', value: 'x' }), { kind: 'invalid-field' });
    assert.deepEqual(updates, [[8, 'name', 'name'], [8, 'phone', 'phone'], [8, 'email', 'email'], [8, 'address', 'address']]);
});

test('showtime use case validates input and rejects duplicates', async () => {
    const created = [];
    const showtimes = new ManageShowtimes({
        showtimes: {
            findDuplicate: async () => ({ id: 1 }),
            create: async values => created.push(values),
        },
    });
    assert.deepEqual(await showtimes.create({ cinemaId: 1, date: '', timeShowId: 2, filmId: 3 }), { kind: 'invalid' });
    assert.deepEqual(await showtimes.create({ cinemaId: 1, date: '2026-10-16', timeShowId: 2, filmId: 3 }), { kind: 'duplicate' });
    assert.equal(created.length, 0);
});

test('sales summary aggregates cinema sales into the corresponding cineplex', async () => {
    const dashboard = new GetSalesSummary({ dashboard: { getSales: async () => ({
        filmSales: [{ CinemaTimeShow: { film_ID: 11 }, dataValues: { TongTien: '150', SoVeBanDuoc: '3' } }],
        cinemaSales: [{ CinemaTimeShow: { cinema_ID: 21 }, dataValues: { TongTien: '150', SoVeBanDuoc: '3' } }],
        films: [{ film_ID: 11, film_Name: 'Film' }],
        cinemas: [{ cinema_ID: 21, cinema_Name: 'Cinema', CineplexCineplexID: 31 }],
        cineplexes: [{ cineplex_ID: 31, cineplex_Name: 'Cineplex' }],
    }) } });
    const result = await dashboard.execute(new Date('2026-10-01'), new Date('2026-10-31'));
    assert.equal(result.thuocTinhFilm[0].TotalMoney_film, 150);
    assert.equal(result.thuocTinhCumRap[0].TotalMoney_cineplex, 150);
    assert.equal(result.thuocTinhCumRap[0].CountTicket_cineplex, 3);
});

test('booking controller sends unauthenticated visitors to the login view', async () => {
    const controller = createBookingController({
        getSeatAvailability: { execute: async () => { throw new Error('should not load seats'); } },
        authenticateBookingUser: {},
        bookSeats: {},
        bookings: {},
    });
    const response = { calls: [], render(view) { this.calls.push(view); } };
    await controller.showSeats({ session: {}, params: { id: '4' } }, response);
    assert.deepEqual(response.calls, ['auth/login.ejs']);
});

test('book seats creates a reservation and sends confirmation email', async () => {
    const savedReservations = [];
    const sentEmails = [];
    const booking = new BookSeats({
        bookings: {
            getBookingContext: async () => ({
                date: '2026-10-16',
                startTime: '12:00',
                film: { name: 'Film' },
                cinema: { name: 'Cinema', cineplexName: 'Cineplex' },
            }),
            findUserById: async () => ({ email: 'user@example.com' }),
            findLatestTicketNumber: async () => 4,
            createTicket: async reservation => savedReservations.push(reservation),
            findShowtime: async () => ({ id: 10 }),
        },
        sendEmail: async (...message) => sentEmails.push(message),
    });

    const result = await booking.execute({
        userId: 9,
        showtimeId: 10,
        chair: 'A1',
        chairType: 'Standard',
        totalMoney: '120000',
    });
    assert.equal(savedReservations[0] instanceof TicketReservation, true);
    assert.equal(savedReservations[0].code, 'VNC_CCF95');
    assert.equal(result.txtMave, 'VNC_CCF95');
    assert.equal(sentEmails[0][0], 'user@example.com');
    assert.match(sentEmails[0][2], /16\/10\/2026/);
});

test('ticket reservation keeps domain values immutable', () => {
    const reservation = new TicketReservation({
        code: 'VNC_X', userId: 1, showtimeId: 2, seats: 'A1', seatType: 'Standard', totalPrice: 100,
    });
    assert.equal(reservation.seats, 'A1');
    assert.equal(Object.isFrozen(reservation), true);
});

test('all HTTP router modules still register their public endpoints', () => {
    const routeModules = [
        'routes/home/pages.js', 'routes/home/films.js', 'routes/home/booking.js',
        'routes/Login.js', 'routes/signUp.js', 'routes/forgotPassword.js', 'routes/updateInfo.js',
        'routes/admin/dashboard.js', 'routes/admin/cinemas.js', 'routes/admin/cineplexes.js',
        'routes/admin/films.js', 'routes/admin/showtimes.js', 'routes/admin/users.js',
    ];
    for (const modulePath of routeModules) {
        const router = loadWithMocks(modulePath, {
            bcrypt: { compare: async () => false, hash: async value => value },
            nodemailer: { createTransport: () => ({ sendMail: async () => ({}) }) },
            formidable: { IncomingForm: class IncomingForm {} },
        });
        assert.ok(router.stack.some(layer => layer.route), `${modulePath} registers at least one route`);
    }
});
