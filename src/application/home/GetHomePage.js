class GetHomePage {
    constructor({ home }) { this.home = home; }
    execute(userId) { return this.home.getHomePageData(userId); }
}
module.exports = GetHomePage;
