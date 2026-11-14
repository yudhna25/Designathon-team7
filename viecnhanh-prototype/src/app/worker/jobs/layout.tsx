"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState, type ReactNode } from "react";
import { Button, Icon } from "@/components/ui";
import { BellLink, Screen, TopBar } from "@/components/worker/Shell";
import { JobPass } from "@/components/worker/Pass";
import { PeersTile } from "@/components/worker/Bento";
import { JobRow, Section } from "@/components/worker/JobRow";
import { CITIES, JOBS, PEERS, VISAS, distanceKm, type Job } from "@/lib/data";
import { takeHome } from "@/lib/pay";
import { fitOf, scoreMatch, type Match } from "@/lib/scoring";
import { isClosed, useApp, useNow } from "@/lib/store";

/** Home = full-width list with a right rail (page.tsx). Detail = full width, no narrow list beside it. */
export default function JobsLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const detail = path !== "/worker/jobs";
  if (detail) return <>{children}</>;
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:pr-8 max-w-[1180px]">
      <Suspense><JobList /></Suspense>
      <aside className="hidden lg:block pt-6">{children}</aside>
    </div>
  );
}

const FILTERS = [
  { id: "great", label: "Rất phù hợp" },
  { id: "dorm", label: "Có ký túc xá" },
  { id: "day", label: "Ca ngày" },
  { id: "near", label: "Gần tôi" },
  { id: "peers", label: "Có người Việt" },
  { id: "pay", label: "Thực nhận > ¥200k" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];
const NEAR_KM = 15;

function JobList() {
  const params = useSearchParams();
  const s = useApp();
  const p = s.profile!;
  const now = useNow(60000);
  const [q, setQ] = useState("");
  const [on, setOn] = useState<FilterId[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const rescored = params.get("rescored");

  const all = useMemo(() => JOBS.map((j) => ({ j, m: scoreMatch(p, j, s.config.weights) })), [p, s.config.weights]);
  const legal = all.filter((r) => r.m.gate.pass).sort((a, b) => b.m.total - a.m.total);
  const hidden = all.filter((r) => !r.m.gate.pass);
  const mine = s.apps.filter((a) => a.candidateId === "me");
  const applied = new Set(mine.filter((a) => !isClosed(a, s) || a.status === "approved").map((a) => a.jobId));
  const fit = (m: Match) => fitOf(m, s.config.threshold);
  const near = (j: Job) => distanceKm(p.city, j.city) <= NEAR_KM;

  const test: Record<FilterId, (r: { j: Job; m: Match }) => boolean> = {
    great: (r) => fit(r.m) === "great",
    dorm: (r) => r.j.dorm !== null,
    day: (r) => r.j.shift === "day",
    near: (r) => near(r.j),
    peers: (r) => !!PEERS[r.j.id],
    pay: (r) => takeHome(r.j, p.relocate).net > 200000,
  };
  const needle = q.trim().toLowerCase();
  const matches = legal.filter((r) => on.every((f) => test[f](r)) && (!needle || `${r.j.title} ${r.j.company} ${CITIES[r.j.city].vi}`.toLowerCase().includes(needle)));
  const searching = !!needle || on.length > 0;

  // Sections: each job appears once, in the first group it fits.
  const top = legal[0];
  const used = new Set<string>(top ? [top.j.id] : []);
  const take = (pred: (r: (typeof legal)[number]) => boolean) => legal.filter((r) => !used.has(r.j.id) && pred(r)).map((r) => (used.add(r.j.id), r));
  const best = take((r) => fit(r.m) === "great");
  const withPeers = take((r) => !!PEERS[r.j.id]);
  const nearby = take((r) => near(r.j));
  const fresh = take((r) => !!r.j.isNewPlant);
  const rest = take(() => true);
  const okCount = legal.filter((r) => fit(r.m) === "great").length;
  const peerJob = Object.keys(PEERS).find((id) => legal.some((r) => r.j.id === id));

  const row = (r: (typeof legal)[number]) => (
    <div key={r.j.id} className={rescored === r.j.id ? "rounded-[26px] ring-4 ring-[var(--color-border-accent-solid)]" : ""}>
      <JobRow job={r.j} p={p} fit={fit(r.m)} now={now} applied={applied.has(r.j.id)} />
    </div>
  );

  return (
    <Screen>
      <TopBar title="Việc phù hợp với bạn" sub={`Chào ${p.name.split(" ").slice(-2).join(" ")} · ${CITIES[p.city].vi}, Aichi`} right={<BellLink />} />
      <div className="px-5 lg:px-0 lg:pl-1 pb-6">
        <form className="flex items-center gap-2 rounded-full border border-[var(--c-input-border)] bg-surface pl-4 pr-1.5 h-14 focus-within:ring-2 focus-within:ring-[var(--color-border-accent-solid)]" role="search" onSubmit={(e) => e.preventDefault()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          <label htmlFor="job-q" className="sr-only">Tìm việc</label>
          <input id="job-q" className="flex-1 min-w-0 bg-transparent outline-none text-[16px]" placeholder="Tìm theo nghề, công ty, thành phố…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary btn-sm pressable !h-11 px-5">Tìm việc</button>
        </form>

        <div className="-mx-5 lg:mx-0 px-5 lg:px-0 mt-3 flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible no-scrollbar" role="group" aria-label="Lọc nhanh">
          {FILTERS.map((f) => {
            const active = on.includes(f.id);
            return (
              <button key={f.id} className="chip pressable !h-10 t-sm shrink-0" aria-pressed={active} onClick={() => setOn((x) => (active ? x.filter((y) => y !== f.id) : [...x, f.id]))}>
                {active && <Icon name="check" size={14} />}{f.label}
              </button>
            );
          })}
        </div>
        <p className="t-sm text-muted mt-3">{legal.length} việc đúng ngành visa · {okCount} rất phù hợp</p>

        {searching ? (
          <Section title="Kết quả" count={matches.length}>
            {matches.length ? matches.map(row) : (
              <div className="card-flat p-5 grid gap-3" role="status">
                <p className="t-sub">Chưa có việc khớp bộ lọc</p>
                <p className="text-muted">Bỏ bớt bộ lọc hoặc thử từ khác.</p>
                <Button variant="secondary" onClick={() => { setOn([]); setQ(""); }}>Xoá bộ lọc</Button>
              </div>
            )}
          </Section>
        ) : legal.length === 0 ? (
          <section className="card-flat p-5 grid gap-3 mt-6" role="status">
            <h2 className="t-sub">Chưa có việc phù hợp với visa hiện tại</h2>
            <p className="text-muted">Xem lý do các việc bị ẩn bên dưới và kiểm tra lại thông tin hồ sơ.</p>
            <Link href="/worker/onboarding?edit=1" className="btn btn-secondary pressable">Kiểm tra hồ sơ</Link>
          </section>
        ) : (
          <>
            <Section title="Việc phù hợp nhất với bạn">
              <JobPass job={top.j} p={p} m={top.m} fit={fit(top.m)} now={now} applied={applied.has(top.j.id)} />
              {best.map(row)}
            </Section>
            {(withPeers.length > 0 || peerJob) && (
              <Section title="Có người Việt đang làm">
                {peerJob && <PeersTile jobId={peerJob} />}
                {withPeers.map(row)}
              </Section>
            )}
            {nearby.length > 0 && <Section title={`Gần chỗ bạn ở · dưới ${NEAR_KM} km`}>{nearby.map(row)}</Section>}
            {fresh.length > 0 && <Section title="Nhà máy mới đang tuyển gấp">{fresh.map(row)}</Section>}
            {rest.length > 0 && <Section title="Việc khác trong ngành">{rest.map(row)}</Section>}
          </>
        )}

        {hidden.length > 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-line p-4">
            <button className="w-full flex items-center justify-between gap-3 text-left" aria-expanded={showHidden} onClick={() => setShowHidden((v) => !v)}>
              <span className="flex items-center gap-3"><Icon name="lock-01" /><span><b>{hidden.length} việc đã ẩn</b> <span className="text-muted">vì visa {VISAS[p.visa].short} không cho phép</span></span></span>
              <Icon name="chevron-down" className={`transition-transform duration-[var(--motion-base)] ${showHidden ? "rotate-180" : ""}`} />
            </button>
            {showHidden && (
              <ul className="mt-3 grid gap-2 t-sm">
                {hidden.map(({ j, m }) => <li key={j.id} className="well p-3"><b>{j.title}</b> · {j.company}<p className="text-muted mt-1">{!m.gate.pass && m.gate.reason}</p></li>)}
              </ul>
            )}
          </div>
        )}
        <p className="t-sm text-muted mt-6">Lương và mốc thời gian là ước tính. Bạn luôn là người quyết định ứng tuyển.</p>
      </div>
    </Screen>
  );
}
