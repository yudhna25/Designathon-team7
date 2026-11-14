"use client";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Button, FitBadge, Icon, InlineNote, MatchChips, Sheet, Segmented } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { PayCard, ScoreBreakdown } from "@/components/worker/Blocks";
import { CITIES, JLPT_SHORT, SKILLS, VISAS, jobById } from "@/lib/data";
import { SHIFT_VI } from "@/lib/labels";
import { FIT_VI, fitOf, matchChips, matchGuidance, scoreMatch, suggestImprovements } from "@/lib/scoring";
import { takeHome, yen } from "@/lib/pay";
import { deadlineOf, fmtLeft, isClosed, useApp, useNow } from "@/lib/store";
import { gsap, useGSAP } from "@/lib/motion";

export default function Page() {
  return <Suspense><JobDetail /></Suspense>;
}

function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const from = Number(useSearchParams().get("from")) || undefined;
  const router = useRouter();
  const s = useApp();
  const job = jobById(id);
  const [sheet, setSheet] = useState<null | "apply" | "anyway">(null);
  if (!job) return <div className="p-8"><p>Không tìm thấy việc này.</p><Link className="underline" href="/worker/jobs">Về danh sách</Link></div>;

  const p = s.profile!;
  const m = scoreMatch(p, job, s.config.weights);
  const fit = fitOf(m, s.config.threshold);
  const can = fit === "great";
  const fromFit = from ? fitOf({ ...m, total: from }, s.config.threshold) : undefined;
  const ups = m.gate.pass && !can ? suggestImprovements(p, job, s.config.weights).slice(0, 3) : [];
  const mine = s.apps.find((a) => a.candidateId === "me" && a.jobId === job.id && !isClosed(a, s));
  const invited = s.apps.some((a) => a.candidateId === "me" && a.jobId === job.id && a.status === "approved");
  const best = [...m.criteria].sort((a, b) => b.score - a.score);
  const pay = takeHome(job, p.relocate);

  return (
    <Screen deps={[id]} className="pb-6 lg:pt-6 lg:pb-0">
      <div className="lg:hidden"><TopBar back="/worker/jobs" title={job.company} sub={CITIES[job.city].vi} /></div>
      <div className="px-5 lg:px-0 grid gap-4 max-w-[760px]">
        <section className="card p-6 md:p-8" data-reveal>
          <div className="flex flex-col-reverse md:flex-row md:items-start gap-6 justify-between">
            <div className="min-w-0">
              <p className="t-sm text-muted">{job.company} · {job.companyJa} · {CITIES[job.city].vi}</p>
              <h1 className="t-h2 mt-1">{job.title}</h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.isNewPlant && <span className="badge badge-solid badge-md">Nhà máy mới</span>}
                <span className="badge badge-md"><Icon name="check-verified" size={14} />Công ty đã xác minh</span>
                <span className="badge badge-md">Cần {job.headcount} người</span>
              </div>
            </div>
            <div className="shrink-0 md:text-right">
              <FitBadge level={fit} size="lg" />
              <p className="t-sm text-muted mt-2">{fromFit ? `AI chấm lại: ${FIT_VI[fromFit]} → ${FIT_VI[fit]}` : "AI chấm từ hồ sơ của bạn"}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 hair-t">
            <p className="t-sm text-muted">Thực nhận mỗi tháng · ước tính ban đầu</p>
            <p className="t-h3 tnum mt-1">{yen(pay.net)}</p>
            <p className="t-sm text-muted mt-1">{pay.housingNote} · xem chi tiết khấu trừ bên dưới</p>
          </div>
          <div className="mt-5 pt-5 hair-t"><MatchChips chips={matchChips(p, job, m)} /></div>
        </section>

        {/* ZEN AI Kit · AIInsightCard */}
        <section className="card p-6" data-reveal aria-labelledby="why-h">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-solid"><Icon name="stars-01" size={14} solid />AI gợi ý</span>
          </div>
          <h2 id="why-h" className="t-h4">{can ? "Vì sao việc này hợp với bạn" : m.gate.pass ? "Hiểu mức phù hợp của bạn" : "Visa của bạn không cho phép việc này"}</h2>
          <p className="text-muted mt-1 mb-5">{can ? `${best[0].note}. ${best[1].note}.` : matchGuidance(p, job, m)}</p>
          {ups.length > 0 && (
            <ul className="grid gap-2 mb-5">
              {ups.map((u) => (
                <li key={u.id} className="flex items-center gap-3 rounded-2xl bg-brand-soft p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-brand"><Icon name="trend-up-01" /></span>
                  <span className="flex-1 min-w-0"><b className="block">{u.label}</b><span className="t-sm text-muted">{u.detail}</span></span>
                  <span className="t-sm font-semibold text-brand whitespace-nowrap">{fitOf({ ...m, total: m.total + u.gain }, s.config.threshold) === "great" ? "→ Rất phù hợp" : "Tăng mức"}</span>
                </li>
              ))}
            </ul>
          )}
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between font-semibold py-1">
              AI đánh giá từng tiêu chí
              <Icon name="chevron-down" className="transition-transform duration-[var(--motion-base)] group-open:rotate-180" />
            </summary>
            <div className="pt-4"><ScoreBreakdown m={m} /></div>
          </details>
        </section>

        <div data-reveal><PayCard key={`${job.id}-${p.relocate}`} job={job} relocate={p.relocate} /></div>

        <section className="card p-6" data-reveal aria-labelledby="facts-h">
          <h2 id="facts-h" className="t-h4 mb-4">Công việc</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Fact icon="clock" k="Ca làm" v={SHIFT_VI[job.shift]} />
            <Fact icon="clock-fast-forward" k="Tăng ca" v={`~${job.otHours} giờ/tháng`} />
            <Fact icon="home-02" k="Ký túc xá" v={job.dorm !== null ? `Có · ${yen(job.dorm)}` : "Không"} />
            <Fact icon="calendar" k="Cần bắt đầu" v={`Trong ${job.startWithinDays} ngày`} />
            <Fact icon="tool-02" k="Kỹ năng" v={job.required.map((x) => SKILLS[x].vi).join(", ")} />
            <Fact icon="translate" k="Tiếng Nhật" v={`Từ ${JLPT_SHORT[job.jlptMin]}`} />
          </dl>
          {job.perks.length > 0 && <ul className="mt-5 flex flex-wrap gap-1.5">{job.perks.map((x) => <li key={x} className="badge badge-md badge-outline">{x}</li>)}</ul>}
        </section>

        <div data-reveal>
          <InlineNote icon="shield-tick">
            <b>Học an toàn 8 phút bằng tiếng Việt trước ngày đầu.</b> Biển báo Kanji, quy tắc máy và 5S. Nhà máy cần bạn hoàn thành trước khi vào xưởng.
          </InlineNote>
        </div>
        <p className="t-sm text-muted pb-4" data-reveal>Tư cách lưu trú yêu cầu: {VISAS.ssw1_mfg.short}, {VISAS.ssw2_mfg.short} hoặc {VISAS.resident.short}.</p>
      </div>

      {/* Sticky decision bar */}
      <div className="fixed lg:sticky bottom-0 inset-x-0 z-20 lg:mt-4 bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl border-t border-hair lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="px-5 lg:px-0 pt-3 pb-3 safe-b max-w-[760px] lg:pb-8">
          {invited ? (
            <Button size="lg" block icon="calendar" onClick={() => router.push("/worker/applications")}>Xem lời mời phỏng vấn</Button>
          ) : mine ? (
            <Button size="lg" block variant="secondary" icon="file-check" onClick={() => router.push("/worker/applications")}>Đã ứng tuyển · xem trạng thái</Button>
          ) : can ? (
            <Button size="lg" block onClick={() => setSheet("apply")} iconRight="arrow-right">Ứng tuyển · HR trả lời trong {s.config.deadlineH}h</Button>
          ) : m.gate.pass ? (
            <div className="flex flex-wrap gap-2">
              <Button size="lg" className="flex-1" icon="trend-up-01" onClick={() => router.push(`/worker/improve?job=${job.id}`)}>Cải thiện hồ sơ</Button>
              <Button size="lg" className="flex-1" variant="tertiary" onClick={() => setSheet("anyway")}>Vẫn ứng tuyển</Button>
            </div>
          ) : (
            <Button size="lg" block variant="secondary" disabled>Không ứng tuyển được với visa hiện tại</Button>
          )}
        </div>
      </div>

      <ApplySheet open={sheet !== null} flagged={sheet === "anyway"} onClose={() => setSheet(null)} jobId={job.id} />
    </Screen>
  );
}

