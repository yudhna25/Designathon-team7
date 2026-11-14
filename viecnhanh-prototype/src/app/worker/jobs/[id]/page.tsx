"use client";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, type CSSProperties, useEffect, useRef, useState } from "react";
import { Button, FitBadge, Icon, InlineNote, MatchChips, Num, Sheet, Segmented } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { PayCard, ScoreBreakdown } from "@/components/worker/Blocks";
import { PeersTile } from "@/components/worker/Bento";
import { Scanner } from "@/components/worker/Scanner";
import { earliestStart, fmtDate } from "@/lib/start";
import { FlightPath } from "@/components/worker/FlightPath";
import { CITIES, JLPT_SHORT, JOBS, SKILLS, VISAS, distanceKm, jobById } from "@/lib/data";
import { CompanyLogo, JobRow } from "@/components/worker/JobRow";
import { SHOWCASE } from "@/lib/showcase";
import { SHIFT_VI } from "@/lib/labels";
import { FIT_VI, fitOf, matchChips, matchGuidance, scoreMatch, suggestImprovements } from "@/lib/scoring";
import { takeHome, yen } from "@/lib/pay";
import { deadlineOf, fmtLeft, isClosed, simNow, useApp, useNow } from "@/lib/store";
import { gsap, resolveViewTransition, useGSAP } from "@/lib/motion";

export default function Page() {
  return <Suspense><JobDetail /></Suspense>;
}

