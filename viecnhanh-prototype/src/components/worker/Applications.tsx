"use client";
import { flushSync } from "react-dom";
import Link from "next/link";
import { Button, FitBadge, Icon, toast } from "@/components/ui";
import { StatusSteps } from "@/components/worker/Blocks";
import { JOBS, jobById } from "@/lib/data";
import { REJECT_REASONS, statusLabel } from "@/lib/labels";
import { cityName, jobTitle, useLang, useT } from "@/lib/i18n";
import { withViewTransition } from "@/lib/motion";
import { takeHome, yen } from "@/lib/pay";
import { fitOf, scoreMatch, suggestImprovements } from "@/lib/scoring";
import { deadlineOf, displayStatus, fmtLeft, fmtSlot, useApp, useNow, type Application } from "@/lib/store";
import { senpaiFor } from "@/lib/senpai";
import { earliestStart, fmtDate } from "@/lib/start";

/** The worker's own applications, split by what needs action first: interview → waiting → closed. */
export function useMyApps() {
  const s = useApp();
  const now = useNow(1000);
  const mine = s.apps.filter((a) => a.candidateId === "me").sort((a, b) => b.appliedAt - a.appliedAt);
  const invites = mine.filter((a) => displayStatus(a, s, now) === "approved");
  const open = mine.filter((a) => ["sent", "viewed"].includes(displayStatus(a, s, now)));
  const closed = mine.filter((a) => ["rejected", "expired"].includes(displayStatus(a, s, now)));
  const accepted = invites.filter((a) => a.accepted);
  return { now, mine, invites, open, closed, accepted };
}

export function AppCard({ a, now }: { a: Application; now: number }) {
  const lang = useLang();
  const t = useT();
  const s = useApp();
  const job = jobById(a.jobId)!;
  const st = displayStatus(a, s, now);
  const deadline = deadlineOf(a, s);
  const left = deadline - now;
  const [hours, minutes, seconds] = fmtLeft(left).split(":");
  const urgent = left < s.config.reminderH * 36e5;
  const units = lang === "ja" ? ["時間", "分", "秒"] : lang === "en" ? ["hrs", "min", "sec"] : ["giờ", "phút", "giây"];
  const dateLocale = lang === "vi" ? "vi-VN" : lang === "ja" ? "ja-JP" : "en-GB";

  return (
    <article className={`rounded-[24px] p-5 md:p-6 ${st === "approved" ? "ink" : "card"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-48">
          <p className={`t-sm ${st === "approved" ? "muted-ink" : "text-muted"}`}>{job.company} · {cityName(job.city, lang)}</p>
          <h2 className="t-sub">{jobTitle(job, lang)}</h2>
        </div>
        <span className={`badge badge-md shrink-0 ${st === "approved" ? "bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)]" : st === "expired" || st === "rejected" ? "badge-dash" : "badge-solid"}`}>{statusLabel(st, lang)}</span>
      </div>

      {(st === "sent" || st === "viewed") && (
        <>
          <div className="mt-5"><StatusSteps status={st} /></div>
          <div className="mt-5 well p-4">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <div>
                <p className="t-sm text-muted">{st === "viewed" ? t("HR đang xem hồ sơ · phản hồi trước", "HR確認中 · 返信期限", "HR reviewing · replies by") : t("HR phản hồi trước", "HR返信期限", "HR replies by")}</p>
                <time dateTime={new Date(deadline).toISOString()} className="mt-1 block font-semibold tnum">{new Date(deadline).toLocaleString(dateLocale, { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</time>
              </div>
              <div>
                <p className={`t-sm mb-1 ${urgent ? "text-brand font-semibold" : "text-muted"}`}>{urgent ? t("Sắp tới hạn phản hồi", "もうすぐ期限", "Deadline soon") : t("Thời gian còn lại", "残り時間", "Time remaining")}</p>
                <div role="timer" aria-live="off" aria-label={t(`Còn ${hours} giờ ${minutes} phút ${seconds} giây`, `残り ${hours}時間${minutes}分${seconds}秒`, `${hours}h ${minutes}m ${seconds}s remaining`)} className="flex items-start gap-2">
                  {[hours, minutes, seconds].map((digits, i) => (
                    <span key={i} aria-hidden="true" className="flex items-start gap-2">
                      {i > 0 && <span className="mono t-h3 text-muted">:</span>}
                      <span className="grid text-center"><span className="mono tnum t-h3 inline-block min-w-[2ch]">{digits}</span><span className="t-sm text-muted">{units[i]}</span></span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="t-sm text-muted mt-4 pt-3 hair-t">
              {t(`Nếu HR chưa trả lời trong ${s.config.deadlineH} giờ, bạn được gợi ý ngay 3 việc khác.`, `${s.config.deadlineH}時間以内にHRから返信がない場合、すぐに他の求人を3件ご紹介します。`)}{" "}
              <Link href="/worker/jobs" className="font-semibold underline underline-offset-2">{t("Xem 3 việc khác", "他の求人を3件見る")}</Link>
            </p>
          </div>
        </>
      )}

      {st === "approved" && <Approved a={a} />}
      {st === "rejected" && (
        <>
          <div className="mt-3 well p-4">
            <p className="t-sm text-muted">{t("Lý do từ nhà máy", "工場からの理由", "Feedback from plant")}</p>
            <p className="font-medium">{REJECT_REASONS.find((r) => r.id === a.rejectReason)?.[lang] ?? t("Nhà máy chưa chọn hồ sơ lần này.", "今回は見送りとなりました。", "The employer went with another candidate this time.")}</p>
          </div>
          <UpSkill jobId={a.jobId} />
          <Alternatives exclude={a.jobId} title={t("Việc khác hợp với bạn", "あなたに合う他の求人", "Other jobs that fit you")} />
        </>
      )}
      {st === "expired" && (
        <>
          <p className="mt-3">
            {t(
              `HR không trả lời trong ${s.config.deadlineH} giờ nên hồ sơ đã tự đóng. Bạn không mất gì và có thể ứng tuyển việc khác ngay.`,
              `${s.config.deadlineH}時間以内にHRから返信がなかったため、応募は自動終了しました。他の求人にすぐ応募できます。`,
              `HR didn't reply within ${s.config.deadlineH} hours so this application auto-closed. You can apply to other jobs right away.`,
            )}
          </p>
          <Alternatives exclude={a.jobId} title={t("3 việc gợi ý thay thế", "おすすめの代替求人3件", "3 suggested alternatives")} />
        </>
      )}
    </article>
  );
}

