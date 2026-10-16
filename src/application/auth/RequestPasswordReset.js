class RequestPasswordReset {
    constructor({ users, sendEmail, generateCode }) {
        this.users = users;
        this.sendEmail = sendEmail;
        this.generateCode = generateCode;
    }

    async execute(email) {
        const user = await this.users.findByEmail(email);
        if (!user) return { kind: 'email-not-found' };
        if (user.emailConfirmed === false) return { kind: 'unconfirmed' };

        const code = this.generateCode();
        await this.users.setVerificationCode(email, code);
        await this.sendEmail(email, 'Quên mật khẩu', 'Bạn có quên mật khẩu', code);
        return { kind: 'code-sent', email };
    }
}

module.exports = RequestPasswordReset;
