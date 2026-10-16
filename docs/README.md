# Tài liệu dự án VNCinema

> Tài liệu được tổng hợp từ mã nguồn hiện có. Một số hành vi được ghi nhận là hiện trạng của code, không phải khuyến nghị triển khai production.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ và lệnh chạy](#công-nghệ-và-lệnh-chạy)
- [Cấu trúc mã nguồn](#cấu-trúc-mã-nguồn)
- [Luồng request và route](#luồng-request-và-route)
- [Mô hình dữ liệu](#mô-hình-dữ-liệu)
- [Giao diện và tài nguyên tĩnh](#giao-diện-và-tài-nguyên-tĩnh)
- [Cấu hình và biến môi trường](#cấu-hình-và-biến-môi-trường)
- [Kiểm tra và tài liệu liên quan](#kiểm-tra-và-tài-liệu-liên-quan)

## Giới thiệu

VNCinema là ứng dụng đặt vé xem phim. Người dùng có thể xem và tìm phim, xem lịch chiếu, chọn ghế, đặt vé, quản lý thông tin tài khoản, đăng ký và xác nhận email. Khu vực quản trị có các trang thống kê và quản lý phim, rạp, cụm rạp, suất chiếu và người dùng.

Ứng dụng dùng Express 4 và EJS. Dữ liệu được thao tác qua Sequelize 5 với PostgreSQL. Các route render template phía server trong `views/`; CSS, JavaScript phía trình duyệt và ảnh được phục vụ từ `public/` dưới URL `/public`.

## Công nghệ và lệnh chạy

### Yêu cầu

- Node.js và npm.
- PostgreSQL có database mà ứng dụng được phép kết nối.
- Các thư viện được khai báo trong `package.json` và cài bằng `npm install`.

### Khởi động

Khởi động ứng dụng bằng:

```sh
npm install
DATABASE_URL='postgres://user:password@localhost:5432/database' node app.js
```

Trên Windows PowerShell, có thể đặt biến môi trường cho phiên hiện tại trước khi chạy:

```powershell
$env:DATABASE_URL = 'postgres://user:password@localhost:5432/database'
node app.js
```

`PORT` tùy chọn; mặc định cổng là `3000`. Khi khởi động, ứng dụng gọi `db.sync()` rồi mới mở HTTP server. Kết nối hoặc đồng bộ database thất bại sẽ khiến tiến trình thoát với mã lỗi.

### Database

`models/db.js` đọc `DATABASE_URL`; nếu không có biến này, code dùng URL PostgreSQL mặc định `postgres://admin:admin@localhost:5432/Web2`. Không nên dùng cấu hình mặc định này bên ngoài máy phát triển. `db.sync()` tạo các bảng còn thiếu theo model; dự án chưa có thư mục migration hoặc quy trình migration được khai báo.

## Cấu trúc mã nguồn

```text
.
├── app.js                 # Bootstrap database và HTTP server
├── src/
│   ├── domain/            # Entity và quy tắc nghiệp vụ độc lập
│   ├── application/       # Use case theo chức năng
│   ├── infrastructure/   # Sequelize repository, email, upload và bảo mật
│   ├── interfaces/http/   # Express controller, router helper và middleware
│   └── container.js      # Composition root, nối use case với adapter
├── models/                # Sequelize models và kết nối database
├── routes/                # Khai báo URL và gắn controller/middleware
│   ├── admin/             # Router theo tính năng quản trị
│   └── home/              # Router phim, tìm kiếm và đặt vé
├── views/                 # EJS templates, chia theo khu vực chức năng
│   ├── layouts/           # Khung trang home và admin
│   ├── auth/              # Đăng nhập, đăng ký, xác nhận và đặt lại mật khẩu
│   ├── account/           # Hồ sơ và các phần giao diện hồ sơ
│   ├── home/              # Nội dung trang phim, header và đặt vé
│   ├── admin/             # Các partial quản trị và template cũ
│   └── pages/             # Trang lỗi dùng chung
├── public/                # CSS, JavaScript trình duyệt, ảnh và thư viện tĩnh
├── docs/                  # Tài liệu dự án và báo cáo rà soát
├── package.json           # Metadata, script và dependencies
└── package-lock.json      # Khóa phiên bản dependencies
```

`routes/admin.js` và `routes/home.js` là điểm vào tương thích với `app.js`; chúng chuyển tiếp đến `routes/admin/index.js` và `routes/home/index.js`. Router chỉ khai báo URL. Controller chuyển đổi request/response, use case giữ luồng nghiệp vụ, repository thực hiện truy vấn. `src/container.js` là nơi tạo và kết nối các phụ thuộc cụ thể.

## Luồng request và route

`app.js` cấu hình EJS, body parser cho form URL encoded, session, static files rồi mount các router. Các tiền tố mount và chức năng chính:

| Tiền tố | File route | Chức năng |
| --- | --- | --- |
| `/` | `routes/home/` | Trang chủ, giới thiệu, hỗ trợ, tìm kiếm phim, chi tiết phim, đặt vé |
| `/login` | `routes/Login.js` | Đăng nhập người dùng và admin |
| `/signup` | `routes/signUp.js` | Đăng ký và xác nhận tài khoản |
| `/forgotPassword` | `routes/forgotPassword.js` | Gửi mã email và đặt lại mật khẩu |
| `/updateInfo` | `routes/updateInfo.js` | Xem vé và cập nhật hồ sơ người dùng |
| `/admin` | `routes/admin/` | Dashboard, phim, rạp, cụm rạp, suất chiếu, người dùng |

### Route home

- `routes/home/pages.js`: `/`, `/filmSearch`, `/forgotPassword`, `/logout`, `/support`, `/intro`.
- `routes/home/films.js`: `/phim`, `/phim/:id` và gửi lựa chọn rạp.
- `routes/home/booking.js`: xem sơ đồ ghế `/phim/muave/:id`, gửi thông tin đặt vé, xem vé đã đặt và quay lại phim.

### Route quản trị

- `routes/admin/dashboard.js`: `/admin` hiển thị thống kê theo khoảng ngày; `/admin/logout` xóa trạng thái admin trong session.
- `routes/admin/films.js`: danh sách, tạo, cập nhật và xóa phim. Ảnh tải lên được lưu ở `public/image/`.
- `routes/admin/cinemas.js`: tạo, cập nhật, xóa rạp.
- `routes/admin/cineplexes.js`: tạo, cập nhật, xóa cụm rạp.
- `routes/admin/showtimes.js`: xem suất chiếu theo rạp/phim, tạo và xóa suất chiếu.
- `routes/admin/users.js`: danh sách, cập nhật và xóa người dùng.

Các thao tác xóa quản trị hiện dùng POST. Quyền quản trị được kiểm tra bởi middleware `src/interfaces/http/middleware/requireAdmin.js`, dựa trên `req.session.Admin`.

## Mô hình dữ liệu

Các model Sequelize được khai báo trong `models/`:

| Model | Vai trò / quan hệ theo code |
| --- | --- |
| `User` | Tài khoản, thông tin liên hệ, mật khẩu, mã xác nhận và trạng thái xác nhận email. Email có unique constraint. |
| `Film` | Tên phim, ngày chiếu, ảnh, thời lượng, lượt xem, trạng thái công khai và nội dung. |
| `Cineplex` | Cụm rạp và địa chỉ. |
| `Cinema` | Phòng/rạp, loại và kích thước; `belongsTo(Cineplex)`. |
| `TimeShow` | Giờ bắt đầu và kết thúc của suất chiếu. |
| `CinemaTimeShow` | Lịch chiếu theo ngày, liên kết `Cinema`, `Film`, `TimeShow`. |
| `Ticket` | Mã vé, ghế, loại ghế, tổng tiền, liên kết người dùng và lịch chiếu. |

Quan hệ chính: một suất chiếu `CinemaTimeShow` trỏ tới một rạp, phim và khung giờ; một `Ticket` trỏ tới người dùng và suất chiếu. Tên khóa ngoại tự sinh của Sequelize cần được kiểm tra khi thao tác trực tiếp với database vì code hiện dùng cả trường khóa ngoại khai báo tường minh lẫn trường quan hệ tự sinh.

## Giao diện và tài nguyên tĩnh

- `views/layouts/home.ejs` là khung trang người dùng, include nội dung phim trong `views/home/content/` và header trong `views/home/partials/header/`.
- `views/layouts/admin.ejs` là khung quản trị, include các màn hình con trong `views/admin/partials/`.
- `views/auth/` chứa các trang đăng nhập, đăng ký, xác nhận email và đặt lại mật khẩu.
- `views/account/` chứa trang hồ sơ và các partial thông tin người dùng.
- `views/home/booking/` chứa giao diện chọn ghế và xác nhận vé.
- `views/pages/` chứa trang lỗi 404 dùng chung.
- `public/css/` chia CSS theo admin, user và trang chung.
- `public/js/` chứa kiểm tra form phía trình duyệt và các thư viện jQuery cũ.
- `public/image/` chứa ảnh phim, banner, icon và ảnh giao diện.

## Cấu hình và biến môi trường

| Biến | Công dụng | Mặc định trong code |
| --- | --- | --- |
| `PORT` | Cổng HTTP | `3000` |
| `SESSION_SECRET` | Secret ký session | `keyboard cat` (fallback phát triển; cần cấu hình riêng khi triển khai) |
| `DATABASE_URL` | URL PostgreSQL cho Sequelize | `postgres://admin:admin@localhost:5432/Web2` |

Cấu hình gửi email nằm trong adapter `src/infrastructure/messaging/sendEmail.js`, hiện vẫn chứa thông tin SMTP cố định thay vì đọc biến môi trường. Trước khi triển khai hoặc chia sẻ mã nguồn, cần chuyển thông tin xác thực sang secret/environment variables và thay thông tin xác thực có thể đã từng được commit. Các rủi ro cấu hình khác được ghi trong [Các vấn đề và lưu ý vận hành](security-and-known-issues.md).

## Kiểm tra và tài liệu liên quan

- `npm test` chạy các bài test use case, adapter và hợp đồng view/model hiện có.
- Báo cáo các route quản trị: [admin-review.md](admin-review.md).
- Các vấn đề cấu hình và bảo mật được phát hiện khi rà soát: [security-and-known-issues.md](security-and-known-issues.md).

