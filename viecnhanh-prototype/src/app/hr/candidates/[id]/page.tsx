"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, Button, Icon, MatchChips, Meter, ScoreRing, Segmented, toast } from "@/components/ui";
import { FIT_EN, FIT_JA, fitOf, matchChips } from "@/lib/scoring";
import { CERTS, JLPT_SHORT, SKILLS, VISAS, jobById, type SkillId } from "@/lib/data";
import { critLabel, critNote, fmtLeftShort, hrT } from "@/lib/hr-i18n";
import { REJECT_REASONS } from "@/lib/labels";
import { INTERVIEW_SLOTS, deadlineOf, displayStatus, fmtSlot, matchOf, profileOf, useApp, useNow } from "@/lib/store";
import { useReveal } from "@/lib/motion";

export default function Candidate() {
  const { id } = useParams<{ id: string }>();
  const s = useApp();
  const now = useNow(1000);
  const lang = s.config.hrLang;
  const t = hrT(lang);
  const a = s.apps.find((x) => x.id === id);
  const [mode, setMode] = useState<"idle" | "approve" | "decline">("idle");
  const [slot, setSlot] = useState(INTERVIEW_SLOTS[0]);
  const [ivMode, setIvMode] = useState<"onsite" | "online">("onsite");
  const [reason, setReason] = useState(REJECT_REASONS[0].id);
  const root = useRef<HTMLDivElement>(null);
  useReveal(root, [id]);
  const markViewed = s.markViewed;
  useEffect(() => { if (a?.status === "sent") markViewed(a.id); }, [a?.id, a?.status, markViewed]);

  if (!a) return <p>Not found. <Link className="underline" href="/hr">{t.back}</Link></p>;
  const p = profileOf(a.candidateId, s.profile)!;
  const job = jobById(a.jobId)!;
  const m = matchOf(a, s.profile, s.config.weights, now)!;
  const st = displayStatus(a, s, now);
  const left = deadlineOf(a, s) - now;
  const open = st === "sent" || st === "viewed";
  const urgent = open && left < s.config.reminderH * 36e5;
  const safety = a.candidateId === "me" ? s.safetyDone : !!s.seedSafety[a.candidateId];
  const strongest = [...m.criteria].sort((x, y) => y.score * y.weight - x.score * x.weight)[0];
  const weakest = [...m.criteria].sort((x, y) => x.score * x.weight - y.score * y.weight)[0];

  const approve = () => { s.decide(a.id, "approved", { interview: { slot, mode: ivMode } }); setMode("idle"); toast(t.toastApprove(p.name), "check-verified"); };
  const decline = () => { s.decide(a.id, "rejected", { reason }); setMode("idle"); toast(t.toastDecline(p.name), "send-01"); };

  return (
    <div ref={root}>
      <Link href="/hr" className="inline-flex items-center gap-2 t-sm text-muted hover:text-fg mb-5" data-reveal><Icon name="arrow-left" size={16} />{t.back}</Link>
      <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <div className="grid gap-5 min-w-0">
          <section className="card p-6 flex flex-wrap items-center gap-5" data-reveal>
            <Avatar name={p.name} size={64} />
            <div className="flex-1 min-w-0 basis-[200px]">
              <h1 className="t-h3">{p.name}</h1>
              <p className="text-muted">{t.nationality[p.nationality]} · <span lang="ja">{VISAS[p.visa][lang]}</span> · {JLPT_SHORT[p.jlpt]}</p>
              <p className="t-sm text-muted mt-1">{t.applied} {new Date(a.appliedAt).toLocaleString(lang === "ja" ? "ja-JP" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="text-center"><ScoreRing value={m.total} size={84} stroke={7} label={lang === "ja" ? `適合度 ${m.total}%` : `${m.total}% fit`} /><p className="t-sm font-semibold mt-1">{(lang === "ja" ? FIT_JA : FIT_EN)[fitOf(m, s.config.threshold)]}</p></div>
            <div className="w-full pt-4 hair-t"><MatchChips chips={matchChips(p, job, m)} lang={lang} /></div>
            {a.flagged && <p className="w-full t-sm flex gap-2 rounded-xl border border-dashed border-line p-3"><Icon name="info-circle" size={16} className="mt-0.5" />{lang === "ja" ? "本人は適合レベル未達を承知の上で応募しています。" : "Applied knowing they are below “Great fit”."}</p>}
            {a.answers && Object.keys(a.answers).length > 0 && (
              <dl className="w-full grid sm:grid-cols-2 gap-3 well p-4">
                {(job.questions ?? []).map((q) => a.answers?.[q.id] && <div key={q.id}><dt className="t-sm text-muted">{q[lang]}</dt><dd className="font-medium">{q.options.find((o) => o.vi === a.answers?.[q.id])?.[lang] ?? a.answers[q.id]}</dd></div>)}
              </dl>
            )}
          </section>

          <section className="card p-6" data-reveal aria-labelledby="bd-h">
            <div className="flex items-center gap-2 mb-1"><span className="badge badge-solid"><Icon name="stars-01" size={12} solid />AI</span><h2 id="bd-h" className="t-h4">{t.breakdown}</h2></div>
            <p className="text-muted mb-5">{t.why}: <b className="text-fg">{critLabel(lang, strongest.key)}</b> ↑ · <b className="text-fg">{critLabel(lang, weakest.key)}</b> ↓</p>
            <div className="grid gap-5">
              {m.criteria.map((c, i) => (
                <div key={c.key} className="grid md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_48px] items-center gap-x-4 gap-y-1.5">
                  <p className="font-medium">{critLabel(lang, c.key)} <span className="t-sm text-muted font-normal">· {t.weight} {c.weight}</span></p>
                  <div className="min-w-0"><Meter value={c.score} label={critLabel(lang, c.key)} delay={i * 0.08} /><p className="t-sm text-muted mt-1.5">{critNote(lang, c, p, job, m.km)}</p></div>
                  <p className="tnum font-semibold md:text-right">{c.score}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6" data-reveal aria-labelledby="dc-h">
            <h2 id="dc-h" className="t-h4 mb-4">{t.docs}</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              {(() => {
                const isMe = a.candidateId === "me";
                const cardOk = !isMe || s.scanned;
                return (
                  <>
                    <Doc
                      ok={cardOk}
                      k={t.card}
                      v={`${VISAS[p.visa].short} · ${cardOk ? t.cardOk : (lang === "ja" ? "未スキャン · 入社時確認" : "Not scanned yet · verify at intake")}`}
                    />
                    <Doc ok k={t.limit} v={VISAS[p.visa].weeklyHourCap ? `${VISAS[p.visa].weeklyHourCap}h/wk` : t.none} />
                    <Doc
                      ok={!isMe}
                      k={t.myNumber}
                      v={isMe ? (lang === "ja" ? "入社初日に提出" : "To be collected on Day 1") : t.declared}
                    />
                  </>
                );
              })()}
              <Doc ok={false} k={t.bank} v={t.afterApprove} />
              {(p.otherSkills?.trim() || p.otherCerts?.trim()) && <Doc ok={false} k={lang === "ja" ? "本人申告（未評価）" : "Self-reported (not scored)"} v={[p.otherSkills?.trim(), p.otherCerts?.trim()].filter(Boolean).join(" · ")} />}
              <Doc ok={safety} k={t.safety} v={safety ? t.safetyDone : t.safetyTodo} />
              <Doc ok k={t.th.skills} v={(Object.keys(p.skills) as SkillId[]).map((k) => `${SKILLS[k][lang]} ${t.years(p.skills[k] ?? 0)}`).join(", ") + (p.certs.length ? ` · ${p.certs.map((c) => CERTS[c][lang]).join(", ")}` : "")} />
            </dl>
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 grid gap-3 min-w-0" data-reveal>
          <section className={`rounded-[24px] p-6 ${urgent ? "ink" : "card"}`} aria-live="polite">
            {open ? (
              <>
                <p className={`t-sm ${urgent ? "muted-ink" : "text-muted"}`}>{t.decideWithin}</p>
                <p className="mono t-h2 tnum mt-1">{fmtLeftShort(left, lang)}</p>
                <div className="meter mt-3 !bg-[color-mix(in_oklab,currentColor_15%,transparent)]"><i className="!bg-current" style={{ transform: `scaleX(${Math.max(0, left / (s.config.deadlineH * 36e5))})` }} /></div>
                <p className={`t-sm mt-3 ${urgent ? "muted-ink" : "text-muted"}`}>{t.autoClose}</p>
              </>
            ) : (
              <>
                <p className="t-h4">{t.status[st]}</p>
                <p className="text-muted mt-1">{st === "expired" ? t.expiredNote : st === "approved" && a.interview ? `${lang === "ja" ? "面接" : "Interview"}: ${fmtSlot(a.interview.slot, lang)} · ${a.interview.mode === "onsite" ? (lang === "ja" ? "工場" : "on-site") : "Zalo"}` : st === "rejected" ? REJECT_REASONS.find((r) => r.id === a.rejectReason)?.[lang] : ""}</p>
              </>
            )}
          </section>

          {open && (
            <section className="card p-5">
              {mode === "idle" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="lg" className="flex-1" variant="tertiary" onClick={() => setMode("decline")}>{t.decline}</Button>
                  <Button size="lg" className="flex-1" icon="calendar" onClick={() => setMode("approve")}>{t.approve}</Button>
                </div>
              )}
              {mode === "approve" && (
                <div className="grid gap-3 animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)]">
                  <label htmlFor="interview-slot" className="font-semibold">{lang === "ja" ? "面接日時" : "Interview slot"}</label>
                  <select id="interview-slot" className="input" value={slot} onChange={(e) => setSlot(e.target.value)}>
                    {INTERVIEW_SLOTS.map((d) => <option key={d} value={d}>{fmtSlot(d, lang)}</option>)}
                  </select>
                  <Segmented size="sm" label="Interview mode" value={ivMode} onChange={setIvMode} options={[{ value: "onsite", label: lang === "ja" ? "工場で" : "On-site" }, { value: "online", label: lang === "ja" ? "Zaloビデオ通話" : "Zalo video" }]} />
                  <Button size="lg" block className="!h-auto min-h-[var(--button-lg-h)] !whitespace-normal py-3" onClick={approve}>{t.confirmApprove}</Button>
                  <Button variant="flat" block onClick={() => setMode("idle")}>{lang === "ja" ? "戻る" : "Back"}</Button>
                </div>
              )}
              {mode === "decline" && (
                <div className="grid gap-3 animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)]">
                  <p className="font-semibold">{t.reason}</p>
                  <div className="grid gap-2" role="radiogroup">
                    {REJECT_REASONS.map((r) => (
                      <button key={r.id} role="radio" aria-checked={reason === r.id} onClick={() => setReason(r.id)} className={`text-left rounded-xl border px-3 py-2.5 pressable ${reason === r.id ? "border-line-strong ring-1 ring-[var(--color-border-neutral-solid)]" : "border-line"}`}>
                        {r[lang]}<span className="block t-sm text-muted">→ {r.vi}</span>
                      </button>
                    ))}
                  </div>
                  <Button size="lg" block onClick={decline}>{t.confirmDecline}</Button>
                  <Button variant="flat" block onClick={() => setMode("idle")}>{lang === "ja" ? "戻る" : "Back"}</Button>
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Doc({ ok, k, v }: { ok: boolean; k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <Icon name={ok ? "check-circle" : "clock"} solid={ok} className={ok ? "" : "text-faint"} />
      <div><dt className="t-sm text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
    </div>
  );
}
