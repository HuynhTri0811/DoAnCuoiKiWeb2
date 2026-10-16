function createAdminCatalogController({ catalog }) {
    return {
        async listUsers(req, res) {
            return res.render('layouts/admin.ejs', { userAll: await catalog.listUsers() });
        },
        async updateUser(req, res) {
            try {
                await catalog.updateUser(Number(req.params.id), {
                    user_Email: req.body.txtUserEmail,
                    user_Name: req.body.txtUserName,
                    user_NumberPhone: req.body.txtUserNumberPhone,
                });
                return res.redirect('/admin/update/user/');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        async deleteUser(req, res) {
            try {
                await catalog.deleteUser(Number(req.params.id));
                return res.redirect('/admin/update/user/');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        async listCinemas(req, res) {
            return res.render('layouts/admin.ejs', await catalog.listCinemas());
        },
        async updateCinema(req, res) {
            const id = Number(req.params.id);
            const cineplexId = Number(req.body.txtCineplexName);
            if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(cineplexId) || cineplexId <= 0) {
                return res.render('pages/404.ejs');
            }
            try {
                const cineplex = await catalog.findCineplex(cineplexId);
                if (!cineplex) return res.redirect('/admin');
                await catalog.updateCinema(id, {
                    cinema_Name: req.body.txtCinemaName,
                    cinema_Type: req.body.txtCinemaType,
                    cinema_Length: req.body.txtCinemaLength,
                    cinema_Width: req.body.txtCinemaWidth,
                    CineplexCineplexID: cineplex.cineplex_ID,
                });
                return res.redirect('/admin/update/cinema/');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        async createCinema(req, res) {
            try {
                const cineplexId = Number(req.body.txtCineplexName);
                const cineplex = await catalog.findCineplex(cineplexId);
                if (!cineplex) return res.redirect('/admin');
                await catalog.createCinema({
                    cinema_Name: req.body.txtCinemaName,
                    cinema_Type: req.body.txtCinemaType,
                    cinema_Length: req.body.txtCinemaLength,
                    cinema_Width: req.body.txtCinemaWidth,
                    CineplexCineplexID: cineplex.cineplex_ID,
                });
                return res.redirect('/admin/update/cinema');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        async deleteCinema(req, res) {
            try {
                await catalog.deleteCinema(Number(req.params.id));
                return res.redirect('/admin/update/cinema/');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        async listCineplexes(req, res) {
            return res.render('layouts/admin.ejs', { cineplex: await catalog.listCineplexes() });
        },
        async createCineplex(req, res) {
            try {
                await catalog.createCineplex({
                    cineplex_Name: req.body.cineplex_Name,
                    cineplex_Adress: req.body.cineplex_Adress,
                });
                return res.redirect('/admin/update/cineplex');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        async updateCineplex(req, res) {
            try {
                await catalog.updateCineplex(Number(req.params.id), {
                    cineplex_Name: req.body.txtCineplexName,
                    cineplex_Adress: req.body.txtCineplexAdress,
                });
                return res.redirect('/admin/update/cineplex');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        async deleteCineplex(req, res) {
            try {
                await catalog.deleteCineplex(Number(req.params.id));
                return res.redirect('/admin/update/cineplex');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
    };
}

module.exports = createAdminCatalogController;
