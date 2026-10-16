class ResetPassword {
    constructor({ users, hashPassword }) {
        this.users = users;
        this.hashPassword = hashPassword;
    }

    async execute({ email, password, confirmation }) {
        if (password !== confirmation) return { kind: 'password-mismatch' };
        const passwordHash = await this.hashPassword(password);
        await this.users.updatePassword(email, passwordHash);
        return { kind: 'reset' };
    }
}

module.exports = ResetPassword;
