const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Sequelize = require('sequelize');
const {
    createRequest,
    createResponse,
    loadWithMocks,
    modelPath,
    routeHandler,
    routeModelsPath,
} = require('./support/route-test-helpers');

function mockRouterModels(feature, values) {
    return { [routeModelsPath(feature)]: { Sequelize, Op: Sequelize.Op, ...values } };
}

function createMockModel(overrides = {}) {
    return {
        findAll: async () => [],
        findOne: async () => null,
        create: async values => values,
        update: async () => [1],
        destroy: async () => 1,
        sum: async () => 0,
        max: async () => null,
        ...overrides,
    };
}

function loadRouteModule(relativePath) {
    const model = createMockModel();
    const models = {
        Film: model,
        User: model,
        Cineplex: model,
        Cinema: model,
        TimeShow: model,
        CinemaTimeShow: model,
        Ticket: model,
        user: model,
        ticket: model,
    };
    const directModelMocks = Object.fromEntries(
        ['User', 'Film', 'Cineplex', 'Cinema', 'TimeShow', 'CinemaTimeShow', 'Ticket']
            .map(name => [modelPath(name), model]),
    );
    return loadWithMocks(relativePath, {
        ...directModelMocks,
        ...mockRouterModels('home', models),
        ...mockRouterModels('admin', models),
        [path.resolve(__dirname, '../models/email.js')]: async () => {},
        [path.resolve(__dirname, '../routes/admin/utils/auth.js')]: require('../routes/admin/utils/auth'),
        bcrypt: { compare: async () => false, hash: async value => `hashed:${value}` },
        formidable: { IncomingForm: class IncomingForm {} },
    });
}

test('admin and home entry points export their feature routers', () => {
    const formidable = { IncomingForm: class IncomingForm {} };
    const emailPath = path.resolve(__dirname, '../models/email.js');
    const mocks = {
        formidable,
        bcrypt: { compare: async () => true, hash: async value => value },
        [emailPath]: async () => {},
    };
    const admin = loadWithMocks('routes/admin.js', mocks);
    const home = loadWithMocks('routes/home.js', mocks);

    assert.ok(Array.isArray(admin.stack));
    assert.ok(Array.isArray(home.stack));
    assert.ok(admin.stack.length > 0);
    assert.ok(home.stack.length > 0);
});

test('every route module loads and registers at least one endpoint', () => {
    const modules = [
        'routes/home/pages.js',
        'routes/home/films.js',
        'routes/home/booking.js',
        'routes/Login.js',
        'routes/signUp.js',
        'routes/forgotPassword.js',
        'routes/updateInfo.js',
        'routes/admin/dashboard.js',
        'routes/admin/cinemas.js',
        'routes/admin/cineplexes.js',
        'routes/admin/films.js',
        'routes/admin/showtimes.js',
        'routes/admin/users.js',
    ];

    for (const modulePath of modules) {
        const router = loadRouteModule(modulePath);
        assert.ok(router.stack.some(layer => layer.route), `${modulePath} has no registered routes`);
    }
});

test('home logout clears the user session and redirects to the home page', async () => {
    const router = loadWithMocks('routes/home/pages.js', mockRouterModels('home', {}));
    const req = createRequest({ session: { user_Id: 27, other: 'keep' } });
    const res = createResponse();

    await routeHandler(router, 'get', '/logout')(req, res);

    assert.equal(req.session.user_Id, undefined);
    assert.equal(req.session.other, 'keep');
    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/' }]);
});

test('home support page renders its flag for the shared home template', async () => {
    const router = loadWithMocks('routes/home/pages.js', mockRouterModels('home', {}));
    const res = createResponse();

    await routeHandler(router, 'get', '/support')(createRequest(), res);

    assert.equal(res.calls[0].type, 'render');
    assert.equal(res.calls[0].view, 'home.ejs');
    assert.equal(res.calls[0].locals.support, true);
});

test('home film selection stores the chosen cinema before redirecting to seat selection', async () => {
    const router = loadWithMocks('routes/home/films.js', mockRouterModels('home', {}));
    const req = createRequest({ params: { id: '41' }, body: { cinemaID: '8' } });
    const res = createResponse();

    await routeHandler(router, 'post', '/phim/:id')(req, res);

    assert.equal(req.session.cinemaIDChosen, '8');
    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/phim/muave/41' }]);
});

test('booking page asks an unauthenticated visitor to log in', async () => {
    const user = {};
    const formParser = { IncomingForm: class IncomingForm {} };
    const router = loadWithMocks('routes/home/booking.js', {
        ...mockRouterModels('home', { User: user }),
        formidable: formParser,
        bcrypt: { compare: async () => false },
        [path.resolve(__dirname, '../models/email.js')]: async () => {},
    });
    const res = createResponse();

    await routeHandler(router, 'get', '/phim/muave/:id')(
        createRequest({ params: { id: '12' } }), res,
    );

    assert.equal(res.calls[0].view, 'Login.ejs');
});

