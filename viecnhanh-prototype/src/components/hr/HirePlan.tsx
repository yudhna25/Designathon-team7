"use client";
import { HIRE_PLAN } from "@/lib/data";
import { hireProgress } from "@/lib/hire";

const L = {
  en: { week: "Week 1", trial: "3-month trial contract", day: (n: number) => `Day ${n}`, today: "today", filled: "placed", target: "target" },
  ja: { week: "1週目", trial: "3か月の試用契約", day: (n: number) => `${n}日目`, today: "今日", filled: "配置済み", target: "目標" },
};

/** M3 market event on one strip: 300 workers in week 1 on a 3-month trial. */
export function HirePlan({ approvedNow, lang }: { approvedNow: number; lang: "en" | "ja" }) {
  const t = L[lang];
  const g = hireProgress(HIRE_PLAN, approvedNow);
  const max = Math.max(...g.perDay, 1);
  return (
    <section className="card p-5 mb-5" aria-label={`${t.week} ${g.filled}/${g.target}`} data-reveal>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-sm text-muted">{t.week} · <span className="badge badge-md bg-brand-soft text-brand align-middle">{t.trial}</span></p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="led text-[44px] leading-none text-brand" aria-hidden>{g.filled}</span>
            <span className="t-h4 text-muted">/ {g.target}{lang === "ja" ? "名" : ""}</span>
            <span className="t-sm text-muted">{t.filled} · {g.pct}%</span>
          </p>
        </div>
        <ol className="flex items-end gap-1.5 h-16" aria-hidden>
          {g.perDay.map((n, i) => (
            <li key={i} className="flex flex-col items-center gap-1 w-8">
              <span className={`w-full rounded-md ${i === HIRE_PLAN.today ? "bg-[#1B22A7]" : i < HIRE_PLAN.today ? "bg-[#4260E6]/60" : "bg-subtle"}`} style={{ height: `${Math.max(6, (n / max) * 44)}px` }} />
              <span className={`t-sm tnum ${i === HIRE_PLAN.today ? "font-semibold" : "text-muted"}`}>{i === HIRE_PLAN.today ? t.today : i + 1}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4 h-2 rounded-full bg-subtle overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={g.target} aria-valuenow={g.filled} aria-label={`${t.filled} ${g.filled} / ${t.target} ${g.target}`}>
        <span className="block h-full rounded-full bg-[#1B22A7]" style={{ width: `${Math.min(100, g.pct)}%` }} />
      </div>
    </section>
  );
}
