# M4 UI · Bento + Thẻ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa prototype ViệcNhanh Aichi sang hướng UI "Bento + Thẻ", trả lời đủ 5 thẻ đề bài (đặc biệt sự kiện M3 3 tháng/300 người và mâu thuẫn feedback 4–6 của M2), đóng 7 lỗi mentor, rồi đẩy màn sang Figma trước 08:00 15/11.

**Architecture:** Giữ nguyên Next.js App Router + zustand store hiện có. Logic mới (ngày bắt đầu, dữ liệu người Việt, kế hoạch tuyển 300, chọn duyệt theo đợt) là hàm thuần trong `src/lib/`, kiểm bằng `scripts/check-scoring.ts` (assert, chạy bằng `npx tsx`). UI mới là component trong `src/components/worker/` và `src/components/hr/`, ghép vào các trang có sẵn. Không thêm dependency.

**Tech Stack:** Next.js 15.5, React 19, Tailwind 4, GSAP 3.15 (useGSAP, Flip), zustand persist, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-11-14-m4-ui-improvement-design.md`

## Global Constraints

- Branch làm việc: `feat/ui-bento-card` tách từ `main`. **Không sửa** `src/app/worker/page.tsx` (màn đăng nhập) và `src/components/worker/Shell.tsx`: hai file này thuộc branch `feat/zalo-oa-flow`. Cần sửa thì báo teammate trước.
- Màu chính giữ Bold Blue `#1B22A7` / Light Blue `#4260E6`; màu phụ chỉ cho trạng thái.
- Trên mỗi thẻ việc, **lương thực nhận/tháng** luôn là con số to nhất màn, luôn là *thực nhận* (`takeHome(job, relocate).net`), không phải lương gộp.
- Mỗi thẻ việc có đủ, theo thứ tự nổi bật: lương thực nhận, `Bắt đầu sớm nhất: dd/mm/yyyy`, ca, thành phố + phút đi, nhãn hợp đồng (nếu có).
- Số LED (`.led`) chỉ dùng cho số tiền cỡ chữ ≥ 32px. Nhỏ hơn dùng `.mono`.
- Ngày bắt đầu luôn kèm chữ **"dự kiến"**, không bao giờ là lời hứa.
- Dữ liệu "người Việt đang làm ở đây" là dữ liệu demo; người hiện nút "Hỏi" phải là người đã tự nguyện (`askable: true`). Không có chức năng đọc danh bạ/bạn Zalo.
- Nội dung không được ẩn chờ animation; `prefers-reduced-motion` và `data-motion="off"` tắt hết chuyển động.
- Câu chữ: tiếng Việt, xưng "bạn", câu ngắn, giữ giọng hiện tại của prototype.
- Không deploy Vercel khi chưa hỏi trưởng nhóm. Không commit `.env*`.
- Khung kiểm: 390px (thợ) và 1280px (HR + thợ desktop), sáng và tối.

## Review Focus

1. **Hồ sơ chưa xong (`profile` null) hoặc thợ không phải SSW** (visa `resident`): `earliestStart` không được cộng 52 ngày cho người không cần đổi tư cách. Test ở Task 2.
2. **Lộ danh tính người hỏi Senpai trước khi nhận việc** (tên, ảnh, công ty hiện tại lọt vào luồng hỏi): không được xảy ra; chỉ `acceptOffer` mới mở. Test ở Task 5B.
3. **Duyệt theo đợt với ứng viên trượt cổng visa hoặc đã quyết rồi**: không được duyệt họ. Test ở Task 7.
4. **Senpai làm ở chính công ty hiện tại của người hỏi**: không được ghép (họ có thể nhận ra người hỏi). Test ở Task 5B. (Việc không có `PEERS` và `availableInDays` lớn vẫn được kiểm ở Task 2 và Task 4.)
5. **Tab ẩn / rAF dừng khi demo** (GSAP không chạy): nội dung vẫn hiện. Kiểm ở Task 1.

---

### Task 1: Nền DS — Be Vietnam Pro, số LED, reveal không ẩn nội dung

**Files:**
- Modify: `src/app/layout.tsx` (font import)
- Modify: `src/app/globals.css:72` (`--font-sans`), thêm `@utility led`
- Modify: `src/styles/zen-tokens.css:30` (`--font-sans`)
- Modify: `src/lib/motion.ts:14-25` (`useReveal`)

**Interfaces:**
- Produces: CSS utility `led` (dùng trên phần tử chứa số tiền); biến `--font-bevn` cho font sans.

- [ ] **Step 1:** Trong `layout.tsx` thay `Inter` bằng `Be_Vietnam_Pro({ variable: "--font-bevn", subsets: ["latin", "vietnamese"], weight: ["400","500","600","700","800"], display: "swap" })`; gắn `bevn.variable` vào `<html>` thay cho `inter.variable`.
- [ ] **Step 2:** Ở cả hai file CSS, `--font-sans` bắt đầu bằng `var(--font-bevn), "Be Vietnam Pro",` rồi giữ phần fallback hiện có (bỏ `var(--font-inter), "Inter"`).
- [ ] **Step 3:** Thêm vào `globals.css`:
  ```css
  @utility led {
    font-family: var(--font-mono); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
    -webkit-mask-image: radial-gradient(circle at center, #000 62%, transparent 66%);
    mask-image: radial-gradient(circle at center, #000 62%, transparent 66%);
    -webkit-mask-size: 3px 3px; mask-size: 3px 3px;
  }
  @media (forced-colors: active) { .led { -webkit-mask-image: none; mask-image: none; } }
  ```
