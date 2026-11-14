# Brief cho Codex · Mockup bố cục mới · ViệcNhanh Aichi (M4)

## Việc cần làm
Dựng **mockup HTML tĩnh, đầy đủ dữ liệu ví dụ** cho bố cục mới của prototype. **Giữ nguyên style hình ảnh hiện tại**, chỉ thiết kế lại **bố cục và layout**. Team đánh giá style đã ổn, chỉ chưa ưng bố cục.

Không sửa bất cứ file nào trong `viecnhanh-prototype/`. Chỉ tạo file trong thư mục `mockups/m4-layout/`.

## Style phải giữ (đọc code để lấy đúng giá trị)
- Token màu và font: `viecnhanh-prototype/src/app/globals.css`, `viecnhanh-prototype/src/styles/zen-tokens.css`. Màu chính Bold Blue `#1B22A7`, Light Blue `#4260E6`, nền `#FAFAFA`, chữ `#0D0D0D`.
- Font Be Vietnam Pro (Google Fonts), số tiền dạng LED chấm mịn: class `.led` trong `globals.css` (JetBrains Mono 800 + mask chấm 3px). Chỉ dùng LED cho số tiền ≥ 32px.
- Thẻ việc dạng pass xanh gradient: `viecnhanh-prototype/src/components/worker/Pass.tsx` + `.pass` trong `globals.css`.
- Ô bento, chip, badge, card: `viecnhanh-prototype/src/components/worker/Bento.tsx`, `src/components/ui.tsx`.
- Lương thực nhận luôn là con số to nhất trên thẻ. Ngày bắt đầu luôn có chữ "dự kiến".

## Tham khảo bố cục: TopCV (topcv.vn) và các trang tìm việc lớn
Lấy cấu trúc, không lấy màu xanh lá của TopCV:
- **Trên cùng:** thanh tìm kiếm to ("Tìm việc theo nghề, công ty…") + hàng chip lọc ngang (Rất phù hợp · Có ký túc xá · Ca ngày · Gần tôi · Có người Việt · Lương > ¥200k).
- **Danh sách việc dạng card gọn:** logo công ty bên trái (ô vuông bo góc, chữ viết tắt), bên phải là tên việc (đậm), tên công ty, hàng chip thông tin (lương thực nhận, thành phố, ca, bắt đầu sớm nhất), góc phải nút lưu (trái tim). Mỗi card cao vừa phải, quét nhanh được 4–5 việc trên một màn điện thoại.
- **Các khối theo mục:** "Việc phù hợp nhất với bạn", "Có người Việt đang làm", "Gần chỗ bạn ở", "Nhà máy mới đang tuyển gấp". Mỗi khối có tiêu đề + "Xem tất cả".
- **Chi tiết việc (kiểu TopCV):** card đầu có tên việc, công ty, 3 ô thông tin chính cạnh nhau (Thực nhận/tháng · Địa điểm · Bắt đầu sớm nhất), hạn nộp, nút "Ứng tuyển ngay" to + nút "Lưu". Bên dưới là tab: Chi tiết công việc · Lương & khấu trừ · Công ty · Người Việt ở đây. Desktop: cột phải là card công ty + card "Việc tương tự".
- **Thanh hành động dính đáy** trên mobile ở chi tiết việc.

## Giữ bản sắc (không được bỏ)
- Việc phù hợp nhất (top 1) vẫn hiện bằng **thẻ pass xanh** to ở đầu trang chủ, các việc còn lại theo dạng list card gọn kiểu TopCV.
- Ô "Người Việt đang làm ở đây" + nút "Hỏi Senpai cùng quê · ẩn danh".
- Lộ trình pháp lý (các mốc từ HR duyệt → nộp đơn chuyển đổi tư cách lưu trú → Cục XNC xét 41–64 ngày → ngày đầu đi làm).
- Xác minh: huy hiệu "ViệcNhanh đã xác minh".

## Màn cần dựng (mỗi màn 1 file HTML, tự chứa, mở được trực tiếp bằng trình duyệt)
1. `w01-home-mobile.html` (390 × chiều cao tự nhiên): trang chủ thợ.
2. `w01-home-desktop.html` (1280): trang chủ thợ desktop, sidebar trái, list giữa, cột phải (hồ sơ AI hiểu bạn, trợ lý AI, lộ trình).
3. `w02-job-mobile.html` (390): chi tiết việc Mikawa Precision.
4. `w02-job-desktop.html` (1280): chi tiết việc, 2 cột.
5. `w03-applications-mobile.html` (390): hồ sơ đã gửi, kiểu danh sách trạng thái của TopCV (đang chờ / được mời / kết quả).
6. `h01-hr-desktop.html` (1280): dashboard HR kiểu trang nhà tuyển dụng: sidebar, hàng KPI, thanh tiến độ 162/300 tuần 1, bảng ứng viên có checkbox duyệt theo đợt.
7. `index.html`: trang gom tất cả màn trên (iframe hoặc ảnh), có tiêu đề từng màn và 1–2 dòng giải thích thay đổi bố cục so với bản hiện tại.

## Dữ liệu ví dụ (lấy thật từ code, đừng bịa)
- Việc, công ty, lương, ca, ký túc xá: `viecnhanh-prototype/src/lib/data.ts` (`JOBS`, `PEERS`, `HIRE_PLAN`, `DEMO_PROFILE`).
- Lương thực nhận: tính như `src/lib/pay.ts` (`takeHome`). Ví dụ Mikawa Precision thực nhận ¥221.526/tháng (có ký túc xá).
- Ngày bắt đầu sớm nhất: `src/lib/start.ts`, ví dụ 07/01/2027 · dự kiến.
- Người hỏi demo: Nguyễn Tuấn Anh, 26 tuổi, quê Nghệ An, tiện CNC 3 năm, visa Kỹ năng đặc định 1.
- Toàn bộ chữ tiếng Việt có dấu, xưng "bạn", câu ngắn. HR màn tiếng Anh (có thể kèm tiếng Nhật).

## Chất lượng
- Không tràn ngang ở 390px. Chữ không bị cắt dấu.
- Chạm ≥ 44px cho nút. Tương phản chữ đạt AA.
- Dùng CSS thuần trong file (có thể link Google Fonts). Không dùng thư viện JS.
- Khi xong, ghi `mockups/m4-layout/NOTES.md`: liệt kê từng màn, thay đổi bố cục chính, và những gì cần sửa trong code thật để áp dụng (file nào, component nào).
