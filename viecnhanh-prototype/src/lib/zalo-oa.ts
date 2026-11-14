// Zalo OA (mô phỏng) — data DỰNG theo BRD "ViệcNhanh Aichi · Cửa vào Zalo OA" v1.0.
// Không dùng tên nhà máy thật (BR8). Số % là số dựng, không chạy engine chấm điểm.

/** BR6: mọi widget mở link này ở tab mới. */
export const OA_WEB_URL = "https://team7designathon-viecnhanh.vercel.app/worker/analyzing";

/** BR4: chỉ gửi gợi ý qua Zalo khi mức phù hợp ≥ 85%. */
export const RECOMMEND_MIN = 85;
/** BR5: tối đa 3 widget gợi ý / tuần / người. */
export const RECOMMEND_WEEKLY_CAP = 3;

export type FitLevelId = "great" | "possible" | "not";
/** BR2: thang dùng chung với web. */
export const fitLevel = (n: number): FitLevelId => (n >= 85 ? "great" : n >= 60 ? "possible" : "not");
/** Nhãn hiển thị trên tin tuyển dụng (không hiện %). */
export const FIT_LABEL: Record<FitLevelId, string> = { great: "Rất phù hợp", possible: "Phù hợp", not: "Chưa phù hợp" };

// ---- Nhóm chat của việc ("Mở box chat"): chỉ trưởng nhóm / phó nhóm được nhắn ------
export type GroupPost = { id: string; by: "lead" | "deputy"; text?: string; info?: { k: string; v: string }[]; up: number; seen: number; at: string };
export const GROUP_ADMINS = {
  lead: { name: "Chị Sato · HR", role: "Trưởng nhóm" },
  deputy: { name: "Anh Minh · Tổ trưởng ca ngày", role: "Phó nhóm" },
} as const;
export function groupPosts(job: string, factory: string, area: string, km: number, monthly: string, hourly: string): GroupPost[] {
  return [
    { id: "g1", by: "lead", at: "08:30", up: 24, seen: 96, text: `Chào mừng các bạn đến nhóm tuyển ${job} của ${factory}. Nhóm dùng để thông báo, câu hỏi riêng vui lòng nhắn OA ViệcNhanh.` },
    { id: "g2", by: "lead", at: "08:31", up: 31, seen: 94, info: [
      { k: "Lương", v: `${monthly} (${hourly})` },
      { k: "Ca làm", v: "Ca ngày 8:00–17:00, nghỉ T7, CN" },
      { k: "Ký túc xá", v: "Có, 25.000 ¥/tháng, 2 người/phòng" },
      { k: "Địa điểm", v: `${area} · cách bạn ${km} km` },
      { k: "Cần tuyển", v: "5 người, nhận đến 30/11" },
    ] },
    { id: "g3", by: "deputy", at: "09:05", up: 18, seen: 81, text: "Xưởng hiện có 6 bạn người Việt. Hôm phỏng vấn có phiên dịch tiếng Việt, các bạn yên tâm nhé." },
    { id: "g4", by: "lead", at: "10:12", up: 12, seen: 64, text: "Lịch phỏng vấn online: thứ Ba 18/11, 10:00. Bạn nào đã nộp hồ sơ sẽ nhận link riêng qua OA." },
  ];
}

/** pay = lương giờ (¥, dữ liệu dựng); km = khoảng cách từ nơi ở của người lao động. */
export type OaJob = { id: string; title: string; factory: string; area: string; fit: number; pay: number; km: number };

/** "1.350 ¥/giờ" và ước tính tháng (8 giờ × 21 ngày). */
export const fmtPay = (yenPerHour: number) => `${yenPerHour.toLocaleString("vi-VN")} ¥/giờ`;
/** Lương tháng theo cách người lao động Việt hay nói: "man" (万 = 10.000 yên), 1 chữ số lẻ — "≈ 22,7 man/tháng". */
export const fmtMonthly = (yenPerHour: number) => `≈ ${((yenPerHour * 168) / 10000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} man/tháng`;
/** Bản đầy đủ bằng yên cho trình đọc màn hình. */
export const fmtMonthlyYen = (yenPerHour: number) => `khoảng ${(Math.round((yenPerHour * 168) / 1000) * 1000).toLocaleString("vi-VN")} yên mỗi tháng`;

