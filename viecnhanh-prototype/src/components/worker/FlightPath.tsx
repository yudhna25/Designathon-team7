"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion";
import type { Job, Profile } from "@/lib/data";
import { jobTitle, useLang, useT } from "@/lib/i18n";
import { takeHome, yen } from "@/lib/pay";
import { fmtDate, legalPath } from "@/lib/start";
import { Icon, Sheet } from "../ui";

/** Legal flight-path: the immigration steps between "HR approves" and day one, locked to the worker's visa. */
export function FlightPath({ p, job, from, open, onClose }: { p: Profile; job: Job; from: number; open: boolean; onClose: () => void }) {
  const lang = useLang();
  const t = useT();
  const steps = legalPath(p, from);
  const [openKey, setOpenKey] = useState<string | null>(steps[0].key);
  const list = useRef<HTMLOListElement>(null);
  // Draw the road between milestones each time the sheet opens.
  useEffect(() => {
    if (!open || document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tmr = setTimeout(() => {
      const root = list.current;
      if (!root) return;
      gsap.fromTo(root.querySelectorAll("[data-fp-line]"), { scaleY: 0 }, { scaleY: 1, transformOrigin: "50% 0%", duration: 0.35, stagger: 0.12, ease: "power2.out" });
      gsap.fromTo(root.querySelectorAll("[data-fp-dot]"), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.12, ease: "back.out(2.2)", clearProps: "transform,opacity,visibility" });
    }, 80);
    return () => clearTimeout(tmr);
  }, [open]);
  const net = takeHome(job, p.relocate).net;
  const last = steps[steps.length - 1];
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("Lộ trình đến ngày đi làm", "初出勤までの手続き", "Timeline to day one")}
      footer={
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="t-sm text-muted">{t("Ngày đầu đi làm", "初出勤日")}</p>
              <p className="t-sub">{fmtDate(last.at)} · {t("dự kiến", "予定", "est.")}</p>
            </div>
            <div className="text-right">
              <p className="led text-[32px] leading-none" aria-hidden>{yen(net)}</p>
              <p className="t-sm text-muted mt-1">{t("thực nhận/tháng", "月の手取り", "take-home/mo")}<span className="sr-only"> {yen(net)}</span></p>
            </div>
          </div>
          <p className="t-sm text-muted mt-3 flex items-center gap-1.5"><Icon name="lock-01" size={14} />{t("Các bước là bắt buộc · ngày là dự kiến", "法的ステップは必須 · 日付は目安", "Legal steps are required · dates are estimates")}</p>
        </div>
      }
    >
      <p className="text-muted mb-4">{jobTitle(job, lang)} · {job.company}</p>
      <ol ref={list} className="relative grid gap-0">
        {steps.map((st, i) => {
          const isOpen = openKey === st.key;
          return (
            <li key={st.key} className="relative pl-9 pb-4">
              {i < steps.length - 1 && <span data-fp-line className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[#4260E6]/40" aria-hidden />}
              <span data-fp-dot className={`absolute left-0 top-0.5 grid size-6 place-items-center rounded-full ${i === 0 ? "fp-now bg-[var(--color-bg-accent-solid)] text-white" : st.legal ? "ink" : "bg-subtle"}`} aria-hidden>
                {st.legal ? <Icon name="lock-01" size={12} /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              <button className="w-full text-left flex items-start justify-between gap-3" aria-expanded={isOpen} onClick={() => setOpenKey(isOpen ? null : st.key)}>
                <span>
                  <span className="font-semibold block">{st.label}</span>
                  {st.legal && <span className="t-sm text-muted">{t("Thủ tục bắt buộc", "法定手続き", "Required legal step")}</span>}
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