- [ ] **Step 4:** Trong `useReveal`: nếu `document.visibilityState !== "visible"` hoặc `matchMedia("(prefers-reduced-motion: reduce)").matches` hoặc `document.documentElement.dataset.motion === "off"` thì return không tween. Thêm lưới an toàn: `const t = setTimeout(() => gsap.set(els, { clearProps: "opacity,visibility,transform" }), 1500)` và clear trong cleanup.
- [ ] **Step 5:** Chạy `npx tsc --noEmit` → không lỗi. Chạy `npm run dev`, mở `/worker/jobs` ở 390px: chữ tiếng Việt hiển thị Be Vietnam Pro (DevTools → Computed font). Chuyển sang tab khác 3 giây rồi quay lại khi trang đang load: nội dung không trống.
- [ ] **Step 6:** Commit `feat(ds): Be Vietnam Pro, LED money utility, reveal never hides content`.

---

### Task 2: Dữ liệu và logic — ngày bắt đầu, hợp đồng 3 tháng, người Việt ở đây, kế hoạch 300

**Files:**
- Create: `src/lib/start.ts`
- Modify: `src/lib/data.ts` (type `Job`, type `Profile`, job `mikawa-cnc`, `DEMO_PROFILE`, thêm `PEERS`, `HIRE_PLAN`)
- Test: `scripts/check-scoring.ts` (thêm assert cuối file)

**Interfaces:**
- Produces:
  - `Job` thêm `contractMonths?: number; renewable?: boolean; verified: boolean`.
  - `Profile` thêm `province: string; currentCompany?: string` (`DEMO_PROFILE`: `province: "Nghệ An", currentCompany: "Kariya Parts"`; helper `P()` mặc định `province: "Hà Tĩnh"`; onboarding `EMPTY` có `province: ""`).
  - `type Peer = { id: string; name: string; years: number; quote: string; rating: number; askable: boolean; province: string; attendanceVerified: boolean }`
  - `PEERS: Record<string, { count: number; peers: Peer[] }>` (key = `job.id`)
  - `HIRE_PLAN: { jobId: string; target: number; days: number; filledByDay: number[]; today: number }`
  - `STATUS_CHANGE_DAYS = 45`, `DOC_PREP_DAYS = 7`
  - `earliestStart(p: Profile, from: number): { date: Date; statusChange: boolean; reason: string }`
  - `fmtDate(d: Date): string` → `"dd/mm/yyyy"`
  - `type PathStep = { key: "approve" | "docs" | "file" | "review" | "card" | "day1"; label: string; at: Date; legal: boolean; note: string }`
  - `legalPath(p: Profile, from: number): PathStep[]` — cần chuyển đổi (SSW): 6 bước `approve`, `docs` (+7), `file` (+7), `review` (+52, note ghi "thường 41–64 ngày"), `card` (+52), `day1` (= `earliestStart`); không cần chuyển đổi: 2 bước `approve`, `day1`. `legal: true` cho `file`, `review`, `card`. Bước cuối luôn bằng `earliestStart(p, from).date`.

- [ ] **Step 1: Viết assert (sẽ fail)** ở cuối `scripts/check-scoring.ts`:
  ```ts
  import { earliestStart, fmtDate, legalPath } from "../src/lib/start";
  import { PEERS, HIRE_PLAN } from "../src/lib/data";
  const hrDay = Date.parse("2026-11-16T09:00:00+09:00");
  assert.equal(fmtDate(earliestStart(p, hrDay).date), "07/01/2027", "SSW job change = HR day + 7 + 45");
  assert.equal(earliestStart(p, hrDay).statusChange, true);
  const res = { ...p, visa: "resident" as const, availableInDays: 14 };
  assert.equal(fmtDate(earliestStart(res, hrDay).date), "30/11/2026", "residents need no status change");
  assert.equal(fmtDate(earliestStart({ ...p, availableInDays: 60 }, hrDay).date), "15/01/2027", "later of review and own availability");
  assert.match(earliestStart(p, hrDay).reason, /chuyển đổi tư cách lưu trú/);
  assert.equal(jobById("mikawa-cnc")!.headcount, 300);
  assert.equal(jobById("mikawa-cnc")!.contractMonths, 3);
  assert.ok(JOBS.every((j) => typeof j.verified === "boolean"));
  assert.ok(PEERS["mikawa-cnc"].peers.some((x) => x.askable), "key job has a volunteer to ask");
  const path = legalPath(p, hrDay);
  assert.deepEqual(path.map((x) => x.key), ["approve", "docs", "file", "review", "card", "day1"]);
  assert.equal(fmtDate(path.at(-1)!.at), fmtDate(earliestStart(p, hrDay).date), "flight-path ends on the start date");
  assert.deepEqual(legalPath(res, hrDay).map((x) => x.key), ["approve", "day1"]);
  assert.ok(!path.some((x) => /đảm bảo|guarantee/i.test(x.label + x.note)), "never promise a date");
  assert.ok(PEERS["mikawa-cnc"].peers.every((x) => x.attendanceVerified || !x.askable), "only attendance-verified peers are askable");
  assert.equal(HIRE_PLAN.jobId, "mikawa-cnc"); assert.equal(HIRE_PLAN.target, 300); assert.equal(HIRE_PLAN.filledByDay.length, HIRE_PLAN.days);
  ```
