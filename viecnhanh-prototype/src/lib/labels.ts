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

export const CRITERIA_VI = { skills: "Kỹ năng & chứng chỉ", start: "Ngày bắt đầu", area: "Khu vực", jp: "Tiếng Nhật" } as const;
export const SHIFT_VI = { day: "Ca ngày", rotating: "2 ca luân phiên", night: "Ca đêm" } as const;
export const SHIFT_JA = { day: "日勤", rotating: "2交替", night: "夜勤" } as const;
export const STATUS_JA: Record<DisplayStatus, string> = {
  sent: "応募済み",
  viewed: "HR確認中",
  approved: "面接の案内",
  rejected: "今回は見送り",
  expired: "24時間で期限切れ",
};