test('login rejects an unconfirmed account without checking its password', async () => {
    let passwordChecked = false;
    const user = {
        findOne: async () => ({ user_ID: 9, user_Password: 'hash', accept_User: false }),
    };
    const router = loadWithMocks('routes/Login.js', {
        [modelPath('User')]: user,
        bcrypt: { compare: async () => { passwordChecked = true; return true; } },
        './signUp.js': {},
    });
    const res = createResponse();

    await routeHandler(router, 'post', '/')(
        createRequest({ body: { txtUserEmail: 'user@example.com', txtUserPassword: 'pw' } }), res,
    );

    assert.equal(passwordChecked, false);
    assert.equal(res.calls[0].view, 'Login.ejs');
    assert.ok(res.calls[0].locals.error);
});

test('login sets the user session after a successful password check', async () => {
    const router = loadWithMocks('routes/Login.js', {
        [modelPath('User')]: {
            findOne: async () => ({ user_ID: 19, user_Password: 'hash', accept_User: true }),
        },
        bcrypt: { compare: async () => true },
        './signUp.js': {},
    });
    const req = createRequest({ body: { txtUserEmail: 'user@example.com', txtUserPassword: 'pw' } });
    const res = createResponse();

    const originalLog = console.log;
    console.log = () => {};
    try {
        await routeHandler(router, 'post', '/')(req, res);
    } finally {
        console.log = originalLog;
    }

    assert.equal(req.session.user_Id, 19);
    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/' }]);
});

test('signup reports an email already in use and does not create another user', async () => {
    let created = false;
    const router = loadWithMocks('routes/signUp.js', {
        [modelPath('User')]: {
            findOne: async () => ({ user_ID: 1 }),
            create: async () => { created = true; },
        },
        [path.resolve(__dirname, '../models/email.js')]: async () => {},
        bcrypt: { hash: async value => `hashed:${value}` },
    });
    const res = createResponse();

    await routeHandler(router, 'post', '/')(
        createRequest({ body: { user_Email: 'taken@example.com', user_Password: 'pw' } }), res,
    );

    assert.equal(created, false);
    assert.equal(res.calls[0].view, 'signUp.ejs');
    assert.ok(res.calls[0].locals.User);
});

test('forgot password gives the same form when the address is unknown', async () => {
    const router = loadWithMocks('routes/forgotPassword.js', {
        [modelPath('User')]: { findOne: async () => null },
        [path.resolve(__dirname, '../models/email.js')]: async () => {},
        bcrypt: { hash: async value => `hashed:${value}` },
    });
    const res = createResponse();

    await routeHandler(router, 'post', '/')(
        createRequest({ body: { email: 'missing@example.com' } }), res,
    );

    assert.equal(res.calls[0].view, 'forgotPassword.ejs');
    assert.ok(res.calls[0].locals.UserSaiMail);
});

test('profile route redirects visitors without a user session', async () => {
    const router = loadWithMocks('routes/updateInfo.js', {
        [modelPath('User')]: {},
        [modelPath('Film')]: {},
        [modelPath('Cineplex')]: {},
        [modelPath('Cinema')]: {},
        [modelPath('TimeShow')]: {},
        [modelPath('CinemaTimeShow')]: {},
        [modelPath('Ticket')]: {},
        formidable: { IncomingForm: class IncomingForm {} },
        bcrypt: { hash: async value => value },
    });
    const res = createResponse();

    await routeHandler(router, 'get', '/') (createRequest(), res);

    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/' }]);
});

test('admin authentication helper recognizes only a session admin', () => {
    const { isAdmin, redirectIfNotAdmin } = require('../routes/admin/utils/auth');
    const res = createResponse();

    assert.equal(isAdmin({ session: { Admin: 'admin@example.com' } }), true);
    assert.equal(isAdmin({ session: {} }), false);
    assert.equal(isAdmin({}), false);
    assert.equal(redirectIfNotAdmin({ session: {} }, res), true);
    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/' }]);
});

test('admin dashboard redirects a visitor before querying sales', async () => {
    let queried = false;
    const router = loadWithMocks('routes/admin/dashboard.js', {
        ...mockRouterModels('admin', { ticket: { findAll: async () => { queried = true; } } }),
        [path.resolve(__dirname, '../routes/admin/utils/auth.js')]: require('../routes/admin/utils/auth'),
    });
    const res = createResponse();

    await routeHandler(router, 'get', '/') (createRequest(), res);

    assert.equal(queried, false);
    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/' }]);
});

