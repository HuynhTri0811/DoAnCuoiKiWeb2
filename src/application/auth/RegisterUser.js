class RegisterUser {
    constructor({ users, hashPassword, sendEmail, generateCode }) {
        this.users = users;
        this.hashPassword = hashPassword;
        this.sendEmail = sendEmail;
        this.generateCode = generateCode;
    }

    async execute({ email, password, name, phone }) {
        const existingEmail = await this.users.findByEmail(email);
        if (existingEmail) return { kind: 'email-taken', user: existingEmail };

        const existingPhone = await this.users.findByPhone(phone);
        if (existingPhone) return { kind: 'phone-taken', user: existingPhone };

        const code = this.generateCode();
        const passwordHash = await this.hashPassword(password);
        const user = await this.users.create({
            email,
            passwordHash,
            name,
            phone,
            address: 'chưa cập nhật',
            verificationCode: code,
        });

        await this.sendEmail(
            email,
            'Xác nhận tài khoản',
            `Đây là email tự động, vui lòng không gửi mail qua địa chỉ này.\nMã xác nhận của bạn: ${code}`
        );
        return { kind: 'registered', email, user };
    }
}

module.exports = RegisterUser;
