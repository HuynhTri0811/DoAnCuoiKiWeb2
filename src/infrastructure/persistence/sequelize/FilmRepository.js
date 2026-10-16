class FilmRepository {
    constructor(Film) { this.Film = Film; }

    listAll() { return this.Film.findAll({ order: [['film_ID', 'ASC']] }); }
    create(attributes) { return this.Film.create(attributes); }
    update(id, attributes) { return this.Film.update(attributes, { where: { film_ID: id } }); }
    delete(id) { return this.Film.destroy({ where: { film_ID: id } }); }
}

module.exports = FilmRepository;
