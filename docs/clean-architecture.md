# Cấu trúc Clean Architecture

Backend được tổ chức thành các lớp hướng vào nghiệp vụ. Luồng request đi từ router đến controller, qua use case, rồi đến repository và adapter bên ngoài:

```text
routes (HTTP routes)
        ↓
src/interfaces/http/controllers + middleware
        ↓
src/application (use cases)
        ↓
src/domain (entities / business rules)

src/container.js kết nối use case với adapter cụ thể:
application → repository → src/infrastructure/persistence/sequelize/models
                                         ├─ email
                                         ├─ file storage
                                         └─ password hashing / secure random
```

## Thư mục

- `src/domain`: thực thể và quy tắc nghiệp vụ độc lập với Express, Sequelize và EJS.
- `src/application`: use case cho auth, hồ sơ, duyệt phim, đặt vé và quản trị.
- `src/infrastructure`: triển khai lưu trữ Sequelize, email, mật khẩu, mã xác nhận và upload ảnh.
- `src/interfaces/http`: controller, middleware và bộ bọc Promise cho Express.
- `src/container.js`: composition root; đây là nơi tạo adapter, repository, use case và controller.
- `routes`: khai báo URL và ghép middleware/controller; không truy vấn database trực tiếp.
- `src/infrastructure/persistence/sequelize/models`: định nghĩa Sequelize; chỉ repository và composition root được phụ thuộc vào chúng.
- `views`: các template EJS hiện tại; controller vẫn truyền dữ liệu theo hợp đồng view cũ.

## Quy ước khi thêm chức năng

1. Đặt quy tắc nghiệp vụ vào domain hoặc application, không đặt trong router.
2. Repository nhận entity/giá trị từ application, ánh xạ sang cột Sequelize khi ghi, và chuyển kết quả truy vấn thành entity hoặc bản ghi dữ liệu thuần khi đọc. Không trả Sequelize instance qua ranh giới repository.
3. Controller chuyển dữ liệu HTTP thành input của use case và chuyển kết quả thành response/view.
4. Đăng ký các phụ thuộc cụ thể trong `src/container.js`.
5. Giữ URL và cấu trúc dữ liệu view ổn định khi chỉ thay đổi kiến trúc nội bộ.
