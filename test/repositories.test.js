const test = require('node:test');
const assert = require('node:assert/strict');
const UserRepository = require('../src/infrastructure/persistence/sequelize/UserRepository');
const FilmRepository = require('../src/infrastructure/persistence/sequelize/FilmRepository');
const ProfileRepository = require('../src/infrastructure/persistence/sequelize/ProfileRepository');
const ShowtimeRepository = require('../src/infrastructure/persistence/sequelize/ShowtimeRepository');
const BookingRepository = require('../src/infrastructure/persistence/sequelize/BookingRepository');
const { BookingRepositoryError } = BookingRepository;
const AdminCatalogRepository = require('../src/infrastructure/persistence/sequelize/AdminCatalogRepository');
const AdminDashboardRepository = require('../src/infrastructure/persistence/sequelize/AdminDashboardRepository');
const HomeRepository = require('../src/infrastructure/persistence/sequelize/HomeRepository');

function model(overrides = {}) {
    const calls = [];
    const instance = {};
    for (const method of ['findAll', 'findOne', 'create', 'update', 'destroy', 'sum', 'max', 'increment']) {
        instance[method] = async (...args) => {
            calls.push([method, ...args]);
            if (typeof overrides[method] === 'function') return overrides[method](...args);
            return Object.prototype.hasOwnProperty.call(overrides, method) ? overrides[method] : [];
        };
    }
    instance.calls = calls;
    return instance;
}

test('user repository maps model records and writes account fields', async () => {
    const User = model({ findOne: { dataValues: {
        user_ID: 2, user_Email: 'a@b', user_Password: 'hash', user_Name: 'A', user_NumberPhone: '1',
        user_Address: 'x', user_Code: 'c', accept_User: true,
    } }, create: { user_ID: 3, user_Email: 'c@d' } });
    const users = new UserRepository(User);
    assert.equal((await users.findByEmail('a@b')).id, 2);
    assert.equal(await users.findById(2).then(u => u.emailConfirmed), true);
    assert.equal(await users.findByPhone('1').then(u => u.phone), '1');
    assert.equal(await users.findByEmailAndCode('a@b', 'c').then(u => u.verificationCode), 'c');
    assert.equal(await users.findByEmail('none').then(user => user.id), 2); // the stub returns a record for every lookup
    await users.create({ email: 'c@d', passwordHash: 'p', name: 'C', phone: '2', address: 'y', verificationCode: 'z' });
    await users.confirmEmail('c@d');
    await users.setVerificationCode('c@d', 'z');
    await users.updatePassword('c@d', 'p');
    assert.deepEqual(User.calls.at(-1), ['update', { user_Password: 'p' }, { where: { user_Email: 'c@d' } }]);
    assert.equal(User.calls.some(call => call[0] === 'create' && call[1].user_Code === 'z'), true);
});

test('film, profile and catalog repositories map CRUD filters and summaries', async () => {
    const Film = model();
    const films = new FilmRepository(Film);
    await films.listAll(); await films.create({ film_Name: 'A' }); await films.update(2, { film_Name: 'B' }); await films.delete(3);
    assert.deepEqual(Film.calls.map(call => call[0]), ['findAll', 'create', 'update', 'destroy']);

    const User = model(); const Ticket = model({ sum: 55 }); const profiles = new ProfileRepository({ User, Ticket, CinemaTimeShow: {}, TimeShow: {}, Film: {}, Cinema: {}, Cineplex: {} });
    await profiles.findUserById(4); await profiles.updateField(4, 'phone', '123'); await profiles.getTicketSummary(4);
    assert.deepEqual(User.calls[1], ['update', { user_NumberPhone: '123' }, { where: { user_ID: 4 } }]);
    await assert.rejects(Promise.resolve().then(() => profiles.updateField(4, 'unknown', 'x')), /Unsupported profile field/);
    assert.deepEqual(await profiles.getTicketSummary(4), { totalMoney: 55, tickets: [] });

    const Cinema = model(), Cineplex = model(); const catalog = new AdminCatalogRepository({ User, Cinema, Cineplex });
    await catalog.listUsers(); await catalog.updateUser(1, {}); await catalog.deleteUser(1); await catalog.listCinemas();
    await catalog.listCineplexes(); await catalog.findCineplex(1); await catalog.createCinema({}); await catalog.updateCinema(1, {});
    await catalog.deleteCinema(1); await catalog.createCineplex({}); await catalog.updateCineplex(1, {}); await catalog.deleteCineplex(1);
    assert.equal(Cinema.calls.length, 4); assert.equal(Cineplex.calls.length, 5);
});

test('showtime and booking repositories include relationships and map booking context', async () => {
    const CinemaTimeShow = model({
        findOne: { dataValues: { cinemaTimeShow_ID: 8, cinemaTimeShow_Date: '2026-10-16',
            Cinema: { cinema_Name: 'C', Cineplex: { cineplex_Name: 'P' } },
            Film: { film_ID: 2, film_Name: 'F' }, TimeShow: { timeShow_Start: '12:00' } } },
    });
    const Cinema = model(), Film = model(), TimeShow = model(), Ticket = model({ max: 9, create: { ok: true } }), User = model({ findOne: null });
    const showtimes = new ShowtimeRepository({ Cinema, Film, TimeShow, CinemaTimeShow });
    await showtimes.listByCinema(1); await showtimes.listByFilm(2); await showtimes.listCinemas(1); await showtimes.listCinemas();
    await showtimes.listTimes(); await showtimes.listPublicFilms(); await showtimes.findFilm(2); await showtimes.findDuplicate({ cinemaId: 1, date: 'd', timeShowId: 2 });
    await showtimes.create({}); await showtimes.delete(3);
    assert.equal(CinemaTimeShow.calls.length, 5);

    const bookings = new BookingRepository({ User, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow, Ticket });
    assert.equal(await bookings.getBookingContext(8).then(context => context.cinema.cineplexName), 'P');
    await bookings.findTicketsForShowtime(8); await bookings.findLatestTicketNumber(4);
    await bookings.createTicket({ code: 'VNC_A', seats: 'A1', seatType: 'Std', totalPrice: 12, showtimeId: 8, userId: 4 });
    assert.equal(Ticket.calls.some(call => call[0] === 'create' && call[1].ticket_ID === 'VNC_A'), true);
});

