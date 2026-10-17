function createBookingController({ getSeatAvailability, authenticateBookingUser, bookSeats, bookings }) {
    return {
        /** Hiển thị sơ đồ ghế và trạng thái đặt chỗ của suất chiếu. */
        async showSeats(req, res) {
            if (!req.session.user_Id) return res.render('auth/login.ejs');
            const data = await getSeatAvailability.execute({
                userId: req.session.user_Id,
                showtimeId: Number(req.params.id),
            });
            return res.render('home/booking/select-seats.ejs', {
                user: data.user,
                cinemaTimeShow: data.cinemaTimeShow,
                ticket: data.ticket,
                ghe_da_dat: data.bookedSeats,
            });
        },

        /** Xác thực tài khoản và mở phiên đăng nhập để tiếp tục đặt vé. */
        async loginForBooking(req, res) {
            const userId = await authenticateBookingUser.execute({
                email: req.body.txtUserEmail,
                password: req.body.txtUserPassword,
            });
            if (!userId) return res.render('auth/login.ejs', { UserSaiPass: 'abc' });
            req.session.user_Id = userId;
            return res.redirect(`/phim/muave/${String(req.params.id)}`);
        },

        /** Quay lại trang chi tiết phim từ luồng đặt vé. */
        returnToFilm(req, res) {
            return res.redirect(`/phim/${String(req.params.id)}`);
        },

        /** Tạo đặt chỗ và hiển thị thông tin xác nhận. */
        async book(req, res) {
            try {
                const confirmation = await bookSeats.execute({
                    userId: req.session.user_Id,
                    showtimeId: Number(req.params.id),
                    chair: req.body.txtChair,
                    chairType: req.body.txtChairType,
                    totalMoney: req.body.txtTotalMoney,
                });
                return res.render('home/booking/confirmation.ejs', confirmation);
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },

        /** Trở về trang phim sau khi hoàn tất xác nhận vé. */
        async backFromConfirmation(req, res) {
            const showtime = await bookings.findShowtime(Number(req.params.id));
            return res.redirect(`/phim/${showtime.film_ID}`);
        },
    };
}

module.exports = createBookingController;
