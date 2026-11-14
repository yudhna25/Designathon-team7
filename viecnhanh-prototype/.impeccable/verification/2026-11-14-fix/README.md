# ViệcNhanh Aichi — kết quả sửa và kiểm chứng

Ngày: 14/11/2026. Giữ hệ thống ZEN và bảng màu hiện tại. Không thêm dependency, không deploy.

Đầu vào: critique `2026-11-14T13-30-32Z__src-app.md`. Phạm vi đã xử lý: năm nhóm P1 chính, giải thích N4, định dạng tiền và empty state. Đây là báo cáo xác minh sửa lỗi, không phải một lượt chấm lại Nielsen/SUS.

## Các thay đổi

- Giới hạn palette nền sáng vào theme sáng để các token nền tối gốc hoạt động; thêm color-scheme cho control native ở theme tối.
- Giữ `approved` tương thích dữ liệu demo hiện có, nhưng hiển thị nhất quán là mời phỏng vấn. HR chọn lịch và hình thức phỏng vấn, chưa chốt ngày đi làm. Sửa cả nhãn và thông báo tiếng Nhật vốn dùng nghĩa tuyển dụng.
- Lời mời không mở ví. Prototype dùng đường xem thử riêng với nhãn mẫu tại ví, xác nhận và kết quả; giao dịch mẫu được ghi rõ là mô phỏng. Chưa có backend ca làm/chi trả.
- `takeHome` yêu cầu caller truyền rõ giả định ký túc xá. Danh sách, kết quả AI, việc thay thế và giá trị ban đầu của chi tiết đều dùng lựa chọn hồ sơ; hiển thị giả định cạnh số tiền. Giữ toggle để so kịch bản.
- Thống nhất tiền của worker theo vi-VN; làm rõ thuế cư trú là giả định ước tính, không thay đổi công thức thuế.
- Giải thích mức phù hợp dùng các tiêu chí thực sự chưa đạt; điểm thấp nhất không bị tự gọi là điều kiện còn thiếu. Giữ ngưỡng và trọng số cũ.
- Sheet và drawer Demo dùng native dialog để khóa nền và trả focus; thêm vòng Tab/Shift+Tab dùng chung. Tên truy cập được bổ sung cho các Meter và score ring HR theo ngôn ngữ màn.
- Hai CTA worker tự xuống hàng khi thiếu chỗ. HR xếp một cột ở màn trung gian; lịch dùng select native và có nhãn, không tràn panel. Thêm tóm tắt lương trước nhóm chip ở chi tiết.
- Thêm empty state có hành động quay về danh sách. Sửa copy phân tích khi không có kết quả phù hợp.
- Số tiền hiển thị đúng ngay ở lần render đầu; entrance chung và các pillar không còn bắt đầu bằng trạng thái vô hình. Toast dùng timer 5 giây độc lập với tốc độ GSAP. Xóa CSS grid-lines không dùng.

## Kết quả kiểm tra

