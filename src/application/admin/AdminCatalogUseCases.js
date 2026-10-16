class AdminCatalogUseCases {
    constructor({ catalog }) { this.catalog = catalog; }

    listUsers() { return this.catalog.listUsers(); }
    updateUser(id, attributes) { return this.catalog.updateUser(id, attributes); }
    deleteUser(id) { return this.catalog.deleteUser(id); }

    async listCinemas() {
        const [cinema, Adress] = await Promise.all([this.catalog.listCinemas(), this.catalog.listCineplexes()]);
        return { cinema, Adress };
    }
    listCineplexes() { return this.catalog.listCineplexes(); }
    findCineplex(id) { return this.catalog.findCineplex(id); }
    createCinema(attributes) { return this.catalog.createCinema(attributes); }
    updateCinema(id, attributes) { return this.catalog.updateCinema(id, attributes); }
    deleteCinema(id) { return this.catalog.deleteCinema(id); }
    createCineplex(attributes) { return this.catalog.createCineplex(attributes); }
    updateCineplex(id, attributes) { return this.catalog.updateCineplex(id, attributes); }
    deleteCineplex(id) { return this.catalog.deleteCineplex(id); }
}

module.exports = AdminCatalogUseCases;
