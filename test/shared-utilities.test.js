const test = require('node:test');
const assert = require('node:assert/strict');
const generateVerificationCode = require('../src/infrastructure/security/generateVerificationCode');

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
