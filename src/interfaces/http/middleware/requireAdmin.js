function requireAdmin(req, res, next) {
    if (req.session && req.session.Admin) return next();
    return res.redirect('/');
}

module.exports = requireAdmin;
