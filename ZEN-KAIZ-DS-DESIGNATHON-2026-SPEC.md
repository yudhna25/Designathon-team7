# ĐẶC TẢ KỸ THUẬT & CHIẾN LƯỢC NÂNG CẤP ZEN KAIZ DESIGN SYSTEM
## Phiên bản Chiến Đấu Designathon 2026 ("Where Everything Aligns – Thế Cân Bằng")

- **Ngày lập:** 13/11/2026 (15:30 ICT)
- **Mốc Giờ G (Deadline sẵn sàng thi đấu):** 07:00 sáng ngày 14/11/2026 (~15.5 giờ còn lại)
- **Hệ thống mục tiêu:** `ZEN Kaiz Design System` (`https://zen-kaiz-ds.vercel.app`) — phiên bản Next.js + Tailwind CSS code hóa từ file `ZEN Kaiz - Design System (FREE).fig` của Dizai Studio.
- **Mục đích tài liệu:** Gửi trực tiếp cho thành viên giữ source code và dùng làm tài liệu điều phối cho Claude Code / AI để hoàn thiện toàn bộ hệ thống trong tối–đêm 13/11/2026.

---

## MỤC LỤC NHANH & LỘ TRÌNH 4 SPRINT ĐÊM NAY

| Sprint | Hạng mục | Thời lượng ước tính | Mục tiêu hoàn thành |
| :--- | :--- | :---: | :--- |
| **P0** | Hotfix Kỹ thuật, Điều hướng War Room & AI Props Context | 30–45 phút | Sạch lỗi Hydration `#418`, đồng bộ `data-type`, đưa `/pitch` & `/demo/*` lên Sidebar/`⌘K`, khóa bảng Props API vào `ai/ZEN-KAIZ-DS.md` |
| **P1** | 8 Component "Sống Còn" (`DỰNG`) | 2.5 giờ | Bổ sung 8 component thực chiến (TopAppBar, SearchBar, DatePicker/Strip, Stepper/Slider, ScannerViewport, AI Kit, MetricCard, PopoverMenu) đủ 3 tab Hiển thị/Rule/Code |
| **P2** | 5 Screen Archetypes trong Flow Lab (`/demo/*`) | 2.5 giờ | Bộ khung 5 màn hình nối thành 1 Golden Path + **Demo Controller Bar** (phím `D`) bật tắt 4 trạng thái `Normal / Loading / Empty / Error` |
| **P3** | Nâng cấp Vũ khí Thuyết trình (`/pitch`) & Phòng thủ Q&A | 1.5 giờ | Thêm 4 Slide Layouts mới (Journey, Balance Loop, UI Before/After, Live Demo 3 chạm) + 4 Slide Appendix phòng thủ BGK |
| **QC** | Kiểm thử tổng thể (390px / 1280px, Light/Dark, 5 Modes) | 45 phút | Xác nhận 0 lỗi console, 100% token hóa, deploy lại Vercel trước khi đi ngủ |

**Tổng thời gian thực thi tập trung:** ~7.5 giờ (hoàn thành gọn trước 00:00–01:00 đêm, giữ sức khỏe cho 24h hackathon bắt đầu lúc 07:00 sáng mai).

---

## PHẦN 1: TUYÊN NGÔN MỤC TIÊU, RÀNG BUỘC & CHIẾN LƯỢC (INTENT, GOALS, NON-GOALS, APPROACHES)

### 1.1. Intent & Why (Tại sao phải nâng cấp ngay đêm nay?)
Hiện tại, `zen-kaiz-ds` đã có nền móng rất tốt:
- **12 trang Foundation** giải mã từ `.fig`: 399 semantic colors (Light/Dark), 114 component colors (Neutral/Brand), 182 component sizes (Compact/Comfortable), 25 corner radius tokens (Rounded/Standard), 26 text styles (Base 14/Base 16), 15+6 shadow/blur effects, 1.585 icons, cùng hệ thống `Motion DỰNG` (5 duration, 5 easing có `ease-spring`, 14 keyframes).
- **33 trang Components** (gồm 30 component UI + 3 component Slide `DỰNG`: `Slide`, `Slide Deck`, `Slide Layouts` với 23 layout 16:9).
- **Công cụ thi đấu:** `/docs/vibecode`, `/docs/qc-annotate`, `/pitch` (18 slide 7 phút, 3 tone `pro`/`story`/`naruto`), `/pitch/layouts`, `/demo/login`.

Tuy nhiên, khi đối chiếu với **Ma trận Chấm điểm Designathon** (UX Design **40%** · UI & Design System **40%** · UX Research **10%** · Presentation & Pitching **10%**) và bài học từ các đội **Quán quân các mùa trước** (như *Infinity – AI Phone+*, *We8*, *PeakArt*) cùng chủ đề **Designathon 2026 ("Where Everything Aligns – Thiết kế thế cân bằng"** giữa *User Needs – Business Goals – Tech Capabilities – Sustainability*), hệ thống còn **4 điểm nghẽn lớn**:
1. **Thiếu component giao diện thực chiến**: 30 component từ bản `.fig` FREE chưa có `TopAppBar`, `SearchBar`, `DatePicker`, `NumberStepper/Slider`, `Scanner/Dropzone`, `AI Kit`, `MetricCard (cho app)`, `PopoverMenu`. Lúc thi AI phải tự bịa hoặc code tay dễ lệch token.
2. **Mới có 1 màn hình mẫu `/demo/login`**: Chưa có bộ khung Screen Archetypes nối thành luồng Golden Path và chưa có công cụ trình diễn các Edge Cases (Loading/Empty/Error) ngay trên UI.
3. **Thiếu Slide Layout cho Kiến trúc UX & Thế Cân Bằng**: 23 layout hiện có rất mạnh về số liệu/insight nhưng thiếu layout *Journey Map có đường cảm xúc*, *Sơ đồ 4 trụ cột Thế Cân Bằng 2026*, *So sánh màn hình UI Before/After sau SUS test*, và *Slide nhúng Live Demo tương tác*.
4. **Rủi ro kỹ thuật nhỏ nhưng chí mạng khi vibecode**: Lỗi React Hydration `#418` trên console, thiếu bảng TypeScript Props API trong tài liệu AI, mode `data-type` chưa đồng bộ hoàn toàn trên thẻ `<html>`, và các route `/pitch`, `/demo/*` bị "ẩn" khỏi Sidebar/`⌘K`.

### 1.2. Goals (Mục tiêu phải đạt trước 07:00 sáng 14/11/2026)
1. **Sạch 100% lỗi kỹ thuật nền tảng (P0):** Triệt tiêu React error `#418`, đồng bộ thuộc tính `data-type` (`base-14` | `base-16`), đưa nhóm **War Room (Pitch & Flow Lab)** lên Sidebar & `⌘K`, và chèn bảng **Props API Signature** cho toàn bộ component vào `ai/ZEN-KAIZ-DS.md`.
2. **Đủ bộ 8 Component "Sống Còn" (P1):** Cài đặt đủ 8 component mới gắn nhãn `DỰNG` trong `src/components/`, dùng 100% token trong `src/styles/tokens.css`, hỗ trợ đủ 5 mode và có tài liệu 3 tab (`Hiển thị` · `Rule` · `Code`).
3. **Sẵn sàng 5 Screen Archetypes (P2):** Hoàn thiện 5 màn hình mẫu tại `/demo/*` nối với nhau thành 1 luồng sản phẩm khép kín + phím tắt `D` bật **Demo Controller Bar** để chuyển tức thì 4 trạng thái `Normal / Loading / Empty / Error`.
4. **Hoàn thiện cỗ máy Pitching 7 phút + Q&A (P3):** Thêm 4 Slide Layouts chiến lược vào `SlideLayouts.tsx` + 4 Slide Appendix (Backup 19–22) vào `src/data/pitch-mock.ts` để "bắt bài" mọi câu hỏi xoáy của BGK.