- [ ] **Step 2:** Chạy `npx tsx scripts/check-scoring.ts` → FAIL (module `start` chưa có).
- [ ] **Step 3: Viết `src/lib/start.ts`.** Đổi công ty cần xin chuyển đổi khi `p.visa` là `ssw1_mfg | ssw2_mfg | ssw1_food`. Khi đó mốc = `from + (DOC_PREP_DAYS + STATUS_CHANGE_DAYS) ngày`; ngược lại mốc = `from`. Kết quả = muộn hơn giữa mốc và `from + p.availableInDays ngày`. Tính theo ngày lịch giờ Nhật (`Asia/Tokyo`). `reason` khi `statusChange`: `"Đổi công ty cần xin chuyển đổi tư cách lưu trú, thường mất khoảng 6–9 tuần. Mùa cao điểm tháng 3–4 có thể lâu hơn."`; ngược lại: `"Tư cách lưu trú của bạn không cần xin chuyển đổi."`
- [ ] **Step 4: Sửa `data.ts`:** thêm 3 trường vào `Job`; `mikawa-cnc`: `headcount: 300, contractMonths: 3, renewable: true`; mọi job `verified: true` trừ một job không phải khách chính (`verified: false`, để có trạng thái "Đang xác minh"). Thêm `PEERS` cho ít nhất `mikawa-cnc` (count 12, 3 người, trong đó `{ id: "pe1", name: "Đặng Văn Hùng", years: 2, quote: "Tăng ca đúng mô tả, ký túc xá sạch.", rating: 4.6, askable: true, province: "Nghệ An", attendanceVerified: true }`; một người `askable: false`; tên không trùng `SEED_CANDIDATES`) và `okazaki-nc`; các job khác để trống. Thêm `HIRE_PLAN = { jobId: KEY_JOB_ID, target: 300, days: 7, filledByDay: [38, 41, 35, 44, 0, 0, 0], today: 3 }` (ngày 0-based; demo đang ở ngày 4/7). Comment đầu `PEERS` và `HIRE_PLAN`: `// Demo data — mô phỏng, không phải số liệu thật.`
- [ ] **Step 5:** `npx tsx scripts/check-scoring.ts` → in bảng điểm, không assert nào fail. `npx tsc --noEmit` → sạch (sửa chỗ nào `Job` literal thiếu `verified`).
- [ ] **Step 6:** Commit `feat(data): earliest start, legal path, 3-month trial, peers, 300-hire plan`.

---

### Task 3: Thẻ việc (pass) — `JobPass`

**Files:**
- Create: `src/components/worker/Pass.tsx`

**Interfaces:**
- Consumes: `takeHome`, `yen` (pay.ts); `earliestStart`, `fmtDate` (start.ts); `PEERS`, `CITIES`, `Job`, `Profile` (data.ts); `Match`, `Fit` (scoring.ts); `FitBadge`, `Icon` (ui.tsx).
- Produces: `JobPass({ job, p, m, fit, now, applied, active }: { job: Job; p: Profile; m: Match; fit: Fit; now: number; applied?: boolean; active?: boolean }): JSX.Element` — toàn thẻ là một `<Link href={/worker/jobs/${job.id}}>`.

- [ ] **Step 1:** Dựng thẻ theo `#m-top1-home .pass` trong `.superpowers/brainstorm/591-1794666072/content/final-round-v8.html`. Thứ tự từ trên: tên công ty + huy hiệu (`ViệcNhanh đã xác minh` nếu `job.verified`, ngược lại `Đang xác minh`), tiêu đề việc, **lương thực nhận** `yen(takeHome(job, p.relocate).net)` với class `led` cỡ ≥ 40px + nhãn nhỏ "thực nhận/tháng", hàng `Bắt đầu sớm nhất: {fmtDate(earliestStart(p, now + 864e5).date)} · dự kiến`, hàng ca + thành phố, nhãn `Thử việc {contractMonths} tháng · có thể gia hạn` khi có, dòng người `{PEERS[job.id].count} người Việt đang làm ở đây` khi có, `FitBadge` ở góc.
- [ ] **Step 2:** `aria-label` của Link đọc được: `"{title}, {company}, thực nhận {yen} mỗi tháng, bắt đầu sớm nhất {date}"`. Số LED có `aria-hidden` và một bản `sr-only` bình thường.
- [ ] **Step 3:** `npx tsc --noEmit` → sạch.
- [ ] **Step 4:** Commit `feat(worker): JobPass card`.

---

### Task 4: Trang chủ thợ — băng thẻ vuốt + bento

**Files:**
- Create: `src/components/worker/Bento.tsx`
- Modify: `src/app/worker/jobs/layout.tsx:26-118` (`JobList`)