function Approved({ a }: { a: Application }) {
  const lang = useLang();
  const t = useT();
  const safety = useApp((s) => s.safetyDone);
  const profile = useApp((s) => s.profile);
  const acceptOffer = useApp((s) => s.acceptOffer);
  const senpai = profile ? senpaiFor(profile, a.jobId) : null;
  const job = jobById(a.jobId)!;
  const start = profile ? fmtDate(earliestStart(profile, a.decidedAt ?? a.appliedAt).date) : null;
  const iv = a.interview;
  // Order matches reality: invite → interview → (if hired) safety before day 1 → wallet after first shift.
  const steps = [
    { done: true, t: t("Nhà máy mời bạn phỏng vấn", "工場から面接の招待", "Employer invited you to interview"), d: t("Hồ sơ đã qua vòng lọc", "書類選考を通過しました", "Passed initial screening") },
    { done: false, t: iv ? t(`Phỏng vấn ${fmtSlot(iv.slot, lang)}`, `面接 ${fmtSlot(iv.slot, lang)}`, `Interview ${fmtSlot(iv.slot, lang)}`) : t("Phỏng vấn", "面接", "Interview"), d: t("Kết quả báo trong app và qua Zalo OA", "結果はアプリとZalo OAでお知らせします", "Result sent in-app and via Zalo OA") },
    { done: safety, t: t("Nếu đạt: học an toàn trước ngày 1", "合格後：初出勤前に安全教育", "If hired: safety training before day 1"), d: safety ? t("Đã hoàn thành", "修了済み", "Completed") : t("8 phút · có thể học trước", "8分 · 事前受講も可能", "8 min · can complete early"), href: "/worker/safety" },
    ...(start ? [{ done: false, t: t(`Bắt đầu đi làm · ${start} (dự kiến)`, `入社予定 · ${start}`, `Start work · ${start} (est.)`), d: t("Tính từ ngày HR duyệt và thủ tục lưu trú", "HR承認と在留手続きの日数から算出", "Based on HR approval & visa paperwork") }] : []),
    ...(job.contractMonths ? [{ done: false, t: t(`Tháng ${job.contractMonths}: đánh giá gia hạn`, `${job.contractMonths}か月目：更新評価`, `Month ${job.contractMonths}: renewal review`), d: t("Nếu không gia hạn, KINTRA xếp việc tiếp trong 24h", "更新されない場合、KINTRAが24時間以内に次の仕事を紹介", "If not renewed, KINTRA matches your next role within 24h") }] : []),
  ];
  return (
    <div className="mt-5">
      <p className="t-h3">{t("Bạn được mời phỏng vấn", "面接に招待されました", "Interview invitation")}</p>
      {iv && (
        <div className="mt-4 rounded-2xl bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)] p-4 grid gap-3">
          <div className="flex gap-3"><Icon name="calendar-check" /><span><span className="t-sm text-muted block">{t("Lịch phỏng vấn", "面接日時", "Interview time")}</span><b>{fmtSlot(iv.slot, lang)}</b></span></div>
          <div className="flex gap-3"><Icon name={iv.mode === "onsite" ? "marker-pin-02" : "phone-call"} /><span><span className="t-sm text-muted block">{iv.mode === "onsite" ? t("Tại nhà máy", "工場で対面", "On-site at plant") : t("Online", "オンライン", "Online")}</span><b>{iv.mode === "onsite" ? t(`${job.company} · ${cityName(job.city, lang)} (xem cổng vào trong tin nhắn Zalo OA). Mang thẻ cư trú.`, `${job.company} · ${cityName(job.city, lang)}（正門案内はZalo OA参照）。在留カード持参。`, `${job.company} · ${cityName(job.city, lang)} (gate info in Zalo OA message). Bring residence card.`) : t("Gọi video qua Zalo, HR sẽ gọi đúng giờ.", "Zaloビデオ通話。時間通りにHRから発信します。", "Zalo video call — HR will call at the scheduled time.")}</b></span></div>
          <Button size="sm" variant="secondary" icon="calendar" onClick={() => toast(t("Đã thêm vào lịch và nhắc trước 1 giờ qua Zalo OA", "カレンダーに追加し、1時間前にZalo OAで通知します", "Added to calendar with a 1h reminder via Zalo OA"), "calendar-check")}>{t("Thêm vào lịch", "カレンダーに追加", "Add to calendar")}</Button>
        </div>
      )}
      <ol className="mt-4 grid gap-1">
        {steps.map((x, i) => {
          const inner = (
            <>
              <span className={`grid size-7 place-items-center rounded-full shrink-0 ${x.done ? "bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)]" : "ring-1 ring-[color:var(--color-border-overlay-subtle-pressed)]"}`}>
                {x.done ? <Icon name="check" size={16} /> : <span className="t-sm tnum">{i + 1}</span>}
              </span>
              <span className="flex-1"><b className="block">{x.t}</b><span className="t-sm muted-ink">{x.d}</span></span>
              {x.href && <Icon name="chevron-right-01" />}
            </>
          );
          return (
            <li key={x.t}>
              {x.href ? <Link href={x.href} className="flex items-center gap-3 py-2.5 rounded-xl pressable">{inner}</Link> : <div className="flex items-center gap-3 py-2.5">{inner}</div>}
            </li>
          );
        })}
      </ol>
      {a.accepted ? (
        <div className="mt-4 rounded-2xl bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)] p-4 flex gap-3" role="status">
          <Icon name="users-check" />
          <span><b className="block">{t("Đã nhận việc", "内定を承諾しました", "Offer accepted")}</b><span className="t-sm text-muted">{senpai ? t(`Zalo OA đã mở hồ sơ hai bên. Senpai ${senpai.name} sẽ đón bạn ngày đầu.`, `Zalo OAで双方のプロフィールが公開されました。初日は先輩の${senpai.name}さんが迎えます。`, `Profiles unlocked on Zalo OA. Senpai ${senpai.name} will welcome you on day one.`) : t("Zalo OA sẽ gửi hướng dẫn ngày đầu đi làm.", "初出勤の案内はZalo OAでお送りします。", "Day-one instructions will arrive on Zalo OA.")}</span></span>
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          <Button
            size="lg"
            block
            variant="inverse"
            icon="check-circle"
            onClick={() => {
              withViewTransition(() => {
                flushSync(() => {
                  acceptOffer(a.id);
                });
              });
              toast(senpai ? t(`Đã nhận việc · Zalo OA đã mở hồ sơ hai bên với ${senpai.name}`, `内定承諾 · ${senpai.name}さんとZalo OAで連携しました`, `Offer accepted · profiles unlocked with ${senpai.name} on Zalo OA`) : t("Đã nhận việc", "内定を承諾しました", "Offer accepted"), "users-check");
            }}
          >
            {t("Nhận việc", "内定を承諾", "Accept offer")}
          </Button>
          <p className="t-sm muted-ink">{t("Khi bạn nhận việc, tên bạn mới được mở cho Senpai ở nhà máy để hỗ trợ ngày đầu.", "内定を承諾した後にのみ、工場の先輩にあなたの名前が公開されます。", "Your name is only revealed to the plant Senpai after you accept the offer.")}</p>
        </div>
      )}
    </div>
  );
}

