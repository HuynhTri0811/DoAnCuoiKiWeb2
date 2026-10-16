function createAdminShowtimeController({ showtimes }) {
    function getReturnPath(req, fallbackCinemaId) {
        const returnPath = req.session.cinemaTimeShowReturnPath;
        if (/^\/admin\/update\/cinemaTimeShow\/(cinema|film)\/\d+$/.test(returnPath || '')) return returnPath;
        if (Number.isInteger(fallbackCinemaId) && fallbackCinemaId > 0) {
            return `/admin/update/cinemaTimeShow/cinema/${fallbackCinemaId}`;
        }
        return '/admin/update/cinema';
    }

    return {
        async listByCinema(req, res) {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) return res.render('pages/404.ejs');
            req.session.cinemaTimeShowReturnPath = `/admin/update/cinemaTimeShow/cinema/${id}`;
            const loi = req.session.loi;
            delete req.session.loi;
            return res.render('layouts/admin.ejs', { ...await showtimes.listForCinema(id), loi });
        },

        async listByFilm(req, res) {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) return res.render('pages/404.ejs');
            req.session.cinemaTimeShowReturnPath = `/admin/update/cinemaTimeShow/film/${id}`;
            const loi = req.session.loi;
            delete req.session.loi;
            return res.render('layouts/admin.ejs', { ...await showtimes.listForFilm(id), loi });
        },

        async create(req, res) {
            const cinemaId = Number(req.body.txtcinema_ID);
            const returnPath = getReturnPath(req, cinemaId);
            try {
                const result = await showtimes.create({
                    cinemaId,
                    date: req.body.txtCinemaTimeShow_Date,
                    timeShowId: Number(req.body.timeShowID),
                    filmId: Number(req.body.filmID),
                });
                if (result.kind === 'invalid') req.session.loi = 'Thông tin xuất chiếu không hợp lệ. Vui lòng kiểm tra lại.';
                else if (result.kind === 'duplicate') req.session.loi = 'Suất chiếu này đã tồn tại. Vui lòng chọn thời gian khác.';
                else delete req.session.loi;
            } catch (error) {
                console.error('Unable to create showtime:', error);
                req.session.loi = 'Không thể tạo suất chiếu. Vui lòng kiểm tra lại thông tin.';
            }
            return res.redirect(returnPath);
        },

        createPage(req, res) {
            return res.redirect('/admin/update/cinemaTimeShow/');
        },

        async delete(req, res) {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) return res.render('pages/404.ejs');
            try {
                await showtimes.delete(id);
                return res.redirect(getReturnPath(req));
            } catch (error) {
                console.error('Unable to delete showtime:', error);
                return res.render('pages/404.ejs');
            }
        },

    };
}

module.exports = createAdminShowtimeController;
