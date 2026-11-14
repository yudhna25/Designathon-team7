# Spec cải thiện UI · Milestone 4 · Team 7 ViệcNhanh Aichi

- **Ngày:** 14/11/2026 · **Hạn nộp:** trước 08:30 ngày 15/11 (Figma link + deck PDF + video tuỳ chọn). Đặt tên file: `Team 07_ViecNhanh Aichi`.
- **Nguồn:** 5 thẻ đề bài BTC (Brief, M1 User Questionnaire, M2 Adapt, M3 Test fast, M4 Scalability), báo cáo M1/M2, feedback mentor M3, critique Impeccable, log hướng UI (`docs/superpowers/notes/2026-11-14-m4-ui-direction-log.md`).
- **Trạng thái:** bản nháp chờ team duyệt. Phần "hướng hình ảnh" (§6) chờ kết quả vote. Các phần khác không phụ thuộc vote.

---

## 1. Ý định

BTC chấm UX Design 40% và UI Design 40%. Phần UI phải *kể lại được* câu chuyện của 4 milestone. Nếu không có màn hình nào trả lời một thẻ đề bài, BGK sẽ coi như team chưa làm thẻ đó. Vì vậy spec này coi mỗi thẻ là một yêu cầu UI, không chỉ là một slide.

Câu chuyện cần kể bằng màn hình:
> Người Việt đã ở Aichi, ngồi giữa ca, mở Zalo → thấy **lương thực nhận, ca, chỗ làm** trước khi quyết → visa được kiểm tra trước nên không bị trượt phút cuối → HR trả lời trong **24h** → đi làm có **an toàn tiếng Việt** và **ứng lương theo ngày công**. Khi khách hàng đổi luật chơi (3 tháng thử, 300 người tuần đầu), hệ thống vẫn chạy.

## 2. Đối chiếu đề bài với những gì team đã làm

| Thẻ | Đề bài yêu cầu | Đã có | Lệch / thiếu | Mức |
|---|---|---|---|---|
| **Brief** | Giữ nguyên mô hình: đăng ký qua tin nhắn, xếp việc 48h, ứng lương theo ngày | Đăng nhập Zalo/SĐT, ví ứng lương (`/worker/wallet`), báo qua Zalo OA | Ghi chú tay của team có chữ **"mini-app"** nhưng prototype là web app thường. Màn đầu tiên không trông giống "đăng ký bằng tin nhắn" | Trung bình |
| **M1** | 1 nhóm người dùng chính + 1 khoảnh khắc dịch vụ chính, problem statement | Rõ: thợ Việt SSW đã ở Aichi; khoảnh khắc = ghép việc + HR quyết trong 24h | Finding 0 (khoảng trống thu nhập ~2 tháng khi đổi việc) là insight mạnh nhất nhưng UI chưa nói ra | Trung bình |
| **M2** | Trả lời **6 feedback AI** (Accept/Adjust/Push back), ma trận Keep/Change/Drop/Add, 1 tính năng lõi | Phần lớn đã làm trong code (xem §3) | **Không có màn nào cho thấy team đã *chọn* giữa 2 feedback mâu thuẫn** (SĐT bỏ qua giấy tờ vs. xác minh đầy đủ). Đa ngôn ngữ mới có ở HR (EN/JA), phía thợ chỉ tiếng Việt | **Cao** |
| **M3** | Sự kiện: hợp đồng còn **3 tháng thử**, cần **300 người tuần đầu**. Test 1 tác vụ chính + 1 ngoại lệ | Ngoại lệ có: visa hết hạn, HR quá 24h → 3 việc khác, bị từ chối | **Sự kiện thị trường chưa có trong UI.** `headcount` hiện là 120/30/12/8, không có 300, không có "hợp đồng 3 tháng", HR không có cách duyệt theo đợt | **Cao** |
| **M3 mentor** | 7 lỗi UI cụ thể | Codex đã sửa một phần | Cần kiểm lại từng mục (§5) | Cao |
| **M4** | Hoàn thiện hành trình chính + ngoại lệ; logic dịch vụ (ai vận hành, đối tác, khi một bên lỗi thì sao); business case 3 chỉ số; Figma | Hành trình chính chạy trên Vercel | Chưa có màn "khi một bên lỗi" (đối tác ứng lương lỗi, nhà máy huỷ). HR chưa hiện 3 chỉ số business. **Chưa có gì trong Figma** | **Cao** |

**Kết luận:** team đi đúng hướng về người dùng, vấn đề và tính năng lõi. Phần lệch nằm ở 3 chỗ, cả 3 đều sửa được bằng UI trong đêm nay:
1. Sự kiện M3 (3 tháng / 300 người) chưa xuất hiện trên màn hình nào.
2. Câu trả lời cho 6 feedback M2 có trong code nhưng không *nhìn thấy* được.
3. Hướng hình ảnh mới không được làm mất "bản sắc" (tinh thần thẻ M2): xanh kiểu Zalo, nhanh, minh bạch tiền.

## 3. Câu trả lời 6 feedback M2 và cách UI phải thể hiện

