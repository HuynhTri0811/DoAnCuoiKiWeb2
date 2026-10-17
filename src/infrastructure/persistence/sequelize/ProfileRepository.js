const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class ProfileRepository {
    constructor({ User, Ticket, CinemaTimeShow, TimeShow, Film, Cinema, Cineplex }) {
        Object.assign(this, { User, Ticket, CinemaTimeShow, TimeShow, Film, Cinema, Cineplex });
    }

    findUserById(id) {
        return this.User.findOne({ where: { user_ID: id } }).then(toPlainRecord);
    }

    updateUser(id, attributes) {
        return this.User.update(attributes, { where: { user_ID: id } });
    }

    updateField(userId, field, value) {
        const modelFields = {
            name: 'user_Name',
            phone: 'user_NumberPhone',
            email: 'user_Email',
            address: 'user_Address',
            passwordHash: 'user_Password',
        };
        const modelField = modelFields[field];
        if (!modelField) throw new Error(`Unsupported profile field: ${field}`);
        return this.updateUser(userId, { [modelField]: value });
    }

    async getTicketSummary(userId) {
        const [totalMoney, tickets] = await Promise.all([
            this.Ticket.sum('ticket_TotalMoney', { where: { user_ID: userId } }),
            this.Ticket.findAll({
                where: { user_ID: userId },
                include: [{
                    model: this.CinemaTimeShow,
                    include: [
                        { model: this.TimeShow },
                        { model: this.Film },
                        { model: this.Cinema, include: [{ model: this.Cineplex }] },
                    ],
                }],
            }).then(toPlainRecords),
        ]);
        return { totalMoney, tickets };
    }
}

module.exports = ProfileRepository;
