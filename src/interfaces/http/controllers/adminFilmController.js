function createAdminFilmController({ films, imageStorage }) {
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
        async list(req, res) {
            return res.render('layouts/admin.ejs', { filmAll: await films.list() });
        },

        async update(req, res) {
            try {
                await films.update(Number(req.params.id), await parseFilmInput(req));
                return res.redirect('/admin/update/film/');
            } catch (error) {
                console.error('Unable to update film:', error);
                return res.render('pages/404.ejs');
            }
        },

        async create(req, res) {
            try {
                await films.create(await parseFilmInput(req));
                return res.redirect('/admin/update/film/');
            } catch (error) {
                console.error('Unable to create film:', error);
                return res.render('pages/404.ejs');
            }
        },

        async delete(req, res) {
            try {
                await films.delete(Number(req.params.id));
                return res.redirect('/admin/update/film/');
            } catch (error) {
                console.error('Unable to delete film:', error);
                return res.render('pages/404.ejs');
            }
        },

        createForm(req, res) {
            return res.redirect('/admin/update/film/');
        },
    };
}

module.exports = createAdminFilmController;
