const UserRepository = require('./UserRepository');
const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class BookingRepositoryError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.name = 'BookingRepositoryError';
        this.code = code;
        if (cause) this.cause = cause;
    }
}

function requireId(id, fieldName) {
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new BookingRepositoryError('INVALID_ID', `${fieldName} must be a positive integer.`);
    }
    return Number(id);
}

function getRelatedRecord(record, relationName, showtimeId) {
    const related = record && record[relationName];
    if (!related || typeof related !== 'object') {
        throw new BookingRepositoryError(
            'BOOKING_CONTEXT_INCOMPLETE',
            `Showtime ${showtimeId} is missing its ${relationName} relation.`,
        );
    }
    return related.dataValues || related;
}

function requireContextField(record, fieldName, showtimeId) {
    const value = record[fieldName];
    if (value == null || (typeof value === 'string' && !value.trim())) {
        throw new BookingRepositoryError(
            'BOOKING_CONTEXT_INCOMPLETE',
            `Showtime ${showtimeId} is missing required field ${fieldName}.`,
        );
    }
    return value;
}

class BookingRepository {
    constructor({ User, Cinema, Cineplex, TimeShow, Film, CinemaTimeShow, Ticket }) {
        Object.assign(this, { User, Cinema, Cineplex, TimeShow, Film, CinemaTimeShow, Ticket });
        this.users = new UserRepository(User);
    }

    findUserById(id) { return this.users.findById(id); }
    findUserByEmail(email) { return this.users.findByEmail(email); }

    findShowtime(id) {
        const showtimeId = requireId(id, 'showtimeId');
        return this.CinemaTimeShow.findOne({
            where: { cinemaTimeShow_ID: showtimeId },
            include: [
                { model: this.Film },
                { model: this.TimeShow },
                { model: this.Cinema, include: [{ model: this.Cineplex }] },
            ],
        }).then(toPlainRecord).catch(error => {
            throw new BookingRepositoryError('SHOWTIME_LOOKUP_FAILED', 'Unable to load the requested showtime.', error);
        });
    }

    async getBookingContext(id) {
        const showtimeId = requireId(id, 'showtimeId');
        const showtime = await this.findShowtime(showtimeId);
        if (!showtime) {
            throw new BookingRepositoryError('SHOWTIME_NOT_FOUND', `Showtime ${showtimeId} was not found.`);
        }
        const row = showtime.dataValues || showtime;
        const cinema = getRelatedRecord(row, 'Cinema', showtimeId);
        const cineplex = getRelatedRecord(cinema, 'Cineplex', showtimeId);
        const film = getRelatedRecord(row, 'Film', showtimeId);
        const time = getRelatedRecord(row, 'TimeShow', showtimeId);
        return {
            showtimeId: row.cinemaTimeShow_ID,
            date: requireContextField(row, 'cinemaTimeShow_Date', showtimeId),
            film: {
                id: requireContextField(film, 'film_ID', showtimeId),
                name: requireContextField(film, 'film_Name', showtimeId),
            },
            cinema: {
                name: requireContextField(cinema, 'cinema_Name', showtimeId),
                cineplexName: requireContextField(cineplex, 'cineplex_Name', showtimeId),
            },
            startTime: requireContextField(time, 'timeShow_Start', showtimeId),
        };
    }

    findTicketsForShowtime(id) {
        const showtimeId = requireId(id, 'showtimeId');
        return this.Ticket.findAll({
            where: { cinemaTimeShow_ID: showtimeId },
            include: [{ model: this.CinemaTimeShow }],
            order: [['ticket_Chair', 'ASC']],
        }).then(records => {
            if (!Array.isArray(records)) {
                throw new BookingRepositoryError('INVALID_TICKET_QUERY_RESULT', 'Ticket lookup did not return a list.');
            }
            return toPlainRecords(records);
        }).catch(error => {
            if (error instanceof BookingRepositoryError) throw error;
            throw new BookingRepositoryError('TICKET_LOOKUP_FAILED', 'Unable to load tickets for the requested showtime.', error);
        });
    }

    findLatestTicketNumber(userId) {
        const accountId = requireId(userId, 'userId');
        return this.Ticket.max('ticket_Num', { where: { user_ID: accountId } }).then(value => {
            if (value == null) return null;
            const ticketNumber = Number(value);
            if (!Number.isInteger(ticketNumber) || ticketNumber < 0) {
                throw new BookingRepositoryError('INVALID_TICKET_NUMBER', 'The latest ticket number is invalid.');
            }
            return ticketNumber;
        }).catch(error => {
            if (error instanceof BookingRepositoryError) throw error;
            throw new BookingRepositoryError('TICKET_NUMBER_LOOKUP_FAILED', 'Unable to load the latest ticket number.', error);
        });
    }

    createTicket(reservation) {
        if (!reservation || typeof reservation !== 'object') {
            throw new BookingRepositoryError('INVALID_RESERVATION', 'A ticket reservation is required.');
        }
        const userId = requireId(reservation.userId, 'userId');
        const showtimeId = requireId(reservation.showtimeId, 'showtimeId');
        if (typeof reservation.code !== 'string' || !reservation.code.trim()
            || typeof reservation.seats !== 'string' || !reservation.seats.trim()
            || typeof reservation.seatType !== 'string' || !reservation.seatType.trim()
            || !Number.isFinite(Number(reservation.totalPrice)) || Number(reservation.totalPrice) < 0) {
            throw new BookingRepositoryError('INVALID_RESERVATION', 'Ticket code, seats, seat type, and a non-negative price are required.');
        }
        return this.Ticket.create({
            ticket_ID: reservation.code,
            ticket_Chair: reservation.seats,
            ticket_ChairType: reservation.seatType,
            ticket_TotalMoney: Number(reservation.totalPrice),
            cinemaTimeShow_ID: showtimeId,
            user_ID: userId,
        }).then(toPlainRecord).catch(error => {
            const duplicateCode = error && error.name === 'SequelizeUniqueConstraintError';
            throw new BookingRepositoryError(
                duplicateCode ? 'TICKET_CODE_CONFLICT' : 'TICKET_CREATE_FAILED',
                duplicateCode ? 'A ticket with this code already exists.' : 'Unable to save the ticket reservation.',
                error,
            );
        });
    }
}

module.exports = BookingRepository;
module.exports.BookingRepositoryError = BookingRepositoryError;
