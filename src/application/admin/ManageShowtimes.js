class ManageShowtimes {
    constructor({ showtimes }) { this.showtimes = showtimes; }

    async listForCinema(id) {
        const [timeShowCinemaIDcinema, cinemaAll, TimeShow, filmCinemaTimeShow] = await Promise.all([
            this.showtimes.listByCinema(id), this.showtimes.listCinemas(id),
            this.showtimes.listTimes(), this.showtimes.listPublicFilms(),
        ]);
        return { timeShowCinemaIDcinema, cinemaAll, TimeShow, filmCinemaTimeShow };
    }

    async listForFilm(id) {
        const [timeShowCinemaIDcinema, cinemaAll, TimeShow, filmCinemaTimeShow] = await Promise.all([
            this.showtimes.listByFilm(id), this.showtimes.listCinemas(),
            this.showtimes.listTimes(), this.showtimes.findFilm(id),
        ]);
        return { timeShowCinemaIDcinema, cinemaAll, TimeShow, filmCinemaTimeShow };
    }

    async create({ cinemaId, date, timeShowId, filmId }) {
        if (![cinemaId, timeShowId, filmId].every(value => Number.isInteger(value) && value > 0) || !date) {
            return { kind: 'invalid' };
        }
        const duplicate = await this.showtimes.findDuplicate({ cinemaId, date, timeShowId });
        if (duplicate) return { kind: 'duplicate' };
        await this.showtimes.create({
            cinema_ID: cinemaId,
            cinemaTimeShow_Date: date,
            timeShow_ID: timeShowId,
            film_ID: filmId,
        });
        return { kind: 'created' };
    }

    delete(id) {
        if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid showtime ID.');
        return this.showtimes.delete(id);
    }
}

module.exports = ManageShowtimes;
