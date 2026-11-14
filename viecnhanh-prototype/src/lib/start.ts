// Earliest legal start date and the immigration steps behind it.
// Durations: ISA statistics put SSW (i) change-of-status reviews at roughly 41–64 days; we use 45 + 7 days of paperwork.
// These are estimates — UI must always say "dự kiến", never promise a date.
import type { Profile } from "./data";
import { tNow as t } from "./i18n";

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
      ? t("Đổi công ty cần xin chuyển đổi tư cách lưu trú, thường mất khoảng 6–9 tuần. Mùa cao điểm tháng 3–4 có thể lâu hơn.", "転職には在留資格の変更許可申請が必要で、通常6〜9週間かかります。3〜4月の繁忙期はさらに長くなることがあります。")
      : t("Tư cách lưu trú của bạn không cần xin chuyển đổi.", "あなたの在留資格は変更申請が不要です。"),
  };
}

/** dd/mm/yyyy in Japan time. */
export const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);

export type PathStep = { key: "approve" | "docs" | "file" | "review" | "card" | "day1"; label: string; at: Date; legal: boolean; note: string };

export function legalPath(p: Profile, from: number): PathStep[] {
  const start = earliestStart(p, from);
  const at = (days: number) => new Date(from + days * DAY);
  const approve: PathStep = { key: "approve", label: t("HR duyệt hồ sơ", "HRが応募を承認"), at: at(0), legal: false, note: t("HR trả lời trong 24 giờ. Bạn nhận lời mời phỏng vấn qua app và Zalo OA.", "HRは24時間以内に返信します。面接の案内はアプリとZalo OAに届きます。") };
  const day1: PathStep = { key: "day1", label: t("Ngày đầu đi làm", "初出勤日"), at: start.date, legal: false, note: t("Học an toàn bằng tiếng Việt trước ca đầu tiên. Mang thẻ cư trú.", "初回勤務の前にベトナム語で安全教育を受けます。在留カードを持参してください。") };
  if (!start.statusChange) return [approve, day1];
  const review = DOC_PREP_DAYS + STATUS_CHANGE_DAYS;
  return [
    approve,
    { key: "docs", label: t("Công ty gửi giấy tờ", "会社が書類を送付"), at: at(DOC_PREP_DAYS), legal: false, note: t("Công ty mới gửi hợp đồng và giấy tờ cần cho đơn. ViệcNhanh nhắc công ty nếu chậm.", "新しい会社が契約書と申請に必要な書類を送ります。遅れる場合はViệcNhanhが会社に連絡します。") },
    { key: "file", label: t("Nộp đơn chuyển đổi tư cách lưu trú", "在留資格変更許可申請を提出"), at: at(DOC_PREP_DAYS), legal: true, note: t("Nộp tại Cục Xuất nhập cảnh Nagoya. Bắt buộc theo luật khi người có Kỹ năng đặc định đổi công ty.", "名古屋出入国在留管理局に提出します。特定技能の方が転職する場合、法律で義務付けられています。") },
    { key: "review", label: t("Cục Xuất nhập cảnh xét đơn", "入管による審査"), at: at(review), legal: true, note: t("Thường 41–64 ngày theo thống kê của Cục. Trong lúc chờ, bạn vẫn làm ở chỗ cũ nếu còn hợp đồng.", "入管の統計では通常41〜64日です。審査中も契約が続く限り現在の職場で働けます。") },
    { key: "card", label: t("Nhận thẻ cư trú mới", "新しい在留カードを受け取る"), at: at(review), legal: true, note: t("Thẻ mới ghi công ty mới. Từ đây bạn được phép đi làm chỗ mới.", "新しいカードには新しい会社が記載されます。ここから新しい職場で働けます。") },
    day1,
  ];
}