**Interfaces:**
- Consumes: `JobPass` (Task 3); `PEERS` (Task 2); `matchChips`, `fitOf` (scoring.ts); `deadlineOf`, `simNow`, `fmtLeft` (store.ts); `Avatar`, `ScoreRing`, `MatchChips` (ui.tsx).
- Produces: `Bento({ job, p, m, chips, app }: { job: Job; p: Profile; m: Match; chips: Chip[]; app?: Application })` gồm các ô `PeersTile`, `FitTile`, `DeadlineTile`, `PathTile`, `AskTile` (không export riêng).

- [ ] **Step 1: Băng thẻ.** Thay lưới `JobCard` trong `JobList` bằng hàng ngang `overflow-x-auto snap-x snap-mandatory` chứa `JobPass` (mỗi thẻ `snap-center`, rộng ~86% khung), chấm phân trang bên dưới cập nhật theo `IntersectionObserver`. Giữ bộ lọc "Tất cả / Rất phù hợp", khối "việc đã ẩn vì visa" và trạng thái rỗng như cũ. Khi có `?rescored=<id>`, cuộn thẻ đó vào giữa và giữ highlight (bỏ Flip reorder).
- [ ] **Step 2: Bento** cho thẻ đang ở giữa, lưới 2 cột:
  - `PeersTile` (2 cột, luôn đầu): 3 avatar, câu xác nhận của người đầu, `★ rating`, nút `Hỏi Senpai cùng quê · ẩn danh` khi có người `askable` (bấm → mở `SenpaiSheet` của Task 5B; nếu 5B chưa xong thì ẩn nút). Không có dữ liệu → "Chưa có người Việt nào làm ở đây. Bạn có thể là người đầu tiên." + link "Xem việc có người Việt".
  - `FitTile`: `MatchChips` từ `matchChips`.
  - `DeadlineTile`: chỉ khi `app` tồn tại và chưa đóng — vòng `ScoreRing` theo thời gian còn lại, nhãn `fmtLeft`.
  - `PathTile`: chỉ khi `fitOf(m, config.threshold) !== "great"` — "Còn {n} bước để rất phù hợp", link `/worker/improve?job=`.
  - `AskTile`: link `/worker/ask` (Task 9). Nếu Task 9 chưa làm, ẩn ô này.
- [ ] **Step 3:** Desktop (≥1024px) cột trái giữ băng thẻ + bento; cột phải giữ chi tiết việc như hiện tại.
- [ ] **Step 4:** `npx tsc --noEmit` sạch. `npm run dev`, kiểm 390px: không cuộn ngang toàn trang, vuốt đổi thẻ thì bento đổi theo, lương LED là số to nhất màn; kiểm thẻ của việc không có `PEERS`. Kiểm 1280px.
- [ ] **Step 5:** Commit `feat(worker): bento + pass home`.

---

### Task 5: Chi tiết việc + sheet xác minh theo tầng

**Files:**
- Modify: `src/app/worker/jobs/[id]/page.tsx` (khối facts `:96-118`, nút `:119-133`, `ApplySheet` `:151-215`, copy `:190`, `:212`)

**Interfaces:**
- Consumes: `earliestStart`, `fmtDate` (Task 2); `PEERS` (Task 2); `Scanner` (`components/worker/Scanner.tsx`), `useApp().scanned / setScanned`.

