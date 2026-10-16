class GetSeatAvailability {
    constructor({ bookings }) { this.bookings = bookings; }

    async execute({ userId, showtimeId }) {
        const [user, cinemaTimeShow, ticket] = await Promise.all([
            this.bookings.findUserById(userId),
            this.bookings.findShowtime(showtimeId),
            this.bookings.findTicketsForShowtime(showtimeId),
        ]);
        const bookedSeats = ticket.map(item => item.ticket_Chair).filter(Boolean).join(', ');
        return { user, cinemaTimeShow, ticket, bookedSeats };
    }
}
module.exports = GetSeatAvailability;