test('admin dashboard aggregates film sales into the matching cineplex', async () => {
    let queryCount = 0;
    const film = { film_ID: 4, film_Name: 'Film A' };
    const cinema = { cinema_ID: 11, cinema_Name: 'Cinema A', CineplexCineplexID: 2 };
    const cineplex = { cineplex_ID: 2, cineplex_Name: 'Cineplex A' };
    const ticket = {
        findAll: async () => {
            queryCount += 1;
            if (queryCount === 1) {
                return [{
                    CinemaTimeShow: { film_ID: 4, cinemaTimeShow_ID: 8 },
                    dataValues: { TongTien: '120000', SoVeBanDuoc: '2' },
                }];
            }
            return [{
                CinemaTimeShow: { cinema_ID: 11, cinemaTimeShow_ID: 8 },
                dataValues: { TongTien: '120000', SoVeBanDuoc: '2' },
            }];
        },
    };
    const router = loadWithMocks('routes/admin/dashboard.js', {
        ...mockRouterModels('admin', {
            ticket,
            Film: { findAll: async () => [film] },
            Cinema: { findAll: async () => [cinema] },
            Cineplex: { findAll: async () => [cineplex] },
        }),
        [path.resolve(__dirname, '../routes/admin/utils/auth.js')]: require('../routes/admin/utils/auth'),
    });
    const res = createResponse();

    await routeHandler(router, 'get', '/')(
        createRequest({ session: { Admin: 'admin@example.com' } }), res,
    );

    assert.equal(queryCount, 2);
    assert.equal(res.calls[0].view, 'admin.ejs');
    assert.equal(res.calls[0].locals.thuocTinhFilm[0].TotalMoney_film, 120000);
    assert.equal(res.calls[0].locals.thuocTinhFilm[0].CountTicket_film, 2);
    assert.equal(res.calls[0].locals.thuocTinhCumRap[0].TotalMoney_cineplex, 120000);
    assert.equal(res.calls[0].locals.thuocTinhCumRap[0].CountTicket_cineplex, 2);
});

test('admin user list redirects a visitor before reading users', async () => {
    let queried = false;
    const router = loadWithMocks('routes/admin/users.js', mockRouterModels('admin', {
        user: { findAll: async () => { queried = true; return []; } },
    }));
    const res = createResponse();

    await routeHandler(router, 'get', '/update/user')(createRequest(), res);

    assert.equal(queried, false);
    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/' }]);
});

test('cinema, cineplex, film, and showtime admin lists reject visitors', async () => {
    const protectedRoutes = [
        ['routes/admin/cinemas.js', 'get', '/update/cinema'],
        ['routes/admin/cineplexes.js', 'get', '/update/cineplex'],
        ['routes/admin/films.js', 'get', '/update/film/'],
        ['routes/admin/showtimes.js', 'get', '/update/cinemaTimeShow/cinema/:id'],
    ];

    for (const [modulePath, method, routePath] of protectedRoutes) {
        const router = loadRouteModule(modulePath);
        const res = createResponse();
        await routeHandler(router, method, routePath)(
            createRequest({ params: { id: '1' } }), res,
        );
        assert.deepEqual(res.calls, [{ type: 'redirect', location: '/' }], modulePath);
    }
});

test('profile name update scopes the database update to the signed-in user', async () => {
    let updateCall;
    const router = loadWithMocks('routes/updateInfo.js', {
        [modelPath('User')]: createMockModel({ update: async (...args) => { updateCall = args; return [1]; } }),
        [modelPath('Film')]: {},
        [modelPath('Cineplex')]: {},
        [modelPath('Cinema')]: {},
        [modelPath('TimeShow')]: {},
        [modelPath('CinemaTimeShow')]: {},
        [modelPath('Ticket')]: {},
        formidable: { IncomingForm: class IncomingForm {} },
        bcrypt: { hash: async value => `hashed:${value}` },
    });
    const res = createResponse();

    await routeHandler(router, 'post', '/name')(
        createRequest({ session: { user_Id: 32 }, body: { txtUserName: 'Nguyen An' } }), res,
    );

    assert.deepEqual(updateCall, [
        { user_Name: 'Nguyen An' },
        { where: { user_ID: 32 } },
    ]);
    assert.deepEqual(res.calls, [{ type: 'redirect', location: '/updateInfo' }]);
});

test('admin model registry resolves the project model files', () => {
    const adminModels = require('../routes/admin/utils/models');
    const homeModels = require('../routes/home/utils/models');

    for (const name of ['user', 'ticket', 'Cinema', 'Cineplex', 'Film', 'timeShow', 'CinemaTimeShow']) {
        assert.ok(adminModels[name], `Missing admin model export ${name}`);
    }
    for (const name of ['Film', 'User', 'Cineplex', 'Cinema', 'TimeShow', 'CinemaTimeShow', 'Ticket']) {
        assert.ok(homeModels[name]);
    }
});