| Kiểm tra | Kết quả |
|---|---|
| TypeScript `--noEmit --incremental false` | Qua |
| `scripts/check-scoring.ts` mở rộng | Qua: giữ quy tắc cũ, kiểm chênh 30.000 yên, định dạng tiền, N4, chứng chỉ thực sự thiếu, gate visa và lời mời tiếng Nhật |
| `npm run build` cuối | Qua: biên dịch, kiểm kiểu và sinh 15 trang |
| Theme tối | Nền `rgb(17,17,17)`, chữ `rgb(245,245,245)`; thay cho nền 250/250/250 trước sửa |
| Theme sáng | Đã xem danh sách, chi tiết, empty state và HR |
| N4 | UI hồ sơ 1 năm CNC, N4, 30 ngày: toàn chip đạt và lời giải thích không báo thiếu N4 |
| Lương không ký túc xá | Mikawa ở kết quả AI, danh sách và chi tiết đều 251.526 yên; công thức có ký túc xá vẫn 221.526 yên |
| Luồng chính | Đăng nhập mẫu → quét mẫu → ba bước onboarding → kết quả → ứng tuyển có câu hỏi → tracker → HR chọn lịch và mời → chi tiết ghi lời mời, ví vẫn khóa |
| Ví mẫu | Có nhãn trước, trong và sau giao dịch; số dư mẫu cập nhật; không gọi API chuyển tiền |
| Focus | Zalo và xác nhận ví: Shift+Tab từ Đóng tới nút cuối, Tab quay về Đóng; Escape đóng và trả focus về nút mở. Drawer Demo cũng giữ vòng Tab |
| 320px worker | Client/scroll đều 305px; hai CTA nằm trong vùng x=20…284,67. Lương tóm tắt hiển thị trong màn đầu |
| HR 390px | Client/scroll đều 375px; lịch native và nhãn EN/JA dùng được |
| HR 1024px | Bố cục một cột không tràn, client/scroll đều 1009px. Kiểm tra này thực hiện ở bản chọn lịch trước khi thay bằng select native; select cuối đã được kiểm ở cột hẹp 390px và cột desktop 1280px |
| HR 1280px cuối | Client/scroll đều 1265px; hai cột và select native vừa panel |
| Empty state | Ngưỡng demo 95, lọc Rất phù hợp = 0 có hướng dẫn; Xem tất cả việc khôi phục 6 việc |
| Toast khi motion off | Hiện ngay, vẫn hiện sau giới hạn chờ khoảng 3 giây của công cụ và biến mất ở lần đọc sau; timer trong code là 5 giây. Không khẳng định đã đo chính xác thời điểm biến mất |
| Console browser | Không có error/warn trong log của tab worker đã kiểm |

Browser kiểm tra bằng in-app browser và viewport emulation. Phần lớn kiểm tra tương tác chạy trên dev server; production build được kiểm riêng. Không xem đây là đo FPS, Lighthouse hoặc chứng nhận WCAG toàn diện. Hook Impeccable tự chạy khi chỉnh UI, không báo finding xác định trên các lần quét được trả về; không chạy detector lặp thêm.

## Bằng chứng

- [Theme tối sau sửa](home-dark-fixed.jpg)
- [Worker 320px sau sửa](worker-320-light.jpg)
- [HR desktop với lịch native](hr-1280-light.jpg)
- [HR mobile với lịch native](hr-390-dark.jpg)
- [Empty state](jobs-empty-light-390.jpg)
- [Kết quả giao dịch mẫu](wallet-sample-confirmed.jpg)
- [Diff của 17 file](changes.patch)
- [Danh sách file thay đổi](changed-files.json)

## Dọn dẹp và giới hạn

Dữ liệu kiểm tra trên `localhost:3100` đã được reset qua UI; threshold 80, weights mặc định, theme hệ thống, motion chuẩn, tốc độ ×1 và HR EN đã khôi phục. Các tab kiểm tra đã đóng và viewport override đã reset. Server tạm đã tắt. Reset tái tạo timestamp seed, không khôi phục từng byte localStorage ban đầu. Không tác động dữ liệu trên origin/port khác.

Archive critique cũ vẫn là bằng chứng trước sửa. Launcher `.cmd` không trả snapshot khi gọi latest trong môi trường hiện tại; gọi engine có sẵn trực tiếp trả exit 2, nên không đóng snapshot bằng tay hoặc tự ghi điểm mới.

Chưa kiểm tra điện thoại thật, Safari/Firefox và NVDA/VoiceOver. Các hạng mục nhỏ ngoài phạm vi này vẫn gồm lưu bản nháp onboarding, các tích hợp Zalo/lịch thật và phân biệt bằng chứng giấy tờ đã xác minh với dữ liệu mô phỏng. Cần kiểm thử người dùng trước khi suy ra mức tăng SUS.
