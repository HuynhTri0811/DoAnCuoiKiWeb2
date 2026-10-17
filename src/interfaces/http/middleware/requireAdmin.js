/** Chỉ cho phép phiên quản trị tiếp tục truy cập tuyến được bảo vệ. */
function requireAdmin(req, res, next) {
    if (req.session && req.session.Admin) return next();
    return res.redirect('/');
}

module.exports = requireAdmin;
