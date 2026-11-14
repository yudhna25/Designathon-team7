import { JPY_TO_VND, type Job } from "./data";

export type Line = { key: string; label: string; amount: number; hint?: string };

// shortcut: flat-rate estimate of Japanese payroll (SI ≈ 14.8%, income tax ≈ 3% after SI, resident tax flat);
// replace with the client's real payroll rules when integrating.
export function takeHome(job: Job, usesDorm: boolean) {
  const regularH = 8 * 21;
  const earnings: Line[] = [
    { key: "base", label: "Lương cơ bản", amount: job.hourly * regularH, hint: `¥${fmt(job.hourly)}/giờ × ${regularH} giờ` },
    { key: "ot", label: "Tăng ca", amount: Math.round(job.hourly * 1.25 * job.otHours), hint: `~${job.otHours} giờ × 125%` },
  ];
  if (job.shift !== "day")
    earnings.push({ key: "night", label: "Phụ cấp ca đêm", amount: Math.round(job.hourly * 0.25 * 8 * (job.shift === "night" ? 21 : 10)), hint: "+25% giờ 22h–5h" });
  const gross = earnings.reduce((a, l) => a + l.amount, 0);
  const si = Math.round(gross * 0.148);
  const deductions: Line[] = [
    { key: "si", label: "Bảo hiểm xã hội", amount: si, hint: "Y tế, hưu trí, thất nghiệp" },
    { key: "tax", label: "Thuế thu nhập", amount: Math.round((gross - si) * 0.03), hint: "Khấu trừ tại nguồn" },
    { key: "resident", label: "Thuế cư trú", amount: 9000, hint: "Giả định trong ước tính" },
  ];
  if (job.dorm !== null && usesDorm) deductions.push({ key: "dorm", label: "Ký túc xá", amount: job.dorm });
  if (job.dorm !== null && usesDorm) deductions.push({ key: "util", label: "Điện nước", amount: 8000, hint: "Ước tính" });
  const net = gross - deductions.reduce((a, l) => a + l.amount, 0);
  const housingNote = job.dorm !== null && usesDorm ? "Đã trừ ký túc xá và điện nước" : "Chưa trừ chi phí chỗ ở";
  return { earnings, deductions, gross, net, bonus: job.attendanceBonus, housingNote };
}

export const fmt = (n: number) => Math.round(n).toLocaleString("vi-VN");
export const yen = (n: number) => `¥${fmt(n)}`;
export const yenK = (n: number) => `¥${Math.round(n / 1000)}k`;
export const vnd = (n: number) => {
  const v = (n * JPY_TO_VND) / 1e6;
  return `≈ ${v.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu ₫`;
};