function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const from = Number(useSearchParams().get("from")) || undefined;
  const router = useRouter();
  const s = useApp();
  const job = jobById(id);
  const [sheet, setSheet] = useState<null | "apply" | "anyway" | "path">(null);
  const [dorm, setDorm] = useState(() => (job ? job.dorm !== null && (s.profile?.relocate ?? false) : false));
  useEffect(() => {
    setDorm(job ? job.dorm !== null && (s.profile?.relocate ?? false) : false);
  }, [job?.id, s.profile?.relocate]);
  useEffect(() => {
    resolveViewTransition();
  }, [id]);
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
  const pay = takeHome(job, dorm);
  const start = earliestStart(p, simNow(s.clock, s.config.speed) + 864e5);

  return (
    <Screen deps={[id]} className="pb-6 lg:pt-6 lg:pb-0">
      <div className="lg:hidden"><TopBar back="/worker/jobs" title={job.company} sub={CITIES[job.city].vi} /></div>
      <div className="px-5 lg:px-8 pb-28 lg:pb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 max-w-[1180px]">
      <div className="grid grid-cols-1 gap-4 min-w-0">
        <section className="card p-6 md:p-8" style={{ viewTransitionName: `pass-card-${job.id}` } as CSSProperties} data-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {SHOWCASE.covers[job.id] && <img src={SHOWCASE.covers[job.id]} alt={`Nhà xưởng ${job.company} (minh hoạ)`} className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-5 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] max-w-none aspect-[16/7] object-cover rounded-t-[24px]" />}
          <div className="flex flex-col-reverse md:flex-row md:items-start gap-6 justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2"><CompanyLogo job={job} size={52} /><p className="t-sm text-muted">{job.company} · {job.companyJa}<br />{CITIES[job.city].vi}, Aichi</p></div>
              <h1 className="t-h2 mt-1" style={{ viewTransitionName: `pass-title-${job.id}` } as CSSProperties}>{job.title}</h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.isNewPlant && <span className="badge badge-solid badge-md">Nhà máy mới</span>}
                <span className="badge badge-md"><Icon name={job.verified ? "check-verified" : "hourglass"} size={14} />{job.verified ? "KINTRA đã xác minh" : "Đang xác minh"}</span>
                <span className="badge badge-md">Cần {job.headcount} người</span>
              </div>
            </div>
            <div className="shrink-0 md:text-right">
              <FitBadge level={fit} size="lg" />
              <p className="t-sm text-muted mt-2">{fromFit ? `AI chấm lại: ${FIT_VI[fromFit]} → ${FIT_VI[fit]}` : "AI chấm từ hồ sơ của bạn"}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2" role="list" aria-label="Thông tin chính">
            <div role="listitem" className="col-span-2 md:col-span-1 rounded-2xl bg-brand-soft p-3 min-w-0">
              <p className="t-sm text-muted">Thực nhận/tháng</p>
              <p className="led text-[32px] leading-none text-brand mt-1.5" style={{ viewTransitionName: `pass-net-${job.id}` } as CSSProperties}>{yen(pay.net)}</p>
              <p className="t-sm text-muted">ước tính</p>
            </div>
            <div role="listitem" className="rounded-2xl bg-subtle p-3 min-w-0">
              <p className="t-sm text-muted">Địa điểm</p>
              <p className="font-semibold mt-1">{CITIES[job.city].vi}</p>
              <p className="t-sm text-muted truncate">~{Math.round(distanceKm(p.city, job.city))} km</p>
            </div>
            <button role="listitem" className="rounded-2xl bg-subtle p-3 min-w-0 text-left pressable" onClick={() => setSheet("path")} aria-label={`Bắt đầu sớm nhất ${fmtDate(start.date)}, dự kiến. Xem lộ trình`}>
              <p className="t-sm text-muted">Bắt đầu sớm nhất</p>
              <p className="font-semibold mt-1 tnum">{fmtDate(start.date).slice(0, 5)}</p>
              <p className="t-sm text-brand font-semibold">dự kiến ›</p>
            </button>
          </div>
          <p className="t-sm text-muted mt-2">{pay.housingNote} · xem chi tiết khấu trừ ở mục Lương</p>
          <div className="mt-5 pt-5 hair-t"><MatchChips chips={matchChips(p, job, m)} /></div>
        </section>

        <nav className="sticky top-0 z-10 -mx-5 lg:mx-0 px-5 lg:px-0 py-2 bg-[color-mix(in_oklab,var(--color-bg-canvas)_92%,transparent)] backdrop-blur-xl flex gap-2 overflow-x-auto no-scrollbar" aria-label="Mục trong tin tuyển dụng">
          {[["#ly-do", "Vì sao hợp"], ["#luong", "Lương & khấu trừ"], ["#cong-viec", "Công việc"], ["#nguoi-viet", "Người Việt ở đây"]].map(([h, l]) => <a key={h} href={h} className="chip pressable !h-10 t-sm shrink-0">{l}</a>)}
        </nav>

        {/* ZEN AI Kit · AIInsightCard */}
        <section id="ly-do" className="card p-6 scroll-mt-16" data-reveal aria-labelledby="why-h">
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

        <div id="luong" className="scroll-mt-16" data-reveal><PayCard key={job.id} job={job} relocate={p.relocate} dorm={dorm} onDormChange={setDorm} /></div>

        <section id="cong-viec" className="card p-6 scroll-mt-16" data-reveal aria-labelledby="facts-h">
          <h2 id="facts-h" className="t-h4 mb-4">Công việc</h2>
          <div className="grid gap-3 mb-5 pb-5 hair-b">
            <button className="text-left rounded-2xl -m-2 p-2 hover:bg-subtle pressable" onClick={() => setSheet("path")} aria-label="Xem lộ trình pháp lý đến ngày đi làm">
              <Fact icon="calendar" k="Bắt đầu sớm nhất · xem lộ trình" v={`${fmtDate(start.date)} · dự kiến`} sub={`${start.reason} Trong lúc chờ: vẫn làm ở chỗ cũ nếu còn hợp đồng · ứng lương theo ngày công vẫn dùng được.`} />
            </button>
            {job.contractMonths && <Fact icon="file-check" k="Hợp đồng" v={`Thử việc ${job.contractMonths} tháng${job.renewable ? " · có thể gia hạn" : ""}`} sub="Nếu không gia hạn, KINTRA xếp việc tiếp trong 24h." />}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Fact icon="clock" k="Ca làm" v={SHIFT_VI[job.shift]} />
            <Fact icon="clock-fast-forward" k="Tăng ca" v={`~${job.otHours} giờ/tháng`} />
            <Fact icon="home-02" k="Ký túc xá" v={job.dorm !== null ? `Có · ${yen(job.dorm)}` : "Không"} />
            <Fact icon="tool-02" k="Kỹ năng" v={job.required.map((x) => SKILLS[x].vi).join(", ")} />
            <Fact icon="translate" k="Tiếng Nhật" v={`Từ ${JLPT_SHORT[job.jlptMin]}`} />
          </dl>
          {job.perks.length > 0 && <ul className="mt-5 flex flex-wrap gap-1.5">{job.perks.map((x) => <li key={x} className="badge badge-md badge-outline">{x}</li>)}</ul>}
          {(SHOWCASE.gallery[job.id]?.length ?? 0) > 0 && (
            <div className="mt-5">
              <p className="t-sm font-semibold mb-2">Ký túc xá & tiện ích · ảnh minh hoạ</p>
              <ul className="-mx-6 px-6 flex gap-2 overflow-x-auto no-scrollbar snap-x">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {SHOWCASE.gallery[job.id].map((src, i) => <li key={src} className="snap-start shrink-0 w-[70%] md:w-[48%]"><img src={src} alt={`Tiện ích ${job.company} ${i + 1} (minh hoạ)`} className="w-full aspect-[4/3] object-cover rounded-2xl border border-hair" /></li>)}
              </ul>
            </div>
          )}
        </section>

        <div id="nguoi-viet" className="scroll-mt-16" data-reveal><PeersTile jobId={job.id} /></div>

        <div data-reveal>
          <InlineNote icon="shield-tick">
            <b>Học an toàn 8 phút bằng tiếng Việt trước ngày đầu.</b> Biển báo Kanji, quy tắc máy và 5S. Nhà máy cần bạn hoàn thành trước khi vào xưởng.
          </InlineNote>
        </div>
        <p className="t-sm text-muted pb-4" data-reveal>Tư cách lưu trú yêu cầu: {VISAS.ssw1_mfg.short}, {VISAS.ssw2_mfg.short} hoặc {VISAS.resident.short}.</p>
      </div>
      <aside className="grid gap-4 content-start mt-4 lg:mt-0" aria-label="Công ty và việc tương tự">
        <section className="card p-5">
          <div className="flex items-center gap-3"><CompanyLogo job={job} size={56} /><div className="min-w-0"><p className="font-semibold">{job.company}</p><p className="t-sm text-muted">{job.companyJa}</p></div></div>
          <dl className="mt-4 grid gap-2 t-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Địa điểm</dt><dd className="font-medium">{CITIES[job.city].vi}, Aichi</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Đang tuyển</dt><dd className="font-medium tnum">{job.headcount} người</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Xác minh</dt><dd className="font-medium">{job.verified ? "KINTRA đã xác minh" : "Đang xác minh"}</dd></div>
          </dl>
          {job.perks.length > 0 && <ul className="mt-3 flex flex-wrap gap-1.5">{job.perks.map((x) => <li key={x} className="badge badge-outline">{x}</li>)}</ul>}
        </section>
        <section aria-label="Việc tương tự">
          <h2 className="t-sub mb-3">Việc tương tự</h2>
          <div className="grid grid-cols-1 gap-3">
            {JOBS.filter((j) => j.id !== job.id).map((j) => ({ j, m: scoreMatch(p, j, s.config.weights) })).filter((r) => r.m.gate.pass).sort((a, b) => b.m.total - a.m.total).slice(0, 3)
              .map((r) => <JobRow key={r.j.id} job={r.j} p={p} fit={fitOf(r.m, s.config.threshold)} now={simNow(s.clock, s.config.speed)} />)}
          </div>
        </section>
      </aside>
      </div>

      {/* Sticky decision bar */}
      <div className="fixed lg:sticky bottom-0 inset-x-0 z-20 lg:mt-4 bg-[color-mix(in_oklab,var(--color-bg-canvas)_92%,transparent)] backdrop-blur-xl border-t border-hair">
        <div className="px-5 lg:px-8 py-3 safe-b max-w-[1180px] lg:pb-4 lg:pr-[352px]">
          {invited ? (
            <Button size="lg" block icon="calendar" onClick={() => router.push("/worker/applications")}>Xem lời mời phỏng vấn</Button>
          ) : mine ? (
            <Button size="lg" block variant="secondary" icon="file-check" onClick={() => router.push("/worker/applications")}>Đã ứng tuyển · xem trạng thái</Button>
          ) : can ? (
            <Button size="lg" block onClick={() => setSheet("apply")} iconRight="arrow-right">Ứng tuyển · HR trả lời trong {s.config.deadlineH}h</Button>
          ) : m.gate.pass ? (
            <div className="flex flex-wrap gap-2">
              {ups.length > 0 && <Button size="lg" className="flex-1" icon="trend-up-01" onClick={() => router.push(`/worker/improve?job=${job.id}`)}>Cập nhật kinh nghiệm</Button>}
              <Button size="lg" className="flex-1" variant="tertiary" onClick={() => setSheet("anyway")}>Vẫn ứng tuyển ngay</Button>
            </div>
          ) : (
            <Button size="lg" block variant="secondary" disabled>Không ứng tuyển được với visa hiện tại</Button>
          )}
        </div>
      </div>

      <FlightPath p={p} job={job} from={simNow(s.clock, s.config.speed) + 864e5} open={sheet === "path"} onClose={() => setSheet(null)} />
      <ApplySheet open={sheet === "apply" || sheet === "anyway"} flagged={sheet === "anyway"} onClose={() => setSheet(null)} jobId={job.id} />
    </Screen>
  );
}

