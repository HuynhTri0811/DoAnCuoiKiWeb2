class UpdateProfile {
    constructor({ profiles, hashPassword }) {
        this.profiles = profiles;
        this.hashPassword = hashPassword;
    }

    async execute({ userId, field, value }) {
        if (!userId) return { kind: 'unauthenticated' };
        if (field === 'password') {
            await this.profiles.updateField(userId, 'passwordHash', await this.hashPassword(value));
            return { kind: 'updated' };
        }

        if (!['name', 'phone', 'email', 'address'].includes(field)) return { kind: 'invalid-field' };
        await this.profiles.updateField(userId, field, value);
        return { kind: 'updated' };
    }
}

module.exports = UpdateProfile;
