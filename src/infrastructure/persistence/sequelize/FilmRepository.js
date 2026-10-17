const { toPlainRecord, toPlainRecords } = require('./toPlainRecord');

class FilmRepository {
    /** Lưu model phim để phục vụ các thao tác lưu trữ. */
    constructor(Film) { this.Film = Film; }

    /** Lấy toàn bộ phim theo thứ tự mã tăng dần. */
    listAll() { return this.Film.findAll({ order: [['film_ID', 'ASC']] }).then(toPlainRecords); }
    /** Tạo phim mới và trả về dữ liệu thuần. */
    create(attributes) { return this.Film.create(attributes).then(toPlainRecord); }
    /** Cập nhật thông tin phim theo mã. */
    update(id, attributes) { return this.Film.update(attributes, { where: { film_ID: id } }); }
    /** Xóa phim theo mã. */
    delete(id) { return this.Film.destroy({ where: { film_ID: id } }); }
}

module.exports = FilmRepository;
