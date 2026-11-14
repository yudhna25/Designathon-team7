"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { CITIES, PEERS, distanceKm, type Job, type Profile } from "@/lib/data";
import { SHIFT_JA, SHIFT_VI } from "@/lib/labels";
import { useLang } from "@/lib/i18n";
import { withViewTransition } from "@/lib/motion";
import { takeHome, yen } from "@/lib/pay";
import { FIT_JA, FIT_VI, type Fit, type Match } from "@/lib/scoring";
import { earliestStart, fmtDate } from "@/lib/start";
import { Icon } from "../ui";
import { FlightPath } from "./FlightPath";

/** Wallet-style job pass: take-home pay is always the biggest thing on screen. */
export function JobPass({ job, p, m, fit, now, applied, active, guest }: { job: Job; p: Profile; m: Match; fit: Fit; now: number; applied?: boolean; active?: boolean; guest?: boolean }) {
  const ja = useLang() === "ja";
  const t = (vi: string, jp: string) => (ja ? jp : vi);
  const router = useRouter();
  const net = takeHome(job, p.relocate).net;
  const start = fmtDate(earliestStart(p, now + 864e5).date); // HR answers within 24h
  const peers = PEERS[job.id];
  const km = Math.round(distanceKm(p.city, job.city));
  const [path, setPath] = useState(false);
  const vtCard = !active ? ({ viewTransitionName: `pass-card-${job.id}` } as CSSProperties) : undefined;
  const vtTitle = !active ? ({ viewTransitionName: `pass-title-${job.id}` } as CSSProperties) : undefined;
  const vtNet = !active ? ({ viewTransitionName: `pass-net-${job.id}` } as CSSProperties) : undefined;
  // Stretched link: the whole pass opens the job, while the start-date button stays its own control.
  return (
    <div className="pass relative rounded-[26px] p-5 text-white pressable" style={vtCard}>
      <Link
        href={`/worker/jobs/${job.id}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          withViewTransition(() => router.push(`/worker/jobs/${job.id}`), { asyncRoute: true });
        }}
        aria-current={active ? "page" : undefined}
        aria-label={t(`${job.title}, ${job.company}, thực nhận ${yen(net)} mỗi tháng, bắt đầu sớm nhất ${start}, dự kiến`, `${job.title}、${job.company}、手取り月${yen(net)}、最短開始 ${start}（予定）`)}
        className="absolute inset-0 rounded-[26px] z-0"
      />
      <div className="relative pointer-events-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="t-sm font-semibold truncate">{job.company}</p>
          <p className="t-sm text-[#DCE3FC] flex items-center gap-1">
            <Icon name={job.verified ? "check-verified" : "hourglass"} size={14} solid={job.verified} />
            {job.verified ? t("KINTRA đã xác minh", "KINTRA確認済み") : t("Đang xác minh", "確認中")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1.5 t-sm font-bold">{guest ? t("Đang tuyển", "募集中") : m.gate.pass ? (ja ? FIT_JA[fit] : FIT_VI[fit]) : t("Không hợp visa", "在留資格の対象外")}</span>
      </div>
      <h2 className="text-[20px] leading-tight font-semibold tracking-[-0.025em] mt-3" style={vtTitle}>{job.title}</h2>
      <p className="mt-3">
        <span className="led block text-[44px] leading-none" style={vtNet} aria-hidden>{yen(net)}</span>
        <span className="t-sm text-[#DCE3FC] block mt-1.5">{t("thực nhận mỗi tháng · ước tính", "月の手取り · 目安")}</span>
      </p>
      <button className="pointer-events-auto mt-3 t-sm font-semibold flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 -ml-1" onClick={() => setPath(true)} aria-label={t(`Bắt đầu sớm nhất ${start}, dự kiến. Xem lộ trình pháp lý`, `最短開始 ${start}（予定）。手続きの流れを見る`)}>
        <Icon name="calendar" size={16} />{t(`Bắt đầu sớm nhất: ${start} · dự kiến`, `最短開始：${start}（予定）`)}<Icon name="chevron-right-01" size={14} />
      </button>
      <p className="mt-1 t-sm text-[#DCE3FC]">{ja ? SHIFT_JA[job.shift] : SHIFT_VI[job.shift]} · {ja ? CITIES[job.city].ja : CITIES[job.city].vi} · {km < 1 ? t("cùng thành phố với bạn", "同じ市内") : t(`~${km} km từ chỗ bạn`, `自宅から約${km}km`)}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.contractMonths && <span className="rounded-full bg-white/15 px-2.5 py-1 t-sm">{t(`Thử việc ${job.contractMonths} tháng${job.renewable ? " · có thể gia hạn" : ""}`, `試用${job.contractMonths}か月${job.renewable ? " · 更新可" : ""}`)}</span>}
        {peers && <span className="rounded-full bg-white/15 px-2.5 py-1 t-sm">{t(`${peers.count} người Việt đang làm ở đây`, `ベトナム人${peers.count}名が在籍`)}</span>}
        {applied && <span className="rounded-full bg-white text-[var(--color-content-accent-base)] px-2.5 py-1 t-sm font-semibold">{t("Đã ứng tuyển", "応募済み")}</span>}
      </div>
      </div>
      <FlightPath p={p} job={job} from={now + 864e5} open={path} onClose={() => setPath(false)} />
    </div>
  );
}
