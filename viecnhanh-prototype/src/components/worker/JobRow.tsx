"use client";
import Link from "next/link";
import { CITIES, type Job, type Profile } from "@/lib/data";
import { SHIFT_VI } from "@/lib/labels";
import { takeHome, yen } from "@/lib/pay";
import { FIT_VI, type Fit } from "@/lib/scoring";
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
    <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-[14px] border border-hair bg-surface object-cover" />
  ) : (
    <span className="shrink-0 grid place-items-center rounded-[14px] bg-brand-soft text-brand font-bold" style={{ width: size, height: size, fontSize: size * 0.32 }} aria-hidden>{initials}</span>
  );
}

/** Compact TopCV-style job row: scan 4–5 per phone screen. Take-home stays the biggest number on the card. */
export function JobRow({ job, p, fit, now, applied }: { job: Job; p: Profile; fit: Fit; now: number; applied?: boolean }) {
  const saved = useApp((s) => s.saved.includes(job.id));
  const toggleSave = useApp((s) => s.toggleSave);
  const pay = takeHome(job, p.relocate);
  const start = fmtDate(earliestStart(p, now + 864e5).date);
  return (
    <article className="relative card p-4 flex gap-3 pressable hover:shadow-[var(--shadow-bottom-2)]">
      <CompanyLogo job={job} />
      <div className="min-w-0 flex-1 pr-8">
        <h3 className="font-semibold leading-snug">
          <Link href={`/worker/jobs/${job.id}`} className="after:absolute after:inset-0 after:rounded-[24px]">{job.title}</Link>
        </h3>
        <p className="t-sm text-muted truncate">
          {job.company}
          {fit === "great" && <span className="text-brand font-semibold"> · {FIT_VI.great}</span>}
          {applied && <span className="font-semibold text-fg"> · Đã ứng tuyển</span>}
        </p>
        <p className="mt-1.5 flex items-baseline gap-1">
          <span className="mono text-[20px] font-bold text-brand tnum">{yen(pay.net)}</span>
          <span className="t-sm text-muted">/tháng · ước tính</span>
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5 t-sm">
          <li className="rounded-full bg-subtle px-2 py-0.5">{CITIES[job.city].vi}</li>
          <li className="rounded-full bg-subtle px-2 py-0.5">{SHIFT_VI[job.shift]}</li>
          {job.dorm !== null && <li className="rounded-full bg-brand-soft text-brand px-2 py-0.5">Có ký túc xá</li>}
          {job.contractMonths && <li className="rounded-full bg-subtle px-2 py-0.5">Thử việc {job.contractMonths} tháng</li>}
        </ul>
        <p className="t-sm text-muted mt-1.5">Bắt đầu {start} · dự kiến · {job.verified ? "Đã xác minh" : "Đang xác minh"}</p>
      </div>
      <button
        className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full hover:bg-subtle pressable"
        aria-pressed={saved}
        aria-label={saved ? `Bỏ lưu ${job.title}` : `Lưu ${job.title}`}
        onClick={() => toggleSave(job.id)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill={saved ? "#1B22A7" : "none"} stroke={saved ? "#1B22A7" : "currentColor"} strokeWidth="2" strokeLinejoin="round">
          <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
        </svg>
      </button>
    </article>
  );
}

export function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-6" aria-label={title}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="t-sub">{title}</h2>
        {count !== undefined && <span className="t-sm text-muted tnum">{count} việc</span>}
      </div>
      <div className="grid grid-cols-1 gap-3">{children}</div>
    </section>
  );
}

