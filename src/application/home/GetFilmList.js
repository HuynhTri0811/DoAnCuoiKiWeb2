class GetFilmList {
    constructor({ home }) { this.home = home; }
    execute(userId) { return this.home.getFilmList(userId); }
}
module.exports = GetFilmList;
