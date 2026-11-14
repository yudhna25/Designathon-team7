// Earliest legal start date and the immigration steps behind it.
// Durations: ISA statistics put SSW (i) change-of-status reviews at roughly 41–64 days; we use 45 + 7 days of paperwork.
// These are estimates — UI must always say "dự kiến", never promise a date.
import type { Profile } from "./data";

export const STATUS_CHANGE_DAYS = 45;
export const DOC_PREP_DAYS = 7;
const DAY = 864e5;

/** Visas whose holder must apply for a change of status (在留資格変更許可申請) to switch employer. */
const needsStatusChange = (p: Profile) => p.visa === "ssw1_mfg" || p.visa === "ssw2_mfg" || p.visa === "ssw1_food";

export function earliestStart(p: Profile, from: number): { date: Date; statusChange: boolean; reason: string } {
  const statusChange = needsStatusChange(p);
  const legal = from + (statusChange ? (DOC_PREP_DAYS + STATUS_CHANGE_DAYS) * DAY : 0);
  const own = from + p.availableInDays * DAY;
  return {
    date: new Date(Math.max(legal, own)),
    statusChange,
    reason: statusChange
      ? "Đổi công ty cần xin chuyển đổi tư cách lưu trú, thường mất khoảng 6–9 tuần. Mùa cao điểm tháng 3–4 có thể lâu hơn."
      : "Tư cách lưu trú của bạn không cần xin chuyển đổi.",
  };
}

/** dd/mm/yyyy in Japan time. */
export const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);

export type PathStep = { key: "approve" | "docs" | "file" | "review" | "card" | "day1"; label: string; at: Date; legal: boolean; note: string };

export function legalPath(p: Profile, from: number): PathStep[] {
  const start = earliestStart(p, from);
  const at = (days: number) => new Date(from + days * DAY);
  const approve: PathStep = { key: "approve", label: "HR duyệt hồ sơ", at: at(0), legal: false, note: "HR trả lời trong 24 giờ. Bạn nhận lời mời phỏng vấn qua app và Zalo OA." };
  const day1: PathStep = { key: "day1", label: "Ngày đầu đi làm", at: start.date, legal: false, note: "Học an toàn bằng tiếng Việt trước ca đầu tiên. Mang thẻ cư trú." };
  if (!start.statusChange) return [approve, day1];
  const review = DOC_PREP_DAYS + STATUS_CHANGE_DAYS;
  return [
    approve,
    { key: "docs", label: "Công ty gửi giấy tờ", at: at(DOC_PREP_DAYS), legal: false, note: "Công ty mới gửi hợp đồng và giấy tờ cần cho đơn. KINTRA nhắc công ty nếu chậm." },
    { key: "file", label: "Nộp đơn chuyển đổi tư cách lưu trú", at: at(DOC_PREP_DAYS), legal: true, note: "Nộp tại Cục Xuất nhập cảnh Nagoya. Bắt buộc theo luật khi người có Kỹ năng đặc định đổi công ty." },
    { key: "review", label: "Cục Xuất nhập cảnh xét đơn", at: at(review), legal: true, note: "Thường 41–64 ngày theo thống kê của Cục. Trong lúc chờ, bạn vẫn làm ở chỗ cũ nếu còn hợp đồng." },
    { key: "card", label: "Nhận thẻ cư trú mới", at: at(review), legal: true, note: "Thẻ mới ghi công ty mới. Từ đây bạn được phép đi làm chỗ mới." },
    day1,
  ];
}
