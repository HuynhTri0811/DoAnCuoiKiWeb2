/** Tạo handler quản lý phim và ảnh phim trong khu vực quản trị. */
function createAdminFilmController({ films, imageStorage }) {
    /** Đọc biểu mẫu, lưu ảnh tải lên và chuẩn hóa dữ liệu phim. */
    async function parseFilmInput(req) {
        const { fields, files } = await imageStorage.parseForm(req);
        const first = value => Array.isArray(value) ? value[0] : value;
        return {
            name: first(fields.txtFilmName),
            releaseDate: first(fields.txtFilmDatePublic),
            duration: Number(first(fields.txtFilmTime)),
            image: first(files.txtFilmImage),
        };
    }

    return {
        /** Hiển thị danh sách phim hiện có. */
        async list(req, res) {
            return res.render('layouts/admin.ejs', { filmAll: await films.list() });
        },

        /** Cập nhật thông tin phim và thay ảnh nếu có ảnh mới. */
        async update(req, res) {
            try {
                await films.update(Number(req.params.id), await parseFilmInput(req));
                return res.redirect('/admin/update/film/');
            } catch (error) {
                console.error('Unable to update film:', error);
                return res.render('pages/404.ejs');
            }
        },

        /** Tạo phim mới từ dữ liệu biểu mẫu quản trị. */
        async create(req, res) {
            try {
                await films.create(await parseFilmInput(req));
                return res.redirect('/admin/update/film/');
            } catch (error) {
                console.error('Unable to create film:', error);
                return res.render('pages/404.ejs');
            }
        },

        /** Xóa phim theo mã được gửi trong yêu cầu. */
        async delete(req, res) {
            try {
                await films.delete(Number(req.params.id));
                return res.redirect('/admin/update/film/');
            } catch (error) {
                console.error('Unable to delete film:', error);
                return res.render('pages/404.ejs');
            }
        },

        /** Hiển thị biểu mẫu thêm phim. */
        createForm(req, res) {
            return res.redirect('/admin/update/film/');
        },
    };
}

module.exports = createAdminFilmController;
