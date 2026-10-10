function isAdmin(req) {
    return Boolean(req.session && req.session.Admin);
}

function redirectIfNotAdmin(req, res) {
    if (isAdmin(req)) return false;
    res.redirect('/');
    return true;
}

module.exports = { isAdmin, redirectIfNotAdmin };
