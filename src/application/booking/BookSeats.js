const TicketReservation = require('../../domain/booking/TicketReservation');

function formatMoney(value) {
    const amount = Number(value);
    return Number.isFinite(amount)
        ? new Intl.NumberFormat('vi-VN').format(amount).replace(/[\s\u00a0\u202f,]/g, '.')
        : '0';
}

function formatDate(value) {
    const dateOnly = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) return `${Number(dateOnly[3])}/${Number(dateOnly[2])}/${dateOnly[1]}`;
    const date = new Date(value);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

class BookSeats {
    constructor({ bookings, sendEmail }) {
        this.bookings = bookings;
        this.sendEmail = sendEmail;
    }

    async execute({ userId, showtimeId, chair, chairType, totalMoney }) {
        if (!userId) throw new Error('Authentication is required to book seats.');
        const [context, user, latestNumber] = await Promise.all([
            this.bookings.getBookingContext(showtimeId),
            this.bookings.findUserById(userId),
            this.bookings.findLatestTicketNumber(userId),
        ]);
        if (!context || !user) throw new Error('The requested booking was not found.');

        const ticketCode = `VNC_${context.cinema.cineplexName.slice(0, 1)}${context.cinema.name.slice(0, 1)}${context.film.name.slice(0, 1)}${userId}${Number(latestNumber || 0) + 1}`;
        const reservation = new TicketReservation({
            code: ticketCode,
            userId,
            showtimeId,
            seats: chair,
            seatType: chairType,
            totalPrice: totalMoney,
        });
        await this.bookings.createTicket(reservation);

        await this.sendEmail(
            user.email,
            'Thông tin vé',
            `Mã vé: ${ticketCode}\nPhim: ${context.film.name}\nXuất chiếu: ${context.startTime}\nNgày chiếu: ${formatDate(context.date)}\nCụm rạp/Rạp: ${context.cinema.cineplexName} / ${context.cinema.name}\nLoại ghế: ${chairType}\nGhế: ${chair}\nGiá vé: ${formatMoney(totalMoney)} ₫\n\nVNCinema xin chân thành cảm ơn bạn đã tin tưởng lựa chọn chúng tôi!`
        );

        const timeShow_Chosen = await this.bookings.findShowtime(showtimeId);
        return { timeShow_Chosen, txtChair: chair, txtChairType: chairType, txtTotalMoney: totalMoney, txtMave: ticketCode };
    }
}

module.exports = BookSeats;

