class GetProfile {
    constructor({ profiles }) {
        this.profiles = profiles;
    }

    async execute(userId) {
        if (!userId) return null;
        const user = await this.profiles.findUserById(userId);
        const { totalMoney, tickets } = await this.profiles.getTicketSummary(userId);
        return { user, totalMoney, all_ve: tickets };
    }
}

module.exports = GetProfile;
