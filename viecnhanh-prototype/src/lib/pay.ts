import { JPY_TO_VND, type Job } from "./data";
import { getLang, tNow } from "./i18n";

export type Line = { key: string; label: string; amount: number; hint?: string };

// shortcut: flat-rate estimate of Japanese payroll (SI ≈ 14.8%, income tax ≈ 3% after SI, resident tax flat);
// replace with the client's real payroll rules when integrating.
export function takeHome(job: Job, usesDorm: boolean) {
  const regularH = 8 * 21;
  const earnings: Line[] = [
    {
      key: "base",
      label: tNow("Lương cơ bản", "基本給", "Base pay"),
      amount: job.hourly * regularH,
      hint: tNow(`¥${fmt(job.hourly)}/giờ × ${regularH} giờ`, `¥${fmt(job.hourly)}/時 × ${regularH}時間`, `¥${fmt(job.hourly)}/hr × ${regularH} hrs`),
    },
    {
      key: "ot",
      label: tNow("Tăng ca", "残業手当", "Overtime"),
      amount: Math.round(job.hourly * 1.25 * job.otHours),
      hint: tNow(`~${job.otHours} giờ × 125%`, `約${job.otHours}時間 × 125%`, `~${job.otHours} hrs × 125%`),
    },
  ];
  if (job.shift !== "day")
    earnings.push({
      key: "night",
      label: tNow("Phụ cấp ca đêm", "深夜手当", "Night-shift allowance"),
      amount: Math.round(job.hourly * 0.25 * 8 * (job.shift === "night" ? 21 : 10)),
      hint: tNow("+25% giờ 22h–5h", "22時〜5時は+25%", "+25% for 22:00–05:00"),
    });
  const gross = earnings.reduce((a, l) => a + l.amount, 0);
  const si = Math.round(gross * 0.148);
  const deductions: Line[] = [
    {
      key: "si",
      label: tNow("Bảo hiểm xã hội", "社会保険料", "Social insurance"),
      amount: si,
      hint: tNow("Y tế, hưu trí, thất nghiệp", "健康・厚生年金・雇用保険", "Health, pension & employment"),
    },
    {
      key: "tax",
      label: tNow("Thuế thu nhập", "所得税", "Income tax"),
      amount: Math.round((gross - si) * 0.03),
      hint: tNow("Khấu trừ tại nguồn", "源泉徴収", "Withheld at source"),
    },
    {
      key: "resident",
      label: tNow("Thuế cư trú", "住民税", "Resident tax"),
      amount: 9000,
      hint: tNow("Giả định trong ước tính", "試算上の仮定額", "Estimated assumption"),
    },
  ];
  if (job.dorm !== null && usesDorm)
    deductions.push({ key: "dorm", label: tNow("Ký túc xá", "寮費", "Dormitory"), amount: job.dorm });
  if (job.dorm !== null && usesDorm)
    deductions.push({ key: "util", label: tNow("Điện nước", "水道光熱費", "Utilities"), amount: 8000, hint: tNow("Ước tính", "目安", "Estimate") });
  const net = gross - deductions.reduce((a, l) => a + l.amount, 0);
  const housingNote =
    job.dorm !== null && usesDorm
      ? tNow("Đã trừ ký túc xá và điện nước", "寮費・水道光熱費を控除済み", "Dorm & utilities deducted")
      : tNow("Chưa trừ chi phí chỗ ở", "住居費は含まれていません", "Housing not deducted");
  return { earnings, deductions, gross, net, bonus: job.attendanceBonus, housingNote };
}

export const fmt = (n: number) => Math.round(n).toLocaleString(getLang() === "en" ? "en-US" : "vi-VN");
export const yen = (n: number) => `¥${fmt(n)}`;
export const yenK = (n: number) => `¥${Math.round(n / 1000)}k`;
export const vnd = (n: number) => {
  const v = (n * JPY_TO_VND) / 1e6;
  const lang = getLang();
  if (lang === "en") return `≈ ${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}M VND`;
  if (lang === "ja") return `約${v.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}百万VND`;
  return `≈ ${v.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu ₫`;
};
