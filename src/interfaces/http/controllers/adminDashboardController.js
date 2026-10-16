function createAdminDashboardController({ getSalesSummary }) {
    async function render(res, startDate, endDate) {
        return res.render('layouts/admin.ejs', await getSalesSummary.execute(startDate, endDate));
    }

    return {
        async show(req, res) {
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(1);
            return render(res, startDate, endDate);
        },
        async filter(req, res) {
            const { txtDateOne, txtDateTwo } = req.body;
            const startDate = new Date(txtDateOne);
            const endDate = new Date(txtDateTwo);
            if (!txtDateOne || !txtDateTwo || Number.isNaN(startDate.getTime())
                || Number.isNaN(endDate.getTime()) || startDate > endDate) {
                return res.status(400).render('pages/404.ejs');
            }
            return render(res, startDate, endDate);
        },
        logout(req, res) {
            delete req.session.Admin;
            return res.redirect('/');
        },
    };
}

module.exports = createAdminDashboardController;
