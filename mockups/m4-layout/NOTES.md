# M4 · Mockup bố cục ViệcNhanh Aichi

Mở `index.html` trực tiếp bằng trình duyệt. Mỗi màn có CSS, SVG và JavaScript nhỏ nằm ngay trong file, không dùng thư viện JS và không phụ thuộc bundle của prototype. Google Fonts là tài nguyên mạng duy nhất; mất mạng sẽ dùng font hệ thống.

## Các màn và thay đổi chính

| File | Bố cục mới | Đối chiếu bản hiện tại |
| --- | --- | --- |
| [w01-home-mobile.html](w01-home-mobile.html) | Giữ pass xanh cho việc đứng đầu. Tìm kiếm và bộ lọc lên trên; các việc còn lại chuyển thành card gọn theo nhóm. | Mobile · 390 px |
| [w01-home-desktop.html](w01-home-desktop.html) | Bố cục ba vùng: điều hướng trái, danh sách việc giữa, hồ sơ AI và lộ trình bên phải. Danh sách không còn bị khóa trong cột pass hẹp. | Desktop · 1280 px |
| [w02-job-mobile.html](w02-job-mobile.html) | Gom lương, địa điểm, ngày bắt đầu vào ba ô đầu trang. Tab dẫn xuống nội dung và thanh ứng tuyển luôn ở đáy. | Mobile · 390 px |
| [w02-job-desktop.html](w02-job-desktop.html) | Chi tiết công việc chiếm cột chính; công ty và việc tương tự nằm bên phải. Lương, khấu trừ, người Việt và pháp lý đọc theo trục dọc. | Desktop · 1280 px |
| [w03-applications-mobile.html](w03-applications-mobile.html) | Có tổng quan và bộ lọc Đang chờ / Được mời / Kết quả. Mỗi hồ sơ là một hàng trạng thái; lịch phỏng vấn được ưu tiên. | Mobile · 390 px |
| [h01-hr-desktop.html](h01-hr-desktop.html) | KPI lên đầu, tiếp theo là tiến độ 162/300. Tìm kiếm, bộ lọc và thanh mời theo đợt được đặt ngay trên bảng ứng viên. | Desktop · 1280 px · English |
| [index.html](index.html) | Gom 6 màn bằng iframe có tên, mô tả thay đổi và liên kết mở riêng. | Khung mobile 390, desktop 1280; desktop cuộn trong khung ở cửa sổ nhỏ. |

Trang chủ vẫn giữ việc top 1 dưới dạng pass xanh gradient. Các nhóm gồm “Việc phù hợp nhất với bạn”, “Có người Việt đang làm”, “Gần chỗ bạn ở”, “Nhà máy mới đang tuyển gấp”, thêm nhóm việc khác trong ngành để dùng đầy đủ 6 việc hợp visa. Một việc có thể xuất hiện trong nhiều nhóm; đây không phải các vị trí tuyển mới khác nhau. Card gọn có logo chữ, tên việc, công ty, tiền thực nhận, thành phố, ca, ký túc xá, ngày dự kiến và nút lưu. Mục tiêu chiều cao khoảng 145–160 px ở 390, để vùng danh sách quét khoảng 4–5 thẻ mỗi màn 844 px (không tính pass và phần đầu trang).

Chi tiết có ba ô thông tin đầu trang cùng hàng kể cả ở 390; ngày luôn ghi “dự kiến”. Các mục tab là liên kết neo đến nội dung đã hiện đầy đủ, không giấu nội dung khi tắt JS. Mobile giữ thanh Lưu / Ứng tuyển dính đáy. Khối người Việt và nút “Hỏi Senpai cùng quê · ẩn danh”, huy hiệu “ViệcNhanh đã xác minh”, lộ trình HR → giấy tờ → nộp đơn chuyển đổi tư cách lưu trú → XNC xét 41–64 ngày → nhận thẻ → ngày đầu đều được giữ.

## Style giữ từ code

- `src/styles/zen-tokens.css`: Bold Blue #1B22A7, Light Blue #4260E6, nền #FAFAFA, chữ #0D0D0D, surface trắng, blue-2 #F1F4FC, viền neutral-4 #E8E8E8; card radius 24 px, pass 26 px, nút/chip pill. Chữ phụ dùng neutral-11 #5B5B5B để giữ tương phản.
- `src/app/globals.css`: pass dùng nguyên gradient `linear-gradient(150deg, #2B33C9 0%, #1B22A7 55%, #121882 100%)` và bóng của pass. Font Be Vietnam Pro; tiền LED JetBrains Mono 800, tracking −.02em, mask radial 62% / 66%, ô 3 px. LED chỉ xuất hiện ở cỡ từ 32 px; tiền thẻ gọn dùng mono thường.
- `src/components/ui.tsx` và `icons.data.ts`: logo W, icon SVG, avatar chữ, badge, chip, nút và card theo cấu trúc hiện có. Không thêm ảnh, logo hãng hay style màu xanh lá.
- Kích thước nút, bộ lọc, nút lưu, điều hướng và ô chạm checkbox từ 44 px. Có nhãn input, trạng thái nút, focus ring, skip link và reduced motion. Số tiền thực nhận luôn là số lớn nhất trên mỗi thẻ việc.

