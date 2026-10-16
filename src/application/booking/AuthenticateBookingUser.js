class AuthenticateBookingUser {
    constructor({ bookings, verifyPassword }) {
        this.bookings = bookings;
        this.verifyPassword = verifyPassword;
    }

    async execute({ email, password }) {
        const user = await this.bookings.findUserByEmail(email);
        if (!user || !await this.verifyPassword(password, user.passwordHash)) return null;
        return user.id;
    }
}
module.exports = AuthenticateBookingUser;
