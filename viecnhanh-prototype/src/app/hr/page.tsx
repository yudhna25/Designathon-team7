"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar, Icon, Meter, Num, toast } from "@/components/ui";
import { HirePlan } from "@/components/hr/HirePlan";
import { SHOWCASE } from "@/lib/showcase";
import { HIRE_PLAN, JLPT_SHORT, KEY_JOB_ID, SKILLS, VISAS, jobById, type SkillId } from "@/lib/data";
import { batchEligible, hireProgress, needsBatch } from "@/lib/hire";
import { fmtLeftShort, hrT } from "@/lib/hr-i18n";
import { FIT_EN, FIT_JA, fitOf } from "@/lib/scoring";
import { INTERVIEW_SLOTS, deadlineOf, displayStatus, fmtSlot, matchOf, profileOf, useApp, useNow, type DisplayStatus } from "@/lib/store";
import { useReveal } from "@/lib/motion";

export default function HRCandidates() {
  const s = useApp();
  const now = useNow(1000);
  const router = useRouter();
  const t = hrT(s.config.hrLang);
  const lang = s.config.hrLang;
  const [showEx, setShowEx] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "approved" | "closed">("all");
  const [picked, setPicked] = useState<string[]>([]);
  const [slot, setSlot] = useState(INTERVIEW_SLOTS[0]);
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const job = jobById(KEY_JOB_ID)!;

  const rows = s.apps
    .filter((a) => a.jobId === KEY_JOB_ID)
    .map((a) => ({ a, p: profileOf(a.candidateId, s.profile)!, m: matchOf(a, s.profile, s.config.weights, now)!, st: displayStatus(a, s, now), left: deadlineOf(a, s) - now }))
    .filter((r) => r.p && r.m);
  const excluded = rows.filter((r) => !r.m.gate.pass);
  const fitRank = { great: 0, possible: 1, not: 2 } as const;
  const ranked = rows.filter((r) => r.m.gate.pass).sort((x, y) => rank(x.st) - rank(y.st) || fitRank[fitOf(x.m, s.config.threshold)] - fitRank[fitOf(y.m, s.config.threshold)] || y.m.total - x.m.total);
  const fitWord = (m: (typeof rows)[number]["m"]) => (lang === "ja" ? FIT_JA : FIT_EN)[fitOf(m, s.config.threshold)];
  const open = ranked.filter((r) => r.st === "sent" || r.st === "viewed");
  const due = open.filter((r) => r.left < s.config.reminderH * 36e5);
  const fresh = ranked.filter((r) => now - r.a.appliedAt < 864e5).length;
  const approved = ranked.filter((r) => r.st === "approved").length;
  const closedCount = ranked.length - open.length - approved;
  const visibleRanked = ranked.filter(({ st }) => {
    if (statusFilter === "open") return st === "sent" || st === "viewed";
    if (statusFilter === "approved") return st === "approved";
    if (statusFilter === "closed") return st === "rejected" || st === "expired";
    return true;
  });
  const eligible = new Set(batchEligible(ranked.map((r) => ({ appId: r.a.id, gatePass: r.m.gate.pass, fit: fitOf(r.m, s.config.threshold), status: r.st }))));
  const sel = picked.filter((id) => eligible.has(id));
  const toggle = (id: string) => setPicked((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const oldestLeftH = open.length ? Math.min(...open.map((r) => r.left)) / 36e5 : s.config.deadlineH;
  const crowded = needsBatch(open.length + HIRE_PLAN.queued, Math.max(1, oldestLeftH));
  const decided = rows.filter((r) => r.a.decidedAt);
  const hrs = decided.map((r) => (r.a.decidedAt! - r.a.appliedAt) / 36e5).sort((x, y) => x - y);
  const medianH = hrs.length ? Math.round(hrs[Math.floor(hrs.length / 2)] * 10) / 10 : 0;
  const fill = hireProgress(HIRE_PLAN, approved);
  const invite = () => {
    s.decideMany(sel, { slot, mode: "onsite" });
    toast(lang === "ja" ? `${sel.length}名をグループ面接に招待しました` : `Invited ${sel.length} to a group interview · ${fmtSlot(slot, lang)}`, "users-check");
    setPicked([]);
  };

  return (
    <div ref={root}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6" data-reveal>
        <div>
          <p className="t-eyebrow mb-2">{job.companyJa} · {lang === "ja" ? "豊田市" : "Toyota-shi"} · {t.headcount(job.headcount)}</p>
          <h1 className="t-h2">{lang === "ja" ? job.titleJa : job.titleEn}</h1>
        </div>
        <p className="t-sm text-muted flex items-center gap-2"><Icon name="shield-tick" size={16} />{t.sortedBy}</p>
      </div>

      <HirePlan approvedNow={approved} lang={lang} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5" data-reveal>
        <Kpi label={t.kpi.pending} value={open.length} icon="hourglass" />
        <Kpi label={t.kpi.due(s.config.reminderH)} value={due.length} icon="alert-triangle" strong={due.length > 0} />
        <Kpi label={lang === "ja" ? "判断までの時間（中央値）" : "Time to decision (median)"} value={medianH} suffix={lang === "ja" ? "時間" : "h"} icon="clock" />
        <Kpi label={lang === "ja" ? "30日定着率 · 試算" : "30-day retention · simulated"} value={91} suffix="%" icon="check-verified" />
      </div>
      {fresh > 0 && <p className="sr-only">{t.kpi.fresh}: {fresh}</p>}

      {crowded && (
        <div className="card-flat p-4 md:px-5 flex flex-wrap items-center gap-3 mb-5" role="status" data-reveal>
          <Icon name="users-check" />
          <p className="flex-1 min-w-[200px] font-medium">{lang === "ja" ? `今週の待機 ${open.length + HIRE_PLAN.queued}名。24時間以内に判断するにはグループ招待を使ってください。` : `${open.length + HIRE_PLAN.queued} applications waiting this week. Turn on group invites to keep the 24h promise.`}</p>
          <button className="btn btn-sm btn-secondary pressable" onClick={() => setPicked([...eligible])} disabled={eligible.size === 0}>{lang === "ja" ? `対象 ${eligible.size}名を選択` : `Select ${eligible.size} eligible`}</button>
        </div>
      )}

      {due.length > 0 && (
        <div className="ink rounded-2xl p-4 md:px-5 flex flex-wrap items-center gap-3 mb-5" role="alert" data-reveal>
          <Icon name="bell-01" solid className="animate-[zen-squash_1.2s_var(--ease-spring)_infinite]" />
          <p className="flex-1 min-w-[200px] font-medium">{t.remind(due.length, s.config.reminderH)}</p>
          <button className="btn btn-sm pressable bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)]" onClick={() => router.push(`/hr/candidates/${due.sort((a, b) => a.left - b.left)[0].a.id}`)}>{t.reviewNow}</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4" role="tablist" aria-label={lang === "ja" ? "ステータス絞り込み" : "Filter by status"} data-reveal>
        {[
          { k: "all" as const, label: lang === "ja" ? `すべて (${ranked.length})` : `All (${ranked.length})` },
          { k: "open" as const, label: lang === "ja" ? `未対応 (${open.length})` : `Pending (${open.length})` },
          { k: "approved" as const, label: lang === "ja" ? `面接案内済 (${approved})` : `Invited (${approved})` },
          { k: "closed" as const, label: lang === "ja" ? `対応済 (${closedCount})` : `Closed (${closedCount})` },
        ].map((f) => {
          const active = statusFilter === f.k;
          return (
            <button
              key={f.k}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusFilter(f.k)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors pressable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-accent-solid)] ${
                active
                  ? "bg-[var(--color-bg-accent-solid)] text-[var(--color-content-on-accent)] border-transparent"
                  : "bg-[var(--color-bg-canvas)] border-hair text-muted hover:text-fg"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden" data-reveal>
        <div className="overflow-x-auto">
          <table className="w-full t-base">
            <thead>
              <tr className="text-left t-sm text-muted hair-b">
                <th className="font-medium py-3 pl-5 pr-3 w-10"><span className="sr-only">{lang === "ja" ? "選択" : "Select"}</span></th>
                <th className="font-medium py-3 px-3 whitespace-nowrap">{t.th.cand}</th>
                <th className="font-medium py-3 px-3 whitespace-nowrap">{t.th.match}</th>
                <th className="font-medium py-3 px-3 whitespace-nowrap">{t.th.visa}</th>
                <th className="font-medium py-3 px-3 whitespace-nowrap hidden xl:table-cell">{t.th.skills}</th>
                <th className="font-medium py-3 px-3 whitespace-nowrap">{t.th.jlpt}</th>
                <th className="font-medium py-3 px-3 whitespace-nowrap hidden lg:table-cell">{t.th.start}</th>
                <th className="font-medium py-3 px-3 whitespace-nowrap">{t.th.left}</th>
                <th className="font-medium py-3 pl-3 pr-5 whitespace-nowrap">{t.th.status}</th>
              </tr>
            </thead>
            <tbody>
              {visibleRanked.map(({ a, p, m, st, left }) => {
                const isDue = (st === "sent" || st === "viewed") && left < s.config.reminderH * 36e5;
                return (
                  <tr key={a.id} onClick={() => router.push(`/hr/candidates/${a.id}`)} className={`cursor-pointer hair-b last:border-0 hover:bg-pale transition-colors ${st === "expired" || st === "rejected" ? "text-muted" : ""} ${a.candidateId === "me" ? "bg-pale" : ""}`}>
                    <td className="py-3 pl-5 pr-3" onClick={(e) => e.stopPropagation()}>
                      {eligible.has(a.id) && <input type="checkbox" className="size-5 accent-[var(--color-bg-accent-solid)]" checked={sel.includes(a.id)} onChange={() => toggle(a.id)} aria-label={`${lang === "ja" ? "選択" : "Select"} ${p.name}`} />}
                    </td>
                    <td className="py-3 px-3">
                      <Link href={`/hr/candidates/${a.id}`} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <Avatar name={p.name} size={36} src={SHOWCASE.avatars[a.candidateId]} />
                        <span><b className="block text-fg">{p.name}{a.candidateId === "me" && <span className="badge ml-2 align-middle">Demo</span>}{a.flagged && <span className="badge badge-dash ml-2 align-middle">{lang === "ja" ? "条件未達で応募" : "Applied below fit"}</span>}</b><span className="t-sm text-muted">{t.nationality[p.nationality]}</span></span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 w-[190px]"><div className="pr-2"><FitPill fit={fitOf(m, s.config.threshold)} label={fitWord(m)} /><div className="flex items-center gap-2 mt-1.5"><Meter value={m.total} label={`${p.name} · ${t.th.match}`} className="flex-1" /><span className="t-sm tnum text-muted w-9 text-right">{m.total}%</span></div></div></td>
                    <td className="py-3 px-3 whitespace-nowrap"><span className="badge badge-outline" lang="ja"><Icon name="check" size={12} />{VISAS[p.visa].short}</span></td>
                    <td className="py-3 px-3 hidden xl:table-cell t-sm">{(Object.keys(p.skills) as SkillId[]).slice(0, 2).map((k) => `${SKILLS[k][lang]} ${t.years(p.skills[k] ?? 0)}`).join(" · ")}</td>
                    <td className="py-3 px-3 tnum whitespace-nowrap">{JLPT_SHORT[p.jlpt]}</td>
                    <td className="py-3 px-3 hidden lg:table-cell whitespace-nowrap">{t.days(p.availableInDays)}</td>
                    <td className="py-3 px-3 tnum whitespace-nowrap">{st === "sent" || st === "viewed" ? <span className={isDue ? "font-semibold text-fg underline decoration-2 underline-offset-4" : ""}>{fmtLeftShort(left, lang)}</span> : "—"}</td>
                    <td className="py-3 pl-3 pr-5 whitespace-nowrap"><StatusBadge st={st} label={t.status[st]} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {visibleRanked.length === 0 && <p className="p-8 text-center text-muted">{t.empty}</p>}
      </div>

      {/* Mobile cards */}
      <ul className="md:hidden grid gap-3">
        {visibleRanked.map(({ a, p, m, st, left }) => (
          <li key={a.id} data-reveal>
            <div className={`card p-4 flex items-center gap-3 ${a.candidateId === "me" ? "bg-pale" : ""}`}>
              {eligible.has(a.id) && (
                <input
                  type="checkbox"
                  className="size-5 shrink-0 accent-[var(--color-bg-accent-solid)]"
                  checked={sel.includes(a.id)}
                  onChange={() => toggle(a.id)}
                  aria-label={`${lang === "ja" ? "選択" : "Select"} ${p.name}`}
                />
              )}
              <Link href={`/hr/candidates/${a.id}`} className="flex items-center gap-3 flex-1 min-w-0 pressable">
                <Avatar name={p.name} size={40} src={SHOWCASE.avatars[a.candidateId]} />
                <span className="flex-1 min-w-0">
                  <b className="block truncate">{p.name}</b>
                  <span className="t-sm text-muted">{VISAS[p.visa].short} · {JLPT_SHORT[p.jlpt]} · {st === "sent" || st === "viewed" ? fmtLeftShort(left, lang) : t.status[st]}</span>
                </span>
                <FitPill fit={fitOf(m, s.config.threshold)} label={fitWord(m)} />
              </Link>
            </div>
          </li>
        ))}
        {visibleRanked.length === 0 && <li className="card p-6 text-center text-muted">{t.empty}</li>}
      </ul>

      {sel.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-4 ink rounded-2xl p-3 md:p-4 flex flex-wrap items-center gap-3 shadow-[var(--shadow-bottom-2)]" role="region" aria-label={lang === "ja" ? "一括招待" : "Batch invite"}>
          <b className="flex-1 min-w-[160px]">{lang === "ja" ? `${sel.length}名を選択中` : `${sel.length} selected`}</b>
          <select className="input !h-10 !w-auto t-sm" value={slot} onChange={(e) => setSlot(e.target.value)} aria-label={lang === "ja" ? "面接日時" : "Interview slot"}>
            {INTERVIEW_SLOTS.map((x) => <option key={x} value={x}>{fmtSlot(x, lang)}</option>)}
          </select>
          <button className="btn btn-sm btn-inverse pressable" onClick={invite}>{lang === "ja" ? `${sel.length}名をグループ面接に招待` : `Invite ${sel.length} to group interview`}</button>
        </div>
      )}

      {excluded.length > 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-4" data-reveal>
          <button className="w-full flex items-center justify-between gap-3 text-left" aria-expanded={showEx} onClick={() => setShowEx((v) => !v)}>
            <span className="flex items-center gap-3"><Icon name="shield-tick" /><span><b>{t.excluded(excluded.length)}</b><span className="block t-sm text-muted">{t.excludedHint}</span></span></span>
            <Icon name="chevron-down" className={`transition-transform duration-[var(--motion-base)] ${showEx ? "rotate-180" : ""}`} />
          </button>
          {showEx && (
            <ul className="mt-3 grid md:grid-cols-3 gap-2 t-sm animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)]">
              {excluded.map(({ a, p }) => <li key={a.id} className="well p-3"><b>{p.name}</b><span className="block text-muted" lang="ja">{VISAS[p.visa][lang]}</span></li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const rank = (st: DisplayStatus) => (st === "sent" || st === "viewed" ? 0 : st === "approved" ? 1 : 2);

function StatusBadge({ st, label }: { st: DisplayStatus; label: string }) {
  const cls = st === "sent" ? "badge-solid" : st === "viewed" ? "" : st === "approved" ? "badge-outline" : "badge-dash";
  return <span className={`badge ${cls}`}>{st === "approved" && <Icon name="check" size={12} />}{label}</span>;
}

function Kpi({ label, value, icon, strong, suffix }: { label: string; value: number; icon: "users-check" | "hourglass" | "alert-triangle" | "check-verified" | "clock"; strong?: boolean; suffix?: string }) {
  return (
    <div className={`rounded-[20px] p-4 ${strong ? "ink" : "card"}`}>
      <div className="flex items-center justify-between"><span className={`t-sm ${strong ? "muted-ink" : "text-muted"}`}>{label}</span><Icon name={icon} size={18} className="opacity-60" /></div>
      <p className="t-h2 mt-2 tnum"><Num value={value} format={(n) => (Number.isInteger(value) ? Math.round(n) : Math.round(n * 10) / 10).toLocaleString("en-US")} />{suffix && <span className="t-sub text-muted ml-0.5">{suffix}</span>}</p>
    </div>
  );
}

function FitPill({ fit, label }: { fit: "great" | "possible" | "not"; label: string }) {
  // Utilities (not .ink) so the brand colour wins over .badge in the components layer.
  return <span className={`badge badge-md ${fit === "great" ? "bg-solid text-[var(--color-content-on-accent)]" : fit === "possible" ? "bg-brand-soft text-brand" : "badge-dash text-muted"}`}>{fit === "great" && <Icon name="check-verified" size={14} solid />}{label}</span>;
}
