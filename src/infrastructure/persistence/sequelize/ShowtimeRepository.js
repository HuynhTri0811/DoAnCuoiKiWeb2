const Sequelize = require('sequelize');
const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class ShowtimeRepository {
    constructor({ Cinema, Film, TimeShow, CinemaTimeShow }) {
        Object.assign(this, { Cinema, Film, TimeShow, CinemaTimeShow });
    }

    listByCinema(id) {
        return this.CinemaTimeShow.findAll({
            where: { cinema_ID: id },
            include: [{ model: this.Cinema }, { model: this.Film }, { model: this.TimeShow }],
        }).then(toPlainRecords);
    }

    listByFilm(id) {
        return this.CinemaTimeShow.findAll({
            where: { film_ID: id },
            include: [{ model: this.Cinema }, { model: this.Film }, { model: this.TimeShow }],
        }).then(toPlainRecords);
    }

    listCinemas(id) { return this.Cinema.findAll(id ? { where: { cinema_ID: id } } : {}).then(toPlainRecords); }
    listTimes() { return this.TimeShow.findAll().then(toPlainRecords); }
    listPublicFilms() {
        return this.Film.findAll({
            where: { film_DatePublic: { [Sequelize.Op.lte]: Date.now() }, film_Public: true },
        }).then(toPlainRecords);
    }
    findFilm(id) { return this.Film.findAll({ where: { film_ID: id } }).then(toPlainRecords); }
    findDuplicate({ cinemaId, date, timeShowId }) {
        return this.CinemaTimeShow.findOne({
            where: { cinema_ID: cinemaId, cinemaTimeShow_Date: date, timeShow_ID: timeShowId },
        }).then(toPlainRecord);
    }
    create(attributes) { return this.CinemaTimeShow.create(attributes).then(toPlainRecord); }
    delete(id) { return this.CinemaTimeShow.destroy({ where: { cinemaTimeShow_ID: id } }); }
}

module.exports = ShowtimeRepository;
