class GetFilmDetails {
    constructor({ home }) { this.home = home; }
    async execute(id, userId) {
        await this.home.incrementFilmViews(id);
        return this.home.getFilmDetails(id, userId);
    }
}
module.exports = GetFilmDetails;
