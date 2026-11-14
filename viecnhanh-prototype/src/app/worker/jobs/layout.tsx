"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState, type ReactNode } from "react";
import { Button, Icon } from "@/components/ui";
import { BellLink, Screen, TopBar } from "@/components/worker/Shell";
import { JobPass } from "@/components/worker/Pass";
import { PeersTile } from "@/components/worker/Bento";
import { JobRow, Section } from "@/components/worker/JobRow";
import { CITIES, JOBS, PEERS, distanceKm, type Job } from "@/lib/data";
import { takeHome } from "@/lib/pay";
import { fitOf, scoreMatch, type Match } from "@/lib/scoring";
import { isClosed, loginThenReturn, useApp, useNow, useViewer } from "@/lib/store";
import { useT } from "@/lib/i18n";

/** Home = full-width list with a right rail (page.tsx). Detail = full width, no narrow list beside it. */
export default function JobsLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const detail = path !== "/worker/jobs";
  if (detail) return <>{children}</>;
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
      <Suspense><JobList /></Suspense>
      <aside className="hidden lg:block pt-6">{children}</aside>
    </div>
  );
}

const FILTERS = [
  { id: "great", label: "Rất phù hợp", ja: "高い適合" },
  { id: "dorm", label: "Có ký túc xá", ja: "寮あり" },
  { id: "day", label: "Ca ngày", ja: "日勤" },
  { id: "near", label: "Gần tôi", ja: "近い" },
  { id: "peers", label: "Có người Việt", ja: "ベトナム人在籍" },
  { id: "pay", label: "Thực nhận > ¥200k", ja: "手取り¥20万以上" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];
const NEAR_KM = 15;

function JobList() {
  const t = useT();
  const params = useSearchParams();
  const s = useApp();
  const { p, guest } = useViewer();
  const now = useNow(60000);
  const router = useRouter();
  // Từ khoá nằm trên URL (?q=) để ô tìm ở header (desktop) và ô tìm trong trang (mobile) dùng chung.
  const q = params.get("q") ?? "";
  const setQ = (v: string) => router.replace(`/worker/jobs${v.trim() ? `?q=${encodeURIComponent(v)}` : ""}`, { scroll: false });
  const [on, setOn] = useState<FilterId[]>([]);
  const rescored = params.get("rescored");

  const all = useMemo(() => JOBS.map((j) => ({ j, m: scoreMatch(p, j, s.config.weights) })), [p, s.config.weights]);
  // Guests see every job (no visa to check yet), key client first, then by take-home.
  const legal = guest
    ? [...all].sort((a, b) => Number(!!b.j.contractMonths) - Number(!!a.j.contractMonths) || takeHome(b.j, true).net - takeHome(a.j, true).net)
    : all.filter((r) => r.m.gate.pass).sort((a, b) => b.m.total - a.m.total);
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
  const best = guest ? [] : take((r) => fit(r.m) === "great");
  const nearby = guest ? [] : take((r) => near(r.j));
  const fresh = take((r) => !!r.j.isNewPlant);
  const rest = take(() => true);
  const peerJob = Object.keys(PEERS).find((id) => legal.some((r) => r.j.id === id));

  const row = (r: (typeof legal)[number]) => (
    <div key={r.j.id} className={rescored === r.j.id ? "rounded-[26px] ring-4 ring-[var(--color-border-accent-solid)]" : ""}>
      <JobRow job={r.j} p={p} fit={fit(r.m)} now={now} applied={applied.has(r.j.id)} guest={guest} />
    </div>
  );

  return (
    <Screen>
      <TopBar title={guest ? t("Việc làm tại Aichi", "愛知県の求人") : t("Việc phù hợp với bạn", "あなたに合う求人")} sub={guest ? t("Đúng tay nghề · lương thực nhận rõ ràng", "スキルに合う · 手取りが明確") : t(`Chào ${p.name.split(" ").slice(-2).join(" ")} · ${CITIES[p.city].vi}, Aichi`, `こんにちは、${p.name.split(" ").slice(-2).join(" ")}さん · 愛知県${CITIES[p.city].ja}`)} right={guest ? <button className="btn btn-primary btn-sm pressable" onClick={() => router.push(loginThenReturn("/worker/jobs"))}>{t("Đăng nhập", "ログイン")}</button> : <BellLink />} />
      <div className="px-5 lg:px-0 pb-6">
        {guest && (
          <section className="pass relative rounded-[26px] p-5 text-white mb-4" aria-labelledby="guest-h">
            <div className="relative">
              <p className="t-sm text-[#DCE3FC]">{t("Miễn phí cho người lao động", "労働者は無料")}</p>
              <h2 id="guest-h" className="text-[22px] font-semibold tracking-[-0.025em] mt-1 leading-tight">{t("Đăng nhập bằng Zalo để xem việc hợp tay nghề của bạn", "Zaloでログインして、あなたのスキルに合う求人を見る")}</h2>
              <p className="t-sm text-[#DCE3FC] mt-2">{t("3 câu hỏi · AI kiểm visa và chấm mức phù hợp · ứng tuyển, HR trả lời trong 24h.", "3つの質問 · AIが在留資格と適合度を確認 · 応募後24時間以内に回答")}</p>
              <button className="btn btn-lg pressable mt-4 bg-white text-[#1B22A7] font-semibold w-full sm:w-auto" onClick={() => router.push(loginThenReturn("/worker/jobs"))}>{t("Đăng nhập · 30 giây", "ログイン · 30秒")}</button>
            </div>
          </section>
        )}
        <form className="lg:hidden flex items-center gap-2 rounded-full border border-[var(--c-input-border)] bg-surface pl-4 pr-1 h-12 focus-within:ring-2 focus-within:ring-[var(--color-border-accent-solid)]" role="search" onSubmit={(e) => e.preventDefault()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
          <label htmlFor="job-q" className="sr-only">{t("Tìm việc", "求人を検索")}</label>
          <input id="job-q" className="flex-1 min-w-0 bg-transparent outline-none text-[16px]" placeholder={t("Tìm theo nghề, công ty, thành phố…", "職種・会社・市町村で検索…")} value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary btn-sm pressable !h-10 px-4">{t("Tìm việc", "検索")}</button>
        </form>

        <div className="-mx-5 lg:mx-0 px-5 lg:px-0 mt-3 lg:mt-0 flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible no-scrollbar" role="group" aria-label={t("Lọc nhanh", "クイック絞り込み")}>
          {FILTERS.filter((f) => !guest || (f.id !== "great" && f.id !== "near")).map((f) => {
            const active = on.includes(f.id);
            return (
              <button key={f.id} className="chip pressable !h-7 !px-3 !gap-1 t-sm shrink-0" aria-pressed={active} onClick={() => setOn((x) => (active ? x.filter((y) => y !== f.id) : [...x, f.id]))}>
                {active && <Icon name="check" size={14} />}{t(f.label, f.ja)}
              </button>
            );
          })}
        </div>

        {searching ? (
          <Section title={t("Kết quả", "検索結果")} count={matches.length}>
            {matches.length ? matches.map(row) : (
              <div className="card-flat p-5 grid gap-3 col-span-full" role="status">
                <p className="t-sub">{t("Chưa có việc khớp bộ lọc", "条件に合う求人がありません")}</p>
                <p className="text-muted">{t("Bỏ bớt bộ lọc hoặc thử từ khác.", "条件を減らすか、別のキーワードをお試しください。")}</p>
                <Button variant="secondary" onClick={() => { setOn([]); setQ(""); }}>{t("Xoá bộ lọc", "条件をクリア")}</Button>
              </div>
            )}
          </Section>
        ) : legal.length === 0 ? (
          <section className="card-flat p-5 grid gap-3 mt-6" role="status">
            <h2 className="t-sub">{t("Chưa có việc phù hợp với visa hiện tại", "現在の在留資格に合う求人はまだありません")}</h2>
            <p className="text-muted">{t("Kiểm tra lại thông tin visa và tay nghề trong hồ sơ.", "プロフィールの在留資格とスキルをご確認ください。")}</p>
            <Link href="/worker/onboarding?edit=1" className="btn btn-secondary pressable">{t("Kiểm tra hồ sơ", "プロフィールを確認")}</Link>
          </section>
        ) : (
          <>
            <Section title={guest ? t("Việc nổi bật", "注目の求人") : t("Việc phù hợp nhất với bạn", "最もあなたに合う求人")}>
              <div className="col-span-full"><JobPass job={top.j} p={p} m={top.m} fit={fit(top.m)} now={now} applied={applied.has(top.j.id)} guest={guest} /></div>
              {best.map(row)}
            </Section>
            {/* Desktop: khối "Có người Việt đang làm" nằm ở cột phải (page.tsx), thay cho Lộ trình. Mobile giữ ở đây. */}
            {peerJob && (
              <div className="lg:hidden">
                <Section title={t("Có người Việt đang làm", "ベトナム人が働いている職場")}>
                  <div className="col-span-full"><PeersTile jobId={peerJob} /></div>
                </Section>
              </div>
            )}
            {nearby.length > 0 && <Section title={t(`Gần chỗ bạn ở · dưới ${NEAR_KM} km`, `自宅から${NEAR_KM}km以内`)}>{nearby.map(row)}</Section>}
            {fresh.length > 0 && <Section title={t("Nhà máy mới đang tuyển gấp", "新工場・急募")}>{fresh.map(row)}</Section>}
            {rest.length > 0 && <Section title={t("Việc khác trong ngành", "同じ分野のその他の求人")}>{rest.map(row)}</Section>}
          </>
        )}

        <p className="t-sm text-muted mt-6">{t("Lương và mốc thời gian là ước tính. Bạn luôn là người quyết định ứng tuyển.", "給与と日程は目安です。応募するかどうかはいつもあなたが決めます。")}</p>
      </div>
    </Screen>
  );
}
