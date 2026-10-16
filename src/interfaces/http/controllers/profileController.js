function createProfileController({ getProfile, updateProfile }) {
    return {
        async show(req, res) {
            const profile = await getProfile.execute(req.session.user_Id);
            if (!profile) return res.redirect('/');
            return res.render('account/profile.ejs', profile);
        },

        async update(req, res) {
            const requestFields = {
                name: 'txtUserName',
                numberphone: 'txtUserNumberPhone',
                email: 'txtUserEmail',
                password: 'txtUserPassword',
                address: 'txtUserAddress',
            };
            try {
                const result = await updateProfile.execute({
                    userId: req.session.user_Id,
                    field: req.params.field === 'numberphone' ? 'phone' : req.params.field,
                    value: req.body[requestFields[req.params.field]],
                });
                if (result.kind === 'unauthenticated') return;
                return res.redirect('/updateInfo');
            } catch (error) {
                return res.render('pages/404.ejs');
            }
        },

        backToHome(req, res) {
            req.session.user_Id = req.session.user_Id;
            return res.redirect('/');
        },
    };
}

module.exports = createProfileController;
