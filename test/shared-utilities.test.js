const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const generateVerificationCode = require('../routes/utils/verificationCode');
const registerProfileUpdateRoutes = require('../routes/utils/profileUpdates');
const {
    createRequest,
    createResponse,
    routeHandler,
} = require('./support/route-test-helpers');

test('verification codes use the expected length and alphanumeric alphabet', () => {
    const code = generateVerificationCode();

    assert.equal(code.length, 10);
    assert.match(code, /^[A-Za-z0-9]+$/);
    assert.equal(generateVerificationCode(24).length, 24);
});

test('verification code generator rejects invalid lengths', () => {
    for (const length of [0, -1, 1.5, '10']) {
        assert.throws(() => generateVerificationCode(length), RangeError);
    }
});

test('profile update routes share persistence behavior and hash passwords', async () => {
    const updateCalls = [];
    const hashedPasswords = [];
    const router = express.Router();
    registerProfileUpdateRoutes(router, {
        User: {
            update: async (...args) => {
                updateCalls.push(args);
                return [1];
            },
        },
        hashPassword: async password => {
            hashedPasswords.push(password);
            return `hashed:${password}`;
        },
    });

    const cases = [
        ['/name', 'txtUserName', 'user_Name', 'Mai'],
        ['/numberphone', 'txtUserNumberPhone', 'user_NumberPhone', '0900000000'],
        ['/email', 'txtUserEmail', 'user_Email', 'mai@example.com'],
        ['/password', 'txtUserPassword', 'user_Password', 'secret'],
        ['/address', 'txtUserAddress', 'user_Address', 'Hà Nội'],
    ];

    for (const [route, requestField, userField, value] of cases) {
        const res = createResponse();
        await routeHandler(router, 'post', route)(
            createRequest({ session: { user_Id: 42 }, body: { [requestField]: value } }), res,
        );
        assert.deepEqual(res.calls, [{ type: 'redirect', location: '/updateInfo' }]);
    }

    assert.deepEqual(updateCalls, cases.map(([, requestField, userField, value]) => [
        { [userField]: userField === 'user_Password' ? 'hashed:secret' : value },
        { where: { user_ID: 42 } },
    ]));
    assert.deepEqual(hashedPasswords, ['secret']);
});

test('profile update routes retain the existing no-session behavior', async () => {
    let updateCount = 0;
    const router = express.Router();
    registerProfileUpdateRoutes(router, {
        User: { update: async () => { updateCount += 1; } },
        hashPassword: async value => value,
    });
    const res = createResponse();

    await routeHandler(router, 'post', '/address')(
        createRequest({ body: { txtUserAddress: 'Hà Nội' } }), res,
    );

    assert.equal(updateCount, 0);
    assert.deepEqual(res.calls, []);
});

test('profile update errors render the shared not-found page', async () => {
    const router = express.Router();
    registerProfileUpdateRoutes(router, {
        User: { update: async () => { throw new Error('database unavailable'); } },
        hashPassword: async value => value,
    });
    const res = createResponse();

    await routeHandler(router, 'post', '/email')(
        createRequest({ session: { user_Id: 7 }, body: { txtUserEmail: 'new@example.com' } }), res,
    );

    assert.deepEqual(res.calls, [{ type: 'render', view: 'pages/404.ejs', locals: undefined }]);
});
