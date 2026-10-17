const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FilmImageStorage {
    /** Cấu hình thư mục lưu ảnh và bộ phân tích biểu mẫu tải lên. */
    constructor(directory, Formidable) {
        this.directory = directory || path.join(process.cwd(), 'public/image');
        this.Formidable = Formidable;
        this.allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    }

    /** Phân tích multipart form và thu dọn tệp tạm nếu phát sinh lỗi. */
    async parseForm(req) {
        await fs.promises.mkdir(this.directory, { recursive: true });
        return new Promise((resolve, reject) => {
            const Formidable = this.Formidable || require('formidable');
            const form = new Formidable.IncomingForm({
                uploadDir: this.directory,
                keepExtensions: true,
                maxFileSize: 10 * 1024 * 1024,
            });
            form.parse(req, (error, fields, files) => {
                if (error) {
                    Object.values(files || {}).flat().forEach(upload => {
                        if (upload && upload.path) fs.promises.unlink(upload.path).catch(() => {});
                    });
                    return reject(error);
                }
                resolve({ fields, files });
            });
        });
    }

    /** Kiểm tra loại ảnh và chuyển ảnh tải lên vào thư mục công khai. */
    async save(upload) {
        if (!upload || !upload.path || !upload.name) throw new Error('A film image is required.');
        const extension = path.extname(upload.name).toLowerCase();
        if (!this.allowedExtensions.has(extension)) throw new Error('Unsupported film image type.');
        await fs.promises.mkdir(this.directory, { recursive: true });
        const filename = `film-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
        await fs.promises.rename(upload.path, path.join(this.directory, filename));
        return `/public/image/${filename}`;
    }

    /** Xóa tệp tải lên tạm sau khi không còn cần dùng. */
    async remove(upload) {
        if (upload && upload.path) await fs.promises.unlink(upload.path).catch(() => {});
    }

    /** Xóa ảnh đã lưu dựa trên đường dẫn công khai của ảnh. */
    async removeSaved(publicPath) {
        if (!publicPath) return;
        const filename = path.basename(publicPath);
        await fs.promises.unlink(path.join(this.directory, filename)).catch(() => {});
    }
}

module.exports = FilmImageStorage;
