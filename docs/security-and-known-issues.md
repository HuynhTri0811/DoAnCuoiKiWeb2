# Các vấn đề và lưu ý vận hành

Tài liệu này ghi lại những điểm được quan sát trong source khi rà soát dự án. Đây là danh sách việc cần xem xét; không phải tất cả mục đều đã được sửa trong phạm vi cập nhật tài liệu.

## Cấu hình nhạy cảm

1. **Tắt xác minh chứng chỉ TLS toàn tiến trình.** `app.js` gán `NODE_TLS_REJECT_UNAUTHORIZED = "0"`. Node.js khi đó không xác minh chứng chỉ TLS cho các kết nối liên quan trong tiến trình, làm giảm khả năng phát hiện kết nối giả mạo. Nên xóa cấu hình này và sửa chứng chỉ/CA ở môi trường gây lỗi.
2. **Thông tin SMTP viết trực tiếp trong mã nguồn.** `models/email.js` chứa thông tin xác thực SMTP trong cấu hình Nodemailer. Hãy thu hồi/thay thông tin đã lộ, lưu secret ngoài repository và đọc qua `process.env`.
3. **Session dùng secret cố định.** `app.js` dùng `keyboard cat`; middleware không cấu hình rõ các thuộc tính cookie như `secure`, `sameSite` hoặc thời hạn, và dùng MemoryStore mặc định. `express-session` bật `httpOnly` mặc định. Cần dùng secret riêng từ môi trường, store phù hợp và cấu hình cookie theo HTTPS/deployment.
4. **Thông tin admin mẫu trong luồng đăng nhập.** `routes/Login.js` có nhánh so sánh email và mật khẩu admin trực tiếp. Không dùng thông tin này khi triển khai; chuyển sang tài khoản/role được lưu an toàn và bỏ credential khỏi source.
5. **Cấu hình database mặc định có thông tin đăng nhập tĩnh.** `models/db.js` có URL fallback với user/password cố định. Chỉ dùng giá trị cấu hình qua môi trường; giới hạn quyền database của tài khoản ứng dụng.

## Luồng xác thực và dữ liệu

- `routes/forgotPassword.js` tạo mã bằng `Math.random`, không đặt thời hạn sử dụng, và sau khi đặt lại mật khẩu không xóa mã xác nhận. Nên dùng mã ngẫu nhiên mật mã, giới hạn thời hạn/số lần thử, và vô hiệu hóa mã sau khi dùng.
- Luồng đặt lại mật khẩu xác minh mã rồi truyền email qua form tiếp theo; nên ràng buộc phiên reset hoặc token một lần để tránh dựa vào email có thể sửa từ client.
- Các route đổi thông tin trong `routes/updateInfo.js` cần kiểm tra giá trị đầu vào và quyền sở hữu bản ghi. Ứng dụng chưa cấu hình CSRF middleware/token cho các form thay đổi dữ liệu.
- Đặt vé trong `routes/home/booking.js` nhận ghế và giá từ `req.body`. Server cần xác minh ghế còn trống, giá, suất chiếu và người dùng trước khi ghi ticket; thao tác cần transaction hoặc ràng buộc database để tránh đặt trùng khi có request đồng thời.
- `app.js` chỉ cấu hình body parser URL encoded. Upload phim được parse riêng qua Formidable tại `routes/admin/films.js`; giới hạn định dạng bằng phần mở rộng không xác thực nội dung thực của ảnh.

## Hành vi cần xác nhận

- `models/Film.js` định nghĩa getter cho `film_ViewCount` luôn trả `0` và getter `film_Public` luôn trả `false`. Các giá trị đọc từ Sequelize instance có thể vì thế khác dữ liệu trong database; cần kiểm tra và bỏ getter nếu không chủ ý.
- `routes/home/films.js` tăng lượt xem trước khi xác nhận phim tồn tại/công khai. Nếu ID không hợp lệ, có thể phát sinh lỗi khi truy cập `viewCount_new.dataValues`.
- `routes/home/pages.js` và `/phim` lọc lịch chiếu theo `film_Public: true`, nhưng hai trang đặt tên biến tương ứng “phim sắp chiếu/không công khai”; cần xác nhận logic nghiệp vụ mong muốn.
- `routes/home/booking.js` dựng mã vé từ thông tin phim/rạp và số vé tối đa theo người dùng. Cần ràng buộc unique và cấp mã an toàn khi có đặt vé đồng thời.
- `routes/updateInfo.js` và một số route khác tạo `IncomingForm` nhưng không dùng để parse body; các form URL encoded đã được xử lý bởi middleware Express.
- `views/` có các link tới đường dẫn chưa thấy route tương ứng trong source, ví dụ `/thoa-thuan-su-dung`, `/quy-che-hoat-dong`, `/chinh-sach-bao-mat`, `/rap-gia-ve`, `/tuyen-dung`. Cần xác nhận đây là trang dự kiến bổ sung hay link cũ.
- Dự án dùng nhiều dependency đời cũ; cần đánh giá nâng cấp tương thích và kiểm tra lỗ hổng dependency trước khi triển khai.

## Khả năng vận hành và kiểm thử

- `package.json` không khai báo `start`, `dev` hoặc test suite; script `test` hiện chỉ in thông báo placeholder rồi trả mã lỗi.
- README cũ hướng dẫn cài `windows-build-tools`/build bcrypt, và chứa thông tin đăng nhập mẫu. Hướng dẫn đã được thay bằng hướng dẫn chung; không đưa thông tin credential vào tài liệu.
- Dự án chưa có migration được khai báo, `.env.example`, logging chuẩn hóa hoặc middleware xử lý lỗi tập trung cho toàn ứng dụng.

## Báo cáo rà soát quản trị

Các lỗi chức năng từng phát hiện trong quá trình tách và rà soát route quản trị, cùng các sửa đổi liên quan, được ghi ở [admin-review.md](admin-review.md). Báo cáo đó tập trung vào route admin và không thay thế việc khắc phục các mục bảo mật/vận hành trong tài liệu này.

