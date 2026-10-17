/** Tạo các handler cho bảng điều khiển doanh thu quản trị. */
function createAdminDashboardController({ getSalesSummary }) {
    /** Tải số liệu và render bảng điều khiển theo khoảng ngày. */
    async function render(res, startDate, endDate) {
        return res.render('layouts/admin.ejs', await getSalesSummary.execute(startDate, endDate));
    }

    return {
        /** Hiển thị báo cáo doanh thu mặc định. */
        async show(req, res) {
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(1);
            return render(res, startDate, endDate);
        },
        /** Kiểm tra khoảng ngày gửi lên rồi lọc báo cáo doanh thu. */
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
        /** Kết thúc phiên quản trị và quay về trang đăng nhập. */
        logout(req, res) {
            delete req.session.Admin;
            return res.redirect('/');
        },
    };
}

module.exports = createAdminDashboardController;
