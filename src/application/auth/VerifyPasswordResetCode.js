class VerifyPasswordResetCode {
    constructor({ users }) {
        this.users = users;
    }

    async execute({ email, code }) {
        const user = await this.users.findByEmailAndCode(email, code);
        return user ? { kind: 'valid', email } : { kind: 'invalid' };
    }
}

module.exports = VerifyPasswordResetCode;
