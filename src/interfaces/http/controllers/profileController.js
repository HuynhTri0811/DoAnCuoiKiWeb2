function createProfileController({ getProfile, updateProfile }) {
    return {
        /** Tải hồ sơ của người dùng đang đăng nhập. */
        async show(req, res) {
            const profile = await getProfile.execute(req.session.user_Id);
            if (!profile) return res.redirect('/');
            return res.render('account/profile.ejs', profile);
        },

        /** Cập nhật trường hồ sơ được gửi từ biểu mẫu. */
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

        /** Điều hướng người dùng từ trang hồ sơ về trang chủ. */
        backToHome(req, res) {
            req.session.user_Id = req.session.user_Id;
            return res.redirect('/');
        },
    };
}

module.exports = createProfileController;