## Dữ liệu và các tình huống minh họa

- Dùng nguyên JOBS, PEERS, DEMO_PROFILE, SEED_CANDIDATES, HIRE_PLAN trong `src/lib/data.ts`; đây vốn là dữ liệu hư cấu của prototype, không phải việc hay người thật. Không tự tạo công ty, lương, ca hoặc ký túc xá.
- Tính trực tiếp bằng `takeHome` trong `src/lib/pay.ts`, với `usesDorm = DEMO_PROFILE.relocate`. Không tính thưởng chuyên cần vào tiền thực nhận. Việc không có ký túc xá ghi nhận tiền chưa trừ chỗ ở theo nguồn.

| Công ty | Thực nhận / tháng ước tính | Chỗ ở trong phép tính |
| --- | ---: | --- |
| Mikawa Precision | ¥221.526 | Đã trừ ký túc xá và điện nước |
| Okazaki Axle Works | ¥185.703 | Đã trừ ký túc xá và điện nước |
| Kariya Parts Lab | ¥229.769 | Chưa trừ chi phí chỗ ở |
| Okazaki Steel Craft | ¥210.230 | Đã trừ ký túc xá và điện nước |
| Anjo Components | ¥207.924 | Đã trừ ký túc xá và điện nước |
| Toyohashi Resin | ¥219.589 | Đã trừ ký túc xá và điện nước |

- Mikawa: lương cơ bản ¥248.640, tăng ca ¥37.000, ca đêm ¥29.600, gross ¥315.240; bảo hiểm ¥46.656, thuế thu nhập ¥8.058, cư trú ¥9.000, ký túc xá ¥22.000, điện nước ¥8.000 → **¥221.526**. Thưởng chuyên cần ¥15.000 riêng.
- Chốt đồng hồ **15/11/2026 09:00 JST**. Tính như JobPass: HR trả lời sau tối đa 1 ngày, sau đó 7 ngày giấy tờ + 45 ngày xử lý; `earliestStart` lấy max với 30 ngày sẵn sàng của Tuấn Anh → **07/01/2027 · dự kiến**. Mốc 41–64 ngày sao lại từ nội dung demo, chưa phải kiểm chứng quy định hiện hành; mockup không cung cấp tư vấn pháp lý.
- Hạn nộp không có trong JOBS nên hiện “chưa được nhà máy cung cấp”, không bịa ngày hết hạn. Giờ vào ca và mô tả thao tác chi tiết cũng chưa có nên được ghi rõ.
- Hồ sơ người lao động dùng đúng Nguyễn Tuấn Anh, 26 tuổi (theo brief), Nghệ An, tiện CNC 3 năm, N4, SSW1 sản xuất, Chiryu. **Kho ứng dụng chưa có hồ sơ đã gửi của “me” mặc định**; 4 trạng thái ở W03 được dàn dựng để duyệt layout, không tuyên bố đó là lịch sử thật. Dùng các việc sẵn có; lịch 18/11/2026 10:00 lấy từ INTERVIEW_SLOTS; lý do từ REJECT_REASONS. Không tự tạo timestamp gửi hoặc thời gian đếm ngược của các hồ sơ minh họa.
- HR lấy 8 ứng viên qua visa gate; 3 người visa không phù hợp bị loại. 5 người đang chờ, 2 người còn dưới 4 giờ, 1 được mời, 2 đóng. Điểm phù hợp và thời gian còn lại tính đúng từ scoring và hoursAgo của seed; chỉ 5 người đủ điều kiện batch được chọn. Mặc định đánh dấu 3 người để thấy thanh hành động.
- **Brief yêu cầu 162/300**, trong khi filledByDay gốc cộng thành 158 và mặc định có 1 seed approved (dashboard gốc có thể thành 159). Snapshot mockup minh họa **162 vị trí đã xếp theo brief**, 54%, còn 138; không suy ra hoặc bịa thêm số theo ngày. Dải 7 ngày chỉ đánh dấu ngày hiện tại từ HIRE_PLAN.today. Không sửa HIRE_PLAN và không gán thêm trạng thái cho ứng viên seed. KPI queue = 212 + 5 = 217; median từ quyết định seed = 2h. Không dùng LED cho KPI vì LED chỉ dành cho tiền.

## Tương tác trong mockup