### 1.3. Non-Goals & Anti-Goals (Tuyệt đối KHÔNG làm đêm nay)
- **KHÔNG sửa tay `src/styles/tokens.css`**: File này được sinh tự động từ `.fig`. Mọi component mới phải tái sử dụng biến CSS/Tailwind có sẵn (`bg-bg-surface`, `text-content-accent-base`, `border-border-neutral-pale`, `--motion-base`, `ease-spring`, v.v.).
- **KHÔNG dựng các component quá nặng ít dùng trong 24h**: Bỏ qua Rich Text Editor (WYSIWYG), Drag-and-drop Kanban, Gantt Chart, Biểu đồ tài chính nến phức tạp, Full Calendar 12 tháng.
- **KHÔNG dùng mã màu hex/px cứng hay emoji làm icon**: 100% icon phải import từ `@/components/atoms/Icon/icons` (1.585 icon gốc) qua `<Icon glyph={...} />`.
- **KHÔNG bỏ qua Light/Dark & Mobile 390px**: Mọi component và màn hình mẫu mới phải hoạt động sắc nét ở cả `light` và `dark`, cả `neutral` và `brand` emphasis.

### 1.4. Approaches (Các phương án đã cân nhắc & Quyết định chọn)

| Phương án | Mô tả | Đánh giá & Trade-off | Quyết định |
| :--- | :--- | :--- | :---: |
| **Phương án 1: Mở rộng chiều rộng UI Kit** | Dựng thêm 15–20 component nhỏ lẻ (Table nâng cao, TreeView, Rating, Carousel, v.v.) | Tốn nhiều giờ viết docs cho từng component rời rạc; đến giờ thi đội vẫn phải mất công ghép từ trang trắng. | Loại |
| **Phương án 2: Tập trung tối đa vào Pitch Deck** | Giữ nguyên 30 component UI, chỉ làm đẹp bộ `/pitch` và hiệu ứng slide | Pitching chỉ chiếm ~10% điểm số; UX & UI sản phẩm chiếm tới 80%. Nếu sản phẩm live demo sơ sài sẽ mất điểm nặng. | Loại |
| **Phương án 3: Chiến lược Pareto 80/20 (4 Sprint P0 → P3)** | Hotfix kỹ thuật (P0) + 8 Component có tần suất xuất hiện cao nhất (P1) + 5 Screen Archetypes ghép sẵn luồng (P2) + Live Demo Slide & Q&A Appendix (P3) | Tác động trực tiếp vào cả **80% điểm UX/UI** (có sẵn khung màn hình + AI/Camera widget) lẫn **20% điểm Research/Pitching** (Live Demo 3 chạm trong slide + Appendix phòng thủ). Tối ưu cho quỹ thời gian 1 đêm. | **CHỌN** |

---

## PHẦN 2: ĐẶC TẢ CHI TIẾT GÓI P0 — HOTFIX KỸ THUẬT, ĐIỀU HƯỚNG & AI CONTEXT (30–45 PHÚT)

### P0.1. Triệt tiêu lỗi React Hydration Mismatch (`Minified React error #418`)
- **Hiện trạng quan sát được:** Trên một số trang (như `/docs/shadow`), console trình duyệt báo lỗi `Minified React error #418` khi SSR HTML không khớp với CSR DOM ban đầu (do đọc `localStorage` cho theme/mode hoặc render trạng thái động của client trên server).
- **Yêu cầu kỹ thuật:**
  1. Kiểm tra `src/app/layout.tsx`: Đảm bảo thẻ `<html>` có `suppressHydrationWarning`.
  2. Chèn một inline script đồng bộ ngắn ngay đầu `<head>` (hoặc trước khi hydrate) đọc `localStorage` để gán các attribute `data-theme`, `data-emphasis`, `data-radius`, `data-density`, `data-type` lên `document.documentElement` ngay lập tức, tránh chớp màn hình (FOUC) và tránh lệch state.
  3. Trong các component UI đọc state từ client (nút Toggle Theme trên Header, Token Customizer popover, các demo dùng `Math.random()` / `Date.now()` / `window` trên `/docs/shadow` và các trang docs khác): Bọc phần DOM phụ thuộc client bằng state `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);` hoặc giữ DOM render ban đầu trên server & client giống hệt nhau.
- **Tiêu chí nghiệm thu (AC):** Mở `/docs/shadow`, `/docs/introduction`, `/docs/button`, `/pitch` — Console trình duyệt có **0 errors**, **0 hydration warnings**.

### P0.2. Đồng bộ `data-type` (Type Scale Base 14 / Base 16) & Rà soát `/docs/color`
- **Hiện trạng quan sát được:**
  - Khi test bộ "Tuỳ chỉnh mode token" trên Header: `data-emphasis`, `data-density`, `data-radius` cập nhật trực tiếp lên thẻ `<html>`, nhưng `data-type` không thay đổi tương ứng (`null` khi kiểm tra DOM attribute trên `<html>`, mặc dù HTML SSR khởi tạo có `data-type="base-14"`).
  - Ngoài ra, trang `/docs/color` ghi nhận cờ từ khóa kiểm tra văn bản (`hasTodo` true do có chuỗi khớp từ khóa trong nội dung).
- **Yêu cầu kỹ thuật:**
  1. Trong Token Mode Customizer (nút `Tuỳ chỉnh mode token` trên Header), kiểm tra handler `Base 14` / `Base 16`: Khi user bấm chọn, bắt buộc cập nhật `document.documentElement.setAttribute('data-type', 'base-14' | 'base-16')`, lưu vào `localStorage`, và kiểm tra CSS selector trong `tokens.css` đang lắng nghe `[data-type="base-16"]` để font-size toàn trang đổi theo đúng spec.
  2. Rà soát toàn bộ text trên `/docs/color` xem có đoạn ghi chú `TODO` hoặc text nháp nào còn sót không, làm sạch nếu có.

### P0.3. Đưa nhóm "Chiến đấu 24h (War Room)" lên Sidebar & Command Menu (`⌘K`)
- **Hiện trạng:** Các route `/pitch`, `/pitch/layouts`, `/demo/login` đang hoạt động tốt nhưng không có link trên Sidebar chính và không tìm thấy qua `⌘K`.
- **Yêu cầu kỹ thuật:**
  Thêm nhóm mục mới vào cấu trúc navigation của Sidebar (đặt ngay dưới nhóm `Bắt đầu 4` hoặc trên cùng) và đồng bộ vào mảng dữ liệu tìm kiếm của `⌘K`:
  - Nhóm: **`Chiến đấu 24h` (War Room)**
    1. `Pitch Deck 18 Slides` → `/pitch?t=pro` (Badge: `DỰNG`)
    2. `Bộ chọn Slide Layouts` → `/pitch/layouts` (Badge: `23+`)
    3. `Flow Lab · Screen Templates` → `/demo/home` (và link phụ tới `/demo/login`, `/demo/onboarding`, `/demo/scanner`, `/demo/explore`, `/demo/dashboard`)

