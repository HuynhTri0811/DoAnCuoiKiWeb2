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

## Lỗi ở repository đặt vé

`BookingRepository` ném `BookingRepositoryError` với thuộc tính `code` để phân biệt lỗi đầu vào, dữ liệu thiếu và lỗi persistence. Khi bọc lỗi Sequelize, lỗi gốc được giữ trong `cause`.

| Mã lỗi | Trường hợp |
| --- | --- |
| `INVALID_ID` | ID user hoặc suất chiếu không phải số nguyên dương. |
| `SHOWTIME_NOT_FOUND` | Không có suất chiếu tương ứng để tạo ngữ cảnh đặt vé. |
| `BOOKING_CONTEXT_INCOMPLETE` | Thiếu Cinema, Cineplex, Film, TimeShow hoặc trường bắt buộc của chúng. |
| `SHOWTIME_LOOKUP_FAILED` | Truy vấn suất chiếu thất bại. |
| `TICKET_LOOKUP_FAILED` / `TICKET_NUMBER_LOOKUP_FAILED` | Không đọc được vé hoặc số vé gần nhất. |
| `INVALID_TICKET_NUMBER` | Database trả về số vé gần nhất không hợp lệ. |
| `INVALID_RESERVATION` | Reservation thiếu mã, ghế, loại ghế hoặc giá hợp lệ. |
| `TICKET_CODE_CONFLICT` | Mã vé bị trùng khóa duy nhất. |
| `TICKET_CREATE_FAILED` | Lưu reservation thất bại vì lỗi persistence khác. |

Các lỗi này dành cho xử lý và chẩn đoán ở tầng ứng dụng. Không đưa thông tin nội bộ từ `cause` trực tiếp ra response HTTP.