function Alternatives({ exclude, title }: { exclude: string; title: string }) {
  const lang = useLang();
  const t = useT();
  const s = useApp();
  const p = s.profile!;
  const applied = new Set(s.apps.filter((x) => x.candidateId === "me").map((x) => x.jobId));
  const alts = JOBS.filter((j) => j.id !== exclude && !applied.has(j.id))
    .map((j) => ({ j, m: scoreMatch(p, j, s.config.weights) }))
    .filter((r) => r.m.gate.pass)
    .sort((a, b) => b.m.total - a.m.total)
    .slice(0, 3);
  return (
    <div className="mt-4">
      <p className="t-sm font-semibold mb-2">{title}</p>
      <ul className="grid gap-2">
        {alts.map(({ j, m }) => {
          const pay = takeHome(j, p.relocate);
          return (
            <li key={j.id}>
              <Link href={`/worker/jobs/${j.id}`} className="flex items-center gap-3 well p-3 pressable">
                <span className="flex-1 min-w-0">
                  <b className="block truncate">{jobTitle(j, lang)}</b>
                  <span className="t-sm text-muted block">{j.company} · {yen(pay.net)}{t("/tháng ước tính", "/月目安", "/mo est.")}</span>
                  <span className="t-sm text-muted block mt-1">{pay.housingNote}</span>
                  <span className="mt-1.5 inline-block"><FitBadge level={fitOf(m, s.config.threshold)} /></span>
                </span>
                <Icon name="chevron-right-01" className="text-faint" />
              </Link>
            </li>
          );
        })}
      </ul>
      {alts.length === 0 && <Button variant="secondary" onClick={() => location.assign("/worker/jobs")}>{t("Xem tất cả việc", "すべての求人を見る", "Browse all jobs")}</Button>}
    </div>
  );
}

function UpSkill({ jobId }: { jobId: string }) {
  const t = useT();
  const s = useApp();
  const job = jobById(jobId)!;
  const m = scoreMatch(s.profile!, job, s.config.weights);
  if (fitOf(m, s.config.threshold) === "great") return null;
  const ups = suggestImprovements(s.profile!, job, s.config.weights).slice(0, 2);
  if (!ups.length) return null;
  return (
    <div className="mt-4">
      <p className="t-sm font-semibold mb-2">{t("Gợi ý nâng tay nghề cho lần sau", "次回に向けたスキル提案", "Suggestions for next time")}</p>
      <ul className="grid gap-2">{ups.map((u) => <li key={u.id} className="flex gap-3 rounded-2xl bg-brand-soft p-3"><Icon name="trend-up-01" className="text-brand mt-0.5" /><span><b className="block">{u.label}</b><span className="t-sm text-muted">{u.detail}</span></span></li>)}</ul>
      <Link href={`/worker/improve?job=${jobId}`} className="btn btn-sm btn-secondary pressable mt-2">{t("Cập nhật hồ sơ", "プロフィールを更新", "Update profile")}</Link>
    </div>
  );
}