| # | Feedback AI | Quyết định | Màn hình chứng minh |
|---|---|---|---|
| 1 | Thợ phải thấy lương, ca, địa điểm rõ trước khi nhận | **Accept** | Thẻ việc (pass trong ví) luôn có đủ 3 thứ: **lương thực nhận/tháng** (số LED), ca (ngày/đêm, giờ), thành phố + phút đi từ ký túc xá. Không có thẻ nào thiếu một trong 3 |
| 2 | Hỗ trợ nhiều ngôn ngữ | **Adjust**: thợ dùng tiếng Việt, kèm thuật ngữ tiếng Nhật ở chỗ cần (biển an toàn, tên nhà máy, ca); HR dùng EN/JA | Thêm công tắc `VI · やさしい日本語` ở hồ sơ thợ cho người muốn luyện; chip kanji kèm nghĩa trong màn an toàn và chi tiết việc |
| 3 | Giữ đăng ký qua Zalo như ở VN | **Accept** | Màn vào là **Zalo Mini App** (thanh tiêu đề mini-app, nút ⋯ ✕) + tin nhắn OA "Có 3 việc hợp với bạn" làm điểm bắt đầu demo |
| 4 | Chỉ cần SĐT, bỏ kiểm tra thẻ cư trú cho nhanh | **Push back** (luật xuất nhập cảnh Nhật: thuê người sai tư cách lưu trú là phạm luật) | Đăng ký vẫn chỉ cần SĐT/Zalo để **xem việc ngay**. Chỉ khi bấm *Ứng tuyển* mới cần chụp thẻ cư trú (10 giây, có OCR). Nhãn trên màn: "Xem việc không cần giấy tờ · Ứng tuyển cần thẻ cư trú" |
| 5 | Xếp việc trong 24h thay vì 48h | **Accept** (tính từ lúc nộp đơn đến khi HR quyết) | Vòng đếm 24h trên bento, nhắc HR trước 4h, quá hạn → tự gợi ý 3 việc khác |
| 6 | Mọi hồ sơ phải xác minh đầy đủ trước khi xếp | **Adjust**: xác minh theo tầng. Visa + ngành = cổng bắt buộc trước khi HR thấy hồ sơ. Chứng chỉ = xác minh trước ngày đi làm | Huy hiệu 3 trạng thái trên hồ sơ: `Đã xác minh` / `Đang xác minh` / `Chưa có`. HR thấy rõ mục nào đã xác minh |

Feedback 4 và 6 mâu thuẫn nhau. **Màn "Xác minh theo tầng"** (một sheet nhỏ khi bấm Ứng tuyển lần đầu) là nơi BGK thấy team đã giải mâu thuẫn đó. Đây là màn cần có trong Figma và trong demo.

## 4. Sự kiện M3: hợp đồng 3 tháng thử + 300 người tuần đầu

Thay đổi giải pháp, thể hiện trên UI:

**Phía thợ**
- Thẻ việc có nhãn hợp đồng rõ: `Thử việc 3 tháng · có thể gia hạn`. Không giấu.
- Gắn với Finding 0 (khoảng trống thu nhập): trong chi tiết việc có dòng "Sau 3 tháng: nếu không gia hạn, ViệcNhanh xếp việc tiếp trong 24h, ứng lương vẫn chạy". Đây là lý do thợ dám nhận hợp đồng ngắn.
- Dòng thời gian sau khi ứng tuyển (ý "timeline" từ v5) có mốc *Tháng 3: đánh giá gia hạn*.

**Phía HR (desktop)**
- Thanh tiến độ tuyển: **`0 / 300 · tuần 1`**, chia theo ngày, kèm số đang chờ quyết.
- **Duyệt theo đợt**: chọn nhiều ứng viên "Rất phù hợp" (đã qua cổng visa) → một nút "Mời phỏng vấn nhóm" với khung giờ chung. Không ai bị duyệt mà chưa qua cổng visa.
- Cảnh báo năng lực: nếu số chờ quyết vượt mức HR xử lý kịp trong 24h → banner "Bật duyệt nhóm để kịp 24h".
- Dữ liệu demo: thêm một việc của khách hàng chính, `headcount: 300`, `contract: 3 tháng thử`.

## 5. Feedback mentor M3 và critique: danh sách phải kiểm lại

Codex đã sửa một phần. Khi làm UI mới, mỗi mục phải có trạng thái đúng trong code và trong Figma:

1. Chứng chỉ ghi "tuỳ chọn" nhưng AI tính nặng → đổi nhãn thành "Không bắt buộc · tăng mức phù hợp đến +X%". Ô tải lên có vùng rõ ràng, có trạng thái **đang tải / thành công / lỗi**.
2. JLPT mặc định N4, thành phố chọn sẵn → bỏ giá trị mặc định, bắt người dùng chọn.
3. Tiêu đề "Khi nào và ở đâu" mơ hồ → "Bạn đi làm được từ ngày nào, ở thành phố nào?"
4. Nút Sửa bắt làm lại cả onboarding, chứng chỉ không cập nhật → sửa từng mục ngay trong hồ sơ, chấm điểm lại tại chỗ.
5. "Cải thiện hồ sơ" lấn "Ứng tuyển" khi đã đủ ✓ → khi đạt hết, *Ứng tuyển* là nút chính duy nhất. Màn "Lộ trình tay nghề" chỉ hiện khi còn thiếu.
6. Segmented control câu hỏi thêm trông như bị tắt → dùng đúng trạng thái có thể chọn của DS (viền + nền khi chọn).
7. "Quá hạn hồ sơ tự đóng và bạn nhận 3 việc khác" khó hiểu, không bấm được → "Nếu HR chưa trả lời trong 24h, bạn được gợi ý ngay 3 việc khác" + nút xem 3 việc đó.
8. (Critique P1) Nội dung không được ẩn chờ GSAP chạy: mặc định hiện, animation chỉ là lớp thêm. Tôn trọng `prefers-reduced-motion`.

