// Zalo OA (mô phỏng) — data DỰNG theo BRD "ViệcNhanh Aichi · Cửa vào Zalo OA" v1.0.
// Không dùng tên nhà máy thật (BR8). Số % là số dựng, không chạy engine chấm điểm.

// ---- Ngôn ngữ (VI mặc định, EN cho bản trình bày quốc tế) --------------------------
export type Lang = "vi" | "en";
let LANG: Lang = "vi";
/** Đặt ngôn ngữ hiện tại; màn /zalo-oa gọi ở mỗi lần render, khung chat dựng lại khi đổi. */
export const setOaLang = (l: Lang) => { LANG = l; };
export const getOaLang = () => LANG;
/** Chọn chữ theo ngôn ngữ đang bật. */
export const t = (vi: string, en: string) => (LANG === "en" ? en : vi);

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
type Admins = Record<"lead" | "deputy", { name: string; role: string }>;
export const GROUP_ADMINS: Admins = {
  lead: { name: "Chị Sato · HR", role: "Trưởng nhóm" },
  deputy: { name: "Anh Minh · Tổ trưởng ca ngày", role: "Phó nhóm" },
};
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
    { id: "g4", by: "lead", at: "10:12", up: 12, seen: 64, text: "Lịch phỏng vấn online: thứ Tư 18/11, 10:00. Bạn nào đã nộp hồ sơ sẽ nhận link riêng qua OA." },
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
    ask: "Câu 1/3 · Visa (tư cách lưu trú) và ngành của bạn là gì? Bạn xem dòng 在留資格 trên thẻ cư trú nếu chưa chắc.",
    chips: ["Kỹ năng đặc định · Sản xuất", "Kỹ năng đặc định · Thực phẩm", "Thực tập sinh kỹ năng"],
    retry: "Mình chưa nhận ra loại visa. Bạn chọn một ô bên dưới hoặc gõ ví dụ “kỹ năng đặc định sản xuất”.",
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
  interview: { job: "Hàn MIG · Nhà máy A", pay: 1350, from: "viewed", to: "interview", note: "Nhà máy đã duyệt hồ sơ. Lịch phỏng vấn: thứ Tư 18/11, 10:00 (online).", at: "14:30" },
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

// ---- Sự kiện: tham quan nhà máy (職場見学) và hội chợ việc làm ---------------------
export type OaEvent = {
  id: string; type: string; jp: string; title: string; host: string; place: string; km: number;
  /** badge = ngày ngắn trên cover ("Thứ 7 · 21/11"). */
  date: string; badge: string; time: string; start: string; end: string; scope: string; age: string; who: string; seats?: string; perks: string[];
};
export const EVENTS: OaEvent[] = [
  {
    id: "kengaku-d", type: "Tham quan nhà máy", jp: "職場見学", title: "Tham quan dây chuyền hàn · Nhà máy D", host: "Nhà máy D",
    place: "Toyota-shi", km: 4, date: "Thứ Bảy 21/11", badge: "Thứ 7 · 21/11", time: "9:30–12:00", start: "2026-11-21T09:30:00+09:00", end: "2026-11-21T12:00:00+09:00",
    scope: "Xem dây chuyền hàn MIG, gặp tổ trưởng người Việt, hỏi về lương và ký túc xá", age: "18–35 tuổi",
    who: "Visa Kỹ năng đặc định hoặc Thực tập sinh", seats: "Còn 12 chỗ", perks: ["Miễn phí", "Xe đưa đón từ ga Toyotashi", "Có phiên dịch"],
  },
  {
    id: "fair-nagoya", type: "Hội chợ việc làm", jp: "就職フェア", title: "Hội chợ việc làm cho người Việt tại Aichi", host: "ViệcNhanh Aichi",
    place: "Nagoya", km: 28, date: "Chủ nhật 29/11", badge: "Chủ nhật · 29/11", time: "10:00–16:00", start: "2026-11-29T10:00:00+09:00", end: "2026-11-29T16:00:00+09:00",
    scope: "25 nhà máy sản xuất, phỏng vấn tại chỗ, tư vấn đổi visa", age: "18–40 tuổi",
    who: "Người Việt đang sống ở Aichi", perks: ["Miễn phí", "Phỏng vấn tại chỗ", "Mang theo thẻ cư trú"],
  },
];

