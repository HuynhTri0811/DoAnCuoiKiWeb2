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
application → repository interface → src/infrastructure/persistence/sequelize
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
- `models`: các định nghĩa Sequelize hiện có, được sử dụng như adapter persistence.
- `views`: các template EJS hiện tại; controller vẫn truyền dữ liệu theo hợp đồng view cũ.

## Quy ước khi thêm chức năng

1. Đặt quy tắc nghiệp vụ vào domain hoặc application, không đặt trong router.
2. Khai báo phương thức repository theo nhu cầu use case; chỉ repository Sequelize mới biết model và cấu trúc cột.
3. Controller chuyển dữ liệu HTTP thành input của use case và chuyển kết quả thành response/view.
4. Đăng ký các phụ thuộc cụ thể trong `src/container.js`.
5. Giữ URL và cấu trúc dữ liệu view ổn định khi chỉ thay đổi kiến trúc nội bộ.