function Fact({ icon, k, v }: { icon: "clock" | "clock-fast-forward" | "home-02" | "calendar" | "tool-02" | "translate"; k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <Icon name={icon} className="mt-0.5 text-faint" />
      <div><dt className="t-sm text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
    </div>
  );
}

function ApplySheet({ open, onClose, jobId, flagged }: { open: boolean; onClose: () => void; jobId: string; flagged: boolean }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const qs = jobById(jobId)?.questions ?? [];
  const answered = qs.every((q) => answers[q.id]);
  const s = useApp();
  const router = useRouter();
  const job = jobById(jobId)!;
  const [appId, setAppId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const now = useNow(1000);
  const app = s.apps.find((a) => a.id === appId);
  const check = useRef<SVGPathElement>(null);

  useGSAP(() => {
    if (!appId || !check.current) return;
    gsap.fromTo(check.current, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "power2.out", delay: 0.15 });
    gsap.from(".ok-ring", { scale: 0.4, autoAlpha: 0, duration: 0.8, ease: "back.out(1.8)" });
  }, { dependencies: [appId] });

  const close = () => { onClose(); setTimeout(() => { setAppId(null); setAnswers({}); }, 400); };
  return (
    <Sheet open={open} onClose={close} title={appId ? "Đã gửi hồ sơ" : "Gửi hồ sơ cho nhà máy?"}
      footer={appId ? (
        <Button size="lg" block onClick={() => { close(); router.push("/worker/applications"); }} iconRight="arrow-right">Xem trạng thái hồ sơ</Button>
      ) : (
        <div className="grid gap-2">
          <Button size="lg" block loading={busy} onClick={() => { setBusy(true); setTimeout(() => { setAppId(s.apply(jobId, { flagged, answers })); setBusy(false); }, 650); }} disabled={!answered}>{answered ? "Gửi hồ sơ" : "Trả lời câu hỏi của nhà máy"}</Button>
          <Button size="lg" block variant="flat" onClick={close}>Xem lại</Button>
        </div>
      )}>
      {appId && app ? (
        <div className="text-center pt-6 pb-2" aria-live="polite">
          <span className="ok-ring mx-auto grid size-20 place-items-center rounded-full ink">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden><path ref={check} d="M10 21l7 7 14-15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h2 className="t-h3 mt-5">Đã gửi cho {job.company}</h2>
          <p className="badge badge-md bg-brand-soft text-brand mt-3">Đang chờ · cam kết 24h</p>
          <p className="text-muted mt-3">HR phải trả lời trước</p>
          <p className="mono t-h2 tnum mt-1">{fmtLeft(deadlineOf(app, s) - now)}</p>
          <p className="t-sm text-muted mt-3 max-w-[340px] mx-auto">Quá {s.config.deadlineH} giờ mà chưa có kết quả, hồ sơ tự đóng và bạn nhận 3 việc khác. Kết quả báo trong app và qua Zalo OA.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="text-muted">{job.title} · {job.company}</p>
          {flagged && <InlineNote icon="info-circle" tone="warn"><b>Bạn chưa ở mức Rất phù hợp.</b> Hồ sơ vẫn được gửi, HR sẽ thấy nhãn “ứng tuyển khi chưa đủ tiêu chí”.</InlineNote>}
          {qs.length > 0 && (
            <div className="grid gap-4 card-flat p-4">
              <p className="font-semibold flex items-center gap-2"><Icon name="message-chat-circle" />Nhà máy hỏi thêm {qs.length} câu</p>
              {qs.map((q) => (
                <div key={q.id}>
                  <p className="t-sm mb-2">{q.vi}</p>
                  <Segmented label={q.vi} value={answers[q.id] ?? ""} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} options={q.options.map((o) => ({ value: o.vi, label: o.vi }))} />
                </div>
              ))}
            </div>
          )}
          <ul className="grid gap-3">
            <li className="flex gap-3"><Icon name="shield-tick" solid /><span><b>Thẻ cư trú đã kiểm tra</b><br /><span className="t-sm text-muted">HR thấy tư cách lưu trú, không thấy số thẻ</span></span></li>
            <li className="flex gap-3"><Icon name="tool-02" /><span><b>Kỹ năng, chứng chỉ, tiếng Nhật</b><br /><span className="t-sm text-muted">Kèm mức phù hợp và lý do</span></span></li>
            <li className="flex gap-3"><Icon name="calendar" /><span><b>Ngày bắt đầu và khu vực</b><br /><span className="t-sm text-muted">Tài khoản ngân hàng chỉ hỏi sau khi được duyệt</span></span></li>
          </ul>
          <InlineNote icon="hourglass">HR phải trả lời trong <b>{s.config.deadlineH} giờ</b>. Quá hạn, hồ sơ tự đóng để bạn không phải chờ.</InlineNote>
        </div>
      )}
    </Sheet>
  );
}
