"use client";
import Link from "next/link";
import { CITIES, PEERS, distanceKm, type Job, type Profile } from "@/lib/data";
import { SHIFT_VI } from "@/lib/labels";
import { takeHome, yen } from "@/lib/pay";
import { FIT_VI, type Fit, type Match } from "@/lib/scoring";
import { earliestStart, fmtDate } from "@/lib/start";
import { Icon } from "../ui";

/** Wallet-style job pass: take-home pay is always the biggest thing on screen. */
export function JobPass({ job, p, m, fit, now, applied, active }: { job: Job; p: Profile; m: Match; fit: Fit; now: number; applied?: boolean; active?: boolean }) {
  const net = takeHome(job, p.relocate).net;
  const start = fmtDate(earliestStart(p, now + 864e5).date); // HR answers within 24h
  const peers = PEERS[job.id];
  const km = Math.round(distanceKm(p.city, job.city));
  return (
    <Link
      href={`/worker/jobs/${job.id}`}
      aria-current={active ? "page" : undefined}
      aria-label={`${job.title}, ${job.company}, thực nhận ${yen(net)} mỗi tháng, bắt đầu sớm nhất ${start}, dự kiến`}
      className="pass block rounded-[26px] p-5 text-white pressable"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="t-sm font-semibold truncate">{job.company}</p>
          <p className="t-sm text-[#DCE3FC] flex items-center gap-1">
            <Icon name={job.verified ? "check-verified" : "hourglass"} size={14} solid={job.verified} />
            {job.verified ? "ViệcNhanh đã xác minh" : "Đang xác minh"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1.5 t-sm font-bold">{m.gate.pass ? FIT_VI[fit] : "Không hợp visa"}</span>
      </div>
      <h2 className="text-[20px] leading-tight font-semibold tracking-[-0.025em] mt-3">{job.title}</h2>
      <p className="mt-3">
        <span className="led block text-[44px] leading-none" aria-hidden>{yen(net)}</span>
        <span className="t-sm text-[#DCE3FC] block mt-1.5">thực nhận mỗi tháng · ước tính</span>
      </p>
      <p className="mt-3 t-sm font-semibold flex items-center gap-1.5"><Icon name="calendar" size={16} />Bắt đầu sớm nhất: {start} · dự kiến</p>
      <p className="mt-1 t-sm text-[#DCE3FC]">{SHIFT_VI[job.shift]} · {CITIES[job.city].vi} · {km < 1 ? "cùng thành phố với bạn" : `~${km} km từ chỗ bạn`}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.contractMonths && <span className="rounded-full bg-white/15 px-2.5 py-1 t-sm">Thử việc {job.contractMonths} tháng{job.renewable ? " · có thể gia hạn" : ""}</span>}
        {peers && <span className="rounded-full bg-white/15 px-2.5 py-1 t-sm">{peers.count} người Việt đang làm ở đây</span>}
        {applied && <span className="rounded-full bg-white text-[#1B22A7] px-2.5 py-1 t-sm font-semibold">Đã ứng tuyển</span>}
      </div>
    </Link>
  );
}
