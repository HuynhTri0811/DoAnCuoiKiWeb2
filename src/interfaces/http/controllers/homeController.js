function createHomeController({ getHomePage, searchFilms, getFilmList, getFilmDetails }) {
    return {
        /** Hiển thị trang chủ với dữ liệu dành cho phiên hiện tại. */
        async showHome(req, res) {
            return res.render('layouts/home.ejs', await getHomePage.execute(req.session.user_Id));
        },

        /** Tìm phim theo từ khóa người dùng nhập. */
        async search(req, res) {
            return res.render('layouts/home.ejs', await searchFilms.execute(req.query.txtSearch, req.session.user_Id));
        },

        /** Hiển thị danh sách phim hiện có. */
        async showFilmList(req, res) {
            return res.render('layouts/home.ejs', await getFilmList.execute(req.session.user_Id));
        },

        /** Hiển thị thông tin chi tiết của một phim. */
        async showFilm(req, res) {
            const data = await getFilmDetails.execute(Number(req.params.id), req.session.user_Id);
            return res.render('layouts/home.ejs', data);
        },

        /** Lưu rạp được chọn vào phiên và chuyển tới trang đặt vé. */
        selectCinema(req, res) {
            req.session.cinemaIDChosen = req.body.cinemaID;
            return res.redirect(`/phim/muave/${Number(req.params.id)}`);
        },

        /** Xóa thông tin người dùng khỏi phiên và quay về trang chủ. */
        logout(req, res) {
            delete req.session.user_Id;
            return res.redirect('/');
        },

        /** Hiển thị trang hỗ trợ khách hàng. */
        showSupport(req, res) {
            return res.render('layouts/home.ejs', { support: true });
        },

        /** Hiển thị trang giới thiệu dịch vụ. */
        showIntro(req, res) {
            return res.render('layouts/home.ejs', { intro: true });
        },
    };
}
module.exports = createHomeController;
