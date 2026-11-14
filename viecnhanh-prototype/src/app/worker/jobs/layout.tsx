"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon } from "@/components/ui";
import { BellLink, Screen, TopBar } from "@/components/worker/Shell";
import { JobCard } from "@/components/worker/Blocks";
import { JOBS, VISAS } from "@/lib/data";
import { fitOf, matchChips, scoreMatch } from "@/lib/scoring";
import { isClosed, useApp } from "@/lib/store";
import { Flip } from "@/lib/motion";

export default function JobsLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const detail = path !== "/worker/jobs";
  return (
    <div className="lg:grid lg:grid-cols-[minmax(360px,420px)_1fr] lg:gap-8 lg:pr-8">
      <div className={`${detail ? "hidden lg:block" : ""} lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto no-scrollbar`}>
        <Suspense><JobList activeId={detail ? path.split("/").pop() : undefined} /></Suspense>
      </div>
      <div className={detail ? "" : "hidden lg:block"}>{children}</div>
    </div>
  );
}

function JobList({ activeId }: { activeId?: string }) {
  const params = useSearchParams();
  const s = useApp();
  const p = s.profile!;
  const [showHidden, setShowHidden] = useState(false);
  const [filter, setFilter] = useState<"all" | "ok">("all");
  // After "Bổ sung thông tin" we briefly show the old order, then let Flip move the card to its new rank.
  const rescored = params.get("rescored");
  const from = Number(params.get("from"));
  const [settled, setSettled] = useState(!rescored);
  useEffect(() => { if (!rescored) return; const t = setTimeout(() => setSettled(true), 650); return () => clearTimeout(t); }, [rescored]);

  const all = useMemo(() => JOBS.map((j) => ({ j, m: scoreMatch(p, j, s.config.weights) })), [p, s.config.weights]);
  const visible = all
    .filter((r) => r.m.gate.pass && (filter === "all" || r.m.total >= s.config.threshold))
    .sort((a, b) => sortScore(b) - sortScore(a));
  function sortScore(r: (typeof all)[number]) { return !settled && r.j.id === rescored && from ? from : r.m.total; }
  const hidden = all.filter((r) => !r.m.gate.pass);
  const applied = new Set(s.apps.filter((a) => a.candidateId === "me" && (!isClosed(a, s) || a.status === "approved")).map((a) => a.jobId));

  const list = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const order = visible.map((r) => r.j.id).join();
  useLayoutEffect(() => {
    const els = list.current?.querySelectorAll("[data-flip-id]");
    if (!els) return;
    if (flip.current) Flip.from(flip.current, { duration: 0.9, ease: "expo.inOut", absolute: false, nested: true, scale: false });
    flip.current = Flip.getState(els);
  }, [order]);

  const okCount = all.filter((r) => r.m.gate.pass && r.m.total >= s.config.threshold).length;
  return (
    <Screen>
      <TopBar title="Việc phù hợp với bạn" sub={`${okCount} việc rất phù hợp · xếp theo mức phù hợp`} right={<BellLink />} />
      <div className="px-5 lg:px-0 lg:pl-1">
        <div className="flex gap-2 mb-4" data-reveal role="group" aria-label="Lọc việc">
          <button className="chip pressable !h-9 t-sm" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Tất cả · {all.length - hidden.length}</button>
          <button className="chip pressable !h-9 t-sm" aria-pressed={filter === "ok"} onClick={() => setFilter("ok")}>Rất phù hợp · {okCount}</button>
        </div>
        <div ref={list} className="grid grid-cols-1 gap-3">
          {visible.map(({ j, m }) => (
            <div key={j.id} data-reveal data-flip-id={j.id}>
              <JobCard job={j} relocate={p.relocate} m={m} fit={fitOf(m, s.config.threshold)} chips={matchChips(p, j, m)} applied={applied.has(j.id)} active={activeId === j.id} highlight={!!(rescored === j.id && from)} />
            </div>
          ))}
        </div>
        {visible.length === 0 && (
          <section className="card-flat p-5 grid gap-3" role="status">
            <h2 className="t-sub">{filter === "ok" ? "Chưa có việc ở mức Rất phù hợp" : "Chưa có việc phù hợp với visa hiện tại"}</h2>
            <p className="text-muted">{filter === "ok" ? "Bạn vẫn có thể xem các việc khác và quyết định ứng tuyển. Mức gợi ý không thay cho quyết định của bạn." : "Xem lý do các việc bị ẩn bên dưới và kiểm tra lại thông tin hồ sơ."}</p>
            {filter === "ok" ? <Button variant="secondary" onClick={() => setFilter("all")}>Xem tất cả việc</Button> : <Link href="/worker/onboarding?edit=1" className="btn btn-secondary pressable">Kiểm tra hồ sơ</Link>}
          </section>
        )}
        {hidden.length > 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-line p-4" data-reveal>
            <button className="w-full flex items-center justify-between gap-3 text-left" aria-expanded={showHidden} onClick={() => setShowHidden((v) => !v)}>
              <span className="flex items-center gap-3"><Icon name="lock-01" /><span><b>{hidden.length} việc đã ẩn</b> <span className="text-muted">vì visa {VISAS[p.visa].short} không cho phép</span></span></span>
              <Icon name="chevron-down" className={`transition-transform duration-[var(--motion-base)] ${showHidden ? "rotate-180" : ""}`} />
            </button>
            {showHidden && (
              <ul className="mt-3 grid gap-2 t-sm animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)]">
                {hidden.map(({ j, m }) => (
                  <li key={j.id} className="well p-3"><b>{j.title}</b> · {j.company}<p className="text-muted mt-1">{!m.gate.pass && m.gate.reason}</p></li>
                ))}
              </ul>
            )}
          </div>
        )}
        <p className="t-sm text-muted mt-6 mb-4 lg:mb-10" data-reveal>Điểm do AI tính từ hồ sơ của bạn. Bạn luôn là người quyết định ứng tuyển.</p>
      </div>
    </Screen>
  );
}