Tìm kiếm và chip lọc chạy cục bộ theo dữ liệu đã nhúng; Gần tôi được minh họa bằng khoảng cách ≤15 km từ Chiryu. Lưu việc chỉ đổi trạng thái trong màn hiện tại. Bộ lọc hồ sơ, bộ lọc HR, tìm tên, chọn tất cả và chọn theo đợt dùng JS thuần. Nút ứng tuyển, Senpai, AI, mời phỏng vấn và những màn ngoài phạm vi mở giải thích xem thử; không gọi mạng hay gửi dữ liệu, không giả thông báo gửi thành công. Tắt JS vẫn xem được toàn bộ nội dung.

## Cần sửa gì nếu áp dụng vào prototype thật

Các đường dẫn dưới đây tính từ `viecnhanh-prototype/`. **Chưa sửa file nào trong prototype.**

| Màn / phần | File và component cần đổi | Cách áp dụng |
| --- | --- | --- |
| Trang chủ, danh sách | `src/app/worker/jobs/layout.tsx` · JobsLayout, JobList | Thay dải pass ngang và cơ chế carousel bằng tìm kiếm, chip, một JobPass top 1 và các nhóm card gọn; tính nhóm trên danh sách đã qua visaGate, giữ cách scoreMatch / fitOf hiện có. Bỏ việc dùng pass đang ở giữa để đổi toàn bộ Bento. |
| Thẻ việc | `src/components/worker/Pass.tsx` · JobPass; `src/components/worker/Bento.tsx` · Bento, PeersTile | Giữ JobPass và style .pass; thêm biến thể card gọn cho danh sách, tách cách sắp Bento khỏi carousel, giữ PeersTile và SenpaiSheet. Khi tích hợp cần thêm state lưu việc vì store hiện chưa có saved jobs. |
| Desktop home | `src/app/worker/jobs/page.tsx` · JobsIndex; `src/components/worker/Shell.tsx` · SideNav, TopBar; `src/app/worker/layout.tsx` | Đưa hồ sơ AI ra rail phải cùng trợ lý và lộ trình, danh sách vào cột giữa, giữ điều hướng trái. Profile rail chỉ ở trang chủ, không lặp lại danh sách hẹp bên cạnh chi tiết. |
| Chi tiết | `src/app/worker/jobs/[id]/page.tsx` · JobDetail, ApplySheet | Gom hero 3 thông tin; thêm tab neo và cột công ty / việc tương tự; giữ ApplySheet và visa gate, chỉ thay cách tổ chức nội dung. Mobile giữ sticky CTA và khoảng đệm đáy. Hạn nộp cần field nguồn khi backend có, không lấy từ hạn phản hồi 24h. |
| Lương, cộng đồng, pháp lý | `src/components/worker/Blocks.tsx` · PayCard, ScoreBreakdown; `Bento.tsx` · PeersTile; `FlightPath.tsx` · FlightPath | Tái dùng logic pay và dorm, cộng đồng và ẩn danh, timeline; đưa vào các mục tương ứng. Dùng FlightPath hiện có cho dialog/rail, giữ mọi ngày ở trạng thái dự kiến. |
| Hồ sơ đã gửi | `src/app/worker/applications/page.tsx` · Applications, AppCard, Approved | Thêm tổng quan và lọc nhóm trạng thái, thu gọn phần thẻ và giữ bước hành động lịch hẹn. Giữ trạng thái thực, logic tự hết hạn, lý do từ chối, an toàn và sự khác biệt mời phỏng vấn / nhận việc. |
| HR | `src/app/hr/page.tsx` · HRCandidates; `src/components/hr/HirePlan.tsx` · HirePlan; `src/app/hr/layout.tsx` · HRLayout | Đặt KPI trước HirePlan, đặt bộ lọc và thanh batch chung trong bảng; reuse batchEligible, needsBatch, decideMany và dữ liệu lịch phỏng vấn. Đồng bộ mốc 162 từ dữ liệu thật nếu team chọn, không hard-code con số mockup. |
| Token và CSS | `src/app/globals.css`, `src/styles/zen-tokens.css`, `src/components/ui.tsx` | Giữ token và style pass / LED; chỉ thêm grid, compact card, responsive và tap target. Các card nhỏ không dùng LED. |
| Dữ liệu và state | `src/lib/data.ts`, `pay.ts`, `start.ts`, `scoring.ts`, `hire.ts`, `store.ts` | Giữ nguồn công việc, tính lương, dự kiến pháp lý và batch gate. Các tình huống W03 phải nối vào apps thực; lưu việc cần state riêng trong store. Snapshot demo không thay thế logic nghiệp vụ. |

## Tham chiếu và kiểm tra