### P0.4. Chuẩn hóa Bảng Props API vào `ai/ZEN-KAIZ-DS.md` & Tab `Rule`
- **Vấn đề:** Tab `Rule` hiện có bảng Token naming + Anatomy + Kích thước + Do/Don't, nhưng **chưa có bảng TypeScript Props API** thống nhất. Khi Claude Code vibecode nhanh trong 24h, AI rất dễ đoán sai tên prop (ví dụ truyền `variant="primary"` thay vì `level="primary"`, hoặc `icon={...}` thay vì `glyph={...}` / `leadingIcon={...}`).
- **Yêu cầu kỹ thuật:**
  1. Tạo hoặc cập nhật phần đầu của file `ai/ZEN-KAIZ-DS.md` (và nhắc trong `CLAUDE.md`) bằng một bảng tra cứu nhanh **Component Props Cheatsheet** liệt kê toàn bộ ~38 components (30 cũ + 8 mới) theo format nén tối đa token:
     ```markdown
     | Component | Import Path | Core Props & Defaults |
     |---|---|---|
     | Button | `@/components/atoms/Button/Button` | `level?: 'primary'\|'accent'\|'secondary'\|'tertiary'\|'danger'\|'danger-subtle'\|'positive'\|'positive-subtle'\|'flat'\|'flat-accent'`, `size?: 'xl'\|'lg'\|'md'\|'sm'\|'xs'`, `loading?: boolean`, `disabled?: boolean`, `leadingIcon?: IconGlyph`, `trailingIcon?: IconGlyph` |
     ```
  2. Bổ sung block **"Props API"** gọn gàng vào phần `Rule` (hoặc ngay dưới `Import`) trên các trang Component docs để người và AI đều tra cứu tức thì.

---

## PHẦN 3: ĐẶC TẢ CHI TIẾT GÓI P1 — 8 COMPONENT "SỐNG CÒN" DỰNG THÊM (2.5 GIỜ)

> **Quy ước chung cho toàn bộ 8 component mới:**
> - Gắn huy hiệu `DỰNG` (giống `Motion`, `Slide`) và ghi rõ `Figma: Không có trong file FREE — dựng theo token`.
> - Dùng 100% CSS variables / Tailwind classes từ `src/styles/tokens.css`, **không hardcode hex/px**.
> - Tuân thủ hệ thống `Motion`: tương tác pressable (`active:scale-[0.98]`), mở popover/menu dùng `animate-scale-in` / `animate-slide-up` với `ease-spring`, thời lượng ≤ 300ms.
> - Hỗ trợ đầy đủ cả 5 Mode (`Light/Dark`, `Neutral/Brand`, `Rounded/Standard`, `Compact/Comfortable`, `Base 14/Base 16`).
> - Mỗi component bắt buộc có đủ:
>   1. File component thật trong `src/components/...`
>   2. File ví dụ tương tác trong `src/examples/...`
>   3. Trang tài liệu `/docs/<slug>` với 3 tab (`Hiển thị` · `Rule` · `Code`) và được index vào Sidebar + `⌘K`.

### Component 1: `TopAppBar` (Organism)
- **Đường dẫn:** `src/components/organisms/TopAppBar/TopAppBar.tsx` · Docs: `/docs/top-app-bar`
- **Vai trò:** Thanh điều hướng đỉnh cho cả Mobile (390px) và Desktop (1512px) — ghép cặp trực tiếp với `BottomNavigation`.
- **Props Interface:**
  ```ts
  export interface TopAppBarProps {
    title?: string;
    subtitle?: string;
    leadingAction?: React.ReactNode; // IconButton Back, Logo, hoặc Avatar
    trailingActions?: React.ReactNode; // Tối đa 2 IconButton / Badge
    variant?: 'solid' | 'glass' | 'transparent'; // glass dùng backdrop-blur-[20px]
    sticky?: boolean; // sticky top-0 z-30
    progress?: number; // 0..100 — hiển thị vạch Progress 2px sát mép dưới (rất hợp Onboarding)
    children?: React.ReactNode; // Slot mở rộng dưới tiêu đề (ví dụ SearchBar hoặc Segmented)
    className?: string;
  }
  ```
- **Token & Style:**
  - `variant="glass"`: `bg-bg-surface/80 backdrop-blur-[20px] border-b border-border-neutral-pale`.
  - Chiều cao: dùng biến kích thước navigation (`min-h-14` ~56px trên mobile Compact, thoáng hơn ở Comfortable).
  - Title: `text-heading-5 font-semibold text-content-neutral-strong truncate`.
- **Do / Don't:** Tối đa 2 nút bên phải; tiêu đề quá dài phải `truncate`; màn hình chính dùng Avatar/Logo bên trái, màn hình con bắt buộc có nút Back.

### Component 2: `SearchBar` & `Combobox` (Molecule)
- **Đường dẫn:** `src/components/molecules/SearchBar/SearchBar.tsx` · Docs: `/docs/search-bar`
- **Vai trò:** Ô tìm kiếm sản phẩm/tài liệu có gợi ý theo thời gian thực, lịch sử tìm kiếm, và dải chip lọc nhanh.
- **Props Interface:**
  ```ts
  export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    placeholder?: string;
    size?: 'lg' | 'md' | 'sm';
    suggestions?: { id: string; label: string; category?: string; icon?: IconGlyph }[];
    recentSearches?: string[];
    onSelectSuggestion?: (item: { id: string; label: string }) => void;
    loading?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
  }
  ```