export const profile = {
  name: "Nguyễn Tuấn Anh",
  /** 5 bước hồ sơ: visa · kỹ năng · chứng chỉ · tiếng Nhật · thời gian & khu vực. Chat 3 câu điền được 3. */
  steps: { done: 3, total: 5 },
  visa: "Kỹ năng đặc định · Sản xuất",
  skills: ["CNC 3 năm"],
  missing: ["Chứng chỉ xe nâng"],
  start: "Sau 30 ngày",
  area: "Toyota-shi",
  score: 82,
};

export const top3: OaJob[] = [
  { id: "a-mig", title: "Hàn MIG", factory: "Nhà máy A", area: "Toyota-shi", fit: 91, pay: 1350, km: 4 },
  { id: "b-cnc", title: "Tiện CNC", factory: "Nhà máy B", area: "Okazaki", fit: 86, pay: 1400, km: 11 },
  { id: "c-asm", title: "Lắp ráp", factory: "Nhà máy C", area: "Anjo", fit: 84, pay: 1250, km: 15 },
];

// ---- 3 câu hỏi (giống Onboarding web, BR2) ------------------------------------
export type QuestionId = "q1" | "q2" | "q3";
export const QUESTIONS: Record<QuestionId, { ask: string; chips: string[]; retry: string }> = {
  q1: {
    ask: "Câu 1/3 · Visa (tư cách lưu trú) của bạn là loại nào? Xem dòng 在留資格 trên thẻ cư trú. Không chắc thì cứ chụp thẻ, mình đọc giúp.",
    chips: ["Kỹ năng đặc định · Sản xuất", "Kỹ năng đặc định · Thực phẩm", "Thực tập sinh kỹ năng"],
    retry: "Mình chưa nhận ra loại visa. Bạn chọn một ô bên dưới, gõ ví dụ “kỹ năng đặc định sản xuất”, hoặc chụp thẻ cư trú để mình đọc.",
  },
  q2: {
    ask: "Câu 2/3 · Bạn làm được việc gì, bao nhiêu năm? Có chứng chỉ nào không?",
    chips: ["CNC 3 năm", "Hàn 3 năm", "Lắp ráp 1 năm", "Xe nâng · có chứng chỉ"],
    retry: "Mình cần biết ít nhất một kỹ năng để chấm điểm. Ví dụ: “CNC 3 năm” hoặc “hàn 2 năm”.",
  },
  q3: {
    ask: "Câu 3/3 · Khi nào bạn bắt đầu được, và muốn làm ở khu vực nào?",
    chips: ["Sau 30 ngày · Toyota-shi", "Ngay · Okazaki", "2 tuần · Anjo"],
    retry: "Bạn cho mình cả thời gian và khu vực nhé. Ví dụ: “sau 2 tuần, Okazaki”.",
  },
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
const AREAS = ["toyota", "okazaki", "anjo", "kariya", "nagoya", "chiryu", "toyohashi", "nishio", "komaki", "handa", "obu"];

/** Kiểm câu trả lời gõ tay. Trả về giá trị đã chuẩn hoá, hoặc null để bot hỏi lại đúng câu đó (AC2). */
export function parseAnswer(q: QuestionId, raw: string): string | null {
  const t = norm(raw.trim());
  if (!t) return null;
  if (q === "q1") {
    if (/thuc tap|tts|ginou ?jissu|jisshu/.test(t)) return "Thực tập sinh kỹ năng";
    if (!/ssw|ky nang dac dinh|tokutei|tokuteigino/.test(t)) return null;
    return `Kỹ năng đặc định · ${/thuc pham|food|an uong/.test(t) ? "Thực phẩm" : "Sản xuất"}`;
  }
  if (q === "q2") return /cnc|han|tien|phay|lap rap|xe nang|son|dong goi|kiem tra|\d+\s*nam/.test(t) ? raw.trim() : null;
  const when = /ngay|tuan|thang|\d/.test(t);
  const area = AREAS.find((a) => t.includes(a));
  return when && area ? raw.trim() : null;
}

// ---- B2 · Trạng thái đơn (BR7) -----------------------------------------------
export type StatusId = "pending" | "viewed" | "interview" | "rejected" | "expired";
export const STATUS_LABEL: Record<StatusId, string> = {
  pending: "Đang chờ",
  viewed: "Đang xem",
  interview: "Hẹn phỏng vấn",
  rejected: "Từ chối",
  expired: "Hết hạn",
};
export const STATUS_TONE: Record<StatusId, "neutral" | "positive" | "negative"> = {
  pending: "neutral",
  viewed: "neutral",
  interview: "positive",
  rejected: "negative",
  expired: "negative",
};

export type StatusUpdate = { job: string; pay: number; from: StatusId; to: StatusId; note: string; upskill?: string; alternatives?: OaJob[]; at: string };
export const STATUS_UPDATES: Record<Exclude<StatusId, "pending">, StatusUpdate> = {
  viewed: { job: "Hàn MIG · Nhà máy A", pay: 1350, from: "pending", to: "viewed", note: "HR Nhà máy A đang xem hồ sơ của bạn. Cam kết trả lời trong 24h.", at: "09:12" },
  interview: { job: "Hàn MIG · Nhà máy A", pay: 1350, from: "viewed", to: "interview", note: "Nhà máy đã duyệt hồ sơ. Lịch phỏng vấn: thứ Ba 18/11, 10:00 (online).", at: "14:30" },
  rejected: {
    job: "Tiện CNC · Nhà máy B",
    pay: 1400,
    from: "viewed",
    to: "rejected",
    note: "Vị trí cần chứng chỉ xe nâng, hồ sơ của bạn chưa có.",
    upskill: "Học chứng chỉ xe nâng (2 ngày, Toyota-shi) để mở thêm 6 việc có mức phù hợp ≥ 85%.",
    at: "16:05",
  },
  expired: {
    job: "Lắp ráp · Nhà máy C",
    pay: 1250,
    from: "pending",
    to: "expired",
    note: "Nhà máy chưa trả lời sau 24h nên đơn đã tự đóng. Đây là 3 việc khác hợp với bạn:",
    alternatives: [
      { id: "d-mig", title: "Hàn MIG", factory: "Nhà máy D", area: "Toyota-shi", fit: 91, pay: 1380, km: 4 },
      { id: "e-cnc", title: "Vận hành CNC", factory: "Nhà máy E", area: "Kariya", fit: 87, pay: 1420, km: 9 },
      { id: "f-qc", title: "Kiểm tra chất lượng", factory: "Nhà máy F", area: "Anjo", fit: 80, pay: 1200, km: 15 },
    ],
    at: "08:00",
  },
};

// ---- B2 · Gợi ý việc ≥ 85% (BR4, BR5) ---------------------------------------
export type Recommend = { job: string; area: string; fit: number; pay: number; km: number; chips: { ok: boolean; label: string }[] };
export const RECOMMENDS: Recommend[] = [
  { job: "Hàn MIG · Nhà máy D", area: "Toyota-shi", fit: 91, pay: 1380, km: 4, chips: [{ ok: true, label: "Đúng visa" }, { ok: true, label: "Hàn 3 năm" }, { ok: true, label: "Cách nhà 4 km" }] },
  { job: "Vận hành CNC · Nhà máy E", area: "Kariya", fit: 88, pay: 1420, km: 9, chips: [{ ok: true, label: "Đúng visa" }, { ok: true, label: "CNC 3 năm" }, { ok: false, label: "JLPT N3" }] },
  { job: "Dập kim loại · Nhà máy G", area: "Okazaki", fit: 86, pay: 1300, km: 11, chips: [{ ok: true, label: "Đúng visa" }, { ok: true, label: "Ca ngày" }] },
  { job: "Sơn tĩnh điện · Nhà máy H", area: "Nishio", fit: 89, pay: 1330, km: 18, chips: [{ ok: true, label: "Đúng visa" }, { ok: true, label: "Có ký túc xá" }] },
];
/** Bản thử AC4: cùng việc nhưng chỉ 84% → không được gửi qua Zalo. */
export const RECOMMEND_BELOW: Recommend = { job: "Lắp ráp · Nhà máy C", area: "Anjo", fit: 84, pay: 1250, km: 15, chips: [{ ok: true, label: "Đúng visa" }, { ok: false, label: "Xe nâng" }] };
