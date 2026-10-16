class SearchFilms {
    constructor({ home }) { this.home = home; }
    execute(name, userId) { return this.home.searchFilms(name, userId); }
}
module.exports = SearchFilms;
