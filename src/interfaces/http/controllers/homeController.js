function createHomeController({ getHomePage, searchFilms, getFilmList, getFilmDetails }) {
    return {
        async showHome(req, res) {
            return res.render('layouts/home.ejs', await getHomePage.execute(req.session.user_Id));
        },

        async search(req, res) {
            return res.render('layouts/home.ejs', await searchFilms.execute(req.query.txtSearch, req.session.user_Id));
        },

        async showFilmList(req, res) {
            return res.render('layouts/home.ejs', await getFilmList.execute(req.session.user_Id));
        },

        async showFilm(req, res) {
            const data = await getFilmDetails.execute(Number(req.params.id), req.session.user_Id);
            return res.render('layouts/home.ejs', data);
        },

        selectCinema(req, res) {
            req.session.cinemaIDChosen = req.body.cinemaID;
            return res.redirect(`/phim/muave/${Number(req.params.id)}`);
        },

        logout(req, res) {
            delete req.session.user_Id;
            return res.redirect('/');
        },

        showSupport(req, res) {
            return res.render('layouts/home.ejs', { support: true });
        },

        showIntro(req, res) {
            return res.render('layouts/home.ejs', { intro: true });
        },
    };
}
module.exports = createHomeController;
