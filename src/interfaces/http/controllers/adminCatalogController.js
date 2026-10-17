/** Tạo handler quản lý người dùng, rạp và cụm rạp. */
function createAdminCatalogController({ catalog }) {
    return {
        /** Hiển thị danh sách tài khoản người dùng. */
        async listUsers(req, res) {
            return res.render('layouts/admin.ejs', { userAll: await catalog.listUsers() });
        },
        /** Cập nhật thông tin tài khoản theo mã. */
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
        /** Xóa tài khoản theo mã. */
        async deleteUser(req, res) {
            try {
                await catalog.deleteUser(Number(req.params.id));
                return res.redirect('/admin/update/user/');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        /** Hiển thị danh sách rạp cùng thông tin cụm rạp. */
        async listCinemas(req, res) {
            return res.render('layouts/admin.ejs', await catalog.listCinemas());
        },
        /** Cập nhật thông tin rạp và cụm rạp trực thuộc. */
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
        /** Tạo rạp mới trong cụm rạp được chọn. */
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
        /** Xóa rạp theo mã. */
        async deleteCinema(req, res) {
            try {
                await catalog.deleteCinema(Number(req.params.id));
                return res.redirect('/admin/update/cinema/');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },
        /** Hiển thị danh sách cụm rạp. */
        async listCineplexes(req, res) {
            return res.render('layouts/admin.ejs', { cineplex: await catalog.listCineplexes() });
        },
        /** Tạo cụm rạp mới. */
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
        /** Cập nhật tên và địa chỉ cụm rạp. */
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
        /** Xóa cụm rạp theo mã. */
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