- [ ] **Step 1: Facts.** Thêm `Fact` "Bắt đầu sớm nhất" = `{fmtDate} · dự kiến` + dòng phụ `reason`; dưới đó `"Trong lúc chờ: vẫn làm ở chỗ cũ nếu còn hợp đồng · ứng lương theo ngày công vẫn dùng được"`. Thêm `Fact` hợp đồng khi `contractMonths`: `"Thử việc {n} tháng · có thể gia hạn"` + dòng phụ `"Nếu không gia hạn, ViệcNhanh xếp việc tiếp trong 24h."`. Thêm section "Người Việt đang làm ở đây" dùng lại nội dung `PeersTile` (import từ `Bento.tsx` — export thêm `PeersTile` nếu cần).
- [ ] **Step 2: Nút (mentor #5).** Khi `can` (rất phù hợp): chỉ một nút chính `Ứng tuyển`. Khi chưa đủ: nút chính `Cập nhật kinh nghiệm` → `/worker/improve?job=`, nút phụ `Vẫn ứng tuyển ngay`. Giữ trường hợp trượt visa.
- [ ] **Step 3: Xác minh theo tầng.** Trong `ApplySheet`, nếu `!scanned`: bước đầu hiện tiêu đề `"Xem việc không cần giấy tờ · Ứng tuyển cần thẻ cư trú"`, 1 dòng lý do `"Nhà máy chỉ được nhận người có tư cách lưu trú đúng ngành. Chụp 1 lần, dùng cho mọi đơn."`, `Scanner`; xong → `setScanned(true)` rồi sang bước câu hỏi như cũ. Đã `scanned` thì bỏ qua bước này.
- [ ] **Step 4: Copy (mentor #7).** Thay câu ở `:190` và `:212` bằng `"Nếu HR chưa trả lời trong {deadlineH} giờ, bạn được gợi ý ngay 3 việc khác."` + nút `Xem 3 việc khác` → `/worker/jobs?filter=ok`.
- [ ] **Step 5:** `npx tsc --noEmit` sạch. Kiểm luồng: reset demo (DemoPanel) → đăng nhập SĐT → mở `mikawa-cnc` → Ứng tuyển → thấy bước thẻ cư trú → chụp → câu hỏi → gửi.
- [ ] **Step 6:** Commit `feat(worker): job detail start date, contract, peers, tiered verification`.

---

### Task 5A: Lộ trình pháp lý · Legal Flight-Path

**Files:**
- Create: `src/components/worker/FlightPath.tsx`
- Modify: `src/app/worker/jobs/[id]/page.tsx` (Fact "Bắt đầu sớm nhất" của Task 5)
- Modify: `src/components/worker/Pass.tsx` (dòng ngày bắt đầu)

**Interfaces:**
- Consumes: `legalPath`, `fmtDate`, `PathStep` (Task 2); `takeHome`, `yen` (pay.ts); `Sheet` (ui.tsx).
- Produces: `FlightPath({ p, job, from, open, onClose }: { p: Profile; job: Job; from: number; open: boolean; onClose: () => void })`, hiển thị trong `Sheet`.

- [ ] **Step 1:** Thanh dọc các `PathStep`: chấm + đường nối, bước `legal` có icon khoá và nhãn nhỏ "Thủ tục bắt buộc", ngày từng bước theo `fmtDate`. Bước hiện tại (bước đầu khi chưa ứng tuyển) có vòng sáng, nhịp nhẹ bằng CSS animation, tắt khi `prefers-reduced-motion` hoặc `data-motion="off"`.
- [ ] **Step 2:** Chạm một bước → mở `note` ngay dưới bước đó (accordion, `aria-expanded`). Mỗi lúc chỉ mở một bước.
- [ ] **Step 3:** Chân sheet: trái `Ngày đầu đi làm · {fmtDate} · dự kiến`, phải lương thực nhận `.led` ≥ 32px + "thực nhận/tháng". Dòng nhỏ cố định: `"Các bước là bắt buộc · ngày là dự kiến"`.
- [ ] **Step 4:** Dòng ngày bắt đầu ở `JobPass` và Fact ở chi tiết việc thành nút mở `FlightPath` (trên `JobPass` gọi `e.preventDefault()` để không điều hướng Link).
- [ ] **Step 5:** `npx tsc --noEmit` sạch. Kiểm 390px: hồ sơ demo (SSW) thấy 6 bước; đổi visa sang định cư trong onboarding thấy 2 bước.
- [ ] **Step 6:** Commit `feat(worker): legal flight-path start-date tracker`.

---

### Task 5B: Hỏi Senpai cùng quê · ẩn danh

**Files:**
- Create: `src/lib/senpai.ts`
- Create: `src/components/worker/SenpaiSheet.tsx`
- Modify: `src/lib/store.ts` (state `threads`, action `askSenpai`, `acceptOffer`; `Application.accepted?: boolean`)
- Modify: `src/components/worker/Bento.tsx` (`PeersTile` mở sheet), `src/app/worker/applications/page.tsx` (nút Nhận việc + thẻ mở hồ sơ)
- Test: `scripts/check-scoring.ts`

**Interfaces:**
- Consumes: `PEERS`, `Peer`, `Profile`, `jobById` (Task 2); `Application` (store.ts).
- Produces:
  - `SENPAI_QUESTIONS: string[]` = `["Tăng ca thật mỗi tháng bao nhiêu giờ?", "Ký túc xá thế nào?", "Sếp và người Nhật ở đó đối xử ra sao?", "Lương có trả đúng như mô tả không?"]`
  - `senpaiFor(p: Profile, jobId: string): Peer | null` — chỉ người `askable && attendanceVerified`; trả `null` nếu `jobById(jobId).company === p.currentCompany`; ưu tiên cùng `province`, rồi `years` lớn hơn.
  - `askerLabel(p: Profile, revealed: boolean): string` — chưa mở: `"Thợ ẩn danh · cùng quê {province}"` khi Senpai cùng tỉnh, ngược lại `"Thợ ẩn danh"`; đã mở: `p.name`. (Hàm nhận thêm tham số `sameProvince = true`.)
  - `isRevealed(apps: Application[], jobId: string): boolean` — có đơn `candidateId === "me"`, cùng `jobId`, `accepted === true`.
  - `type Thread = { id: string; jobId: string; peerId: string; questions: string[]; answers: string[]; at: number }`
  - store: `askSenpai(jobId: string, questions: string[]): string` (giữ tối đa 3 câu); `acceptOffer(appId: string): void` (chỉ có tác dụng khi `status === "approved"`).

- [ ] **Step 1: Assert (sẽ fail):**
  ```ts
  import { askerLabel, senpaiFor, isRevealed } from "../src/lib/senpai";
  assert.equal(senpaiFor(p, "mikawa-cnc")!.province, p.province, "same province first");
  assert.equal(senpaiFor({ ...p, currentCompany: jobById("mikawa-cnc")!.company }, "mikawa-cnc"), null, "never match a senpai at the asker's current company");
  assert.equal(askerLabel(p, false), "Thợ ẩn danh · cùng quê Nghệ An");
  assert.ok(!askerLabel(p, false).includes(p.name) && !askerLabel(p, false).includes(p.currentCompany!), "no identity leaks before accept");
  const offer = { id: "x", jobId: "mikawa-cnc", candidateId: "me", appliedAt: 0, status: "approved" as const };
  assert.equal(isRevealed([offer], "mikawa-cnc"), false, "approval alone does not reveal");
  assert.equal(isRevealed([{ ...offer, accepted: true }], "mikawa-cnc"), true);
  ```
- [ ] **Step 2:** Chạy `npx tsx scripts/check-scoring.ts` → FAIL. Viết `src/lib/senpai.ts` (kèm câu trả lời mẫu cho từng câu trong `SENPAI_QUESTIONS`: ngắn, thật, có cả điểm chưa tốt) → chạy lại → PASS.
- [ ] **Step 3: `SenpaiSheet`:**
  - Đầu sheet là thẻ Senpai: avatar, tên, `{years} năm ở đây`, `Cùng quê {province}`, huy hiệu `Đã xác minh chấm công`.
  - Chip `SENPAI_QUESTIONS` + 1 ô tự viết, đếm `x/3`, khoá lựa chọn thứ 4.
  - Dòng "Bạn hiện là: {askerLabel(p, false)}" kèm icon ẩn danh.
  - Dòng minh bạch `"Senpai được thưởng giới thiệu khi bạn nhận việc. Câu trả lời là ý kiến cá nhân."`
  - Nút `Gửi ẩn danh` → `askSenpai` → sau 2 giây hiện câu trả lời mẫu.
- [ ] **Step 4: Nhận việc.** Ở `applications/page.tsx`, đơn `approved` có nút chính `Nhận việc` → `acceptOffer` → toast `"Đã nhận việc · Zalo OA đã mở hồ sơ hai bên với {senpai}"`, và trong đơn hiện thẻ "Senpai {tên} sẽ đón bạn ngày đầu". Trước bước này, luồng hỏi luôn hiện `askerLabel(p, false)`.
- [ ] **Step 5:** `npx tsc --noEmit` sạch. Kiểm luồng: thẻ `mikawa-cnc` → Hỏi Senpai → chọn 3 câu → gửi → thấy trả lời; HR duyệt (DemoPanel) → Nhận việc → thấy thẻ mở hồ sơ.
- [ ] **Step 6:** Commit `feat(worker): anonymous hometown senpai Q&A, reveal on offer accept`.

---

### Task 6: Onboarding và hồ sơ — đóng mentor #1–#4, #6

**Files:**
- Modify: `src/app/worker/onboarding/page.tsx` (`EMPTY :11`, `titles :37`, ảnh thẻ, JLPT `:185`, thành phố `:206`, chứng chỉ, `?edit`)
- Modify: `src/app/worker/profile/page.tsx`
- Modify: `src/components/ui.tsx:90-108` (`Segmented`, chỉ phần style trạng thái)

**Interfaces:**
- Produces: route `/worker/onboarding?edit=1&step={0|1|2}` mở thẳng bước đó, Lưu quay về `/worker/profile`.

- [ ] **Step 0:** Bước visa thêm ô `Quê ở tỉnh nào?` (Picker 63 tỉnh, bắt buộc, dùng để ghép Senpai) và ô không bắt buộc `Đang làm ở công ty nào?` kèm dòng `"Chỉ để không ghép bạn với người cùng công ty. Không ai thấy thông tin này."`
- [ ] **Step 1 (#2):** Bản nháp onboarding dùng `type Draft = Omit<Profile, "jlpt" | "city"> & { jlpt: number | null; city: CityId | "" }`; `EMPTY` có `jlpt: null, city: ""`. Nút Tiếp bị khoá đến khi chọn cả hai; chuyển `Draft → Profile` khi lưu.
- [ ] **Step 2 (#3):** `titles[2] = "Bạn đi làm được từ ngày nào, ở thành phố nào?"`.
- [ ] **Step 3 (#1, feedback 4):** Nhãn chứng chỉ `"Không bắt buộc · tăng mức phù hợp đến +{gain}%"`, `gain` = `suggestImprovements` lớn nhất cho chứng chỉ trên việc khách chính (làm tròn). Ô tải có 3 trạng thái hiển thị: đang tải (spinner + tên file), thành công (✓ + "Đã thêm · AI chấm lại"), lỗi (đỏ + "Thử lại"). Ảnh thẻ cư trú ở bước visa đổi thành **không bắt buộc** với dòng "Bạn có thể chụp sau, khi ứng tuyển".
- [ ] **Step 4 (#4):** Trang hồ sơ: mỗi nhóm (Visa, Kỹ năng & chứng chỉ, Ngày & nơi) có nút Sửa riêng → `?edit=1&step=N`. Lưu → `setProfile` → điểm chấm lại ngay; chứng chỉ mới phải hiện trên hồ sơ và trên chip `FitTile`.
- [ ] **Step 4b:** Hồ sơ hiện huy hiệu 3 trạng thái cho Visa / Thẻ cư trú / Chứng chỉ: `Đã xác minh` (visa sau khi `scanned`), `Đang xác minh` (chứng chỉ vừa thêm), `Chưa có`.
- [ ] **Step 5 (#6):** `Segmented`: trạng thái chưa chọn có viền `--color-border` rõ và chữ màu nội dung chính (không xám nhạt); trạng thái chọn có nền accent. Kiểm câu hỏi thêm trong `ApplySheet` không còn trông như bị tắt.
- [ ] **Step 6:** `npx tsc --noEmit` sạch; `npx tsx scripts/check-scoring.ts` vẫn pass. Chạy lại onboarding từ đầu: không có giá trị chọn sẵn cho JLPT/thành phố.
- [ ] **Step 7:** Commit `fix(worker): mentor M3 onboarding and profile issues`.

---

### Task 7: HR — tiến độ 0/300, duyệt theo đợt, 3 chỉ số

**Files:**
- Create: `src/lib/hire.ts`
- Create: `src/components/hr/HirePlan.tsx`
- Modify: `src/app/hr/page.tsx` (header `:40`, KPI `:47-50`, bảng ứng viên `:60-130`)
- Modify: `src/lib/store.ts` (thêm action `decideMany`)
- Modify: `src/lib/hr-i18n.ts` (chuỗi EN + JA mới)
- Test: `scripts/check-scoring.ts`

**Interfaces:**
- Consumes: `HIRE_PLAN` (Task 2), `scoreMatch`, `fitOf`, `profileOf`, `displayStatus`.
- Produces:
  - `batchEligible(rows: { appId: string; gatePass: boolean; fit: Fit; status: DisplayStatus }[]): string[]` — trả appId có `gatePass && fit === "great" && (status === "sent" || status === "viewed")`.
  - `hireProgress(plan: typeof HIRE_PLAN, approvedNow: number): { filled: number; target: number; pct: number; perDay: number[] }` — `filled = sum(filledByDay) + approvedNow`.
  - `needsBatch(pending: number, hoursLeft: number, perHourCapacity = 12): boolean` — `pending > hoursLeft * perHourCapacity`.
  - store: `decideMany(appIds: string[], interview: Application["interview"]): void` — gọi `decide(id, "approved", { interview })` cho từng id.

- [ ] **Step 1: Assert (sẽ fail):**
  ```ts
  import { batchEligible, hireProgress, needsBatch } from "../src/lib/hire";
  const rows = [
    { appId: "a", gatePass: true, fit: "great" as const, status: "sent" as const },
    { appId: "b", gatePass: false, fit: "great" as const, status: "sent" as const },
    { appId: "c", gatePass: true, fit: "possible" as const, status: "viewed" as const },
    { appId: "d", gatePass: true, fit: "great" as const, status: "approved" as const },
    { appId: "e", gatePass: true, fit: "great" as const, status: "expired" as const },
  ];
  assert.deepEqual(batchEligible(rows), ["a"], "batch never approves gate-failed, weaker or decided candidates");
  assert.equal(hireProgress(HIRE_PLAN, 2).filled, 160);
  assert.equal(hireProgress(HIRE_PLAN, 2).pct, 53);
  assert.equal(needsBatch(300, 20), true); assert.equal(needsBatch(10, 20), false);
  ```
- [ ] **Step 2:** Chạy check → FAIL.
- [ ] **Step 3:** Viết `src/lib/hire.ts` (`pct` làm tròn `Math.round`), thêm `decideMany` vào store.
- [ ] **Step 4:** Chạy check → PASS.
- [ ] **Step 5: UI HR.**
  - Header: `HirePlan` — `Tuần 1 · {filled} / 300` (JA: `1週目 · {filled} / 300名`), thanh tiến độ, 7 cột nhỏ theo ngày (hôm nay đánh dấu), nhãn hợp đồng `3-month trial` / `3か月試用`.
  - Bảng: checkbox mỗi hàng, chỉ bật cho id trong `batchEligible`; thanh hành động dính đáy khi có chọn: `Invite {n} to group interview` / `{n}名をグループ面接に招待` + chọn 1 trong `INTERVIEW_SLOTS` → `decideMany` → toast.
  - Banner khi `needsBatch(pending, hoursLeftOfOldest)`: `"Bật duyệt nhóm để kịp 24h"` (EN/JA tương ứng) + nút chọn tất cả hàng đủ điều kiện.
  - KPI thay 4 ô hiện có bằng: Chờ quyết (giữ), Sắp quá hạn (giữ), **Time-to-decision** (trung vị giờ từ `appliedAt` → `decidedAt` của đơn đã quyết), **Fill rate** (`pct`%), **30-day retention** `91%` có nhãn `simulated / 試算`.
- [ ] **Step 6:** `npx tsc --noEmit` sạch. Kiểm `/hr` 1280px cả EN và JA: chọn 2 ứng viên → mời nhóm → hai hàng chuyển Approved, `filled` tăng 2; ứng viên trượt visa không có checkbox.
- [ ] **Step 7:** Commit `feat(hr): 300-hire plan, batch interview invite, business KPIs`.

---

### Task 8: Đơn đã gửi, ví ứng lương — ngoại lệ và "khi một bên lỗi"

**Files:**
- Modify: `src/app/worker/applications/page.tsx` (`:84`, `:99`, dòng thời gian `:105-120`)
- Modify: `src/app/worker/wallet/page.tsx`
- Modify: `src/lib/store.ts` (`Config.ewaDown: boolean`, mặc định `false`)
- Modify: `src/components/DemoPanel.tsx` (công tắc "Đối tác ứng lương lỗi")

- [ ] **Step 1:** `:84` dùng đúng câu mới của Task 5 Step 4 kèm nút `Xem 3 việc khác`. Ở trạng thái quá hạn (`:99`) hiện 3 `JobPass` thu nhỏ (3 việc `great` khác, chưa ứng tuyển) thay vì chỉ chữ.
- [ ] **Step 2:** Dòng thời gian thêm mốc `Bắt đầu đi làm · {fmtDate} (dự kiến)` sau Phỏng vấn; với việc có `contractMonths` thêm mốc `Tháng {contractMonths}: đánh giá gia hạn`.
- [ ] **Step 3:** Ví: khi `config.ewaDown`, nút rút bị khoá và banner `"Đối tác ứng lương đang tạm lỗi. Lương tháng của bạn vẫn trả đủ, đúng ngày. Ngày công đã ghi nhận không mất."` + `"Thử lại sau"`; khi tắt trở lại bình thường.
- [ ] **Step 4:** `npx tsc --noEmit` sạch. Kiểm: DemoPanel tua 25h → đơn quá hạn có 3 thẻ gợi ý bấm được; bật `ewaDown` → ví hiện banner.
- [ ] **Step 5:** Commit `feat(worker): expiry alternatives, start milestone, EWA partner failure state`.

---

### Task 9: Trợ lý AI hỏi–đáp (P1)

**Files:**
- Create: `src/app/worker/ask/page.tsx`
- Create: `src/lib/ask.ts`

**Interfaces:**
- Produces: `ASK_SCRIPT: { q: string; a: string; cites: string[]; follow: string[] }[]` (cites = job id); `answer(q: string): (typeof ASK_SCRIPT)[number]` — khớp theo từ khoá đơn giản, không khớp thì trả mục "Mình chưa chắc, bạn hỏi lại cụ thể hơn…" với 3 gợi ý.

- [ ] **Step 1:** 4 kịch bản: "Việc nào có ký túc xá gần ga?", "Việc nào lương thực nhận trên ¥200k?", "Đổi công ty mất bao lâu mới đi làm được?" (trả lời dùng `earliestStart` cho hồ sơ hiện tại), "Có người Việt nào làm ở Mikawa không?" (cites `mikawa-cnc`, nhắc người `askable`). Trả lời có số trích dẫn `[1]` link tới `/worker/jobs/{id}`.
- [ ] **Step 2:** Trang: ô nhập + nút mic (chỉ hiển thị trạng thái "Đang nghe…" 1.5s rồi điền câu mẫu — không dùng Web Speech API), danh sách hỏi–đáp, chip gợi ý hỏi tiếp. Dùng `AIThinking` có sẵn khi "đang trả lời". Nhãn nhỏ cuối: "Trợ lý trả lời từ dữ liệu việc làm trong app. Bạn luôn là người quyết định."
- [ ] **Step 3:** Thêm assert: `assert.ok(answer("đổi công ty mất bao lâu").a.includes("dự kiến"))`; `assert.equal(answer("xyz").cites.length, 0)`. Chạy check → PASS. `tsc` sạch.
- [ ] **Step 4:** Commit `feat(worker): AI Q&A assistant with job citations`.

---

### Task 10: QC, Figma, bàn giao

**Files:** không sửa code trừ khi QC tìm ra lỗi.

- [ ] **Step 1:** Dừng dev server, chạy `npm run build` → build thành công, không cảnh báo hydration.
- [ ] **Step 2:** Kiểm 390px + 1280px, sáng + tối, các màn: trang chủ thẻ+bento, chi tiết `mikawa-cnc`, Lộ trình pháp lý (SSW 6 bước), sheet Hỏi Senpai (trước và sau Nhận việc), sheet xác minh, đơn đã gửi (đang chờ / quá hạn), ví (thường / `ewaDown`), onboarding, hồ sơ, `/hr` EN + JA, `/worker/ask`. Không cuộn ngang, không chữ bị cắt dấu, lương LED to nhất ở thẻ.
- [ ] **Step 3:** Merge `main` mới nhất (có thể đã có Zalo OA) vào `feat/ui-bento-card`, giải xung đột theo phân chia ở Global Constraints, chạy lại Step 1.
- [ ] **Step 4:** Đẩy từng màn ở Step 2 sang Figma (code → Figma), mỗi màn một frame 390 hoặc 1280, đặt tên `W01 Home · Bento + Thẻ`, `W02 Job detail`, …, `H01 HR · 0/300`. Gom trong page `M4 Final`.
- [ ] **Step 5:** Hỏi trưởng nhóm trước khi deploy Vercel. Mở PR `feat/ui-bento-card → main`.

---

## Thứ tự & chạy song song

Task 1 → 2 → 3 → 4 → 5 → 5A → 5B nối tiếp (phụ thuộc interface). Task 6 chỉ cần Task 1, chạy song song với 3–5 được (khác file). Task 7 cần Task 2. Task 8 cần Task 3 + 5, và làm sau 5B (cùng sửa `applications/page.tsx`). Task 9 cần Task 2. Nếu hết giờ: bỏ Task 9 trước, rồi phần ví ở Task 8; **không bỏ** Task 4, 5, 5A, 5B, 7.

**Cố ý không làm trong plan này** (P2 của spec, làm sau nếu còn giờ): chip kanji kèm nghĩa ở màn an toàn, công tắc `VI · やさしい日本語`, chế độ tối "ca đêm" riêng. Màn vào Zalo OA / Mini App thuộc branch `feat/zalo-oa-flow`.