/** File lịch .ics cho nút "Quan tâm · thêm lịch" (nhắc trước 1 ngày). */
export function eventIcs(e: OaEvent) {
  const z = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ViecNhanh Aichi//Zalo OA demo//VI", "BEGIN:VEVENT",
    `UID:${e.id}@viecnhanh-demo`, `DTSTAMP:${z(new Date().toISOString())}`, `DTSTART:${z(e.start)}`, `DTEND:${z(e.end)}`,
    `SUMMARY:${e.title}`, `LOCATION:${e.place}, Aichi`, `DESCRIPTION:${e.type} (${e.jp}) · ${e.scope}`,
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${t("Nhắc lịch ViệcNhanh", "ViệcNhanh reminder")}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

/** Nhóm / thành viên mô phỏng cho side tab "Thông tin nhóm" (tên dựng). */
export type GroupMember = { name: string; note: string; admin?: "lead" | "deputy"; me?: boolean };
export const GROUP_MEMBERS: GroupMember[] = [
  { name: "Chị Sato · HR", note: "Trưởng cộng đồng", admin: "lead" },
  { name: "Anh Minh · Tổ trưởng", note: "Phó cộng đồng", admin: "deputy" },
  { name: "Chị Linh · Phiên dịch", note: "Phó cộng đồng", admin: "deputy" },
  { name: "Trần Văn Hùng", note: "Tham gia qua link cộng đồng" },
  { name: "Lê Thị Mai", note: "Thêm bởi Chị Sato · HR" },
  { name: "Phạm Đức Long", note: "Tham gia qua ViệcNhanh Aichi" },
  { name: "Nguyễn Thu Hà", note: "Tham gia qua link cộng đồng" },
  { name: "Đỗ Quang Vinh", note: "Thêm bởi Anh Minh · Tổ trưởng" },
  { name: "Bạn", note: "Tham gia qua ViệcNhanh Aichi", me: true },
];


// =====================================================================================
// English version (dữ liệu dựng, cùng số liệu với bản tiếng Việt)
// =====================================================================================
const enPay = (yenPerHour: number) => `¥${yenPerHour.toLocaleString("en-US")}/hr`;
const enMonthlyNum = (yenPerHour: number) => (Math.round((yenPerHour * 168) / 1000) * 1000).toLocaleString("en-US");
const enMonthly = (yenPerHour: number) => `≈ ¥${enMonthlyNum(yenPerHour)}/month`;
const enMonthlyYen = (yenPerHour: number) => `about ${enMonthlyNum(yenPerHour)} yen a month`;

const EN_ADMINS: Admins = {
  lead: { name: "Ms. Sato · HR", role: "Owner" },
  deputy: { name: "Mr. Minh · Day-shift lead", role: "Deputy" },
};
function enGroupPosts(job: string, factory: string, area: string, km: number, monthly: string, hourly: string): GroupPost[] {
  return [
    { id: "g1", by: "lead", at: "08:30", up: 24, seen: 96, text: `Welcome to the ${job} hiring group of ${factory}. This group is for announcements; for personal questions, please message the ViệcNhanh OA.` },
    { id: "g2", by: "lead", at: "08:31", up: 31, seen: 94, info: [
      { k: "Pay", v: `${monthly} (${hourly})` },
      { k: "Shift", v: "Day shift 8:00–17:00, Sat & Sun off" },
      { k: "Dormitory", v: "Yes, ¥25,000/month, 2 per room" },
      { k: "Location", v: `${area} · ${km} km from you` },
      { k: "Openings", v: "5 people, until Nov 30" },
    ] },
    { id: "g3", by: "deputy", at: "09:05", up: 18, seen: 81, text: "There are 6 Vietnamese workers on site. A Vietnamese interpreter will join the interview, so don't worry." },
    { id: "g4", by: "lead", at: "10:12", up: 12, seen: 64, text: "Online interview: Wednesday Nov 18, 10:00. Everyone who applied will get a private link through the OA." },
  ];
}

const EN_TOP3: OaJob[] = [
  { id: "a-mig", title: "MIG welding", factory: "Factory A", area: "Toyota-shi", fit: 91, pay: 1350, km: 4 },
  { id: "b-cnc", title: "CNC lathe", factory: "Factory B", area: "Okazaki", fit: 86, pay: 1400, km: 11 },
  { id: "c-asm", title: "Assembly", factory: "Factory C", area: "Anjo", fit: 84, pay: 1250, km: 15 },
];

const EN_QUESTIONS: typeof QUESTIONS = {
  q1: {
    ask: "Question 1/3 · What is your visa (status of residence) and field? If unsure, check the 在留資格 line on your residence card.",
    chips: ["Specified Skilled Worker · Manufacturing", "Specified Skilled Worker · Food", "Technical Intern"],
    retry: "I couldn't recognise the visa type. Pick one of the options below or type e.g. “specified skilled worker manufacturing”.",
  },
  q2: {
    ask: "Question 2/3 · What work can you do, and for how many years? Any certificates?",
    chips: ["CNC 3 years", "Welding 3 years", "Assembly 1 year", "Forklift · certified"],
    retry: "I need at least one skill to match you. For example: “CNC 3 years” or “welding 2 years”.",
  },
  q3: {
    ask: "Question 3/3 · When can you start, and which area would you like to work in?",
    chips: ["In 30 days · Toyota-shi", "Now · Okazaki", "In 2 weeks · Anjo"],
    retry: "Please tell me both the time and the area. For example: “in 2 weeks, Okazaki”.",
  },
};

/** Hiểu câu trả lời gõ tay bằng tiếng Anh (và cả tiếng Việt), trả về nhãn tiếng Anh. */
function enParseAnswer(q: QuestionId, raw: string): string | null {
  const t = norm(raw.trim());
  if (!t) return null;
  if (q === "q1") {
    if (/intern|trainee|thuc tap|tts|jisshu/.test(t)) return "Technical Intern";
    if (!/ssw|specified|skilled|tokutei|ky nang dac dinh/.test(t)) return null;
    return `Specified Skilled Worker · ${/food|thuc pham/.test(t) ? "Food" : "Manufacturing"}`;
  }
  if (q === "q2") return /cnc|weld|lathe|mill|assembl|forklift|paint|pack|inspect|han|tien|lap rap|xe nang|\d+\s*(years?|yrs?|nam)/.test(t) ? raw.trim() : null;
  const when = /now|today|week|month|day|ngay|tuan|thang|\d/.test(t);
  const area = AREAS.find((a) => t.includes(a));
  return when && area ? raw.trim() : null;
}

const EN_STATUS_LABEL: Record<StatusId, string> = {
  pending: "Pending",
  viewed: "Under review",
  interview: "Interview scheduled",
  rejected: "Not selected",
  expired: "Expired",
};

const EN_STATUS_UPDATES: typeof STATUS_UPDATES = {
  viewed: { job: "MIG welding · Factory A", pay: 1350, from: "pending", to: "viewed", note: "HR at Factory A is reviewing your profile. They commit to reply within 24h.", at: "09:12" },
  interview: { job: "MIG welding · Factory A", pay: 1350, from: "viewed", to: "interview", note: "The factory approved your profile. Interview: Wednesday Nov 18, 10:00 (online).", at: "14:30" },
  rejected: {
    job: "CNC lathe · Factory B", pay: 1400, from: "viewed", to: "rejected",
    note: "This position needs a forklift certificate, which your profile doesn't have yet.",
    upskill: "Get a forklift certificate (2 days, Toyota-shi) to unlock 6 more jobs with a fit of 85% or higher.",
    at: "16:05",
  },
  expired: {
    job: "Assembly · Factory C", pay: 1250, from: "pending", to: "expired",
    note: "The factory didn't reply within 24h, so the application closed automatically. Here are 3 other jobs that fit you:",
    alternatives: [
      { id: "d-mig", title: "MIG welding", factory: "Factory D", area: "Toyota-shi", fit: 91, pay: 1380, km: 4 },
      { id: "e-cnc", title: "CNC operator", factory: "Factory E", area: "Kariya", fit: 87, pay: 1420, km: 9 },
      { id: "f-qc", title: "Quality inspection", factory: "Factory F", area: "Anjo", fit: 80, pay: 1200, km: 15 },
    ],
    at: "08:00",
  },
};

const EN_RECOMMENDS: Recommend[] = [
  { job: "MIG welding · Factory D", area: "Toyota-shi", fit: 91, pay: 1380, km: 4, chips: [{ ok: true, label: "Right visa" }, { ok: true, label: "Welding 3 years" }, { ok: true, label: "4 km from home" }] },
  { job: "CNC operator · Factory E", area: "Kariya", fit: 88, pay: 1420, km: 9, chips: [{ ok: true, label: "Right visa" }, { ok: true, label: "CNC 3 years" }, { ok: false, label: "JLPT N3" }] },
  { job: "Metal stamping · Factory G", area: "Okazaki", fit: 86, pay: 1300, km: 11, chips: [{ ok: true, label: "Right visa" }, { ok: true, label: "Day shift" }] },
  { job: "Powder coating · Factory H", area: "Nishio", fit: 89, pay: 1330, km: 18, chips: [{ ok: true, label: "Right visa" }, { ok: true, label: "Dormitory" }] },
];
const EN_RECOMMEND_BELOW: Recommend = { job: "Assembly · Factory C", area: "Anjo", fit: 84, pay: 1250, km: 15, chips: [{ ok: true, label: "Right visa" }, { ok: false, label: "Forklift" }] };

const EN_EVENTS: OaEvent[] = [
  {
    id: "kengaku-d", type: "Factory visit", jp: "職場見学", title: "Welding line tour · Factory D", host: "Factory D",
    place: "Toyota-shi", km: 4, date: "Saturday, Nov 21", badge: "Sat · Nov 21", time: "9:30–12:00", start: "2026-11-21T09:30:00+09:00", end: "2026-11-21T12:00:00+09:00",
    scope: "See the MIG welding line, meet the Vietnamese team lead, ask about pay and the dormitory", age: "Age 18–35",
    who: "Specified Skilled Worker or Technical Intern visa", seats: "12 seats left", perks: ["Free", "Shuttle from Toyotashi station", "Interpreter"],
  },
  {
    id: "fair-nagoya", type: "Job fair", jp: "就職フェア", title: "Job fair for Vietnamese workers in Aichi", host: "ViệcNhanh Aichi",
    place: "Nagoya", km: 28, date: "Sunday, Nov 29", badge: "Sunday · Nov 29", time: "10:00–16:00", start: "2026-11-29T10:00:00+09:00", end: "2026-11-29T16:00:00+09:00",
    scope: "25 manufacturing companies, on-the-spot interviews, visa change advice", age: "Age 18–40",
    who: "Vietnamese people living in Aichi", perks: ["Free", "On-the-spot interviews", "Bring your residence card"],
  },
];

const EN_GROUP_MEMBERS: GroupMember[] = [
  { name: "Ms. Sato · HR", note: "Community owner", admin: "lead" },
  { name: "Mr. Minh · Team lead", note: "Community deputy", admin: "deputy" },
  { name: "Ms. Linh · Interpreter", note: "Community deputy", admin: "deputy" },
  { name: "Trần Văn Hùng", note: "Joined via community link" },
  { name: "Lê Thị Mai", note: "Added by Ms. Sato · HR" },
  { name: "Phạm Đức Long", note: "Joined via ViệcNhanh Aichi" },
  { name: "Nguyễn Thu Hà", note: "Joined via community link" },
  { name: "Đỗ Quang Vinh", note: "Added by Mr. Minh · Team lead" },
  { name: "You", note: "Joined via ViệcNhanh Aichi", me: true },
];

const EN_PROFILE: typeof profile = {
  ...profile,
  visa: "Specified Skilled Worker · Manufacturing",
  skills: ["CNC 3 years"],
  missing: ["Forklift certificate"],
  start: "In 30 days",
};

const VI_SET = {
  profile, top3, QUESTIONS, STATUS_LABEL, STATUS_UPDATES, RECOMMENDS, RECOMMEND_BELOW, EVENTS, GROUP_ADMINS, GROUP_MEMBERS,
  groupPosts, fmtPay, fmtMonthly, fmtMonthlyYen, parseAnswer,
};
const EN_SET: typeof VI_SET = {
  profile: EN_PROFILE, top3: EN_TOP3, QUESTIONS: EN_QUESTIONS, STATUS_LABEL: EN_STATUS_LABEL, STATUS_UPDATES: EN_STATUS_UPDATES,
  RECOMMENDS: EN_RECOMMENDS, RECOMMEND_BELOW: EN_RECOMMEND_BELOW, EVENTS: EN_EVENTS, GROUP_ADMINS: EN_ADMINS, GROUP_MEMBERS: EN_GROUP_MEMBERS,
  groupPosts: enGroupPosts, fmtPay: enPay, fmtMonthly: enMonthly, fmtMonthlyYen: enMonthlyYen, parseAnswer: enParseAnswer,
};
/** Bộ dữ liệu theo ngôn ngữ đang bật. */
export const D = () => (LANG === "en" ? EN_SET : VI_SET);
