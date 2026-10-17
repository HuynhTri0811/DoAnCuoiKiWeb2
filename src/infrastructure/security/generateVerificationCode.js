const crypto = require('crypto');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Tạo mã xác minh ngẫu nhiên với độ dài được yêu cầu. */
function generateVerificationCode(length = 10) {
    if (!Number.isInteger(length) || length < 1) {
        throw new RangeError('Verification code length must be a positive integer.');
    }

    let code = '';
    for (let index = 0; index < length; index += 1) {
        code += alphabet[crypto.randomInt(alphabet.length)];
    }
    return code;
}

module.exports = generateVerificationCode;
