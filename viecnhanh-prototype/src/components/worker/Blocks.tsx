"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Job } from "@/lib/data";
import { criteriaLabel, shiftLabel } from "@/lib/labels";
import { cityName, jobTitle, useLang, useT } from "@/lib/i18n";
import { takeHome, vnd, yen } from "@/lib/pay";
import { type Chip, type Fit, type Match } from "@/lib/scoring";
import { gsap, useGSAP } from "@/lib/motion";
import { FitBadge, Icon, MatchChips, Meter, Num, Toggle } from "../ui";

/** ZEN AI Kit · AIThinkingSteps — what the AI is doing, step by step. */
export function AIThinking({ steps, onDone, stepMs = 900 }: { steps: { title: string; sub: string }[]; onDone?: () => void; stepMs?: number }) {
  const [i, setI] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (i >= steps.length) { done.current?.(); return; }
    const motion = document.documentElement.dataset.motion;
    const t = setTimeout(() => setI((n) => n + 1), motion === "off" ? 120 : motion === "slow" ? stepMs * 2 : stepMs);
    return () => clearTimeout(t);
  }, [i, steps.length, stepMs]);
  return (
    <ol className="grid gap-1" aria-live="polite">
      {steps.map((s, k) => {
        const state = k < i ? "done" : k === i ? "active" : "todo";
        return (
          <li key={s.title} className={`flex gap-3 py-2 transition-opacity duration-[var(--motion-base)] ${state === "todo" ? "opacity-35" : ""}`}>
            <span className="mt-0.5 grid size-6 place-items-center shrink-0">
              {state === "done" ? (
                <span className="grid size-6 place-items-center rounded-full ink animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]"><Icon name="check" size={14} /></span>
              ) : state === "active" ? (
                <Icon name="stars-01" solid className="animate-[zen-spin_1.6s_linear_infinite]" />
              ) : (
                <span className="size-2 rounded-full bg-subtle" />
              )}
            </span>
            <div>
              <p className={`font-semibold ${state === "active" ? "" : ""}`}>{s.title}</p>
              <p className="t-sm text-muted">{s.sub}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Explainable score: visa gate + 4 weighted criteria. */
export function ScoreBreakdown({ m }: { m: Match; compact?: boolean }) {
  const lang = useLang();
  const t = useT();
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 pb-3 hair-b">
        <div className="flex items-center gap-3">
          <Icon name={m.gate.pass ? "shield-tick" : "x-circle"} solid />
          <div>
            <p className="font-semibold">{t("Visa · điều kiện bắt buộc", "在留資格 · 必須条件", "Visa · mandatory check")}</p>
            <p className="t-sm text-muted">{m.gate.pass ? m.gate.note : m.gate.reason}</p>
          </div>
        </div>
        <span className={`badge badge-md ${m.gate.pass ? "badge-solid" : "badge-dash"}`}>
          {m.gate.pass ? t("Đạt", "適合", "Pass") : t("Không đạt", "対象外", "Fail")}
        </span>
      </div>
      {m.criteria.map((c, i) => (
        <div key={c.key}>
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <p className="font-medium">{criteriaLabel(c.key, lang)}</p>
            <span className={`t-sm font-semibold ${c.score >= 75 ? "text-brand" : "text-muted"}`}>
              {c.score >= 75
                ? t("Tốt", "良好", "Strong")
                : c.score >= 50
                  ? t("Tạm được", "まずまず", "Fair")
                  : t("Còn thiếu", "不足", "Needs boost")}
            </span>
          </div>
          <Meter value={c.score} label={criteriaLabel(c.key, lang)} delay={0.1 + i * 0.08} />
          <p className="t-sm text-muted mt-1.5">{c.note}</p>
        </div>
      ))}
    </div>
  );
}

/** Take-home pay as one number, with the full waterfall behind it. */
export function PayCard({ job, relocate, dorm: controlledDorm, onDormChange }: { job: Job; relocate: boolean; dorm?: boolean; onDormChange?: (v: boolean) => void }) {
  const t = useT();
  const [localDorm, setLocalDorm] = useState(job.dorm !== null && relocate);
  const dorm = controlledDorm ?? localDorm;
  const setDorm = onDormChange ?? setLocalDorm;
  const pay = takeHome(job, dorm);
  const ratioPct = `${Math.max(0, Math.min(100, Math.round((pay.net / pay.gross) * 100)))}%`;
  return (
    <section className="card p-5 md:p-6" aria-labelledby="pay-h">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="pay-h" className="t-eyebrow mb-2">{t("Thực nhận mỗi tháng · ước tính", "月の手取り · 目安", "Est. monthly take-home")}</h2>
          <p className="text-[40px] leading-none font-semibold tracking-[-0.04em]"><Num value={pay.net} format={(n) => yen(n)} spring /></p>
          <p className="text-muted mt-2"><Num value={pay.net} format={(n) => vnd(n)} spring /> · {t("tỷ giá tham khảo", "参考レート", "reference rate")}</p>
          <p className="t-sm text-muted mt-1">{pay.housingNote}</p>
        </div>
        <Icon name="coins-hand" size={28} className="text-faint" />
      </div>

      <div className="mt-4" aria-hidden="true">
        <div className="flex justify-between t-sm text-muted mb-1.5">
          <span>{t("Tỷ lệ thực nhận trên lương gộp", "総支給に対する手取り割合", "Take-home ratio of gross pay")}</span>
          <span className="tnum font-semibold text-fg">{ratioPct}</span>
        </div>
        <div className="h-2 rounded-full bg-subtle overflow-hidden">
          <div className="pay-ratio-bar h-full rounded-full bg-solid" style={{ "--pay-ratio": ratioPct } as React.CSSProperties} />
        </div>
      </div>

      {job.dorm !== null && (
        <div className="flex items-center justify-between gap-4 mt-5 well px-4 py-3">
          <span className="t-sm"><b>{t("Ở ký túc xá", "入寮する", "Live in dorm")}</b> · {yen(job.dorm)}{t("/tháng", "/月")}</span>
          <Toggle checked={dorm} onChange={setDorm} label={t("Tính tiền ký túc xá", "寮費を含める", "Include dorm deduction")} />
        </div>
      )}

      <dl className="mt-5 grid gap-2.5 t-base">
        {pay.earnings.map((l) => (
          <div key={l.key} className="flex justify-between gap-4">
            <dt>{l.label} <span className="t-sm text-muted block md:inline">{l.hint}</span></dt>
            <dd className="tnum font-medium shrink-0">+{yen(l.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 pt-2.5 hair-t font-semibold"><dt>{t("Tổng trước khấu trừ", "控除前合計", "Gross pay")}</dt><dd className="tnum">{yen(pay.gross)}</dd></div>
        {pay.deductions.map((l) => (
          <div key={l.key} className="flex justify-between gap-4 text-muted">
            <dt>{l.label} {l.hint && <span className="t-sm block md:inline md:before:content-['·_']">{l.hint}</span>}</dt>
            <dd className="tnum shrink-0">−{yen(l.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 pt-2.5 hair-t t-sub"><dt>{t("Thực nhận", "手取り額", "Take-home pay")}</dt><dd className="tnum"><Num value={pay.net} format={(n) => yen(n)} spring /></dd></div>
      </dl>
      <p className="mt-4 t-sm flex items-start gap-2">
        <Icon name="award-01" size={18} className="mt-0.5" />
        <span>
          {t("Cộng thêm ", "皆勤手当 ", "Plus ")}
          <b className="tnum">{yen(pay.bonus)}</b>
          {t(" thưởng chuyên cần nếu đi làm đủ ngày.", "（全勤の場合）", " attendance bonus for full attendance.")}
        </span>
      </p>
      <p className="mt-1 t-sm text-muted">
        {t(
          "Ước tính theo giờ làm thường gặp, có thể chênh ±5%. Đã tính thuế cư trú giả định, chưa xét thời gian cư trú. Lương trả tháng, ngày 25.",
          "標準勤務時間に基づく試算です（±5%前後する場合があります）。住民税は仮定額を含みます。給与は毎月25日払いです。",
          "Estimated from typical hours (±5%). Includes assumed resident tax. Monthly payroll paid on the 25th.",
        )}
      </p>
    </section>
  );
}

export function JobCard({ job, relocate, m, chips, fit, applied, active, highlight }: { job: Job; relocate: boolean; m: Match; chips: Chip[]; fit: Fit; applied?: boolean; active?: boolean; highlight?: boolean }) {
  const lang = useLang();
  const t = useT();
  const pay = takeHome(job, relocate);
  const ref = useRef<HTMLAnchorElement>(null);
  useGSAP(() => {
    if (!highlight) return;
    gsap.fromTo(ref.current, { boxShadow: "0 0 0 0px var(--color-border-accent-solid)" }, { boxShadow: "0 0 0 3px var(--color-border-accent-solid)", duration: 0.5, repeat: 3, yoyo: true, ease: "sine.inOut" });
  }, { dependencies: [highlight] });
  return (
    <Link
      ref={ref}
      href={`/worker/jobs/${job.id}`}
      aria-current={active ? "page" : undefined}
      className={`block card p-5 pressable hover:shadow-[var(--shadow-bottom-2)] ${active ? "!border-[var(--color-border-accent-solid)] ring-1 ring-[var(--color-border-accent-solid)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <FitBadge level={fit} />
        <div className="flex flex-wrap justify-end gap-1.5">
          {job.isNewPlant && <span className="badge badge-md bg-brand-soft text-brand">{t("Nhà máy mới", "新工場")}</span>}
          {applied && <span className="badge badge-md badge-solid"><Icon name="check" size={14} />{t("Đã ứng tuyển", "応募済み")}</span>}
          {highlight && <span className="badge badge-md badge-solid">{t("Vừa chấm lại", "再評価済み", "Rescored")}</span>}
        </div>
      </div>
      <h2 className="t-sub mt-3">{jobTitle(job, lang)}</h2>
      <p className="t-sm text-muted">
        {job.company} · {cityName(job.city, lang)} · {shiftLabel(job.shift, lang)}
        {job.dorm !== null ? ` · ${t("Có ký túc xá", "寮あり", "dorm available").toLowerCase()}` : ""}
      </p>
      <div className="mt-3"><MatchChips chips={chips} max={4} lang={lang} /></div>
      <div className="mt-4 pt-3 hair-t flex items-baseline justify-between gap-3">
        <span className="t-sm text-muted">{t("Thực nhận ước tính", "手取り目安", "Est. take-home")}</span>
        <span className="text-[20px] leading-7 font-semibold tracking-[-0.03em] tnum">{yen(pay.net)}<span className="t-sm font-normal text-muted">{t("/tháng", "/月")}</span></span>
      </div>
      <p className="t-sm text-muted mt-1">{pay.housingNote}</p>
      {m.gate.pass ? null : <p className="t-sm text-muted mt-2">{m.gate.reason}</p>}
    </Link>
  );
}

export function StatusSteps({ status }: { status: "sent" | "viewed" | "approved" | "rejected" | "expired" }) {
  const t = useT();
  const n = status === "sent" ? 1 : status === "viewed" ? 2 : 3;
  const last =
    status === "approved"
      ? t("Mời phỏng vấn", "面接の案内", "Interview")
      : status === "rejected"
        ? t("Chưa phù hợp", "見送り", "Closed")
        : status === "expired"
          ? t("Hết hạn", "期限切れ", "Expired")
          : t("Kết quả", "結果", "Result");
  const labels = [t("Đã gửi", "応募済み", "Applied"), t("HR đang xem", "HR確認中", "Reviewing"), last];
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label={t("Tiến trình hồ sơ", "応募の進捗", "Application progress")}>
      {labels.map((l, i) => (
        <li key={l} className="grid gap-2">
          <span className={`h-1 rounded-full ${i < n ? "bg-solid" : "bg-subtle"} ${status === "expired" && i === 2 ? "!bg-[repeating-linear-gradient(90deg,var(--color-bg-neutral-solid)_0_4px,transparent_4px_8px)]" : ""}`} />
          <span className={`t-sm ${i < n ? "font-semibold" : "text-muted"}`}>{l}</span>
        </li>
      ))}
    </ol>
  );
}
