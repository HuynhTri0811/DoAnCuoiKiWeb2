const Sequelize = require('sequelize');
const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

/** Chuẩn hóa các hàng thống kê doanh thu để tầng ứng dụng xử lý. */
function toSalesRows(rows) {
    return (rows || []).map(row => ({
        CinemaTimeShow: toPlainRecord(row.CinemaTimeShow),
        dataValues: toPlainRecord(row.dataValues || row),
    }));
}

class AdminDashboardRepository {
    /** Nhận các model cần thiết để truy vấn dữ liệu doanh thu. */
    constructor({ Ticket, Cinema, Cineplex, Film, CinemaTimeShow }) {
        Object.assign(this, { Ticket, Cinema, Cineplex, Film, CinemaTimeShow });
    }

    /** Tổng hợp doanh thu và số vé trong khoảng ngày đã chọn. */
    async getSales(startDate, endDate) {
        const dateFilter = { [Sequelize.Op.between]: [startDate, endDate] };
        const [filmSales, cinemaSales, films, cinemas, cineplexes] = await Promise.all([
            this.Ticket.findAll({
                attributes: [
                    'CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID',
                    [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'],
                    [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc'],
                ],
                group: ['CinemaTimeShow.film_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
                include: [{ model: this.CinemaTimeShow, where: { cinemaTimeShow_Date: dateFilter } }],
            }),
            this.Ticket.findAll({
                attributes: [
                    'CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID',
                    [Sequelize.fn('SUM', Sequelize.col('ticket_TotalMoney')), 'TongTien'],
                    [Sequelize.fn('COUNT', Sequelize.col('ticket_TotalMoney')), 'SoVeBanDuoc'],
                ],
                group: ['CinemaTimeShow.cinema_ID', 'CinemaTimeShow.cinemaTimeShow_ID'],
                include: [{ model: this.CinemaTimeShow, where: { cinemaTimeShow_Date: dateFilter } }],
            }),
            this.Film.findAll({ where: { film_DatePublic: { [Sequelize.Op.lte]: Date.now() }, film_Public: true } }),
            this.Cinema.findAll(),
            this.Cineplex.findAll(),
        ]);
        return {
            filmSales: toSalesRows(filmSales),
            cinemaSales: toSalesRows(cinemaSales),
            films: toPlainRecords(films),
            cinemas: toPlainRecords(cinemas),
            cineplexes: toPlainRecords(cineplexes),
        };
    }
}

module.exports = AdminDashboardRepository;
