class AdminCatalogRepository {
    constructor({ User, Cinema, Cineplex }) {
        Object.assign(this, { User, Cinema, Cineplex });
    }

    listUsers() { return this.User.findAll(); }
    updateUser(id, attributes) { return this.User.update(attributes, { where: { user_ID: id } }); }
    deleteUser(id) { return this.User.destroy({ where: { user_ID: id } }); }

    listCinemas() { return this.Cinema.findAll({ include: [{ model: this.Cineplex }] }); }
    listCineplexes() { return this.Cineplex.findAll(); }
    findCineplex(id) { return this.Cineplex.findOne({ where: { cineplex_ID: id } }); }
    createCinema(attributes) { return this.Cinema.create(attributes); }
    updateCinema(id, attributes) { return this.Cinema.update(attributes, { where: { cinema_ID: id } }); }
    deleteCinema(id) { return this.Cinema.destroy({ where: { cinema_ID: id } }); }
    createCineplex(attributes) { return this.Cineplex.create(attributes); }
    updateCineplex(id, attributes) { return this.Cineplex.update(attributes, { where: { cineplex_ID: id } }); }
    deleteCineplex(id) { return this.Cineplex.destroy({ where: { cineplex_ID: id } }); }
}

module.exports = AdminCatalogRepository;
