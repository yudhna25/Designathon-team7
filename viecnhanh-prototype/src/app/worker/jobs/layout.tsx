"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon } from "@/components/ui";
import { BellLink, Screen, TopBar } from "@/components/worker/Shell";
import { JobPass } from "@/components/worker/Pass";
import { Bento } from "@/components/worker/Bento";
import { JOBS, VISAS } from "@/lib/data";
import { fitOf, matchChips, scoreMatch } from "@/lib/scoring";
import { isClosed, useApp, useNow } from "@/lib/store";

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
  const rescored = params.get("rescored");
  const now = useNow(60000);

  const all = useMemo(() => JOBS.map((j) => ({ j, m: scoreMatch(p, j, s.config.weights) })), [p, s.config.weights]);
  const visible = all
    .filter((r) => r.m.gate.pass && (filter === "all" || r.m.total >= s.config.threshold))
    .sort((a, b) => b.m.total - a.m.total);
  const hidden = all.filter((r) => !r.m.gate.pass);
  const mine = s.apps.filter((a) => a.candidateId === "me");
  const applied = new Set(mine.filter((a) => !isClosed(a, s) || a.status === "approved").map((a) => a.jobId));

  // Pass carousel: the pass nearest the centre drives the bento below.
  const strip = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const order = visible.map((r) => r.j.id).join();
  const onStrip = () => {
    const root = strip.current;
    if (!root) return;
    const mid = root.getBoundingClientRect().left + root.clientWidth / 2;
    let best = 0, dist = Infinity;
    root.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => {
      const r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
      if (d < dist) { dist = d; best = Number(el.dataset.i); }
    });
    setIdx(best);
  };
  useEffect(() => setIdx(0), [order]);
  useEffect(() => {
    const i = visible.findIndex((r) => r.j.id === (rescored ?? activeId));
    if (i > 0) strip.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
    onStrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rescored, activeId, order]);
  const cur = visible[Math.min(idx, visible.length - 1)];

  const okCount = all.filter((r) => r.m.gate.pass && r.m.total >= s.config.threshold).length;
  return (
    <Screen>
      <TopBar title="Việc phù hợp với bạn" sub={`${okCount} việc rất phù hợp · xếp theo mức phù hợp`} right={<BellLink />} />
      <div className="px-5 lg:px-0 lg:pl-1">
        <div className="flex gap-2 mb-4" data-reveal role="group" aria-label="Lọc việc">
          <button className="chip pressable !h-9 t-sm" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Tất cả · {all.length - hidden.length}</button>
          <button className="chip pressable !h-9 t-sm" aria-pressed={filter === "ok"} onClick={() => setFilter("ok")}>Rất phù hợp · {okCount}</button>
        </div>
        {visible.length > 0 && (
          <>
            <div ref={strip} onScroll={onStrip} className="-mx-5 lg:mx-0 px-5 lg:px-0 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1" role="list" aria-label="Việc phù hợp, vuốt ngang để xem">
              {visible.map(({ j, m }, i) => (
                <div key={j.id} data-i={i} role="listitem" className={`snap-center shrink-0 w-[86%] lg:w-full ${rescored === j.id ? "ring-4 ring-[var(--color-border-accent-solid)] rounded-[30px]" : ""}`}>
                  <JobPass job={j} p={p} m={m} fit={fitOf(m, s.config.threshold)} now={now} applied={applied.has(j.id)} active={activeId === j.id} />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1.5 mt-3" aria-hidden>
              {visible.map((r, i) => <i key={r.j.id} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-[18px] bg-[var(--color-bg-accent-solid,#1B22A7)]" : "w-1.5 bg-subtle"}`} />)}
            </div>
            {cur && <Bento job={cur.j} p={p} chips={matchChips(p, cur.j, cur.m)} fit={fitOf(cur.m, s.config.threshold)} app={mine.filter((a) => a.jobId === cur.j.id).at(-1)} />}
          </>
        )}
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
