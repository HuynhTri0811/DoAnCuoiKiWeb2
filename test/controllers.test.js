const test = require('node:test');
const assert = require('node:assert/strict');
const createAuth = require('../src/interfaces/http/controllers/authController');
const createCatalog = require('../src/interfaces/http/controllers/adminCatalogController');
const createDashboard = require('../src/interfaces/http/controllers/adminDashboardController');
const createFilm = require('../src/interfaces/http/controllers/adminFilmController');
const createShowtime = require('../src/interfaces/http/controllers/adminShowtimeController');
const createBooking = require('../src/interfaces/http/controllers/bookingController');
const createHome = require('../src/interfaces/http/controllers/homeController');
const createProfile = require('../src/interfaces/http/controllers/profileController');

function io() {
    const req = { body: {}, params: { id: '2', field: 'name' }, query: {}, session: { user_Id: 3, Admin: true } };
    const res = { calls: [], render(view, data) { this.calls.push(['render', view, data]); return this; }, redirect(to) { this.calls.push(['redirect', to]); return this; }, status(code) { this.code = code; return this; } };
    return { req, res };
}

test('auth controller serves pages and handles login, signup, confirmation and reset flows', async () => {
    const result = { execute: async () => ({ kind: 'authenticated', userId: 3 }) };
    const c = createAuth({ authenticateUser: result, registerUser: { execute: async () => ({ kind: 'registered', email: 'a' }) },
        confirmRegistration: result, requestPasswordReset: result, verifyPasswordResetCode: { execute: async () => ({ kind: 'valid' }) }, resetPassword: result });
    let x = io(); c.showLogin(x.req, x.res); await c.login(x.req, x.res); assert.equal(x.req.session.user_Id, 3);
    x = io(); c.showSignup(x.req, x.res); await c.signup(x.req, x.res); c.showForgotPassword(x.req, x.res);
    await c.requestPasswordReset(x.req, x.res); c.showForgotPasswordConfirmation(x.req, x.res); await c.confirmPasswordReset(x.req, x.res);
    c.showResetPassword(x.req, x.res); await c.resetPasswordHandler(x.req, x.res);
    assert.equal(x.res.calls.some(call => call[1] === 'auth/reset-password.ejs'), true);
    const bad = createAuth({ authenticateUser: { execute: async () => ({ kind: 'invalid-credentials' }) }, registerUser: { execute: async () => ({ kind: 'email-taken', user: {} }) }, confirmRegistration: { execute: async () => ({ kind: 'invalid-code' }) }, requestPasswordReset: { execute: async () => ({ kind: 'email-not-found' }) }, verifyPasswordResetCode: { execute: async () => ({ kind: 'invalid' }) }, resetPassword: { execute: async () => ({ kind: 'password-mismatch' }) } });
    x = io(); await bad.login(x.req, x.res); await bad.signup(x.req, x.res); await bad.confirmSignup(x.req, x.res, assert.fail); await bad.requestPasswordReset(x.req, x.res); await bad.confirmPasswordReset(x.req, x.res); await bad.resetPasswordHandler(x.req, x.res);
});

test('home and profile controllers render, update session state and handle missing profiles', async () => {
    const data = { execute: async () => ({}) };
    const home = createHome({ getHomePage: data, searchFilms: data, getFilmList: data, getFilmDetails: data });
    const x = io(); await home.showHome(x.req, x.res); await home.search(x.req, x.res); await home.showFilmList(x.req, x.res); await home.showFilm(x.req, x.res);
    home.selectCinema(x.req, x.res); home.showSupport(x.req, x.res); home.showIntro(x.req, x.res); home.logout(x.req, x.res);
    const profile = createProfile({ getProfile: data, updateProfile: { execute: async () => ({ kind: 'updated' }) } });
    x.req.session.user_Id = 3; await profile.show(x.req, x.res); await profile.update(x.req, x.res); profile.backToHome(x.req, x.res);
    const absent = createProfile({ getProfile: { execute: async () => null }, updateProfile: { execute: async () => ({ kind: 'unauthenticated' }) } });
    await absent.show(x.req, x.res); await absent.update(x.req, x.res);
});

test('admin controllers handle catalog, dashboard, film and showtime requests', async () => {
    const catalog = createCatalog({ catalog: {
        listUsers: async () => [], updateUser: async () => {}, deleteUser: async () => {}, listCinemas: async () => ({}),
        findCineplex: async id => ({ cineplex_ID: id }), updateCinema: async () => {}, createCinema: async () => {}, deleteCinema: async () => {},
        listCineplexes: async () => [], createCineplex: async () => {}, updateCineplex: async () => {}, deleteCineplex: async () => {},
    } });
    const x = io(); await catalog.listUsers(x.req, x.res); await catalog.updateUser(x.req, x.res); await catalog.deleteUser(x.req, x.res);
    await catalog.listCinemas(x.req, x.res); await catalog.updateCinema(x.req, x.res); await catalog.createCinema(x.req, x.res); await catalog.deleteCinema(x.req, x.res);
    await catalog.listCineplexes(x.req, x.res); await catalog.createCineplex(x.req, x.res); await catalog.updateCineplex(x.req, x.res); await catalog.deleteCineplex(x.req, x.res);
    const dashboard = createDashboard({ getSalesSummary: { execute: async () => ({}) } });
    await dashboard.show(x.req, x.res); x.req.body = { txtDateOne: '2026-01-01', txtDateTwo: '2026-01-31' }; await dashboard.filter(x.req, x.res); dashboard.logout(x.req, x.res);
    const storage = { parseForm: async () => ({ fields: { txtFilmName: ['F'], txtFilmDatePublic: ['2026-01-01'], txtFilmTime: ['90'] }, files: {} }) };
    const films = createFilm({ films: { list: async () => [], update: async () => {}, create: async () => {}, delete: async () => {} }, imageStorage: storage });
    await films.list(x.req, x.res); await films.update(x.req, x.res); await films.create(x.req, x.res); await films.delete(x.req, x.res); films.createForm(x.req, x.res);
    const showtimes = createShowtime({ showtimes: { listForCinema: async () => ({}), listForFilm: async () => ({}), create: async () => ({ kind: 'created' }), delete: async () => {} } });
    await showtimes.listByCinema(x.req, x.res); await showtimes.listByFilm(x.req, x.res); await showtimes.create(x.req, x.res); showtimes.createPage(x.req, x.res); await showtimes.delete(x.req, x.res);
});

test('booking controller covers seat view, login, booking, return and confirmation paths', async () => {
    const c = createBooking({ getSeatAvailability: { execute: async () => ({ user: {}, ticket: [], bookedSeats: '' }) },
        authenticateBookingUser: { execute: async () => 3 }, bookSeats: { execute: async () => ({}) }, bookings: { findShowtime: async () => ({ film_ID: 4 }) } });
    const x = io(); await c.showSeats(x.req, x.res); await c.loginForBooking(x.req, x.res); c.returnToFilm(x.req, x.res);
    await c.book(x.req, x.res); await c.backFromConfirmation(x.req, x.res);
});