## 6. Hướng hình ảnh (chờ vote)

Mặc định nếu team chưa chốt: **Top 1 · Ví + Bento** (`final-round-v8.html`).
- Hero: thẻ việc dạng pass trong ví, vuốt giữa các việc. Số lương thực nhận dùng **LED chấm mịn** (JetBrains Mono 800, mask 3px).
- Bento bên dưới: vòng 24h, tiêu chí đạt, ô **Cộng đồng người Việt** (12 người Việt đang làm · 4,6★), ô lộ trình tay nghề.
- Thêm tính năng: **Trợ lý AI hỏi–đáp** (hỏi bằng giọng/chữ tiếng Việt, câu trả lời trích dẫn việc cụ thể).

**Ràng buộc bản sắc (thẻ M2: "không đánh mất bản sắc")** áp dụng cho mọi hướng thắng vote:
- Giữ Bold Blue #1B22A7 / Light Blue #4260E6 làm màu chính, gần cảm giác Zalo. Màu phụ chỉ dùng cho trạng thái.
- Con số tiền luôn to nhất trên màn, luôn là *thực nhận*, không phải lương gộp.
- Các hướng như poster chữ lớn, máy bán vé, bảng lật chữ chỉ được dùng nếu vẫn giữ 3 điều trên. Nếu một trong số đó thắng vote, cần kiểm lại với ràng buộc này trước khi code.

Thay đổi DS đi kèm: Be Vietnam Pro thay Inter (dấu tiếng Việt đẹp hơn), số tiền dùng mono LED.

## 7. Phạm vi màn hình (thứ tự ưu tiên)

| Ưu tiên | Màn | Lý do |
|---|---|---|
| P0 | Tin nhắn Zalo OA → mở Mini App | Brief + feedback 3 |
| P0 | Trang chủ thợ (ví + bento) | Hành trình chính |
| P0 | Chi tiết việc: lương thực nhận / ca / địa điểm / hợp đồng 3 tháng | Feedback 1 + M3 |
| P0 | Sheet xác minh theo tầng khi ứng tuyển lần đầu | Feedback 4 vs 6 |
| P0 | Đơn đã gửi + vòng 24h + ngoại lệ quá hạn → 3 việc khác | Feedback 5 + ngoại lệ M3/M4 |
| P0 | HR: tiến độ 0/300, duyệt theo đợt | Sự kiện M3 |
| P1 | Lộ trình tay nghề (khi chưa đủ điều kiện) | Mentor #5 |
| P1 | Trợ lý AI hỏi–đáp | Điểm cộng dùng AI |
| P1 | Ví ứng lương + trạng thái "đối tác ứng lương tạm lỗi, vẫn nhận lương tháng như thường" | M4: khi một bên lỗi |
| P1 | HR: 3 chỉ số business (thời gian lấp chỗ, tỉ lệ lấp 300, tỉ lệ ở lại sau 30 ngày) | M4 business case |
| P2 | An toàn tiếng Việt + chip kanji | Finding 4, feedback 2 |
| P2 | Ô cộng đồng người Việt | Niềm tin xã hội |

## 8. Mục tiêu / không làm / thất bại

- **Mục tiêu:** mỗi thẻ đề bài có ít nhất một màn trả lời; 7 lỗi mentor đều đóng; Figma có đủ màn P0 + P1 trước 08:00.
- **Không làm:** thêm thị trường mới, thanh toán thật, đăng nhập Zalo thật, viết lại thuật toán chấm điểm.
- **Coi là thất bại dù chạy được:** màn đẹp nhưng không thấy lương thực nhận; BGK hỏi "300 người tuần đầu thì sao?" mà không có màn để mở; animation làm nội dung trống khi demo.

## 9. Ràng buộc

- Codex đang sửa cùng codebase → chia file rõ trước khi code UI, hoặc làm UI sau khi Codex xong.
- Figma: đẩy từ code sang Figma (code → Figma), mỗi màn một frame 390px, HR 1280px.
- Không deploy khi chưa hỏi trưởng nhóm.

## 10. Để lại cho người làm

- Câu chữ chi tiết từng màn (dùng giọng hiện tại của prototype, câu ngắn, xưng "bạn").
- Số liệu demo cho 300 người (phân bố theo ngày tự chọn, miễn hợp lý).
- Chuyển động cụ thể, miễn tuân thủ mục 5.8.
