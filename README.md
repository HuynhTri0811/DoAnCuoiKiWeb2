# VNCinema — DoAnCuoiKiWeb2

Ứng dụng web đặt vé xem phim xây dựng bằng Node.js, Express, EJS, Sequelize và PostgreSQL. Tài liệu tổng quan, hướng dẫn chạy, sơ đồ route, dữ liệu và các lưu ý khi vận hành nằm trong [`docs/README.md`](docs/README.md).

## Chạy ứng dụng

Yêu cầu Node.js, npm và PostgreSQL. Từ thư mục dự án:

```sh
npm install
DATABASE_URL='postgres://user:password@localhost:5432/database' node app.js
```

Có thể đặt `PORT` để đổi cổng (mặc định `3000`). `DATABASE_URL` là URL kết nối PostgreSQL; nếu bỏ trống, ứng dụng dùng cấu hình mặc định trong `src/infrastructure/persistence/sequelize/models/db.js`. Chạy bộ test bằng `npm test`.

## Tài liệu

- [Tổng quan dự án và hướng dẫn phát triển](docs/README.md)
- [Báo cáo rà soát route quản trị](docs/admin-review.md)
- [Các vấn đề và lưu ý vận hành](docs/security-and-known-issues.md)
