const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class AdminCatalogRepository {
    /** Nhận các model dùng để quản lý người dùng, rạp và cụm rạp. */
    constructor({ User, Cinema, Cineplex }) {
        Object.assign(this, { User, Cinema, Cineplex });
    }

    /** Lấy danh sách người dùng. */
    listUsers() { return this.User.findAll().then(toPlainRecords); }
    /** Cập nhật thuộc tính người dùng theo mã. */
    updateUser(id, attributes) { return this.User.update(attributes, { where: { user_ID: id } }); }
    /** Xóa người dùng theo mã. */
    deleteUser(id) { return this.User.destroy({ where: { user_ID: id } }); }

    /** Lấy danh sách rạp kèm thông tin cụm rạp. */
    listCinemas() { return this.Cinema.findAll({ include: [{ model: this.Cineplex }] }).then(toPlainRecords); }
    /** Lấy toàn bộ cụm rạp. */
    listCineplexes() { return this.Cineplex.findAll().then(toPlainRecords); }
    /** Tìm một cụm rạp theo mã. */
    findCineplex(id) { return this.Cineplex.findOne({ where: { cineplex_ID: id } }).then(toPlainRecord); }
    /** Tạo rạp mới. */
    createCinema(attributes) { return this.Cinema.create(attributes).then(toPlainRecord); }
    /** Cập nhật rạp theo mã. */
    updateCinema(id, attributes) { return this.Cinema.update(attributes, { where: { cinema_ID: id } }); }
    /** Xóa rạp theo mã. */
    deleteCinema(id) { return this.Cinema.destroy({ where: { cinema_ID: id } }); }
    /** Tạo cụm rạp mới. */
    createCineplex(attributes) { return this.Cineplex.create(attributes).then(toPlainRecord); }
    /** Cập nhật cụm rạp theo mã. */
    updateCineplex(id, attributes) { return this.Cineplex.update(attributes, { where: { cineplex_ID: id } }); }
    /** Xóa cụm rạp theo mã. */
    deleteCineplex(id) { return this.Cineplex.destroy({ where: { cineplex_ID: id } }); }
}

module.exports = AdminCatalogRepository;
