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
import { SHIFT_JA, SHIFT_VI } from "@/lib/labels";
import { useLang, useT } from "@/lib/i18n";
import { FIT_JA, FIT_VI, fitOf, matchChips, matchGuidance, scoreMatch, suggestImprovements } from "@/lib/scoring";
import { takeHome, yen } from "@/lib/pay";
import { deadlineOf, fmtLeft, isClosed, loginThenReturn, simNow, useApp, useNow, useViewer } from "@/lib/store";
import { gsap, resolveViewTransition, useGSAP } from "@/lib/motion";

export default function Page() {
  return <Suspense><JobDetail /></Suspense>;
}

function JobDetail() {
  const t = useT();
  const ja = useLang() === "ja";
  const FIT = ja ? FIT_JA : FIT_VI;
  const city = (c: keyof typeof CITIES) => (ja ? CITIES[c].ja : CITIES[c].vi);
  const { id } = useParams<{ id: string }>();
  const from = Number(useSearchParams().get("from")) || undefined;
  const router = useRouter();
  const s = useApp();
  const job = jobById(id);
  const [sheet, setSheet] = useState<null | "apply" | "anyway" | "path">(null);
  const [dorm, setDorm] = useState(() => (job ? job.dorm !== null && (s.profile?.relocate ?? true) : false));
  useEffect(() => {
    setDorm(job ? job.dorm !== null && (s.profile?.relocate ?? true) : false);
  }, [job?.id, s.profile?.relocate]);
  useEffect(() => {
    resolveViewTransition();
  }, [id]);
  if (!job) return <div className="p-8"><p>{t("Không tìm thấy việc này.", "この求人は見つかりません。")}</p><Link className="underline" href="/worker/jobs">{t("Về danh sách", "一覧へ戻る")}</Link></div>;

  const { p, guest } = useViewer();
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
      <div className="lg:hidden"><TopBar back="/worker/jobs" title={job.company} sub={city(job.city)} /></div>
      {/* Màn rộng: khung theo header (1440), cột chính chia 2 cột từ 1280px; ảnh + tóm tắt, ghi chú cuối trải hết bề ngang. */}
      <div className="px-5 lg:px-0 pb-28 lg:pb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 xl:items-start gap-4 min-w-0 content-start">
        <section className="card p-6 md:p-8 xl:col-span-2" style={{ viewTransitionName: `pass-card-${job.id}` } as CSSProperties} data-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {SHOWCASE.covers[job.id] && <img src={SHOWCASE.covers[job.id]} alt={t(`Nhà xưởng ${job.company} (minh hoạ)`, `${job.company}の工場（イメージ）`)} className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-5 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] max-w-none aspect-[16/7] object-cover rounded-t-[24px]" />}
          <div className="flex flex-col-reverse md:flex-row md:items-start gap-6 justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2"><CompanyLogo job={job} size={52} /><p className="t-sm text-muted">{job.company} · {job.companyJa}<br />{ja ? `愛知県${CITIES[job.city].ja}` : `${CITIES[job.city].vi}, Aichi`}</p></div>
              <h1 className="t-h2 mt-1" style={{ viewTransitionName: `pass-title-${job.id}` } as CSSProperties}>{job.title}</h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.isNewPlant && <span className="badge badge-solid badge-md">{t("Nhà máy mới", "新工場")}</span>}
                <span className="badge badge-md"><Icon name={job.verified ? "check-verified" : "hourglass"} size={14} />{job.verified ? t("KINTRA đã xác minh", "KINTRA確認済み") : t("Đang xác minh", "確認中")}</span>
                <span className="badge badge-md">{t(`Cần ${job.headcount} người`, `募集${job.headcount}名`)}</span>
              </div>
            </div>
            <div className="shrink-0 md:text-right">
              {guest ? <span className="badge badge-md bg-brand-soft text-brand">{t("Đang tuyển", "募集中")}</span> : <FitBadge level={fit} size="lg" label={ja ? FIT_JA[fit] : undefined} />}
              <p className="t-sm text-muted mt-2">{fromFit ? t(`AI chấm lại: ${FIT_VI[fromFit]} → ${FIT_VI[fit]}`, `AI再評価：${FIT_JA[fromFit]} → ${FIT_JA[fit]}`) : guest ? t("Đăng nhập để AI chấm mức phù hợp", "ログインするとAIが適合度を評価") : t("AI chấm từ hồ sơ của bạn", "あなたのプロフィールからAIが評価")}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2" role="list" aria-label={t("Thông tin chính", "主な情報")}>
            <div role="listitem" className="col-span-2 md:col-span-1 rounded-2xl bg-brand-soft p-3 min-w-0">
              <p className="t-sm text-muted">{t("Thực nhận/tháng", "月の手取り")}</p>
              <p className="led text-[32px] leading-none text-brand mt-1.5" style={{ viewTransitionName: `pass-net-${job.id}` } as CSSProperties}>{yen(pay.net)}</p>
              <p className="t-sm text-muted">{t("ước tính", "目安")}</p>
            </div>
            <div role="listitem" className="rounded-2xl bg-subtle p-3 min-w-0">
              <p className="t-sm text-muted">{t("Địa điểm", "勤務地")}</p>
              <p className="font-semibold mt-1">{city(job.city)}</p>
              <p className="t-sm text-muted truncate">{guest ? "Aichi" : t(`cách ~${Math.round(distanceKm(p.city, job.city))} km`, `約${Math.round(distanceKm(p.city, job.city))}km`)}</p>
            </div>
            <button role="listitem" className="rounded-2xl bg-subtle p-3 min-w-0 text-left pressable" onClick={() => setSheet("path")} aria-label={t(`Bắt đầu sớm nhất ${fmtDate(start.date)}, dự kiến. Xem lộ trình`, `最短開始 ${fmtDate(start.date)}（予定）。流れを見る`)}>
              <p className="t-sm text-muted">{t("Bắt đầu sớm nhất", "最短開始")}</p>
              <p className="font-semibold mt-1 tnum">{fmtDate(start.date).slice(0, 5)}</p>
              <p className="t-sm text-brand font-semibold">{t("dự kiến ›", "予定 ›")}</p>
            </button>
          </div>
          <p className="t-sm text-muted mt-2">{ja ? "控除の詳細は「給与」をご覧ください" : `${pay.housingNote} · xem chi tiết khấu trừ ở mục Lương`}</p>
          <div className="mt-5 pt-5 hair-t"><MatchChips chips={matchChips(p, job, m)} lang={ja ? "ja" : "vi"} /></div>
        </section>

        <nav className="sticky top-0 lg:top-16 z-10 -mx-5 lg:mx-0 px-5 lg:px-0 py-2 xl:col-span-2 bg-[color-mix(in_oklab,var(--color-bg-canvas)_92%,transparent)] backdrop-blur-xl flex gap-2 overflow-x-auto no-scrollbar" aria-label={t("Mục trong tin tuyển dụng", "求人内の項目")}>
          {[["#ly-do", t("Vì sao hợp", "合う理由")], ["#luong", t("Lương & khấu trừ", "給与と控除")], ["#cong-viec", t("Công việc", "仕事内容")], ["#nguoi-viet", t("Người Việt ở đây", "この職場のベトナム人")]].map(([h, l]) => <a key={h} href={h} className="chip pressable !h-10 t-sm shrink-0">{l}</a>)}
        </nav>

        {/* ZEN AI Kit · AIInsightCard */}
        {guest ? (
          <section id="ly-do" className="card p-6 scroll-mt-16 bg-brand-soft" aria-labelledby="why-h">
            <span className="badge badge-solid"><Icon name="stars-01" size={14} solid />{t("AI gợi ý", "AIの提案")}</span>
            <h2 id="why-h" className="t-h4 mt-3">{t("Việc này có hợp với bạn không?", "この仕事はあなたに合っていますか？")}</h2>
            <p className="text-muted mt-1">{t("Đăng nhập bằng Zalo, trả lời 3 câu. AI kiểm visa, chấm mức phù hợp và cho biết bạn còn thiếu gì.", "Zaloでログインし3つの質問に答えると、AIが在留資格と適合度を確認します。")}</p>
            <Button className="mt-4" icon="stars-01" onClick={() => router.push(loginThenReturn(`/worker/jobs/${job.id}`))}>{t("Đăng nhập để xem mức phù hợp", "ログインして適合度を見る")}</Button>
          </section>
        ) : (
        <section id="ly-do" className="card p-6 scroll-mt-16" data-reveal aria-labelledby="why-h">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-solid"><Icon name="stars-01" size={14} solid />{t("AI gợi ý", "AIの提案")}</span>
          </div>
          <h2 id="why-h" className="t-h4">{can ? t("Vì sao việc này hợp với bạn", "この求人があなたに合う理由") : m.gate.pass ? t("Hiểu mức phù hợp của bạn", "あなたの適合度について") : t("Visa của bạn không cho phép việc này", "あなたの在留資格ではこの仕事はできません")}</h2>
          <p className="text-muted mt-1 mb-5">{can ? `${best[0].note}. ${best[1].note}.` : matchGuidance(p, job, m)}</p>
          {ups.length > 0 && (
            <ul className="grid gap-2 mb-5">
              {ups.map((u) => (
                <li key={u.id} className="flex items-center gap-3 rounded-2xl bg-brand-soft p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-brand"><Icon name="trend-up-01" /></span>
                  <span className="flex-1 min-w-0"><b className="block">{u.label}</b><span className="t-sm text-muted">{u.detail}</span></span>
                  <span className="t-sm font-semibold text-brand whitespace-nowrap">{fitOf({ ...m, total: m.total + u.gain }, s.config.threshold) === "great" ? `→ ${FIT.great}` : t("Tăng mức", "適合度アップ")}</span>
                </li>
              ))}
            </ul>
          )}
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between font-semibold py-1">
              {t("AI đánh giá từng tiêu chí", "AIによる項目別の評価")}
              <Icon name="chevron-down" className="transition-transform duration-[var(--motion-base)] group-open:rotate-180" />
            </summary>
            <div className="pt-4"><ScoreBreakdown m={m} /></div>
          </details>
        </section>
        )}

        <div id="luong" className="scroll-mt-16" data-reveal><PayCard key={job.id} job={job} relocate={p.relocate} dorm={dorm} onDormChange={setDorm} /></div>

        <section id="cong-viec" className="card p-6 scroll-mt-16" data-reveal aria-labelledby="facts-h">
          <h2 id="facts-h" className="t-h4 mb-4">{t("Công việc", "仕事内容")}</h2>
          <div className="grid gap-3 mb-5 pb-5 hair-b">
            <button className="text-left rounded-2xl -m-2 p-2 hover:bg-subtle pressable" onClick={() => setSheet("path")} aria-label={t("Xem lộ trình pháp lý đến ngày đi làm", "初出勤までの手続きの流れを見る")}>
              <Fact icon="calendar" k={t("Bắt đầu sớm nhất · xem lộ trình", "最短開始 · 流れを見る")} v={t(`${fmtDate(start.date)} · dự kiến`, `${fmtDate(start.date)}（予定）`)} sub={t(`${start.reason} Trong lúc chờ: vẫn làm ở chỗ cũ nếu còn hợp đồng · ứng lương theo ngày công vẫn dùng được.`, `${start.reason} 待機中も契約が続く限り現在の職場で働けます。`)} />
            </button>
            {job.contractMonths && <Fact icon="file-check" k={t("Hợp đồng", "契約")} v={t(`Thử việc ${job.contractMonths} tháng${job.renewable ? " · có thể gia hạn" : ""}`, `試用${job.contractMonths}か月${job.renewable ? " · 更新可" : ""}`)} sub={t("Nếu không gia hạn, KINTRA xếp việc tiếp trong 24h.", "更新されない場合、KINTRAが24時間以内に次の仕事を紹介します。")} />}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            <Fact icon="clock" k={t("Ca làm", "勤務形態")} v={ja ? SHIFT_JA[job.shift] : SHIFT_VI[job.shift]} />
            <Fact icon="clock-fast-forward" k={t("Tăng ca", "残業")} v={t(`~${job.otHours} giờ/tháng`, `月約${job.otHours}時間`)} />
            <Fact icon="home-02" k={t("Ký túc xá", "寮")} v={job.dorm !== null ? t(`Có · ${yen(job.dorm)}`, `あり · ${yen(job.dorm)}`) : t("Không", "なし")} />
            <Fact icon="tool-02" k={t("Kỹ năng", "必要スキル")} v={job.required.map((x) => (ja ? SKILLS[x].ja : SKILLS[x].vi)).join(ja ? "、" : ", ")} />
            <Fact icon="translate" k={t("Tiếng Nhật", "日本語")} v={t(`Từ ${JLPT_SHORT[job.jlptMin]}`, `${JLPT_SHORT[job.jlptMin]}以上`)} />
          </dl>
          {job.perks.length > 0 && <ul className="mt-5 flex flex-wrap gap-1.5">{job.perks.map((x) => <li key={x} className="badge badge-md badge-outline">{x}</li>)}</ul>}
          {(SHOWCASE.gallery[job.id]?.length ?? 0) > 0 && (
            <div className="mt-5">
              <p className="t-sm font-semibold mb-2">{t("Ký túc xá & tiện ích · ảnh minh hoạ", "寮と設備 · イメージ写真")}</p>
              <ul className="-mx-6 px-6 flex gap-2 overflow-x-auto no-scrollbar snap-x">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {SHOWCASE.gallery[job.id].map((src, i) => <li key={src} className="snap-start shrink-0 w-[70%] md:w-[48%]"><img src={src} alt={t(`Tiện ích ${job.company} ${i + 1} (minh hoạ)`, `${job.company}の設備 ${i + 1}（イメージ）`)} className="w-full aspect-[4/3] object-cover rounded-2xl border border-hair" /></li>)}
              </ul>
            </div>
          )}
        </section>

        <div id="nguoi-viet" className="scroll-mt-16" data-reveal><PeersTile jobId={job.id} /></div>

        <div data-reveal className="xl:col-span-2">
          <InlineNote icon="shield-tick">
            {ja ? <><b>初出勤前にベトナム語で8分の安全教育。</b>漢字の標識、機械のルール、5Sを学びます。工場に入る前に修了が必要です。</> : <><b>Học an toàn 8 phút bằng tiếng Việt trước ngày đầu.</b> Biển báo Kanji, quy tắc máy và 5S. Nhà máy cần bạn hoàn thành trước khi vào xưởng.</>}
          </InlineNote>
        </div>
        <p className="t-sm text-muted pb-4 xl:col-span-2" data-reveal>{t("Tư cách lưu trú yêu cầu:", "必要な在留資格：")} {VISAS.ssw1_mfg.short}, {VISAS.ssw2_mfg.short} {t("hoặc", "または")} {VISAS.resident.short}.</p>
      </div>
      <aside className="grid gap-4 content-start mt-4 lg:mt-0" aria-label={t("Công ty và việc tương tự", "会社と類似の求人")}>
        <section className="card p-5">
          <div className="flex items-center gap-3"><CompanyLogo job={job} size={56} /><div className="min-w-0"><p className="font-semibold">{job.company}</p><p className="t-sm text-muted">{job.companyJa}</p></div></div>
          <dl className="mt-4 grid gap-2 t-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">{t("Địa điểm", "所在地")}</dt><dd className="font-medium">{ja ? `愛知県${CITIES[job.city].ja}` : `${CITIES[job.city].vi}, Aichi`}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">{t("Đang tuyển", "募集人数")}</dt><dd className="font-medium tnum">{t(`${job.headcount} người`, `${job.headcount}名`)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">{t("Xác minh", "確認")}</dt><dd className="font-medium">{job.verified ? t("KINTRA đã xác minh", "KINTRA確認済み") : t("Đang xác minh", "確認中")}</dd></div>
          </dl>
          {job.perks.length > 0 && <ul className="mt-3 flex flex-wrap gap-1.5">{job.perks.map((x) => <li key={x} className="badge badge-outline">{x}</li>)}</ul>}
        </section>
        <section aria-label={t("Việc tương tự", "類似の求人")}>
          <h2 className="t-sub mb-3">{t("Việc tương tự", "類似の求人")}</h2>
          <div className="grid grid-cols-1 gap-3">
            {JOBS.filter((j) => j.id !== job.id).map((j) => ({ j, m: scoreMatch(p, j, s.config.weights) })).filter((r) => r.m.gate.pass).sort((a, b) => b.m.total - a.m.total).slice(0, 3)
              .map((r) => <JobRow key={r.j.id} job={r.j} p={p} fit={fitOf(r.m, s.config.threshold)} now={simNow(s.clock, s.config.speed)} />)}
          </div>
        </section>
      </aside>
      </div>

      {/* Sticky decision bar */}
      <div className="fixed lg:sticky bottom-0 inset-x-0 z-20 lg:mt-4 bg-[color-mix(in_oklab,var(--color-bg-canvas)_92%,transparent)] backdrop-blur-xl border-t border-hair">
        <div className="px-5 lg:px-0 py-3 safe-b lg:pb-4 lg:pr-[364px] xl:pr-[404px]">
          {guest ? (
            <Button size="lg" block icon="lock-01" onClick={() => router.push(loginThenReturn(`/worker/jobs/${job.id}`))}>{t("Đăng nhập để ứng tuyển · miễn phí", "ログインして応募 · 無料")}</Button>
          ) : invited ? (
            <Button size="lg" block icon="calendar" onClick={() => router.push("/worker/applications")}>{t("Xem lời mời phỏng vấn", "面接の案内を見る")}</Button>
          ) : mine ? (
            <Button size="lg" block variant="secondary" icon="file-check" onClick={() => router.push("/worker/applications")}>{t("Đã ứng tuyển · xem trạng thái", "応募済み · 状況を見る")}</Button>
          ) : can ? (
            <Button size="lg" block onClick={() => setSheet("apply")} iconRight="arrow-right">{t(`Ứng tuyển · HR trả lời trong ${s.config.deadlineH}h`, `応募する · HRは${s.config.deadlineH}時間以内に返信`)}</Button>
          ) : m.gate.pass ? (
            <div className="flex flex-wrap gap-2">
              {ups.length > 0 && <Button size="lg" className="flex-1" icon="trend-up-01" onClick={() => router.push(`/worker/improve?job=${job.id}`)}>{t("Cập nhật kinh nghiệm", "経験を更新")}</Button>}
              <Button size="lg" className="flex-1" variant="tertiary" onClick={() => setSheet("anyway")}>{t("Vẫn ứng tuyển ngay", "このまま応募する")}</Button>
            </div>
          ) : (
            <Button size="lg" block variant="secondary" disabled>{t("Không ứng tuyển được với visa hiện tại", "現在の在留資格では応募できません")}</Button>
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
  const t = useT();
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
    <Sheet open={open} onClose={close} title={appId ? t("Đã gửi hồ sơ", "応募しました") : t("Gửi hồ sơ cho nhà máy?", "工場に応募しますか？")}
      footer={appId ? (
        <Button size="lg" block onClick={() => { close(); router.push("/worker/applications"); }} iconRight="arrow-right">{t("Xem trạng thái hồ sơ", "応募状況を見る")}</Button>
      ) : (
        <div className="grid gap-2">
          <Button size="lg" block loading={busy} onClick={() => { setBusy(true); setTimeout(() => { setAppId(s.apply(jobId, { flagged, answers })); setBusy(false); }, 650); }} disabled={needCard || !answered}>{needCard ? t("Chụp thẻ cư trú để tiếp tục", "在留カードを撮影して続ける") : answered ? t("Gửi hồ sơ", "応募する") : t("Trả lời câu hỏi của nhà máy", "工場からの質問に回答")}</Button>
          <Button size="lg" block variant="flat" onClick={close}>{t("Xem lại", "見直す")}</Button>
        </div>
      )}>
      {appId && app ? (
        <div className="text-center pt-6 pb-2" aria-live="polite">
          <span className="ok-ring mx-auto grid size-20 place-items-center rounded-full ink">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden><path ref={check} d="M10 21l7 7 14-15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h2 className="t-h3 mt-5">{t(`Đã gửi cho ${job.company}`, `${job.company}に応募しました`)}</h2>
          <p className="badge badge-md bg-brand-soft text-brand mt-3">{t("Đang chờ · cam kết 24h", "返信待ち · 24時間以内")}</p>
          <p className="text-muted mt-3">{t("HR phải trả lời trước", "HRの返信期限まで")}</p>
          <p className="mono t-h2 tnum mt-1">{fmtLeft(deadlineOf(app, s) - now)}</p>
          <p className="t-sm text-muted mt-3 max-w-[340px] mx-auto">{t(`Nếu HR chưa trả lời trong ${s.config.deadlineH} giờ, bạn được gợi ý ngay 3 việc khác. Kết quả báo trong app và qua Zalo OA.`, `${s.config.deadlineH}時間以内にHRから返信がない場合、すぐに他の求人を3件ご紹介します。結果はアプリとZalo OAでお知らせします。`)}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="text-muted">{job.title} · {job.company}</p>
          {needCard && (
            <section className="card-flat p-4 grid gap-3" aria-labelledby="tier-h">
              <p className="t-eyebrow">{t("Xác minh theo tầng", "段階的な確認")}</p>
              <h3 id="tier-h" className="t-sub">{t("Xem việc không cần giấy tờ · Ứng tuyển cần thẻ cư trú", "閲覧は書類不要 · 応募には在留カードが必要")}</h3>
              <p className="t-sm text-muted">{t("Nhà máy chỉ được nhận người có tư cách lưu trú đúng ngành. Chụp 1 lần, dùng cho mọi đơn.", "工場は分野に合う在留資格の方のみ採用できます。1回撮影すれば全ての応募に使えます。")}</p>
              <Scanner done={false} onResult={() => s.setScanned(true)} />
            </section>
          )}
          {flagged && <InlineNote icon="info-circle" tone="warn"><b>{t("Bạn chưa ở mức Rất phù hợp.", "まだ「高い適合」ではありません。")}</b> {t("Hồ sơ vẫn được gửi, HR sẽ thấy nhãn “ứng tuyển khi chưa đủ tiêu chí”.", "応募は送信されますが、HRには「条件未達での応募」と表示されます。")}</InlineNote>}
          {qs.length > 0 && (
            <div className="grid gap-4 card-flat p-4">
              <p className="font-semibold flex items-center gap-2"><Icon name="message-chat-circle" />{t(`Nhà máy hỏi thêm ${qs.length} câu`, `工場からの追加質問 ${qs.length}件`)}</p>
              {qs.map((q) => (
                <div key={q.id}>
                  <p className="t-sm mb-2">{q.vi}</p>
                  <Segmented label={q.vi} value={answers[q.id] ?? ""} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} options={q.options.map((o) => ({ value: o.vi, label: o.vi }))} />
                </div>
              ))}
            </div>
          )}
          <ul className="grid gap-3">
            <li className="flex gap-3"><Icon name="shield-tick" solid /><span><b>{t("Thẻ cư trú đã kiểm tra", "在留カード確認済み")}</b><br /><span className="t-sm text-muted">{t("HR thấy tư cách lưu trú, không thấy số thẻ", "HRには在留資格のみ表示され、カード番号は表示されません")}</span></span></li>
            <li className="flex gap-3"><Icon name="tool-02" /><span><b>{t("Kỹ năng, chứng chỉ, tiếng Nhật", "スキル・資格・日本語")}</b><br /><span className="t-sm text-muted">{t("Kèm mức phù hợp và lý do", "適合度と理由付き")}</span></span></li>
            <li className="flex gap-3"><Icon name="calendar" /><span><b>{t("Ngày bắt đầu và khu vực", "開始日と地域")}</b><br /><span className="t-sm text-muted">{t("Tài khoản ngân hàng chỉ hỏi sau khi được duyệt", "銀行口座は採用後にのみ確認します")}</span></span></li>
          </ul>
          <InlineNote icon="hourglass">{t(`Nếu HR chưa trả lời trong ${s.config.deadlineH} giờ, bạn được gợi ý ngay 3 việc khác.`, `${s.config.deadlineH}時間以内にHRから返信がない場合、すぐに他の求人を3件ご紹介します。`)} <Link href="/worker/jobs" className="font-semibold underline underline-offset-2">{t("Xem 3 việc khác", "他の求人を3件見る")}</Link></InlineNote>
        </div>
      )}
    </Sheet>
  );
}
