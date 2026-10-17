const Sequelize = require('sequelize');
const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class HomeRepository {
    /** Nhận các model dùng để truy vấn dữ liệu trang chủ và phim. */
    constructor({ Film, User, Cinema, Cineplex, TimeShow, CinemaTimeShow }) {
        Object.assign(this, { Film, User, Cinema, Cineplex, TimeShow, CinemaTimeShow });
    }

    /** Tìm thông tin người dùng hiện tại nếu đã đăng nhập. */
    async findCurrentUser(userId) {
        return userId ? this.User.findOne({ where: { user_ID: userId } }).then(toPlainRecord) : undefined;
    }

    /** Lấy phim đã đến ngày công chiếu. */
    findPublicFilmsBefore(date) {
        return this.Film.findAll({
            where: { film_DatePublic: { [Sequelize.Op.lte]: date }, film_Public: true },
            order: [['film_DatePublic', 'DESC']],
        }).then(toPlainRecords);
    }

    /** Lấy phim có ngày công chiếu trong tương lai. */
    findPublicFilmsAfter(date) {
        return this.Film.findAll({
            where: { film_DatePublic: { [Sequelize.Op.gt]: date }, film_Public: true },
            order: [['film_DatePublic', 'ASC']],
        }).then(toPlainRecords);
    }

    /** Tổng hợp người dùng, phim đang chiếu, sắp chiếu và phim nổi bật. */
    async getHomePageData(userId) {
        const now = Date.now();
        const [user, filmPublic, filmNoPublic, filmViewHigh] = await Promise.all([
            this.findCurrentUser(userId),
            this.findPublicFilmsBefore(now),
            this.findPublicFilmsAfter(now),
            this.Film.findAll({
                where: { film_DatePublic: { [Sequelize.Op.lte]: now }, film_Public: true },
                order: [['film_ViewCount', 'DESC']],
            }).then(toPlainRecords),
        ]);
        return { user, film: { filmPublic, filmNoPublic, filmViewHigh } };
    }

    /** Tìm phim theo tên và chia kết quả theo trạng thái công chiếu. */
    async searchFilms(name, userId) {
        const now = Date.now();
        const common = {
            film_Public: true,
            film_Name: { [Sequelize.Op.substring]: name },
        };
        const [searchNameFilmPublic, searchNameFilmNoPublic, user] = await Promise.all([
            this.Film.findAll({
                where: { ...common, film_DatePublic: { [Sequelize.Op.lte]: now } },
                order: [['film_DatePublic', 'DESC']],
            }).then(toPlainRecords),
            this.Film.findAll({
                where: { ...common, film_DatePublic: { [Sequelize.Op.gt]: now } },
                order: [['film_DatePublic', 'ASC']],
            }).then(toPlainRecords),
            this.findCurrentUser(userId),
        ]);
        return {
            user,
            searchNameFilm: { searchNameFilmPublic, searchNameFilmNoPublic },
        };
    }

    /** Chuẩn bị danh sách phim để hiển thị trang tổng hợp phim. */
    async getFilmList(userId) {
        const now = Date.now();
        const [user, filmDangChieu, filmSapChieu, filmXemNhieu] = await Promise.all([
            this.findCurrentUser(userId),
            this.findPublicFilmsBefore(now),
            this.findPublicFilmsAfter(now),
            this.Film.findAll({
                where: { film_DatePublic: { [Sequelize.Op.lte]: now }, film_Public: true },
                order: [['film_ViewCount', 'DESC']],
            }).then(toPlainRecords),
        ]);
        return { user, filmChieu: { filmDangChieu, filmSapChieu, filmXemNhieu } };
    }

    /** Tăng lượt xem cho phim được mở. */
    async incrementFilmViews(id) {
        return this.Film.increment('film_ViewCount', { where: { film_ID: id } });
    }

    /** Lấy phim, lịch chiếu, rạp và thông tin phiên cho trang chi tiết. */
    async getFilmDetails(id, userId) {
        const [filmID, user, filmDangChieu2, cinema, cineplex, cinemaTimeShow] = await Promise.all([
            this.Film.findOne({ where: { film_ID: id, film_Public: true } }).then(toPlainRecord),
            this.findCurrentUser(userId),
            this.Film.findAll({
                where: { film_DatePublic: { [Sequelize.Op.gt]: Date.now() }, film_Public: true },
            }).then(toPlainRecords),
            this.Cinema.findAll().then(toPlainRecords),
            this.Cineplex.findAll().then(toPlainRecords),
            this.CinemaTimeShow.findAll({
                where: { film_ID: id },
                order: [['cinema_ID', 'ASC'], ['timeShow_ID', 'ASC']],
                include: [{ model: this.Cinema }, { model: this.Film }, { model: this.TimeShow }],
            }).then(toPlainRecords),
        ]);
        return { filmID, user, filmDangChieu2, cinema, cineplex, cinemaTimeShow };
    }
}

module.exports = HomeRepository;
