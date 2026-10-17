const Sequelize = require('sequelize');
const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class ShowtimeRepository {
    /** Nhận các model rạp, phim, khung giờ và lịch chiếu. */
    constructor({ Cinema, Film, TimeShow, CinemaTimeShow }) {
        Object.assign(this, { Cinema, Film, TimeShow, CinemaTimeShow });
    }

    /** Lấy các suất chiếu của rạp kèm thông tin liên quan. */
    listByCinema(id) {
        return this.CinemaTimeShow.findAll({
            where: { cinema_ID: id },
            include: [{ model: this.Cinema }, { model: this.Film }, { model: this.TimeShow }],
        }).then(toPlainRecords);
    }

    /** Lấy các suất chiếu của phim kèm thông tin liên quan. */
    listByFilm(id) {
        return this.CinemaTimeShow.findAll({
            where: { film_ID: id },
            include: [{ model: this.Cinema }, { model: this.Film }, { model: this.TimeShow }],
        }).then(toPlainRecords);
    }

    /** Lấy toàn bộ rạp hoặc rạp khớp mã nếu có truyền vào. */
    listCinemas(id) { return this.Cinema.findAll(id ? { where: { cinema_ID: id } } : {}).then(toPlainRecords); }
    /** Lấy danh sách khung giờ chiếu. */
    listTimes() { return this.TimeShow.findAll().then(toPlainRecords); }
    /** Lấy các phim đã công chiếu và đang được công khai. */
    listPublicFilms() {
        return this.Film.findAll({
            where: { film_DatePublic: { [Sequelize.Op.lte]: Date.now() }, film_Public: true },
        }).then(toPlainRecords);
    }
    /** Tìm phim theo mã để gắn vào lịch chiếu. */
    findFilm(id) { return this.Film.findAll({ where: { film_ID: id } }).then(toPlainRecords); }
    /** Kiểm tra rạp đã có suất chiếu trùng ngày và khung giờ chưa. */
    findDuplicate({ cinemaId, date, timeShowId }) {
        return this.CinemaTimeShow.findOne({
            where: { cinema_ID: cinemaId, cinemaTimeShow_Date: date, timeShow_ID: timeShowId },
        }).then(toPlainRecord);
    }
    /** Tạo suất chiếu mới. */
    create(attributes) { return this.CinemaTimeShow.create(attributes).then(toPlainRecord); }
    /** Xóa suất chiếu theo mã. */
    delete(id) { return this.CinemaTimeShow.destroy({ where: { cinemaTimeShow_ID: id } }); }
}

module.exports = ShowtimeRepository;