test('home and dashboard repositories execute their query groups', async () => {
    const Film = model({ findOne: null }), User = model({ findOne: null }), Cinema = model(), Cineplex = model(), TimeShow = model(), CinemaTimeShow = model();
    const home = new HomeRepository({ Film, User, Cinema, Cineplex, TimeShow, CinemaTimeShow });
    assert.equal(await home.findCurrentUser(null), undefined);
    await home.getHomePageData(1); await home.searchFilms('A', 1); await home.getFilmList(1); await home.incrementFilmViews(2); await home.getFilmDetails(2, 1);
    assert.equal(Film.calls.some(call => call[0] === 'increment'), true);
    assert.equal(CinemaTimeShow.calls.length, 1);
    const Ticket = model(); const dashboard = new AdminDashboardRepository({ Ticket, Cinema, Cineplex, Film, CinemaTimeShow });
    const result = await dashboard.getSales(new Date(0), new Date());
    assert.deepEqual(Object.keys(result), ['filmSales', 'cinemaSales', 'films', 'cinemas', 'cineplexes']);
    assert.equal(Ticket.calls.length, 2);
});

test('booking repository reports invalid IDs, missing booking data, and persistence errors', async () => {
    const empty = model({ findOne: () => null, findAll: [], max: null });
    const repository = new BookingRepository({
        User: empty, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow: empty, Ticket: empty,
    });

    assert.throws(() => repository.findShowtime(0), error => error instanceof BookingRepositoryError
        && error.code === 'INVALID_ID');
    await assert.rejects(repository.getBookingContext(999), error => error.code === 'SHOWTIME_NOT_FOUND');
    assert.throws(() => repository.findTicketsForShowtime(-1), error => error.code === 'INVALID_ID');
    assert.throws(() => repository.findLatestTicketNumber('abc'), error => error.code === 'INVALID_ID');
    assert.throws(() => repository.createTicket(null), error => error.code === 'INVALID_RESERVATION');
    assert.throws(() => repository.createTicket({ userId: 1, showtimeId: 1 }), error => error.code === 'INVALID_RESERVATION');
    assert.throws(() => repository.createTicket({
        code: 'VNC_X', userId: 1, showtimeId: 1, seats: 'A1', seatType: 'Standard', totalPrice: 'invalid',
    }), error => error.code === 'INVALID_RESERVATION');

    const incomplete = model({ findOne: { cinemaTimeShow_ID: 7 } });
    const incompleteRepository = new BookingRepository({
        User: empty, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow: incomplete, Ticket: empty,
    });
    await assert.rejects(incompleteRepository.getBookingContext(7), error => error.code === 'BOOKING_CONTEXT_INCOMPLETE');
    const missingField = model({ findOne: {
        cinemaTimeShow_ID: 8,
        cinemaTimeShow_Date: '2026-10-17',
        Cinema: { cinema_Name: 'Cinema', Cineplex: { cineplex_Name: 'Cineplex' } },
        Film: { film_ID: 2, film_Name: ' ' },
        TimeShow: { timeShow_Start: '12:00' },
    } });
    const missingFieldRepository = new BookingRepository({
        User: empty, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow: missingField, Ticket: empty,
    });
    await assert.rejects(missingFieldRepository.getBookingContext(8), error => error.code === 'BOOKING_CONTEXT_INCOMPLETE'
        && /film_Name/.test(error.message));

    const brokenTickets = model({ findAll: async () => { throw new Error('database unavailable'); } });
    const brokenRepository = new BookingRepository({
        User: empty, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow: empty, Ticket: brokenTickets,
    });
    await assert.rejects(brokenRepository.findTicketsForShowtime(1), error => error.code === 'TICKET_LOOKUP_FAILED'
        && error.cause.message === 'database unavailable');
    const brokenNumberRepository = new BookingRepository({
        User: empty, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow: empty,
        Ticket: model({ max: async () => { throw new Error('database unavailable'); } }),
    });
    await assert.rejects(brokenNumberRepository.findLatestTicketNumber(1), error => error.code === 'TICKET_NUMBER_LOOKUP_FAILED'
        && error.cause.message === 'database unavailable');
    const brokenCreateRepository = new BookingRepository({
        User: empty, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow: empty,
        Ticket: model({ create: async () => { throw new Error('write failed'); } }),
    });
    await assert.rejects(brokenCreateRepository.createTicket({
        code: 'VNC_X', userId: 1, showtimeId: 2, seats: 'A1', seatType: 'Standard', totalPrice: '120000',
    }), error => error.code === 'TICKET_CREATE_FAILED');
    const duplicateRepository = new BookingRepository({
        User: empty, Cinema: {}, Cineplex: {}, TimeShow: {}, Film: {}, CinemaTimeShow: empty,
        Ticket: model({ create: async () => { throw Object.assign(new Error('duplicate'), { name: 'SequelizeUniqueConstraintError' }); } }),
    });
    await assert.rejects(duplicateRepository.createTicket({
        code: 'VNC_X', userId: 1, showtimeId: 2, seats: 'A1', seatType: 'Standard', totalPrice: 120000,
    }), error => error.code === 'TICKET_CODE_CONFLICT');
});
