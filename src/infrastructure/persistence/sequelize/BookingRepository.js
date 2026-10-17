const UserRepository = require('./UserRepository');
const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class BookingRepository {
    constructor({ User, Cinema, Cineplex, TimeShow, Film, CinemaTimeShow, Ticket }) {
        Object.assign(this, { User, Cinema, Cineplex, TimeShow, Film, CinemaTimeShow, Ticket });
        this.users = new UserRepository(User);
    }

    findUserById(id) { return this.users.findById(id); }
    findUserByEmail(email) { return this.users.findByEmail(email); }

    findShowtime(id) {
        return this.CinemaTimeShow.findOne({
            where: { cinemaTimeShow_ID: id },
            include: [
                { model: this.Film },
                { model: this.TimeShow },
                { model: this.Cinema, include: [{ model: this.Cineplex }] },
            ],
        }).then(toPlainRecord);
    }

    async getBookingContext(id) {
        const showtime = await this.findShowtime(id);
        if (!showtime) return null;
        const row = showtime.dataValues || showtime;
        const cinema = row.Cinema.dataValues || row.Cinema;
        const cineplex = cinema.Cineplex.dataValues || cinema.Cineplex;
        const film = row.Film.dataValues || row.Film;
        const time = row.TimeShow.dataValues || row.TimeShow;
        return {
            showtimeId: row.cinemaTimeShow_ID,
            date: row.cinemaTimeShow_Date,
            film: { id: film.film_ID, name: film.film_Name },
            cinema: { name: cinema.cinema_Name, cineplexName: cineplex.cineplex_Name },
            startTime: time.timeShow_Start,
        };
    }

    findTicketsForShowtime(id) {
        return this.Ticket.findAll({
            where: { cinemaTimeShow_ID: id },
            include: [{ model: this.CinemaTimeShow }],
            order: [['ticket_Chair', 'ASC']],
        }).then(toPlainRecords);
    }

    findLatestTicketNumber(userId) {
        return this.Ticket.max('ticket_Num', { where: { user_ID: userId } });
    }

    createTicket(reservation) {
        return this.Ticket.create({
            ticket_ID: reservation.code,
            ticket_Chair: reservation.seats,
            ticket_ChairType: reservation.seatType,
            ticket_TotalMoney: reservation.totalPrice,
            cinemaTimeShow_ID: reservation.showtimeId,
            user_ID: reservation.userId,
        }).then(toPlainRecord);
    }
}

module.exports = BookingRepository;