Tham chiếu cấu trúc danh sách: [TopCV · tìm việc làm](https://www.topcv.vn/tim-viec-lam-moi-nhat), truy cập 15/11/2026; chỉ dùng ý tưởng tìm kiếm / lọc / danh sách việc của brief. Giữ nhận diện từ code và các ảnh `before/now-*.jpg`.

Đây là màn ứng dụng tĩnh; không áp dụng quy tắc marketing “mỗi section một màn hình”, đổi palette, hero animation hay hiệu ứng trang đích của skill, vì xung đột với brief giữ style và danh sách gọn.

Kiểm tra tự động lúc tạo: import trực tiếp TypeScript nguồn để tính lương, điểm, visa gate và ngày; assert tiền Mikawa, ngày 07/01/2027, tiến độ 162, 5 người đủ batch, 8 ứng viên hiển thị, đủ 7 HTML, CSS nhúng và UTF-8. Kết quả kiểm tra trình duyệt bổ sung bên dưới sau khi render.

### Kết quả kiểm tra bàn giao

- `node mockups/m4-layout/verify.cjs`: **PASS**. Kiểm tra 7 HTML có CSS nhúng, cú pháp JS, liên kết file cục bộ, ID duy nhất, landmark main; tiền và ngày từ nguồn; nhãn JLPT, visa gate, 8 hàng HR, 5 người đủ điều kiện batch; 7 cặp màu chữ/nền đạt AA. Script kiểm tra được giữ tại `verify.cjs` và cần dependency TypeScript đã có của prototype để đối chiếu dữ liệu nguồn. Các HTML không cần dependency đó.
- Xác nhận working tree không có thay đổi trong `viecnhanh-prototype/`; không chỉnh sửa ảnh `before/` hay `BRIEF.md`. `codex-run.log` đã có từ trước và được môi trường ghi log, không thuộc các file bàn giao mới.
- **Chưa xác minh render thực tế, tràn ngang, font đã tải, va chạm hoặc kích thước chạm bằng trình duyệt.** Chrome/Edge headless không hoàn tất render; Chrome báo lỗi GPU không sử dụng được trong môi trường chạy. Kênh browser host không khả dụng; duyệt tự động cũng từ chối truy cập cửa sổ Brave: “Computer Use was not approved to use Brave”. Không có ảnh render thành công để khẳng định layout đã qua visual QA.
- CSS đặt khung mobile tối đa 390 px, desktop tối ưu 1280 px; ba ô thông tin chi tiết giữ cùng hàng tại 390 px, dưới 360 px chuyển ô tiền lên hàng riêng. Cần mở từng HTML ở 390 và 1280 px để duyệt hình trước khi áp dụng thật. Chưa kiểm tra thiết bị vật lý hay trình đọc màn hình.

### Rà soát hook Impeccable · cỡ chữ và khoảng đệm

Đã đối chiếu các cảnh báo trên cả 7 HTML. Hook tổng hợp 161 mục; lượt quét chi tiết trước sửa ghi nhận 332 lượt xuất hiện gồm 234 `undersized-ui-text`, 96 `tiny-text` và 2 `cramped-padding`. Đây là vấn đề đọc và khoảng đệm cần sửa trong các mockup, không suy luận thời điểm phát sinh từ nhãn “attribution unknown”.

- Nâng mọi khai báo cỡ chữ dưới 12 px, cả CSS và inline style, lên 12 px: công ty, chip, nhãn, tab, trạng thái, metadata, điều hướng và bảng HR. Giữ nguyên Be Vietnam Pro, JetBrains Mono, màu và tiền LED lớn. Tiền thực nhận vẫn là số lớn nhất trên thẻ việc.
- Ô tìm ứng viên có đệm 8 px theo chiều dọc, 12 px theo chiều ngang. Ô cuối trong ba thông tin việc có khoảng đệm phải nhất quán và khai báo rõ không có đường phân cách phải.
- Tăng tiêu đề chính W03 từ 17 lên 20 px để phân cấp rõ với tiêu đề nhóm 15 px và chữ phụ 12 px. Không giảm cỡ chữ để cố giữ mật độ thẻ; mục tiêu quét 4–5 thẻ mỗi màn cần kiểm tra lại bằng render.
- Quét lại bằng `impeccable detect --json` trên đúng 7 HTML: **0 cảnh báo, kể cả advisory**. Không thêm ignore, không tắt rule và không để lại cảnh báo của lượt rà soát này.
- `node mockups/m4-layout/verify.cjs`: **PASS**, bổ sung kiểm tra không có khai báo cỡ chữ dưới 12 px. Không thay đổi file nào trong `viecnhanh-prototype/`.
- Giới hạn còn nguyên: chưa xác minh hiển thị, tràn ngang và mật độ thẻ sau khi nâng chữ bằng trình duyệt; nguyên nhân và các đường kiểm tra đã thử được ghi ở phần bàn giao phía trên.
