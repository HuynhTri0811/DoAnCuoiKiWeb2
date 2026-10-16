const test = require('node:test');
const assert = require('node:assert/strict');

const ConfirmRegistration = require('../src/application/auth/ConfirmRegistration');
const RequestPasswordReset = require('../src/application/auth/RequestPasswordReset');
const ResetPassword = require('../src/application/auth/ResetPassword');
const VerifyPasswordResetCode = require('../src/application/auth/VerifyPasswordResetCode');
const AuthenticateBookingUser = require('../src/application/booking/AuthenticateBookingUser');
const GetSeatAvailability = require('../src/application/booking/GetSeatAvailability');
const GetFilmDetails = require('../src/application/home/GetFilmDetails');
const GetFilmList = require('../src/application/home/GetFilmList');
const GetHomePage = require('../src/application/home/GetHomePage');
const SearchFilms = require('../src/application/home/SearchFilms');
const GetProfile = require('../src/application/profile/GetProfile');
const AdminCatalogUseCases = require('../src/application/admin/AdminCatalogUseCases');
const ManageFilms = require('../src/application/admin/ManageFilms');
const asyncHandler = require('../src/interfaces/http/asyncHandler');
const requireAdmin = require('../src/interfaces/http/middleware/requireAdmin');
const Account = require('../src/domain/user/Account');

test('authentication use cases cover confirmation, password reset and reset code validation', async () => {
    const updates = [];
    const users = {
        findByEmailAndCode: async (email, code) => code === 'ok' ? { id: 4 } : null,
        confirmEmail: async email => updates.push(['confirm', email]),
        findByEmail: async email => email === 'missing' ? null : { emailConfirmed: email !== 'pending' },
        setVerificationCode: async (...args) => updates.push(['code', ...args]),
        updatePassword: async (...args) => updates.push(['password', ...args]),
    };
    assert.deepEqual(await new ConfirmRegistration({ users }).execute({ email: 'a', code: 'bad' }), { kind: 'invalid-code' });
    assert.deepEqual(await new ConfirmRegistration({ users }).execute({ email: 'a', code: 'ok' }), { kind: 'confirmed', userId: 4 });
    const emails = [];
    const resetRequest = new RequestPasswordReset({ users, sendEmail: async (...args) => emails.push(args), generateCode: () => '123' });
    assert.deepEqual(await resetRequest.execute('missing'), { kind: 'email-not-found' });
    assert.deepEqual(await resetRequest.execute('pending'), { kind: 'unconfirmed' });
    assert.deepEqual(await resetRequest.execute('a'), { kind: 'code-sent', email: 'a' });
    assert.deepEqual(await new VerifyPasswordResetCode({ users }).execute({ email: 'a', code: 'ok' }), { kind: 'valid', email: 'a' });
    assert.deepEqual(await new VerifyPasswordResetCode({ users }).execute({ email: 'a', code: 'bad' }), { kind: 'invalid' });
    const reset = new ResetPassword({ users, hashPassword: async value => `hash:${value}` });
    assert.deepEqual(await reset.execute({ email: 'a', password: 'x', confirmation: 'y' }), { kind: 'password-mismatch' });
    assert.deepEqual(await reset.execute({ email: 'a', password: 'x', confirmation: 'x' }), { kind: 'reset' });
    assert.deepEqual(updates, [['confirm', 'a'], ['code', 'a', '123'], ['password', 'a', 'hash:x']]);
    assert.equal(emails.length, 1);
});

test('booking and home use cases delegate with the expected identifiers', async () => {
    const calls = [];
    const bookings = {
        findUserByEmail: async email => email === 'a' ? { id: 3, passwordHash: 'h' } : null,
        findUserById: async id => ({ id }), findShowtime: async id => ({ id }),
        findTicketsForShowtime: async () => [{ ticket_Chair: 'A1' }, { ticket_Chair: '' }, { ticket_Chair: 'B2' }],
    };
    const auth = new AuthenticateBookingUser({ bookings, verifyPassword: async (p, h) => p === 'pw' && h === 'h' });
    assert.equal(await auth.execute({ email: 'a', password: 'pw' }), 3);
    assert.equal(await auth.execute({ email: 'a', password: 'bad' }), null);
    assert.equal(await auth.execute({ email: 'no', password: 'pw' }), null);
    const seatData = await new GetSeatAvailability({ bookings }).execute({ userId: 3, showtimeId: 7 });
    assert.equal(seatData.bookedSeats, 'A1, B2');
    const home = {
        incrementFilmViews: async id => calls.push(['view', id]),
        getFilmDetails: async (...args) => (calls.push(['details', ...args]), 'details'),
        getFilmList: async (...args) => (calls.push(['list', ...args]), 'list'),
        getHomePageData: async (...args) => (calls.push(['home', ...args]), 'home'),
        searchFilms: async (...args) => (calls.push(['search', ...args]), 'search'),
    };
    assert.equal(await new GetFilmDetails({ home }).execute(8, 2), 'details');
    assert.equal(await new GetFilmList({ home }).execute(2), 'list');
    assert.equal(await new GetHomePage({ home }).execute(2), 'home');
    assert.equal(await new SearchFilms({ home }).execute('film', 2), 'search');
    assert.deepEqual(calls, [['view', 8], ['details', 8, 2], ['list', 2], ['home', 2], ['search', 'film', 2]]);
});

