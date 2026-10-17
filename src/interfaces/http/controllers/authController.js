/** Tạo handler cho đăng nhập, đăng ký và khôi phục mật khẩu. */
function createAuthController({ authenticateUser, registerUser, confirmRegistration,
    requestPasswordReset, verifyPasswordResetCode, resetPassword }) {
    return {
        /** Hiển thị biểu mẫu đăng nhập. */
        showLogin(req, res) {
            return res.render('auth/login.ejs');
        },

        /** Xác thực thông tin đăng nhập và thiết lập phiên phù hợp. */
        async login(req, res) {
            const result = await authenticateUser.execute({
                email: req.body.txtUserEmail,
                password: req.body.txtUserPassword,
            });
            if (result.kind === 'admin') {
                req.session.Admin = req.body.txtUserEmail;
                return res.redirect('/admin');
            }
            if (result.kind === 'authenticated') {
                req.session.user_Id = result.userId;
                return res.redirect('/');
            }
            if (result.kind === 'unconfirmed') {
                return res.render('auth/login.ejs', { error: 'Vui long xac nhan email!' });
            }
            return res.render('auth/login.ejs', { UserSaiPass: 'abc' });
        },

        /** Hiển thị biểu mẫu đăng ký tài khoản. */
        showSignup(req, res) {
            return res.render('auth/sign-up.ejs');
        },

        /** Tạo yêu cầu đăng ký và gửi email xác nhận. */
        async signup(req, res) {
            const result = await registerUser.execute({
                email: req.body.user_Email,
                password: req.body.user_Password,
                name: req.body.user_Name,
                phone: req.body.user_NumberPhone,
            });
            if (result.kind === 'email-taken') return res.render('auth/sign-up.ejs', { User: result.user });
            if (result.kind === 'phone-taken') return res.render('auth/sign-up.ejs', { NumberPhone: result.user });
            return res.render('auth/sign-up-confirm.ejs', { user_Email: result.email });
        },

        /** Kiểm tra mã xác nhận đăng ký và đăng nhập tài khoản mới. */
        async confirmSignup(req, res, next) {
            const email = req.body.email;
            try {
                const result = await confirmRegistration.execute({ email, code: req.body.user_ConfirmEmail });
                if (result.kind === 'invalid-code') {
                    return res.render('auth/sign-up-confirm.ejs', { user_Email: email, codefail: 'a' });
                }
                req.session.user_Id = result.userId;
                return res.redirect('/');
            } catch (error) {
                return next(error);
            }
        },

        /** Hiển thị biểu mẫu yêu cầu đặt lại mật khẩu. */
        showForgotPassword(req, res) {
            return res.render('auth/forgot-password.ejs');
        },

        /** Gửi mã đặt lại mật khẩu đến email hợp lệ. */
        async requestPasswordReset(req, res) {
            const email = req.body.email;
            const result = await requestPasswordReset.execute(email);
            if (result.kind === 'unconfirmed') {
                return res.render('auth/forgot-password.ejs', { error: 'Email chưa xác nhận!' });
            }
            if (result.kind === 'email-not-found') {
                return res.render('auth/forgot-password.ejs', { UserSaiMail: 'abc' });
            }
            return res.render('auth/forgot-password-confirm.ejs', { mail: email });
        },

        /** Hiển thị biểu mẫu nhập mã đặt lại mật khẩu. */
        showForgotPasswordConfirmation(req, res) {
            return res.render('auth/forgot-password-confirm.ejs');
        },

        /** Xác minh mã đặt lại mật khẩu do người dùng cung cấp. */
        async confirmPasswordReset(req, res) {
            const email = req.body.email;
            const result = await verifyPasswordResetCode.execute({ email, code: req.body.user_ConfirmEmail });
            if (result.kind === 'valid') return res.render('auth/reset-password.ejs', { mail: email });
            return res.render('auth/forgot-password-confirm.ejs', { mail: email, codefail: 'a' });
        },

        /** Hiển thị biểu mẫu nhập mật khẩu mới. */
        showResetPassword(req, res) {
            return res.render('auth/reset-password.ejs');
        },

        /** Cập nhật mật khẩu khi hai giá trị nhập khớp nhau. */
        async resetPasswordHandler(req, res) {
            const email = req.body.email;
            const result = await resetPassword.execute({
                email,
                password: req.body.user_Password,
                confirmation: req.body.user_ConfirmPassword,
            });
            if (result.kind === 'password-mismatch') {
                return res.render('auth/reset-password.ejs', { mail: email, passsai: 'abc' });
            }
            return res.redirect('/');
        },
    };
}

module.exports = createAuthController;
