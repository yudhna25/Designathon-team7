"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CITIES, jobById } from "@/lib/data";
import { displayStatus, useApp, useNow } from "@/lib/store";
import { useReveal } from "@/lib/motion";
import { tNow, useLang, useT } from "@/lib/i18n";
import { Avatar, Icon, Logo, Segmented, toast } from "../ui";

const NAV = [
  { href: "/worker/jobs", label: "Việc làm", ja: "求人", icon: "briefcase" },
  { href: "/worker/applications", label: "Hồ sơ đã gửi", ja: "応募履歴", icon: "file-check" },
  // Ví lương (EWA) tạm ẩn khỏi điều hướng; route /worker/wallet vẫn còn để demo trực tiếp.
  { href: "/worker/profile", label: "Tôi", ja: "マイページ", icon: "user-circle" },
] as const;

function usePending() {
  const now = useNow(5000);
  const s = useApp();
  return s.apps.filter((a) => a.candidateId === "me" && ["sent", "viewed"].includes(displayStatus(a, s, now))).length;
}

export function BottomNav() {
  const t = useT();
  const ja = useLang() === "ja";
  const path = usePathname();
  const pending = usePending();
  const active = NAV.findIndex((n) => path.startsWith(n.href));
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[color-mix(in_oklab,var(--color-bg-surface)_88%,transparent)] backdrop-blur-xl border-t border-hair safe-b" aria-label={t("Điều hướng chính", "メインナビゲーション")}>
      <ul className="relative grid h-[64px]" style={{ gridTemplateColumns: `repeat(${NAV.length}, minmax(0, 1fr))` }}>
        {active >= 0 && (
          <span aria-hidden className="absolute top-0 h-[2px] bg-solid transition-[left] duration-[var(--motion-slow)] [transition-timing-function:var(--ease-emphasized)]" style={{ left: `${(active * 100) / NAV.length}%`, width: `${100 / NAV.length}%` }} />
        )}
        {NAV.map((n, i) => (
          <li key={n.href}>
            <Link href={n.href} aria-current={i === active ? "page" : undefined} className={`pressable h-full flex flex-col items-center justify-center gap-1 t-sm ${i === active ? "text-[var(--color-content-accent-base)] font-semibold" : "text-[var(--color-content-accent-light)]"}`}>
              <span className="relative">
                <Icon name={n.icon} size={24} solid={i === active} />
                {n.href === "/worker/applications" && pending > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full ink text-[11px] leading-[18px] text-center font-semibold animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]">{pending}</span>
                )}
              </span>
              <span className="text-[12px] leading-none">{ja ? n.ja : n.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Desktop header (≥1024px) — replaces the old left column.
 * [logo → /worker/jobs] [search — fills the row] [language] [avatar + name → popover: Hồ sơ của tôi · Thông báo · …]
 * "Hồ sơ đã gửi" now lives inside "Hồ sơ của tôi" (avatar popover → /worker/profile);
 * on phones the BottomNav keeps both tabs.
 */
export function TopNav() {
  const t = useT();
  return (
    <header data-id="worker-topnav" className="hidden lg:block sticky top-0 z-40 border-b border-hair bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6">
        {/* Logo = về trang Việc làm; tab "Việc làm" riêng đã bỏ. */}
        <Link href="/worker/jobs" className="shrink-0 rounded-xl pressable" aria-label={t("Việc làm", "求人")}><Logo /></Link>
        <HeaderSearch />
        <LangMenu />
        <AccountMenu />
      </div>
    </header>
  );
}

/** Header search: on the jobs page it filters the list live (URL ?q=); elsewhere Enter opens the jobs page with the query. */
function HeaderSearch() {
  const t = useT();
  const path = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const onJobs = path === "/worker/jobs";
  const [q, setQ] = useState(params.get("q") ?? "");
  useEffect(() => { if (onJobs) setQ(params.get("q") ?? ""); }, [params, onJobs]);
  const go = (v: string) => router.replace(`/worker/jobs${v.trim() ? `?q=${encodeURIComponent(v)}` : ""}`, { scroll: false });
  return (
    <form role="search" className="flex flex-1 min-w-0 items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-content-neutral-strongest)_22%,transparent)] hover:border-[color-mix(in_oklab,var(--color-content-neutral-strongest)_36%,transparent)] bg-surface pl-4 pr-1.5 h-11 focus-within:ring-2 focus-within:ring-[var(--color-border-accent-solid)]"
      onSubmit={(e) => { e.preventDefault(); go(q); }}>
      <Icon name="search-md" size={18} className="text-muted" />
      <label htmlFor="top-q" className="sr-only">{t("Tìm việc", "求人を検索")}</label>
      <input id="top-q" className="flex-1 min-w-0 bg-transparent outline-none t-sm" placeholder={t("Tìm theo nghề, công ty, thành phố…", "職種・会社・市町村で検索…")} value={q}
        onChange={(e) => { setQ(e.target.value); if (onJobs) go(e.target.value); }} />
      {q && <button type="button" className="icon-btn sm pressable !size-8 text-muted" aria-label={t("Xoá từ khoá", "キーワードを消去")} onClick={() => { setQ(""); if (onJobs) go(""); }}><Icon name="x-medium" size={16} /></button>}
    </form>
  );
}

/** Small popover that opens on hover (mouse) and on click/focus (keyboard, touch); Esc or outside click closes. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const hover = {
    onMouseEnter: () => { if (timer.current) clearTimeout(timer.current); setOpen(true); },
    onMouseLeave: () => { timer.current = setTimeout(() => setOpen(false), 160); },
  };
  return { open, setOpen, ref, hover };
}

const POP = "absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-hair bg-surface p-2 shadow-[var(--shadow-bottom-3)] animate-[zen-slide-down_var(--motion-slow)_var(--ease-spring)_both]";
const ITEM = "pressable flex w-full items-center gap-3 rounded-xl px-3 h-11 text-left t-sm hover:bg-pale";

const LANGS = [
  { id: "vi", label: "Tiếng Việt" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
] as const;

/** Language dropdown: Tiếng Việt (default) and 日本語 switch the worker app; English is not built yet and says so. */
function LangMenu() {
  const t = useT();
  const lang = useLang();
  const setConfig = useApp((s) => s.setConfig);
  const current = LANGS.find((l) => l.id === lang)?.label ?? "Tiếng Việt";
  const { open, setOpen, ref, hover } = usePopover();
  return (
    <div ref={ref} className="relative shrink-0" {...hover}>
      <button type="button" className="pressable flex h-10 items-center gap-2 rounded-full px-3 t-sm hover:bg-pale" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Icon name="globe-02" size={18} />{current}<Icon name="chevron-down" size={16} className={`transition-transform duration-[var(--motion-base)] ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" aria-label={t("Ngôn ngữ", "言語")} className={`${POP} w-52`}>
          {LANGS.map((l) => (
            <button key={l.id} type="button" role="menuitemradio" aria-checked={l.id === lang} className={ITEM}
              onClick={() => {
                setOpen(false);
                if (l.id === "en") toast(t("English: bản demo chưa có tiếng Anh", "English: 英語版はまだありません"), "translate");
                else setConfig({ workerLang: l.id });
              }}>
              <span className="flex-1">{l.label}</span>
              {l.id === lang && <Icon name="check" size={16} className="text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Avatar + name. Popover: personal info, manage profile, display mode, sign out. */
function AccountMenu() {
  const t = useT();
  const { open, setOpen, ref, hover } = usePopover();
  const router = useRouter();
  const p = useApp((s) => s.profile);
  const pending = usePending();
  const theme = useApp((s) => s.config.theme);
  const setConfig = useApp((s) => s.setConfig);
  const logout = useApp((s) => s.logout);
  if (!p) return null;
  const city = t(CITIES[p.city]?.vi ?? "", CITIES[p.city]?.ja ?? "");
  return (
    <div ref={ref} className="relative shrink-0" {...hover}>
      <button type="button" className="pressable flex h-11 items-center gap-2.5 rounded-full pl-1 pr-3 hover:bg-pale" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="relative"><Avatar name={p.name} size={36} />{pending > 0 && <span aria-hidden className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-solid ring-2 ring-[var(--color-bg-canvas)]" />}</span>
        <span className="flex min-w-0 flex-col items-start text-left leading-tight">
          <span className="max-w-[160px] truncate t-sm font-semibold">{p.name}</span>
          <span className="max-w-[160px] truncate text-[12px] text-muted">{city ? `${city} · ${p.prefecture ?? "Aichi"}` : p.prefecture ?? "Aichi"}</span>
        </span>
        <Icon name="chevron-down" size={16} className={`text-muted transition-transform duration-[var(--motion-base)] ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" aria-label={t("Tài khoản", "アカウント")} className={POP}>
          <div className="flex items-center gap-3 px-3 pt-2 pb-3 border-b border-hair mb-1">
            <Avatar name={p.name} size={44} />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{p.name}</span>
              <span className="block truncate t-sm text-muted">{city ? `${city} · ${p.prefecture ?? "Aichi"}` : p.prefecture ?? "Aichi"}</span>
            </span>
          </div>
          <Link role="menuitem" href="/worker/profile" className={ITEM} onClick={() => setOpen(false)}><Icon name="user-circle" size={18} /><span className="flex-1">{t("Hồ sơ của tôi", "マイページ")}</span></Link>
          <Link role="menuitem" href="/worker/profile#ung-tuyen" className={ITEM} onClick={() => setOpen(false)}><Icon name="bell-01" size={18} /><span className="flex-1">{t("Thông báo", "お知らせ")}</span>{pending > 0 && <span className="badge badge-solid tnum" aria-label={t(`${pending} hồ sơ đang chờ`, `${pending}件が返信待ち`)}>{pending}</span>}</Link>
          <Link role="menuitem" href="/worker/onboarding?edit=1" className={ITEM} onClick={() => setOpen(false)}><Icon name="file-check" size={18} />{t("Quản lý hồ sơ", "プロフィール管理")}</Link>
          <div className="px-3 py-2">
            <p className="t-sm text-muted mb-2">{t("Giao diện", "表示モード")}</p>
            <Segmented label={t("Giao diện", "表示モード")} size="sm" value={theme} onChange={(v) => setConfig({ theme: v })}
              options={[{ value: "light", label: t("Sáng", "ライト") }, { value: "dark", label: t("Tối", "ダーク") }, { value: "system", label: t("Tự động", "自動") }]} />
          </div>
          <div className="border-t border-hair mt-1 pt-1">
            <button role="menuitem" type="button" className={`${ITEM} text-[var(--color-content-negative-base)]`}
              onClick={() => { setOpen(false); logout(); router.replace("/worker"); toast(t("Đã đăng xuất", "ログアウトしました"), "log-out-01"); }}>
              <Icon name="log-out-01" size={18} />{t("Đăng xuất", "ログアウト")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar({ title, back, right, sub }: { title?: ReactNode; back?: string | true; right?: ReactNode; sub?: ReactNode }) {
  const t = useT();
  const router = useRouter();
  return (
    <header className="sticky top-0 lg:top-16 z-20 bg-[color-mix(in_oklab,var(--color-bg-surface)_92%,transparent)] lg:bg-[color-mix(in_oklab,var(--color-bg-canvas)_92%,transparent)] backdrop-blur-xl border-b border-[var(--color-border-neutral-pale)] shadow-[var(--shadow-bottom-1)] mb-4 lg:mb-0 lg:border-0 lg:shadow-none">
      <div className="h-16 flex items-center gap-2 px-4 lg:px-0">
        {back ? (
          <button className="icon-btn pressable" aria-label={t("Quay lại", "戻る")} onClick={() => (back === true ? router.back() : router.push(back))}>
            <Icon name="arrow-left" />
          </button>
        ) : (
          <Link href="/worker/jobs" className="pr-1 lg:hidden" aria-label={t("Việc làm", "求人")}><Logo compact /></Link>
        )}
        <div className="flex-1 min-w-0 px-1">
          {title && <h1 className="t-sub truncate text-[var(--color-content-accent-base)]">{title}</h1>}
          {sub && <p className="t-sm text-muted truncate">{sub}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

/** Chuông thông báo (mobile). Trên desktop "Thông báo" nằm trong menu avatar, nên chuông ẩn từ 1024px. */
export function BellLink() {
  const t = useT();
  const pending = usePending();
  return (
    <Link href="/worker/applications" className="icon-btn pressable relative lg:hidden" aria-label={t(`Thông báo${pending ? `, ${pending} hồ sơ đang chờ` : ""}`, `お知らせ${pending ? `、${pending}件が返信待ち` : ""}`)}>
      <Icon name="bell-01" />
      {pending > 0 && <span className="absolute top-3 right-3 size-2 rounded-full bg-solid ring-2 ring-[var(--color-bg-canvas)]" />}
    </Link>
  );
}

/** Page wrapper: staggers [data-reveal] children on mount. */
export function Screen({ children, className = "", deps = [] }: { children: ReactNode; className?: string; deps?: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, deps);
  return <div ref={ref} className={className}>{children}</div>;
}

/**
 * Turns status changes made in the HR tab (or by the clock) into worker toasts.
 * Tracks what this tab has already shown in memory, so cross-tab rehydration can never double-fire.
 */
export function StatusNotifier() {
  const now = useNow(1000);
  const s = useApp();
  const shown = useRef<Record<string, string> | null>(null);
  useEffect(() => {
    const mine = s.apps.filter((a) => a.candidateId === "me");
    if (!shown.current) { shown.current = Object.fromEntries(mine.map((a) => [a.id, displayStatus(a, s, now)])); return; }
    for (const a of mine) {
      const st = displayStatus(a, s, now);
      const prev = shown.current[a.id];
      if (prev === st) continue;
      shown.current[a.id] = st;
      if (!prev) continue; // just applied — no toast
      const co = jobById(a.jobId)?.company ?? tNow("Nhà máy", "工場");
      if (st === "viewed") toast(tNow(`${co} đang xem hồ sơ của bạn`, `${co}があなたの応募を確認中です`), "eye");
      if (st === "approved") toast(tNow(`${co} mời bạn phỏng vấn · đã gửi qua Zalo OA`, `${co}から面接の案内 · Zalo OAにも送信しました`), "check-verified");
      if (st === "rejected") toast(tNow(`${co} đã trả lời · xem lý do và gợi ý`, `${co}から返信がありました · 理由と提案を確認`), "info-circle");
      if (st === "expired") toast(tNow(`${co} chưa trả lời sau 24h · có 3 việc gợi ý`, `${co}から24時間返信なし · おすすめの求人が3件あります`), "hourglass");
    }
  }, [now, s]);
  return null;
}
