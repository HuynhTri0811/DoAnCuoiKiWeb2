class Account {
    constructor({ id, email, passwordHash, name, phone, address, verificationCode, emailConfirmed }) {
        Object.assign(this, { id, email, passwordHash, name, phone, address, verificationCode, emailConfirmed });
        Object.freeze(this);
    }
}

module.exports = Account;
