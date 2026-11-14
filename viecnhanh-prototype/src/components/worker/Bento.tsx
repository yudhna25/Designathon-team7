"use client";
import Link from "next/link";
import { useState } from "react";
import { SenpaiSheet } from "./SenpaiSheet";
import { useRouter } from "next/navigation";
import { loginThenReturn } from "@/lib/store";
import { PEERS, type Job, type Profile } from "@/lib/data";
import { SHOWCASE } from "@/lib/showcase";
import { suggestImprovements, type Chip, type Fit } from "@/lib/scoring";
import { deadlineOf, fmtLeft, isClosed, useApp, useNow, type Application } from "@/lib/store";
import { Avatar, Icon, MatchChips, ScoreRing } from "../ui";

/** "Người Việt ở đây": social proof + the door to an anonymous hometown senpai. */
export function PeersTile({ jobId, className = "", onSeePeers }: { jobId: string; className?: string; onSeePeers?: () => void }) {
  const data = PEERS[jobId];
  const [ask, setAsk] = useState(false);
  const router = useRouter();
  const authed = useApp((s) => !!s.auth && !!s.profile);
  if (!data) {
    return (
      <section className={`card-flat p-4 ${className}`} aria-label="Người Việt ở đây">
        <p className="t-sm font-semibold text-muted">Người Việt ở đây</p>
        <p className="mt-1">Chưa có người Việt nào làm ở đây. Bạn có thể là người đầu tiên.</p>
        {onSeePeers ? (
          <button type="button" onClick={onSeePeers} className="t-sm font-semibold text-brand mt-2 inline-flex items-center gap-1 underline underline-offset-4">Xem việc có người Việt</button>
        ) : (
          <Link href="/worker/jobs/mikawa-cnc" className="t-sm font-semibold text-brand mt-2 inline-flex items-center gap-1 underline underline-offset-4">Xem việc có người Việt</Link>
        )}
      </section>
    );
  }
  const lead = data.peers[0];
  const canAsk = data.peers.some((x) => x.askable && x.attendanceVerified);
  return (
    <section className={`card-flat p-4 ${className}`} aria-label="Người Việt ở đây">
      <div className="flex items-start gap-3">
        <span className="flex mt-0.5">{data.peers.slice(0, 3).map((x, i) => <span key={x.id} className={i ? "-ml-2" : ""}><Avatar name={x.name} size={32} src={SHOWCASE.avatars[x.id]} /></span>)}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{data.count} người Việt đang làm ở đây</p>
          <p className="t-sm text-muted line-clamp-2">“{lead.quote}” · {lead.name.split(" ").pop()}</p>
        </div>
        <span className="ml-auto text-[18px] font-bold text-brand tnum shrink-0">{lead.rating.toFixed(1).replace(".", ",")}★</span>
      </div>
      {canAsk && (
        <button className="btn btn-secondary btn-sm pressable mt-3 w-full" onClick={() => (authed ? setAsk(true) : router.push(loginThenReturn(location.pathname)))}>
          <Icon name="message-chat-circle" size={16} />Hỏi Senpai cùng quê · ẩn danh
        </button>
      )}
      {authed && <SenpaiSheet jobId={jobId} open={ask} onClose={() => setAsk(false)} />}
    </section>
  );
}

/** Bento under the pass. Tiles change with the pass in view. */
export function Bento({ job, p, chips, fit, app, onSeePeers }: { job: Job; p: Profile; chips: Chip[]; fit: Fit; app?: Application; onSeePeers?: () => void }) {
  const s = useApp();
  const now = useNow();
  const open = app && !isClosed(app, s);
  const steps = fit === "great" ? 0 : Math.max(1, suggestImprovements(p, job, s.config.weights).length);
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      <PeersTile key={job.id} jobId={job.id} className="col-span-2" onSeePeers={onSeePeers} />
      <section className="card-flat p-4" aria-label="Tiêu chí">
        <p className="t-sm font-semibold text-muted mb-2">Tiêu chí</p>
        <MatchChips chips={chips} max={4} />
      </section>
      {open ? (
        <section className="card-flat p-4" aria-label="HR còn bao lâu">
          <p className="t-sm font-semibold text-muted">HR trả lời trong</p>
          <div className="mt-2 flex items-center gap-2">
            <ScoreRing value={Math.round((Math.max(0, deadlineOf(app, s) - now) / (s.config.deadlineH * 36e5)) * 100)} size={52} stroke={5} label="Thời gian HR còn lại">
              <Icon name="hourglass" size={16} />
            </ScoreRing>
            <span className="mono t-sm font-semibold">{fmtLeft(deadlineOf(app, s) - now)}</span>
          </div>
        </section>
      ) : steps > 0 ? (
        <Link href={`/worker/improve?job=${job.id}`} className="card-flat p-4 pressable block">
          <p className="t-sm font-semibold text-muted">Lộ trình tay nghề</p>
          <p className="font-semibold mt-1">Còn {steps} bước để rất phù hợp</p>
          <p className="t-sm text-brand font-semibold mt-2 flex items-center gap-1">Xem cách<Icon name="arrow-right" size={14} /></p>
        </Link>
      ) : (
        <section className="card-flat p-4" aria-label="Sẵn sàng">
          <p className="t-sm font-semibold text-muted">Sẵn sàng</p>
          <p className="font-semibold mt-1 flex items-center gap-1.5"><Icon name="check-verified" solid size={18} />Đủ điều kiện ứng tuyển</p>
        </section>
      )}
      <Link href="/worker/ask" className="col-span-2 card-flat p-4 pressable flex items-center gap-3">
        <Icon name="stars-01" solid />
        <span className="flex-1"><b className="block">Hỏi trợ lý AI</b><span className="t-sm text-muted">“Việc nào lương thực nhận trên ¥200k?”</span></span>
        <Icon name="chevron-right-01" />
      </Link>
    </div>
  );
}
