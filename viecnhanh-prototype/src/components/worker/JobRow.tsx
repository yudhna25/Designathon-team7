"use client";
import Link from "next/link";
import { CITIES, type Job, type Profile } from "@/lib/data";
import { SHIFT_JA, SHIFT_VI } from "@/lib/labels";
import { useLang, useT } from "@/lib/i18n";
import { takeHome, yen } from "@/lib/pay";
import { FIT_JA, FIT_VI, type Fit } from "@/lib/scoring";
import { SHOWCASE } from "@/lib/showcase";
import { earliestStart, fmtDate } from "@/lib/start";
import { useApp } from "@/lib/store";
import { Icon } from "../ui";

/** Company mark: showcase logo when available, otherwise initials on brand tint. */
export function CompanyLogo({ job, size = 48 }: { job: Job; size?: number }) {
  const src = SHOWCASE.logos[job.id];
  const initials = job.company.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className="shrink-0 self-start rounded-[14px] border border-hair bg-surface object-contain" style={{ width: size, height: size }} />
  ) : (
    <span className="shrink-0 self-start grid place-items-center rounded-[14px] bg-brand-soft text-brand font-bold" style={{ width: size, height: size, fontSize: size * 0.32 }} aria-hidden>{initials}</span>
  );
}

/** Compact TopCV-style job row: scan 4–5 per phone screen. Take-home stays the biggest number on the card. */
export function JobRow({ job, p, fit, now, applied, guest }: { job: Job; p: Profile; fit: Fit; now: number; applied?: boolean; guest?: boolean }) {
  const t = useT();
  const ja = useLang() === "ja";
  const saved = useApp((s) => s.saved.includes(job.id));
  const toggleSave = useApp((s) => s.toggleSave);
  const pay = takeHome(job, p.relocate);
  const start = fmtDate(earliestStart(p, now + 864e5).date);
  return (
    <article className="relative card p-5 flex gap-4 pressable hover:shadow-[var(--shadow-bottom-2)]">
      <CompanyLogo job={job} />
      <div className="min-w-0 flex-1 py-0.5 pr-12">
        <h3 className="font-semibold leading-snug">
          <Link href={`/worker/jobs/${job.id}`} className="after:absolute after:inset-0 after:rounded-[24px]">{job.title}</Link>
        </h3>
        <p className="t-sm text-muted truncate">
          {job.company}
          {!guest && fit === "great" && <span className="text-brand font-semibold"> · {ja ? FIT_JA.great : FIT_VI.great}</span>}
          {applied && <span className="font-semibold text-fg"> · {t("Đã ứng tuyển", "応募済み")}</span>}
        </p>
        <p className="mt-1.5 flex items-baseline gap-1">
          <span className="mono text-[20px] font-bold text-brand tnum">{yen(pay.net)}</span>
          <span className="t-sm text-muted">{t("/tháng · ước tính", "/月 · 目安")}</span>
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5 t-sm lg:-mr-9 lg:flex-nowrap lg:whitespace-nowrap lg:[&>li]:min-w-0 lg:[&>li]:truncate">
          <li className="rounded-full bg-subtle px-2 py-0.5">{ja ? CITIES[job.city].ja : CITIES[job.city].vi}</li>
          <li className="rounded-full bg-subtle px-2 py-0.5">{ja ? SHIFT_JA[job.shift] : SHIFT_VI[job.shift]}</li>
          {job.dorm !== null && <li className="rounded-full bg-brand-soft text-brand px-2 py-0.5">{t("Có ký túc xá", "寮あり")}</li>}
          {job.contractMonths && <li className="rounded-full bg-subtle px-2 py-0.5">{t(`Thử việc ${job.contractMonths} tháng`, `試用${job.contractMonths}か月`)}</li>}
        </ul>
        <p className="t-sm text-muted mt-1.5">{t(`Bắt đầu ${start} · dự kiến`, `開始 ${start}（予定）`)} · {job.verified ? t("Đã xác minh", "確認済み") : t("Đang xác minh", "確認中")}</p>
      </div>
      <button
        className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full hover:bg-subtle pressable"
        aria-pressed={saved}
        aria-label={saved ? t(`Bỏ lưu ${job.title}`, `${job.title}の保存を解除`) : t(`Lưu ${job.title}`, `${job.title}を保存`)}
        onClick={() => toggleSave(job.id)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill={saved ? "#1B22A7" : "none"} stroke={saved ? "#1B22A7" : "currentColor"} strokeWidth="2" strokeLinejoin="round">
          <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
        </svg>
      </button>
    </article>
  );
}

/** Nhóm việc. Từ 1280px các thẻ việc xếp 2 cột; thẻ nổi bật (JobPass, PeersTile) bọc trong `.col-span-full` để trải hết bề ngang. */
export function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const t = useT();
  return (
    <section className="mt-6" aria-label={title}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="t-lg font-semibold">{title}</h2>
        {count !== undefined && <span className="t-sm text-muted tnum">{t(`${count} việc`, `${count}件`)}</span>}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