function Fact({ icon, k, v, sub }: { icon: "clock" | "clock-fast-forward" | "home-02" | "calendar" | "tool-02" | "translate" | "file-check"; k: string; v: string; sub?: string }) {
  return (
    <div className="flex gap-3">
      <Icon name={icon} className="mt-0.5 text-faint" />
      <div><dt className="t-sm text-muted">{k}</dt><dd className="font-medium">{v}</dd>{sub && <dd className="t-sm text-muted mt-0.5">{sub}</dd>}</div>
    </div>
  );
}

function ApplySheet({ open, onClose, jobId, flagged }: { open: boolean; onClose: () => void; jobId: string; flagged: boolean }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const qs = jobById(jobId)?.questions ?? [];
  const answered = qs.every((q) => answers[q.id]);
  const s = useApp();
  const needCard = !s.scanned;
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
          <Button size="lg" block loading={busy} onClick={() => { setBusy(true); setTimeout(() => { setAppId(s.apply(jobId, { flagged, answers })); setBusy(false); }, 650); }} disabled={needCard || !answered}>{needCard ? "Chụp thẻ cư trú để tiếp tục" : answered ? "Gửi hồ sơ" : "Trả lời câu hỏi của nhà máy"}</Button>
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
          <p className="t-sm text-muted mt-3 max-w-[340px] mx-auto">Nếu HR chưa trả lời trong {s.config.deadlineH} giờ, bạn được gợi ý ngay 3 việc khác. Kết quả báo trong app và qua Zalo OA.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="text-muted">{job.title} · {job.company}</p>
          {needCard && (
            <section className="card-flat p-4 grid gap-3" aria-labelledby="tier-h">
              <p className="t-eyebrow">Xác minh theo tầng</p>
              <h3 id="tier-h" className="t-sub">Xem việc không cần giấy tờ · Ứng tuyển cần thẻ cư trú</h3>
              <p className="t-sm text-muted">Nhà máy chỉ được nhận người có tư cách lưu trú đúng ngành. Chụp 1 lần, dùng cho mọi đơn.</p>
              <Scanner done={false} onResult={() => s.setScanned(true)} />
            </section>
          )}
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
          <InlineNote icon="hourglass">Nếu HR chưa trả lời trong <b>{s.config.deadlineH} giờ</b>, bạn được gợi ý ngay 3 việc khác. <Link href="/worker/jobs" className="font-semibold underline underline-offset-2">Xem 3 việc khác</Link></InlineNote>
        </div>
      )}
    </Sheet>
  );
}
