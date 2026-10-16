class ConfirmRegistration {
    constructor({ users }) {
        this.users = users;
    }

    async execute({ email, code }) {
        const account = await this.users.findByEmailAndCode(email, code);
        if (!account) return { kind: 'invalid-code' };
        await this.users.confirmEmail(email);
        return { kind: 'confirmed', userId: account.id };
    }
}

module.exports = ConfirmRegistration;
