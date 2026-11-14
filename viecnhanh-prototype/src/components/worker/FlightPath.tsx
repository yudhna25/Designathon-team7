"use client";
import { useState } from "react";
import type { Job, Profile } from "@/lib/data";
import { takeHome, yen } from "@/lib/pay";
import { fmtDate, legalPath } from "@/lib/start";
import { Icon, Sheet } from "../ui";

/** Legal flight-path: the immigration steps between "HR approves" and day one, locked to the worker's visa. */
export function FlightPath({ p, job, from, open, onClose }: { p: Profile; job: Job; from: number; open: boolean; onClose: () => void }) {
  const steps = legalPath(p, from);
  const [openKey, setOpenKey] = useState<string | null>(steps[0].key);
  const net = takeHome(job, p.relocate).net;
  const last = steps[steps.length - 1];
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Lộ trình đến ngày đi làm"
      footer={
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="t-sm text-muted">Ngày đầu đi làm</p>
              <p className="t-sub">{fmtDate(last.at)} · dự kiến</p>
            </div>
            <div className="text-right">
              <p className="led text-[32px] leading-none" aria-hidden>{yen(net)}</p>
              <p className="t-sm text-muted mt-1">thực nhận/tháng<span className="sr-only"> {yen(net)}</span></p>
            </div>
          </div>
          <p className="t-sm text-muted mt-3 flex items-center gap-1.5"><Icon name="lock-01" size={14} />Các bước là bắt buộc · ngày là dự kiến</p>
        </div>
      }
    >
      <p className="text-muted mb-4">{job.title} · {job.company}</p>
      <ol className="relative grid gap-0">
        {steps.map((st, i) => {
          const isOpen = openKey === st.key;
          return (
            <li key={st.key} className="relative pl-9 pb-4">
              {i < steps.length - 1 && <span className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-subtle" aria-hidden />}
              <span className={`absolute left-0 top-0.5 grid size-6 place-items-center rounded-full ${i === 0 ? "fp-now bg-[#1B22A7] text-white" : st.legal ? "ink" : "bg-subtle"}`} aria-hidden>
                {st.legal ? <Icon name="lock-01" size={12} /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              <button className="w-full text-left flex items-start justify-between gap-3" aria-expanded={isOpen} onClick={() => setOpenKey(isOpen ? null : st.key)}>
                <span>
                  <span className="font-semibold block">{st.label}</span>
                  {st.legal && <span className="t-sm text-muted">Thủ tục bắt buộc</span>}
                </span>
                <span className="mono t-sm shrink-0">{fmtDate(st.at)}</span>
              </button>
              {isOpen && <p className="t-sm text-muted mt-1.5">{st.note}</p>}
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}