test('profile and admin use cases delegate, validate, and clean up failed film operations', async () => {
    const profile = new GetProfile({ profiles: {
        findUserById: async id => ({ id }), getTicketSummary: async () => ({ totalMoney: 20, tickets: ['ticket'] }),
    } });
    assert.equal(await profile.execute(null), null);
    assert.deepEqual(await profile.execute(5), { user: { id: 5 }, totalMoney: 20, all_ve: ['ticket'] });

    const catalog = new AdminCatalogUseCases({ catalog: {
        listUsers: async () => ['u'], updateUser: async (...a) => a, deleteUser: async id => id,
        listCinemas: async () => ['c'], listCineplexes: async () => ['p'], findCineplex: async id => id,
        createCinema: async value => value, updateCinema: async (...a) => a, deleteCinema: async id => id,
        createCineplex: async value => value, updateCineplex: async (...a) => a, deleteCineplex: async id => id,
    } });
    assert.deepEqual(await catalog.listCinemas(), { cinema: ['c'], Adress: ['p'] });
    assert.deepEqual(await catalog.updateUser(1, { name: 'u' }), [1, { name: 'u' }]);
    assert.equal(await catalog.listUsers().then(rows => rows[0]), 'u');
    assert.equal(await catalog.findCineplex(2), 2);
    assert.equal(await catalog.deleteUser(3), 3);
    assert.equal(await catalog.listCineplexes().then(rows => rows[0]), 'p');
    assert.equal((await catalog.createCinema({ x: 1 })).x, 1);
    assert.deepEqual(await catalog.updateCinema(1, {}), [1, {}]);
    assert.equal(await catalog.deleteCinema(1), 1);
    assert.equal((await catalog.createCineplex({ x: 1 })).x, 1);
    assert.deepEqual(await catalog.updateCineplex(1, {}), [1, {}]);
    assert.equal(await catalog.deleteCineplex(1), 1);

    const removed = [];
    const films = new ManageFilms({
        films: { listAll: async () => ['film'], update: async () => [0], create: async () => {}, delete: async id => id },
        imageStorage: { save: async () => '/image.png', remove: async file => removed.push(file), removeSaved: async file => removed.push(file) },
    });
    assert.deepEqual(await films.list(), ['film']);
    assert.equal(await films.delete(4), 4);
    await assert.rejects(films.delete(0), /Invalid film ID/);
    await assert.rejects(films.update(1, { name: 'film', image: { size: 1 } }), /not found/);
    assert.equal(removed.includes('/image.png'), true);
    await assert.rejects(films.create({ name: '', releaseDate: 'bad', duration: 0 }), /invalid/i);
});

test('showtime management builds cinema and film views, creates and deletes schedules', async () => {
    const calls = [];
    const showtimes = new (require('../src/application/admin/ManageShowtimes'))({ showtimes: {
        listByCinema: async id => ['cinema', id], listByFilm: async id => ['film', id],
        listCinemas: async id => ['cinemas', id], listTimes: async () => ['times'],
        listPublicFilms: async () => ['public'], findFilm: async id => ['film-detail', id],
        findDuplicate: async () => null, create: async item => calls.push(item), delete: async id => id,
    } });
    assert.deepEqual(await showtimes.listForCinema(1), {
        timeShowCinemaIDcinema: ['cinema', 1], cinemaAll: ['cinemas', 1], TimeShow: ['times'], filmCinemaTimeShow: ['public'],
    });
    assert.deepEqual(await showtimes.listForFilm(2), {
        timeShowCinemaIDcinema: ['film', 2], cinemaAll: ['cinemas', undefined], TimeShow: ['times'], filmCinemaTimeShow: ['film-detail', 2],
    });
    assert.deepEqual(await showtimes.create({ cinemaId: 1, date: '2026-10-16', timeShowId: 2, filmId: 3 }), { kind: 'created' });
    assert.deepEqual(calls[0], { cinema_ID: 1, cinemaTimeShow_Date: '2026-10-16', timeShow_ID: 2, film_ID: 3 });
    assert.equal(await showtimes.delete(8), 8);
    assert.throws(() => showtimes.delete(0), /Invalid showtime ID/);
});

test('account is immutable and HTTP middleware forwards async errors', async () => {
    const account = new Account({ id: 1, email: 'a' });
    assert.equal(Object.isFrozen(account), true);
    let nextCount = 0;
    requireAdmin({ session: { Admin: 'admin' } }, {}, () => nextCount++);
    assert.equal(nextCount, 1);
    let redirected;
    requireAdmin({ session: {} }, { redirect: path => { redirected = path; } }, () => assert.fail('must not pass'));
    assert.equal(redirected, '/');
    let resolved;
    await asyncHandler(async () => 'ok')({}, {}, error => { throw error; }).then(value => { resolved = value; });
    assert.equal(resolved, 'ok');
    let forwarded;
    await asyncHandler(async () => { throw new Error('failure'); })({}, {}, error => { forwarded = error; });
    assert.equal(forwarded.message, 'failure');
});
