class TicketReservation {
    constructor({ code, userId, showtimeId, seats, seatType, totalPrice }) {
        this.code = code;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.seats = seats;
        this.seatType = seatType;
        this.totalPrice = totalPrice;
        Object.freeze(this);
    }
}

module.exports = TicketReservation;