- **Hành vi & Motion:**
  - Nút xoá nhanh `×` xuất hiện mượt với `animate-pop` khi `value.length > 0`.
  - Khi focus hoặc gõ chữ và có `suggestions`/`recentSearches`, xổ popover danh sách gợi ý (`shadow-popover`, `animate-scale-in`, hỗ trợ phím `ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
  - Hỗ trợ `loading` hiển thị spinner nhỏ bên phải thay cho nút xoá.

### Component 3: `DatePicker` & `DateStrip` (Molecule)
- **Đường dẫn:** `src/components/molecules/DatePicker/DatePicker.tsx` · Docs: `/docs/date-picker`
- **Vai trò:** Chọn ngày/giờ cho lịch hẹn, hạn sử dụng, đặt lịch, bộ lọc thời gian.
- **Props Interface:**
  ```ts
  export interface DatePickerProps {
    mode?: 'strip' | 'calendar'; // 'strip' = dải ngày ngang cho mobile; 'calendar' = lịch tháng
    value?: Date | null;
    onChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    quickPresets?: { label: string; date: Date }[]; // VD: Hôm nay, Ngày mai, +3 ngày, +7 ngày
    showTimeSlots?: boolean;
    timeSlots?: string[]; // VD: ['08:00', '12:00', '17:00', '20:00']
    selectedTime?: string;
    onTimeChange?: (time: string) => void;
    highlightDates?: { date: Date; status?: 'accent' | 'warning' | 'negative' }[];
    className?: string;
  }
  ```
- **Token & Style:**
  - `mode="strip"`: Hiển thị 7 ngày cuộn ngang (`snap-x`), mỗi ô ngày bo theo `--radius-*`, ngày được chọn dùng nền `bg-bg-accent-solid` (hoặc primary theo emphasis) với `animate-pop`.
  - `mode="calendar"`: Dùng kích thước nút chuẩn, hỗ trợ quick presets bằng `Chip` phía trên.

### Component 4: `NumberStepper` & `RangeSlider` (Atoms)
- **Đường dẫn:**
  - `src/components/atoms/NumberStepper/NumberStepper.tsx`
  - `src/components/atoms/RangeSlider/RangeSlider.tsx`
  - Docs: `/docs/number-stepper` (gộp cả 2 hoặc tách 2 trang nếu cần, khuyến nghị gộp 1 trang `/docs/range-stepper` "Stepper & Slider" để tiết kiệm thời gian docs).
- **Props Interface:**
  ```ts
  export interface NumberStepperProps {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string; // VD: 'g', 'hộp', 'người'
    size?: 'md' | 'sm';
    disabled?: boolean;
  }

  export interface RangeSliderProps {
    value: number | [number, number]; // Đơn hoặc Kép [min, max]
    onChange: (next: number | [number, number]) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    formatValue?: (v: number) => string; // VD: (v) => `${v} km` hoặc `${v.toLocaleString()}đ`
    showTicks?: boolean;
    disabled?: boolean;
  }
  ```
- **Hành vi & Motion:**
  - `NumberStepper`: Nút `-` / `+` dùng `IconButton` `level="tertiary"` (tự disable khi chạm `min`/`max`). Số ở giữa dùng `tabular-nums`, thay đổi kèm `animate-pop`.
  - `RangeSlider`: Thanh track `bg-bg-neutral-pale`, fill dùng `bg-bg-accent-solid`, nút kéo thumb có viền `border-border-neutral-strong` + `shadow-action`, khi hover/drag phóng to `scale-110 ease-spring` kèm nhãn giá trị nổi phía trên.

### Component 5: `ScannerViewport` (Organism — Vũ khí "Signature Visual Moment")
- **Đường dẫn:** `src/components/organisms/ScannerViewport/ScannerViewport.tsx` · Docs: `/docs/scanner`
- **Vai trò:** Khung quét Camera/OCR/QR/Nhận diện vật thể. **Đây là component tạo "Wow Moment" lớn nhất khi demo sản phẩm có yếu tố AI / Mobile trên sân khấu.**
- **Props Interface:**
  ```ts
  export interface ScannerPreset<T = unknown> {
    id: string;
    label: string; // VD: "Hoá đơn siêu thị", "Tủ lạnh ngăn mát", "Mã QR sản phẩm"
    thumbnailUrl?: string;
    previewBg?: React.ReactNode; // Hoặc SVG/Card minh hoạ sắc nét nếu không dùng ảnh ngoài
    mockDetections?: { label: string; x: number; y: number; w: number; h: number; confidence?: string }[];
    mockResult: T;
  }

  export interface ScannerViewportProps<T = unknown> {
    mode?: 'receipt' | 'qr' | 'object' | 'document';
    title?: string;
    hint?: string; // VD: "Đưa hoá đơn vào giữa khung hình"
    presets: ScannerPreset<T>[]; // Chế độ 1-Click Demo Presets cho sân khấu
    scanDurationMs?: number; // Mặc định 1200ms
    allowFileUpload?: boolean;
    onScanStart?: (preset: ScannerPreset<T>) => void;
    onScanComplete: (result: T, preset: ScannerPreset<T>) => void;
    className?: string;
  }
  ```
- **Cơ chế hoạt động bắt buộc (Chống rủi ro sân khấu):**
  1. Không phụ thuộc vào webcam thật (`getUserMedia`) để tránh lỗi xin quyền trên máy trình chiếu hoặc phòng tối. Thay vào đó, mặc định chọn Preset #1 và cho phép người dùng chuyển nhanh giữa 2–3 Presets ở hàng chip bên dưới.
  2. Khung ngắm tỷ lệ `aspect-[3/4]` hoặc `aspect-square`, có 4 góc định vị (`corner brackets`), và đường tia quét laser chạy lên xuống mượt mà.
  3. Khi bấm nút **"Quét ngay"** (Primary Circle/Pill CTA):
     - Chạy trạng thái `scanning` trong `scanDurationMs` (mặc định `1200ms`): Tia quét chuyển sang màu `accent`, hiệu ứng `animate-shimmer`.
     - Tại mốc `800ms`: Hiện các khung nhận diện (`mockDetections`) kèm badge confidence (`98%`) nhảy ra với `animate-pop`.
     - Tại mốc `1200ms`: Gọi `onScanComplete(preset.mockResult, preset)` để mở `BottomSheet` hoặc chuyển bước.
  4. Có nút phụ cho phép "Chọn ảnh từ máy" (`<input type="file" accept="image/*" />`) để demo upload ảnh thật nếu muốn.

### Component 6: `AIKit` — `AIThinkingSteps` & `AIInsightCard` (Organism — Vũ khí 2026)
- **Đường dẫn:** `src/components/organisms/AIKit/AIKit.tsx` · Docs: `/docs/ai-kit`
- **Vai trò:** Khẳng định chuẩn mực **Explainable AI + Human-in-the-loop** (phù hợp tiêu chí "Thế Cân Bằng" 2026: AI hỗ trợ nhưng con người nắm quyền kiểm soát).
- **Props Interface:**
  ```ts
  export interface AIThinkingStep {
    id: string;
    label: string;
    detail?: string;
  }

  export interface AIThinkingStepsProps {
    steps: AIThinkingStep[];
    activeStepIndex?: number; // Nếu không truyền, có thể bật autoPlay
    autoPlay?: boolean;
    intervalMs?: number; // Mặc định 450ms/bước
    onComplete?: () => void;
    className?: string;
  }

  export interface AIInsightCardProps {
    badgeLabel?: string; // Mặc định "AI Gợi ý"
    impactTag?: string; // VD: "Tiết kiệm 120.000đ" hoặc "Giảm 40% rủi ro"
    impactTone?: 'positive' | 'accent' | 'warning' | 'negative';
    title: string;
    description?: string;
    reasoning: string; // BẮT BUỘC: khối "Vì sao AI đề xuất điều này?"
    primaryAction?: { label: string; onClick: () => void; loading?: boolean };
    secondaryAction?: { label: string; onClick: () => void };
    onDismiss?: () => void;
    className?: string;
  }
  ```
- **Token & Motion:**
  - `AIInsightCard`: Viền nhấn `border-border-accent-subtle` trên nền `bg-bg-surface`, icon tia sáng/AI trong `bg-bg-accent-subtle text-content-accent-base`, phần `reasoning` đặt trong hộp phụ `bg-bg-neutral-pale rounded-xl px-3 py-2 text-body-small`.
  - `AIThinkingSteps`: Bước đang chạy có `animate-spin` hoặc `animate-ping` dot; bước hoàn thành đổi sang `IconCheckCircleSolid` màu `text-content-positive-light` với `animate-pop`.

### Component 7: `MetricCard` & `MiniChart` (Molecule)
- **Đường dẫn:** `src/components/molecules/MetricCard/MetricCard.tsx` · Docs: `/docs/metric-card`
- **Vai trò:** Đưa khả năng hiển thị số liệu từ `SlideLayouts` vào thẳng giao diện Mobile App và Web Dashboard.
- **Props Interface:**
  ```ts
  export interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    delta?: { value: string; trend: 'up' | 'down' | 'flat'; positiveIsGood?: boolean };
    sparkline?: number[]; // Mảng 5–12 điểm vẽ SVG polyline
    progress?: number; // 0..100 vẽ Ring progress hoặc thanh ngang nhỏ
    icon?: IconGlyph;
    tone?: 'neutral' | 'accent' | 'positive' | 'warning' | 'negative';
    interactive?: boolean;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
  }
  ```
- **Token & Style:** Tận dụng `Card` base, số liệu dùng `tabular-nums text-heading-2 font-semibold`, SVG sparkline dùng `stroke-current` theo `tone`, animation đường vẽ mượt dưới 400ms.

### Component 8: `PopoverMenu` / `ActionMenu` (Molecule)
- **Đường dẫn:** `src/components/molecules/PopoverMenu/PopoverMenu.tsx` · Docs: `/docs/popover-menu`
- **Vai trò:** Menu ngữ cảnh khi bấm vào nút `...` (`IconDotsHorizontalLine`), nút lọc sắp xếp, hoặc Avatar người dùng.
- **Props Interface:**
  ```ts
  export interface PopoverMenuItem {
    id: string;
    label: string;
    description?: string;
    icon?: IconGlyph;
    shortcut?: string;
    danger?: boolean;
    disabled?: boolean;
    onSelect: () => void;
  }

  export interface PopoverMenuProps {
    trigger: React.ReactNode;
    groups: PopoverMenuItem[][]; // Tự chèn Divider giữa các group
    align?: 'start' | 'end';
    side?: 'bottom' | 'top';
    className?: string;
  }
  ```
- **Hành vi:** Mở bằng click, đóng bằng `Escape` hoặc click ngoài (`outside click`), điều hướng bằng phím mũi tên, nền `bg-bg-surface shadow-popover border border-border-neutral-pale`, hiệu ứng `animate-scale-in ease-spring`.

---

## PHẦN 4: ĐẶC TẢ CHI TIẾT GÓI P2 — 5 "SCREEN ARCHETYPES" TRONG FLOW LAB (`/demo/*`) (2.5 GIỜ)

### 4.1. Kiến trúc chung của Flow Lab & "Demo Controller Bar"
- **Thư mục đích:** `src/app/(screens)/demo/` (cùng dữ liệu mẫu tập trung tại `src/data/demo-mock.ts` để ngày thi chỉ cần sửa 1 file mock là toàn bộ 5 màn hình đổi theo domain của đề thi!).
- **Vũ khí Demo Controller Bar (`src/components/demo/DemoController.tsx`):**
  - Bọc quanh layout `/demo/*` (ẩn mặc định khi nhúng trong iframe Slide hoặc bấm phím **`D`** để bật/tắt thanh nổi nhỏ góc dưới trái).
  - Cho phép chuyển tức thì 4 trạng thái trên bất kỳ màn hình demo nào:
    - `Normal` (Dữ liệu đầy đủ)
    - `Loading` (Hiển thị `Skeleton` đúng cấu trúc layout thật)
    - `Empty` (Hiển thị `EmptyState` kèm CTA khôi phục)
    - `Error` (Hiển thị `InlineMessage` / `AlertBanner` mất kết nối hoặc AI không đọc được kèm nút `Thử lại`)
  - Hỗ trợ query param `?state=normal|loading|empty|error` và `?embed=1` (ẩn thanh điều hướng docs thừa khi nhúng vào Slide Deck).
  - **Ý nghĩa khi chấm điểm:** Khi BGK hỏi *"Nếu mạng chập chờn hoặc chưa có dữ liệu thì giao diện trông như thế nào?"*, chỉ cần 1 click trên Demo Controller Bar là hiện ngay `Skeleton` / `EmptyState` / `Error` đúng chuẩn!

### 4.2. Chi tiết 5 Screen Archetypes (Nối thành 1 Golden Path hoàn chỉnh)

> **Lưu ý dữ liệu mặc định:** Có thể dùng tiếp đề tài *"Bếp Vừa Đủ"* (đang dùng làm dữ liệu mẫu trong `SlideLayouts`) hoặc cấu trúc abstract dễ thay thế trong `src/data/demo-mock.ts` để toàn bộ App Demo ăn khớp 100% với Pitch Deck mẫu.

1. **`/demo/onboarding` — Archetype 1: Cá nhân hóa 15 giây (3 bước)**
   - **Cấu trúc:** `TopAppBar` (nút Back + `progress={33|66|100}`) → Tiêu đề lớn + mô tả ngắn → Danh sách `Card` / `Chip` chọn mục tiêu (VD: chọn quy mô gia đình, thói quen, mức cảnh báo) → Sticky bottom bar chứa đúng 1 `Button` `size="lg"` `level="primary"` ("Tiếp tục" / "Bắt đầu ngay").
   - **Flow:** Kết thúc bước 3 chuyển thẳng sang `/demo/home` kèm `Toast` chào mừng.

2. **`/demo/home` — Archetype 2: Mobile Home Dashboard (390px Frame trên Desktop)**
   - **Cấu trúc:**
     - `TopAppBar` (Logo/Avatar + lời chào cá nhân hóa + `IconButton` thông báo có `Badge` chấm đỏ).
     - `AIInsightCard` nổi bật trên đầu (tác động cao nhất + dòng "Vì sao gợi ý?" + nút CTA).
     - Hàng lưới 2–3 `MetricCard` (có delta + mini sparkline/ring).
     - `Segmented` hoặc `Tabs` chia nhóm nội dung (VD: `Cần xử lý (3)` · `Tất cả` · `Đã xong`).
     - Danh sách `ListItem` tương tác (bấm vào mở `BottomSheet` chi tiết, có nút `PopoverMenu` `...` bên phải).
     - `BottomNavigation` (`variant="floating-glass"`): Trang chủ · Khám phá (`/demo/explore`) · **Quét AI** (`/demo/scanner`, nút nổi bật) · Hệ thống (`/demo/dashboard`).

3. **`/demo/scanner` — Archetype 3: Luồng "Wow Moment" Camera/AI → BottomSheet Xác nhận**
   - **Cấu trúc:**
     - `TopAppBar` (Nút Back về `/demo/home` + tiêu đề chế độ quét).
     - `ScannerViewport` (chọn 1 trong 3 Presets → bấm Quét).
     - Sau khi quét xong (`1.2s`): Hiện khối `AIThinkingSteps` (3 bước chạy tuần tự `1.2s`) hoặc chuyển thẳng sang `BottomSheet` kết quả.
     - Trong `BottomSheet`: Hiển thị các item vừa bóc tách; mỗi item có `NumberStepper` chỉnh số lượng và `DatePicker mode="strip"` / `Chip` chỉnh thời hạn; nút Primary `Button lg` "Lưu & Áp dụng".
     - Khi xác nhận: Lưu state vào `sessionStorage` / Context → Điều hướng về `/demo/home` → Số liệu `MetricCard` trên Home tự tăng và hiện `Toast` `positive`!

4. **`/demo/explore` — Archetype 4: Tìm kiếm, Bộ lọc & Trạng thái Biên**
   - **Cấu trúc:**
     - `TopAppBar` + `SearchBar` (có gợi ý autocomplete và nút xoá).
     - Hàng `Chip` lọc ngang (`scroll-x`) + `Segmented` chuyển chế độ xem Lưới (`Card`) / Danh sách (`ListItem`).
     - Hỗ trợ gõ từ khóa không tồn tại để tự động kích hoạt `EmptyState` (kèm nút "Xoá bộ lọc").
     - Nút `Pagination` hoặc nút "Tải thêm" có trạng thái loading.

5. **`/demo/dashboard` — Archetype 5: Desktop B2B / Admin / System View (1512px) cho "Thế Cân Bằng"**
   - **Vai trò chiến lược:** Designathon 2026 nhấn mạnh **Business Goals & Sustainability** bên cạnh User Needs. Nếu đội chỉ làm app cho người dùng cuối mà thiếu góc nhìn quản trị/đối tác/bền vững thì dễ bị hỏi xoáy. Màn hình này giải quyết trọn vẹn phần đó!
   - **Cấu trúc:**
     - Layout Desktop: Sidebar điều hướng trái + Header (kèm link quay lại Mobile App `/demo/home`).
     - Hàng 4 `MetricCard` lớn đại diện cho 4 trụ cột: *Người dùng hoạt động*, *Doanh thu / Tiết kiệm*, *Tỉ lệ chính xác AI*, *Chỉ số Tác động Bền vững*.
     - Khối nội dung chính: Thanh `SearchBar` + `Tabs` lọc + Bảng dữ liệu (dùng token `table` từ `/docs/size`, mỗi dòng có `Avatar`, `Badge` trạng thái, `Progress`, nút xem chi tiết mở `Modal` hoặc `Drawer`).

---

## PHẦN 5: ĐẶC TẢ CHI TIẾT GÓI P3 — NÂNG CẤP VŨ KHÍ THUYẾT TRÌNH `/pitch` & PHÒNG THỦ Q&A (1.5 GIỜ)

### 5.1. Bổ sung 4 Slide Layouts mới vào `src/components/organisms/SlideLayouts/SlideLayouts.tsx`
Mỗi layout phải tuân thủ quy tắc 16:9 (`960×540`), hỗ trợ `SlideViewport` tự scale, tuân thủ quy tắc màu số liệu của hệ thống (tối đa 5 màu phân loại, nhấn 1 điểm bằng `accent`, bắt buộc có `source` ở slide số liệu, animation `< 400ms`).

1. **`<FlowJourney />` (Hành trình người dùng & Đường cảm xúc)**
   - **Props:** `eyebrow`, `title`, `steps: { phase: string; action: string; emotion: -2 | -1 | 0 | 1 | 2; painPoint?: string; opportunity?: string }[]`, `source?`, `page`.
   - **Hiển thị:** 4–5 cột giai đoạn đặt theo chiều ngang; phía trên là biểu đồ đường cong cảm xúc SVG nối qua các điểm `emotion` (điểm trũng `-2` tô màu `negative` nổi bật cùng bong bóng trích dẫn `painPoint`), phía dưới là điểm chạm cơ hội giải pháp (`opportunity`).

2. **`<FlowBalanceLoop />` (Sơ đồ 4 Trụ cột Thế Cân Bằng — Designathon 2026)**
   - **Props:** `eyebrow`, `title`, `centerCore: { label: string; sublabel?: string }`, `pillars: { role: 'user' | 'business' | 'tech' | 'sustainability'; title: string; metric: string; detail: string }[]`, `page`.
   - **Hiển thị:** Bố cục 2×2 đối xứng quanh tâm sản phẩm (`centerCore`), các mũi tên SVG nối vòng tròn thể hiện vòng lặp giá trị (*User tin dùng → Tạo dữ liệu sạch → AI chính xác hơn → Đối tác/Doanh nghiệp giảm chi phí & tăng doanh thu → Giảm lãng phí xã hội*). Mỗi góc hiển thị rõ 1 con số/cam kết cụ thể.

3. **`<UiBeforeAfter />` (So sánh Màn hình UI Trước & Sau Usability Test)**
   - **Props:** `eyebrow`, `title`, `before: { label: string; issues: string[]; mockup: React.ReactNode }`, `after: { label: string; fixes: string[]; metricGain?: string; mockup: React.ReactNode }`, `page`.
   - **Hiển thị:** 2 khung mockup cạnh nhau (Bản V1 vs Bản V2), ở giữa có mũi tên chuyển đổi kèm huy hiệu cải thiện (VD: `SUS 61 → 78.5`, `Giảm 42% thời gian thao tác`). Bên cạnh mỗi khung là tối đa 3 thẻ Callout ngắn giải thích lý do thiết kế.

4. **`<LiveDemoSlide />` (Nhúng Live Interactive Demo ngay trong Slide Deck)**
   - **Props:** `eyebrow`, `title`, `scenarios: { id: string; label: string; description: string; targetUrl: string }[]`, `page`.
   - **Hiển thị:**
     - **Cột trái (40%):** Danh sách 3 bước kịch bản demo ("Chạm 1: Mở app & nhận gợi ý AI", "Chạm 2: Quét hoá đơn trong 1.2s", "Chạm 3: Xác nhận & cập nhật tủ đồ").
     - **Cột phải (60%):** Khung viền điện thoại (tỷ lệ 390×844 thu gọn vừa khung 16:9) chứa `<iframe src={activeScenario.targetUrl + '?embed=1'} />` cùng nút "Mở toàn màn hình" phòng hờ.
     - **Giá trị:** Người thuyết trình không bao giờ phải `Alt+Tab` ra khỏi Slide Deck khi đang chạy đồng hồ 7 phút!

### 5.2. Bổ sung 4 Slide Appendix (Backup Slides 19–22) vào `src/data/pitch-mock.ts` & `SlideDeck`
- **Cơ chế truy cập nhanh trong `SlideDeck`:**
  - Bộ 18 slide chính giữ nguyên mạch kể chuyện **7 phút** (đồng hồ tính cho 18 slide chính).
  - Thêm 4 slide **Appendix (`A1`–`A4`, phím tắt nhanh `1`–`4` hoặc nút mục lục Appendix ở thanh điều khiển dưới của `SlideDeck`)** không nằm trong luồng 7 phút chính mà dùng để nhảy ngay đến khi BGK đặt câu hỏi ở phần Q&A:
    1. **Appendix A1 (`Key 1`): Business Model & Unit Economics** — Nguồn thu, chi phí vận hành (AI API cost/user), chiến lược giữ chân người dùng (dùng `<DataTable />` hoặc `<DataKpis />`).
    2. **Appendix A2 (`Key 2`): Tech Architecture & AI Fallback Strategy** — Xử lý thế nào khi AI nhận diện nhầm, khi thiết bị offline, hoặc người dùng từ chối quyền Camera (dùng `<InsightImplication />` hoặc bảng quy trình).
    3. **Appendix A3 (`Key 3`): Accessibility & Inclusive Design (Live Mode Switch)** — Chứng minh thực tế ngay trên slide bằng 1 nút bấm chuyển `Base 14 → Base 16` + `Compact → Comfortable` + `Light → Dark` của ZEN Kaiz để cho BGK thấy sản phẩm đáp ứng người lớn tuổi / người thị lực kém tức thì!
    4. **Appendix A4 (`Key 4`): Sustainability Impact & 6-Month Roadmap** — Định lượng tác động dài hạn và khả năng mở rộng hệ thống design system.

---

## PHẦN 6: BỘ PROMPT THỰC THI COPY-PASTE CHO CLAUDE CODE (DÀNH CHO THÀNH VIÊN GIỮ SOURCE CODE)

Thành viên giữ source code chỉ cần mở terminal tại thư mục gốc của repo `ZEN-KAIZ-DS` và chạy lần lượt 4 prompt dưới đây trong tối nay. (Nhớ kiểm tra lại giữa mỗi sprint trên `http://localhost:6868`).

### Prompt Sprint P0 — Hotfix Kỹ thuật, Sidebar & AI Props Context
```text
Đọc CLAUDE.md và ai/ZEN-KAIZ-DS.md trong repo ZEN-KAIZ-DS.
Thực hiện Gói P0 (Hotfix & Context) với 4 việc sau, không sửa tay src/styles/tokens.css:
1. Sửa triệt để lỗi React Hydration mismatch (error #418) xuất hiện trên /docs/shadow và layout:
   - Kiểm tra src/app/layout.tsx: thêm suppressHydrationWarning trên <html> và thêm inline script đồng bộ trong <head> để khôi phục data-theme, data-emphasis, data-radius, data-density, data-type từ localStorage trước khi React hydrate.
   - Kiểm tra các component đọc client state trong /docs/shadow và header để đảm bảo SSR HTML khớp 100% CSR lần render đầu.
2. Sửa nút chuyển đổi Type Scale (Base 14 / Base 16) trong Token Mode Customizer trên Header để cập nhật đồng bộ thuộc tính `data-type="base-14" | "base-16"` trên <html> và lưu localStorage. Rà soát lại trang /docs/color xem có từ/đoạn TODO nào còn sót không và hoàn thiện nếu có.
3. Cập nhật cấu trúc Sidebar và dữ liệu tìm kiếm Cmd+K (Command Menu): Thêm nhóm "Chiến đấu 24h" với link tới `/pitch?t=pro` (Pitch Deck 18 Slides), `/pitch/layouts` (Bộ chọn Slide Layouts), và `/demo/login` (Flow Lab).
4. Đọc toàn bộ props interface của các component trong src/components/atoms, molecules, organisms; bổ sung một bảng "Component Props Cheatsheet" (tên component, import path, props chính, default values) lên đầu file ai/ZEN-KAIZ-DS.md để AI vibecode không bao giờ truyền sai tên prop.

Verify trên http://localhost:6868: mở /docs/shadow, /docs/color, /docs/introduction, kiểm tra 0 console error và 5 mode token đều cập nhật attribute trên <html>.
```

### Prompt Sprint P1 — Dựng 8 Component "Sống Còn" (`DỰNG`) + Tài liệu 3 Tab
```text
Đọc CLAUDE.md và ai/ZEN-KAIZ-DS.md.
Dựng 8 component mới (gắn badge DỰNG, ghi chú "Không có trong file FREE — dựng theo token"), dùng 100% semantic tokens từ src/styles/tokens.css, icon từ @/components/atoms/Icon/icons, và motion tokens (--motion-*, ease-spring, keyframes có sẵn):
1. `TopAppBar` (`src/components/organisms/TopAppBar/TopAppBar.tsx`): props title, subtitle, leadingAction, trailingActions, variant ('solid'|'glass'|'transparent'), sticky, progress (0-100).
2. `SearchBar` (`src/components/molecules/SearchBar/SearchBar.tsx`): props value, onChange, suggestions, recentSearches, loading, nút xoá nhanh animate-pop, popover gợi ý điều khiển được bằng phím mũi tên/Esc.
3. `DatePicker` (`src/components/molecules/DatePicker/DatePicker.tsx`): hỗ trợ mode="strip" (dải ngày trượt ngang 1 chạm cho mobile) và mode="calendar", kèm quickPresets và timeSlots.
4. `NumberStepper` (`src/components/atoms/NumberStepper/NumberStepper.tsx`) & `RangeSlider` (`src/components/atoms/RangeSlider/RangeSlider.tsx`): hỗ trợ đơn và kép [min, max], tabular-nums, animate-pop khi đổi số.
5. `ScannerViewport` (`src/components/organisms/ScannerViewport/ScannerViewport.tsx`): khung quét camera/OCR/QR có chế độ 1-Click Demo Presets (mặc định không cần webcam thật để an toàn khi demo sân khấu), tia quét laser, hiệu ứng bounding box khoanh vùng nhận diện sau 800ms và trả onScanComplete sau 1200ms, kèm fallback chọn ảnh từ máy.
6. `AIKit` (`src/components/organisms/AIKit/AIKit.tsx`): gồm `AIThinkingSteps` (từng bước chạy tuần tự kèm IconCheckCircleSolid) và `AIInsightCard` (badge AI, impactTag, khối bắt buộc "Vì sao gợi ý điều này?", và nút Human-in-the-loop).
7. `MetricCard` (`src/components/molecules/MetricCard/MetricCard.tsx`): hiển thị chỉ số app/dashboard kèm delta trend, mini SVG sparkline hoặc ring progress.
8. `PopoverMenu` (`src/components/molecules/PopoverMenu/PopoverMenu.tsx`): menu thả xuống cho nút `...` hoặc Avatar, hỗ trợ group + Divider + mục danger, đóng bằng Esc/click ngoài.

Với mỗi component:
- Tạo trang docs tương ứng trong /docs/* với đủ 3 tab (Hiển thị tương tác thật, Rule kèm bảng Props API + Token mapping + Do/Don't, Code copy được), viết example trong src/examples/.
- Thêm vào Sidebar (nhóm Components) và search index Cmd+K.
- Cập nhật bảng Props Cheatsheet trong ai/ZEN-KAIZ-DS.md.

Verify cả Light/Dark, Neutral/Brand emphasis, Rounded/Standard radius, Compact/Comfortable density ở 390px và 1280px.
```

### Prompt Sprint P2 — Dựng 5 Screen Archetypes trong Flow Lab (`/demo/*`) + Demo Controller Bar
```text
Đọc CLAUDE.md và ai/ZEN-KAIZ-DS.md.
Mở rộng Flow Lab tại src/app/(screens)/demo/ thành bộ 5 Screen Archetypes nối thành 1 Golden Path hoàn chỉnh, sử dụng dữ liệu mẫu tập trung trong src/data/demo-mock.ts (cùng bối cảnh với pitch-mock.ts để app và slide khớp nhau 100%).
1. Tạo `DemoController` (`src/components/demo/DemoController.tsx`) bọc layout `/demo/*`:
   - Có phím tắt `D` (hoặc nút nhỏ góc màn hình, tự ẩn khi URL có `?embed=1`) để chuyển tức thì 4 trạng thái toàn màn hình: `Normal`, `Loading` (Skeleton đúng cấu trúc), `Empty` (EmptyState), `Error` (InlineMessage + nút thử lại).
   - Hỗ trợ query `?state=normal|loading|empty|error`.
2. Dựng 4 màn hình mới (cùng với `/demo/login` sẵn có):
   - `/demo/onboarding`: 3 bước cá nhân hoá nhanh với TopAppBar (progress), chọn Card/Chip mục tiêu, 1 Primary Button lg cố định dưới đáy, xong chuyển sang `/demo/home`.
   - `/demo/home`: Khung mobile 390px (căn giữa đẹp trên desktop), TopAppBar + AIInsightCard + hàng MetricCard + Segmented lọc + danh sách ListItem (bấm mở BottomSheet chi tiết) + BottomNavigation floating-glass dẫn sang Scanner/Explore/Dashboard.
   - `/demo/scanner`: Dùng `ScannerViewport` (3 presets) -> bấm quét -> hiện `AIThinkingSteps` -> mở `BottomSheet` chỉnh sửa kết quả bằng `NumberStepper` & `DatePicker` -> bấm lưu quay về `/demo/home` với Toast positive và cập nhật số liệu.
   - `/demo/explore`: `SearchBar` có gợi ý + Chip lọc + Segmented chuyển view Lưới/Danh sách + tự kích hoạt EmptyState khi từ khoá không khớp.
   - `/demo/dashboard`: Màn hình Desktop 1512px (Sidebar + 4 MetricCard Thế Cân Bằng + Data Table với search/tabs/Modal chi tiết) thể hiện góc nhìn Business & Sustainability.
3. Đưa toàn bộ 5 route `/demo/*` vào nhóm "Chiến đấu 24h" trên Sidebar và Cmd+K.
Verify toàn bộ luồng bấm từ Onboarding -> Home -> Scanner -> BottomSheet -> Home -> Explore -> Dashboard trên localhost:6868, cả Light/Dark và phím `D`.
```

### Prompt Sprint P3 — Nâng cấp `/pitch` (4 Slide Layouts mới + Live Demo 3 Chạm + 4 Appendix Q&A)
```text
Đọc CLAUDE.md và ai/ZEN-KAIZ-DS.md.
Nâng cấp hệ thống thuyết trình Designathon tại `src/components/organisms/SlideLayouts/SlideLayouts.tsx`, `src/components/organisms/SlideDeck/`, `src/data/pitch-mock.ts`, và `/pitch/layouts`:
1. Thêm 4 Slide Layouts chuẩn 16:9 (960x540, motion < 400ms, tuân thủ bảng màu & source rule của hệ thống):
   - `FlowJourney`: Hành trình 4-5 bước kèm đường cong cảm xúc SVG, tô nổi điểm trũng pain point và điểm chạm giải pháp.
   - `FlowBalanceLoop`: Sơ đồ 4 trụ cột Thế Cân Bằng 2026 (User Needs · Business Goals · Tech/AI · Sustainability) nối vòng tròn quanh sản phẩm trung tâm.
   - `UiBeforeAfter`: So sánh trực quan 2 khung màn hình UI Vòng 1 vs Vòng 2 sau SUS test, kèm huy hiệu cải thiện và 3 callouts thay đổi cụ thể.
   - `LiveDemoSlide`: Cột trái là danh sách 3 kịch bản bấm chọn ("Chạm 1/2/3"); cột phải là khung điện thoại nhúng `<iframe src="...?embed=1" />` tự chuyển đúng màn hình `/demo/home`, `/demo/scanner`, `/demo/explore` khi click kịch bản bên trái (kèm nút mở tab mới dự phòng).
2. Cập nhật `src/data/pitch-mock.ts` và `SlideDeck`:
   - Thay hoặc bổ sung các layout mới vào bộ 18 slide (đặc biệt gắn `LiveDemoSlide` vào slide Live demo).
   - Thêm 4 Slide Appendix (A1: Business & Unit Economics, A2: Tech & AI Fallback, A3: Accessibility có nút chuyển live Base 14/Base 16 & Comfortable ngay trên slide, A4: Sustainability & Roadmap) truy cập nhanh bằng phím tắt `1` `2` `3` `4` hoặc menu Appendix ở thanh điều khiển SlideDeck mà không làm xáo trộn đồng hồ 7 phút của 18 slide chính.
3. Cập nhật `/docs/slide-layouts` và `/pitch/layouts` để hiển thị đủ 27 layouts (23 cũ + 4 mới).

Verify trình chiếu toàn màn hình `/pitch?t=pro&s=1`, test chuyển kịch bản trên `LiveDemoSlide`, bấm phím `1`-`4` mở Appendix, test Export PDF không bị vỡ layout.
```

---

## PHẦN 7: CHECKLIST NGHIỆM THU CUỐI CÙNG TRƯỚC 07:00 SÁNG 14/11/2026

Trước khi kết thúc chuẩn bị và bước vào giờ thi chính thức, cả team kiểm tra 1 lượt 7 gạch đầu dòng sau trên bản deploy Vercel mới nhất:
1. [ ] **Console sạch 100%:** Mở `/docs/shadow`, `/docs/button`, `/demo/home`, `/pitch` không còn `Minified React error #418`.
2. [ ] **5 Mode token chạy mượt:** Đổi `Light/Dark`, `Neutral/Brand`, `Rounded/Standard`, `Compact/Comfortable`, `Base 14/Base 16` — cả `<html>` attributes lẫn 8 component mới & 5 màn hình `/demo/*` phản hồi chuẩn xác.
3. [ ] **AI Ready:** Đã chạy thử 1 prompt ngắn tạo 1 màn hình mới trên nhánh test bằng `ai/ZEN-KAIZ-DS.md` mới — AI import đúng path, dùng đúng prop `level`/`glyph`, không dùng hex/emoji.
4. [ ] **Flow Lab thông suốt:** Đi hết 1 vòng `Onboarding → Home → Scanner (Preset) → BottomSheet → Home (tăng số) → Explore → Dashboard`, test phím `D` bật tắt `Loading / Empty / Error`.
5. [ ] **Live Demo trong Pitch Deck:** Tại `/pitch?t=pro`, chuyển tới slide Live Demo, bấm 3 kịch bản bên trái thì khung điện thoại bên phải chuyển mượt mà không cần Alt+Tab.
6. [ ] **Q&A Appendix sẵn sàng:** Bấm phím `1`, `2`, `3`, `4` trong SlideDeck nhảy đúng tới 4 slide phòng thủ; slide Accessibility đổi được `Base 16` trực tiếp trước mắt BGK.
7. [ ] **Credits & Quy định Designathon:** Slide cuối vẫn giữ đầy đủ Credit cho Dizai Studio (ZEN Kaiz Design System Free) và các thư viện sử dụng theo đúng `/docs/credits`.
