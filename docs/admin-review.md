# Báo cáo rà soát các route quản trị

Ngày: 2026-10-10

> Cập nhật kiến trúc ngày 2026-10-16: router admin khai báo URL và gắn controller; use case nằm trong `src/application/admin/`, truy vấn Sequelize trong `src/infrastructure/persistence/sequelize/`, kết nối phụ thuộc ở `src/container.js`. Báo cáo bên dưới ghi lại lỗi lịch sử, không mô tả vị trí triển khai mới của từng handler.

## Phạm vi

Đã rà soát các route quản trị trong `routes/admin/`, các file làm điểm vào tương thích `routes/admin.js` và `routes/home.js`, cùng các biểu mẫu EJS được những route quản trị sử dụng.

## Lỗi đã phát hiện và cách khắc phục

1. **Điểm vào của route tự require lại chính nó.**
   - `routes/admin.js` require `./admin`. Node phân giải đường dẫn này tới chính file `routes/admin.js` trước khi xét thư mục, gây vòng lặp require.
   - `routes/home.js` gặp lỗi tương tự.
   - Đã sửa cả hai file để require tường minh `index.js` trong thư mục tương ứng.

2. **Đường dẫn import model dùng chung bị sai.**
   - Các import trong `routes/admin/utils/models.js` và `routes/home/utils/models.js` trỏ tới thư mục `routes/models` không tồn tại.
   - Đã sửa để trỏ tới thư mục `models/` ở thư mục gốc dự án.

3. **Route tạo và cập nhật phim xử lý upload bị lỗi.**
   - Route tạo phim dùng biến `file` chưa khai báo, đường dẫn tệp nguồn giả và có thể gửi phản hồi nhiều lần.
   - Route cập nhật phim chỉ chuyển hướng mà không lưu dữ liệu.
   - Đã viết lại để phân tích biểu mẫu multipart, kiểm tra dữ liệu phim và phần mở rộng ảnh, tạo tên ảnh duy nhất, dọn tệp tạm hoặc tệp mồ côi khi gặp lỗi và chỉ gửi một phản hồi.
   - Đã sửa biểu mẫu EJS để dùng cú pháp multipart hợp lệ. Khi cập nhật phim, ảnh mới là tùy chọn.

4. **Xóa suất chiếu chuyển hướng bằng cả object session.**
   - Handler dùng toàn bộ object session làm ID rạp.
   - Trang suất chiếu hiện lưu đường dẫn quay lại đã được kiểm tra; thao tác tạo và xóa dùng đường dẫn đó để quay lại đúng trang đang xem.
   - Đã bổ sung kiểm tra ID, xử lý lỗi cơ sở dữ liệu và xóa thông báo lỗi sau khi hiển thị một lần.

5. **Các thao tác xóa dùng HTTP GET.**
   - Đã đổi route xóa phim, người dùng, rạp, cụm rạp và suất chiếu sang POST; các liên kết EJS tương ứng được đổi thành biểu mẫu.

6. **Lỗi từ route bất đồng bộ chưa được chuyển nhất quán cho Express.**
   - Route admin hiện dùng `src/interfaces/http/createRouter.js` để chuyển promise bị reject từ controller tới cơ chế xử lý lỗi Express.

7. **Cập nhật rạp tìm cụm rạp theo một phần tên.**
   - Biểu mẫu sửa rạp hiện gửi ID cụm rạp và route tra cứu chính xác theo ID.

8. **Khoảng ngày báo cáo không hợp lệ vẫn được đưa vào truy vấn.**
   - Dashboard hiện từ chối ngày bị thiếu, không hợp lệ hoặc ngày bắt đầu sau ngày kết thúc trước khi truy vấn.

## Lưu ý còn lại

Các yêu cầu xóa hiện dùng POST, nhưng ứng dụng chưa tạo hoặc kiểm tra CSRF token. Chỉ đổi sang POST chưa đủ để bảo vệ hoàn toàn khỏi CSRF; cần tích hợp token vào middleware và các biểu mẫu của ứng dụng.

## Các bước kiểm tra trong đợt rà soát ban đầu

- Kiểm tra cú pháp JavaScript cho các file điểm vào và module route.
- Biên dịch các template EJS quản trị đã chỉnh sửa.
- Kiểm tra tĩnh để xác nhận các đường dẫn import tương đối tồn tại.
- Chạy `git diff --check`.

Tại thời điểm rà soát ban đầu, chưa thể tải toàn bộ router trong workspace vì `formidable` chưa có trong `node_modules`, dù package đã được khai báo trong `package.json`. Bài test route hiện kiểm tra đăng ký endpoint với adapter bên thứ ba được mock.
