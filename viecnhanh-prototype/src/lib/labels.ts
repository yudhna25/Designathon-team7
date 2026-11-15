import type { DisplayStatus } from "./store";

export const STATUS_VI: Record<DisplayStatus, string> = {
  sent: "Đã gửi",
  viewed: "HR đang xem",
  approved: "Mời phỏng vấn",
  rejected: "Chưa phù hợp",
  expired: "Hết hạn 24h",
};

export const REJECT_REASONS: { id: string; vi: string; en: string; ja: string }[] = [
  { id: "skills", vi: "Kinh nghiệm chưa đủ cho vị trí này", en: "Not enough experience", ja: "経験不足" },
  { id: "filled", vi: "Vị trí đã đủ người", en: "Position filled", ja: "募集終了" },
  { id: "schedule", vi: "Ngày bắt đầu không khớp", en: "Start date mismatch", ja: "開始日が合わない" },
  { id: "other", vi: "Lý do khác, HR sẽ nhắn bạn", en: "Other", ja: "その他" },
];

export const STATUS_EN: Record<DisplayStatus, string> = {
  sent: "Applied",
  viewed: "HR reviewing",
  approved: "Interview invite",
  rejected: "Not selected",
  expired: "Expired (24h)",
};

export const CRITERIA_VI = { skills: "Kỹ năng & chứng chỉ", start: "Ngày bắt đầu", area: "Khu vực", jp: "Tiếng Nhật" } as const;
export const CRITERIA_EN = { skills: "Skills & certs", start: "Start date", area: "Area", jp: "Japanese" } as const;
export const CRITERIA_JA = { skills: "スキル・資格", start: "開始日", area: "勤務地", jp: "日本語" } as const;

export const SHIFT_VI = { day: "Ca ngày", rotating: "2 ca luân phiên", night: "Ca đêm" } as const;
export const SHIFT_EN = { day: "Day shift", rotating: "2 rotating shifts", night: "Night shift" } as const;
export const SHIFT_JA = { day: "日勤", rotating: "2交替", night: "夜勤" } as const;

export const STATUS_JA: Record<DisplayStatus, string> = {
  sent: "応募済み",
  viewed: "HR確認中",
  approved: "面接の案内",
  rejected: "今回は見送り",
  expired: "24時間で期限切れ",
};

type WLangLike = "vi" | "ja" | "en";
export const statusLabel = (st: DisplayStatus, lang: WLangLike) =>
  (lang === "ja" ? STATUS_JA : lang === "en" ? STATUS_EN : STATUS_VI)[st];
export const shiftLabel = (sh: keyof typeof SHIFT_VI, lang: WLangLike) =>
  (lang === "ja" ? SHIFT_JA : lang === "en" ? SHIFT_EN : SHIFT_VI)[sh];
export const criteriaLabel = (k: keyof typeof CRITERIA_VI, lang: WLangLike) =>
  (lang === "ja" ? CRITERIA_JA : lang === "en" ? CRITERIA_EN : CRITERIA_VI)[k];
