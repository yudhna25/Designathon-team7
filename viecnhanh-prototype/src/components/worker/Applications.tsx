"use client";
import { flushSync } from "react-dom";
import Link from "next/link";
import { Button, FitBadge, Icon, Meter, toast } from "@/components/ui";
import { StatusSteps } from "@/components/worker/Blocks";
import { CITIES, JOBS, jobById } from "@/lib/data";
import { REJECT_REASONS, STATUS_VI } from "@/lib/labels";
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
  const s = useApp();
  const job = jobById(a.jobId)!;
  const st = displayStatus(a, s, now);
  const left = deadlineOf(a, s) - now;
  const total = s.config.deadlineH * 36e5;
  const urgent = left < s.config.reminderH * 36e5;

  return (
    <article className={`rounded-[24px] p-5 md:p-6 ${st === "approved" ? "ink" : "card"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`t-sm ${st === "approved" ? "muted-ink" : "text-muted"}`}>{job.company} · {CITIES[job.city].vi}</p>
          <h2 className="t-sub">{job.title}</h2>
        </div>
        <span className={`badge badge-md shrink-0 ${st === "approved" ? "bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)]" : st === "expired" || st === "rejected" ? "badge-dash" : "badge-solid"}`}>{STATUS_VI[st]}</span>
      </div>

      {(st === "sent" || st === "viewed") && (
        <>
          <div className="mt-5"><StatusSteps status={st} /></div>
          <div className="mt-5 well p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="t-sm text-muted">{st === "viewed" ? "HR đang xem hồ sơ · trả lời trước" : "HR phải trả lời trước"}</span>
              <span className={`mono tnum t-h4 ${urgent ? "underline decoration-2 underline-offset-4" : ""}`} aria-label={`Còn ${fmtLeft(left)}`}>{fmtLeft(left)}</span>
            </div>
            <Meter value={Math.max(0, (left / total) * 100)} label={`Thời gian HR còn lại cho ${job.company}`} className="mt-3" />
            <p className="t-sm text-muted mt-2">Nếu HR chưa trả lời trong {s.config.deadlineH} giờ, bạn được gợi ý ngay 3 việc khác. <Link href="/worker/jobs" className="font-semibold underline underline-offset-2">Xem 3 việc khác</Link></p>
          </div>
        </>
      )}

      {st === "approved" && <Approved a={a} />}
      {st === "rejected" && (
        <>
          <div className="mt-3 well p-4"><p className="t-sm text-muted">Lý do từ nhà máy</p><p className="font-medium">{REJECT_REASONS.find((r) => r.id === a.rejectReason)?.vi ?? "Nhà máy chưa chọn hồ sơ lần này."}</p></div>
          <UpSkill jobId={a.jobId} />
          <Alternatives exclude={a.jobId} title="Việc khác hợp với bạn" />
        </>
      )}
      {st === "expired" && (
        <>
          <p className="mt-3">HR không trả lời trong {s.config.deadlineH} giờ nên hồ sơ đã tự đóng. Bạn không mất gì và có thể ứng tuyển việc khác ngay.</p>
          <Alternatives exclude={a.jobId} title="3 việc gợi ý thay thế" />
        </>
      )}
    </article>
  );
}

function Approved({ a }: { a: Application }) {
  const safety = useApp((s) => s.safetyDone);
  const profile = useApp((s) => s.profile);
  const acceptOffer = useApp((s) => s.acceptOffer);
  const senpai = profile ? senpaiFor(profile, a.jobId) : null;
  const job = jobById(a.jobId)!;
  const start = profile ? fmtDate(earliestStart(profile, a.decidedAt ?? a.appliedAt).date) : null;
  const iv = a.interview;
  // Order matches reality: invite → interview → (if hired) safety before day 1 → wallet after first shift.
  const steps = [
    { done: true, t: "Nhà máy mời bạn phỏng vấn", d: "Hồ sơ đã qua vòng lọc" },
    { done: false, t: iv ? `Phỏng vấn ${fmtSlot(iv.slot)}` : "Phỏng vấn", d: "Kết quả báo trong app và qua Zalo OA" },
    { done: safety, t: "Nếu đạt: học an toàn trước ngày 1", d: safety ? "Đã hoàn thành" : "8 phút · có thể học trước", href: "/worker/safety" },
    ...(start ? [{ done: false, t: `Bắt đầu đi làm · ${start} (dự kiến)`, d: "Tính từ ngày HR duyệt và thủ tục lưu trú" }] : []),
    ...(job.contractMonths ? [{ done: false, t: `Tháng ${job.contractMonths}: đánh giá gia hạn`, d: "Nếu không gia hạn, ViệcNhanh xếp việc tiếp trong 24h" }] : []),
  ];
  return (
    <div className="mt-5">
      <p className="t-h3">Bạn được mời phỏng vấn</p>
      {iv && (
        <div className="mt-4 rounded-2xl bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)] p-4 grid gap-3">
          <div className="flex gap-3"><Icon name="calendar-check" /><span><span className="t-sm text-muted block">Lịch phỏng vấn</span><b>{fmtSlot(iv.slot)}</b></span></div>
          <div className="flex gap-3"><Icon name={iv.mode === "onsite" ? "marker-pin-02" : "phone-call"} /><span><span className="t-sm text-muted block">{iv.mode === "onsite" ? "Tại nhà máy" : "Online"}</span><b>{iv.mode === "onsite" ? `${job.company} · ${CITIES[job.city].vi} (xem cổng vào trong tin nhắn Zalo OA). Mang thẻ cư trú.` : "Gọi video qua Zalo, HR sẽ gọi đúng giờ."}</b></span></div>
          <Button size="sm" variant="secondary" icon="calendar" onClick={() => toast("Đã thêm vào lịch và nhắc trước 1 giờ qua Zalo OA", "calendar-check")}>Thêm vào lịch</Button>
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
          <span><b className="block">Đã nhận việc</b><span className="t-sm text-muted">{senpai ? `Zalo OA đã mở hồ sơ hai bên. Senpai ${senpai.name} sẽ đón bạn ngày đầu.` : "Zalo OA sẽ gửi hướng dẫn ngày đầu đi làm."}</span></span>
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
              toast(senpai ? `Đã nhận việc · Zalo OA đã mở hồ sơ hai bên với ${senpai.name}` : "Đã nhận việc", "users-check");
            }}
          >
            Nhận việc
          </Button>
          <p className="t-sm muted-ink">Khi bạn nhận việc, tên bạn mới được mở cho Senpai ở nhà máy để hỗ trợ ngày đầu.</p>
        </div>
      )}
    </div>
  );
}

function Alternatives({ exclude, title }: { exclude: string; title: string }) {
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
                <span className="flex-1 min-w-0"><b className="block truncate">{j.title}</b><span className="t-sm text-muted block">{j.company} · {yen(pay.net)}/tháng ước tính</span><span className="t-sm text-muted block mt-1">{pay.housingNote}</span><span className="mt-1.5 inline-block"><FitBadge level={fitOf(m, s.config.threshold)} /></span></span>
                <Icon name="chevron-right-01" className="text-faint" />
              </Link>
            </li>
          );
        })}
      </ul>
      {alts.length === 0 && <Button variant="secondary" onClick={() => location.assign("/worker/jobs")}>Xem tất cả việc</Button>}
    </div>
  );
}

function UpSkill({ jobId }: { jobId: string }) {
  const s = useApp();
  const job = jobById(jobId)!;
  const m = scoreMatch(s.profile!, job, s.config.weights);
  if (fitOf(m, s.config.threshold) === "great") return null;
  const ups = suggestImprovements(s.profile!, job, s.config.weights).slice(0, 2);
  if (!ups.length) return null;
  return (
    <div className="mt-4">
      <p className="t-sm font-semibold mb-2">Gợi ý nâng tay nghề cho lần sau</p>
      <ul className="grid gap-2">{ups.map((u) => <li key={u.id} className="flex gap-3 rounded-2xl bg-brand-soft p-3"><Icon name="trend-up-01" className="text-brand mt-0.5" /><span><b className="block">{u.label}</b><span className="t-sm text-muted">{u.detail}</span></span></li>)}</ul>
      <Link href={`/worker/improve?job=${jobId}`} className="btn btn-sm btn-secondary pressable mt-2">Cập nhật hồ sơ</Link>
    </div>
  );
}
