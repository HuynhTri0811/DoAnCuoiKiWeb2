# Các vấn đề và lưu ý vận hành

Tài liệu này ghi lại những điểm được quan sát trong source khi rà soát dự án. Đây là danh sách việc cần xem xét; không phải tất cả mục đều đã được sửa trong phạm vi cập nhật tài liệu.

## Cấu hình nhạy cảm

1. **Đã bỏ thiết lập tắt xác minh chứng chỉ TLS toàn tiến trình.** Thiết lập `NODE_TLS_REJECT_UNAUTHORIZED = "0"` đã được gỡ khỏi bootstrap. Nếu kết nối ngoài gặp lỗi chứng chỉ, hãy sửa CA/certificate ở môi trường.
2. **Thông tin SMTP vẫn viết trực tiếp trong mã nguồn.** Adapter `src/infrastructure/messaging/sendEmail.js` chứa thông tin xác thực SMTP trong cấu hình Nodemailer. Hãy thu hồi/thay thông tin đã lộ, lưu secret ngoài repository và đọc qua `process.env`.
3. **Session còn secret fallback cố định.** `src/interfaces/http/createApp.js` ưu tiên `SESSION_SECRET`, nhưng fallback vẫn là `keyboard cat`; middleware cũng chưa cấu hình rõ các thuộc tính cookie như `secure`, `sameSite` hoặc thời hạn và dùng MemoryStore mặc định. `express-session` bật `httpOnly` mặc định. Cần đặt secret riêng, store phù hợp và cấu hình cookie theo HTTPS/deployment.
4. **Thông tin admin mẫu trong luồng đăng nhập.** `src/application/auth/AuthenticateUser.js` vẫn so sánh email và mật khẩu admin trực tiếp. Không dùng thông tin này khi triển khai; chuyển sang tài khoản/role được lưu an toàn và bỏ credential khỏi source.
5. **Cấu hình database mặc định có thông tin đăng nhập tĩnh.** `models/db.js` có URL fallback với user/password cố định. Chỉ dùng giá trị cấu hình qua môi trường; giới hạn quyền database của tài khoản ứng dụng.

## Luồng xác thực và dữ liệu

- Mã xác nhận được sinh bằng `crypto.randomInt` trong `src/infrastructure/security/generateVerificationCode.js`, nhưng chưa có thời hạn, giới hạn số lần thử, hoặc vô hiệu hóa sau khi dùng.
- Luồng đặt lại mật khẩu xác minh mã rồi truyền email qua form tiếp theo; nên ràng buộc phiên reset hoặc token một lần để tránh dựa vào email có thể sửa từ client.
- Cập nhật hồ sơ đi qua use case `src/application/profile/UpdateProfile.js`, nhưng vẫn cần kiểm tra chặt giá trị đầu vào. Ứng dụng chưa cấu hình CSRF middleware/token cho các form thay đổi dữ liệu.
- Đặt vé qua `src/application/booking/BookSeats.js` nhận ghế và giá từ form. Server cần xác minh ghế còn trống, giá, suất chiếu và người dùng trước khi ghi ticket; thao tác cần transaction hoặc ràng buộc database để tránh đặt trùng khi có request đồng thời.
- Upload phim qua `src/infrastructure/storage/FilmImageStorage.js` giới hạn phần mở rộng và kích thước, nhưng không xác thực nội dung thực của ảnh.

## Hành vi cần xác nhận

- `models/Film.js` định nghĩa getter cho `film_ViewCount` luôn trả `0` và getter `film_Public` luôn trả `false`. Các giá trị đọc từ Sequelize instance có thể vì thế khác dữ liệu trong database; cần kiểm tra và bỏ getter nếu không chủ ý.
- `src/application/home/GetFilmDetails.js` tăng lượt xem trước khi xác nhận phim tồn tại/công khai. Repository dùng phép tăng nguyên tử; cần cân nhắc chỉ tăng cho phim công khai hợp lệ.
- `src/infrastructure/persistence/sequelize/HomeRepository.js` lọc phim theo `film_Public: true`, nhưng một số view đặt tên biến tương ứng “phim sắp chiếu/không công khai”; cần xác nhận logic nghiệp vụ mong muốn.
- `src/application/booking/BookSeats.js` dựng mã vé từ thông tin phim/rạp và số vé tối đa theo người dùng. Cần ràng buộc unique và cấp mã an toàn khi có đặt vé đồng thời.
- `views/` có các link tới đường dẫn chưa thấy route tương ứng trong source, ví dụ `/thoa-thuan-su-dung`, `/quy-che-hoat-dong`, `/chinh-sach-bao-mat`, `/rap-gia-ve`, `/tuyen-dung`. Cần xác nhận đây là trang dự kiến bổ sung hay link cũ.
- Dự án dùng nhiều dependency đời cũ; cần đánh giá nâng cấp tương thích và kiểm tra lỗ hổng dependency trước khi triển khai.

## Khả năng vận hành và kiểm thử

- `package.json` chưa khai báo script `start` hoặc `dev`. `npm test` hiện chạy các use case, hợp đồng view/model và tiện ích dùng chung.
- README cũ hướng dẫn cài `windows-build-tools`/build bcrypt, và chứa thông tin đăng nhập mẫu. Hướng dẫn đã được thay bằng hướng dẫn chung; không đưa thông tin credential vào tài liệu.
- Dự án chưa có migration được khai báo, `.env.example`, logging chuẩn hóa hoặc middleware xử lý lỗi tập trung cho toàn ứng dụng.

## Báo cáo rà soát quản trị

Các lỗi chức năng từng phát hiện trong quá trình tách và rà soát route quản trị, cùng các sửa đổi liên quan, được ghi ở [admin-review.md](admin-review.md). Báo cáo đó tập trung vào route admin và không thay thế việc khắc phục các mục bảo mật/vận hành trong tài liệu này.

