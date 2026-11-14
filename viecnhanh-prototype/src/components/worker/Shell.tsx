"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { jobById } from "@/lib/data";
import { displayStatus, useApp, useNow } from "@/lib/store";
import { useReveal } from "@/lib/motion";
import { Icon, Logo, toast } from "../ui";

const NAV = [
  { href: "/worker/jobs", label: "Việc làm", icon: "briefcase" },
  { href: "/worker/applications", label: "Hồ sơ đã gửi", icon: "file-check" },
  { href: "/worker/wallet", label: "Ví lương", icon: "wallet-02" },
  { href: "/worker/profile", label: "Tôi", icon: "user-circle" },
] as const;

function usePending() {
  const now = useNow(5000);
  const s = useApp();
  return s.apps.filter((a) => a.candidateId === "me" && ["sent", "viewed"].includes(displayStatus(a, s, now))).length;
}

export function BottomNav() {
  const path = usePathname();
  const pending = usePending();
  const active = NAV.findIndex((n) => path.startsWith(n.href));
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[color-mix(in_oklab,var(--color-bg-surface)_88%,transparent)] backdrop-blur-xl border-t border-hair safe-b" aria-label="Điều hướng chính">
      <ul className="relative grid grid-cols-4 h-[64px]">
        {active >= 0 && (
          <span aria-hidden className="absolute top-0 h-[2px] w-1/4 bg-solid transition-[left] duration-[var(--motion-slow)] [transition-timing-function:var(--ease-emphasized)]" style={{ left: `${active * 25}%` }} />
        )}
        {NAV.map((n, i) => (
          <li key={n.href}>
            <Link href={n.href} aria-current={i === active ? "page" : undefined} className={`pressable h-full flex flex-col items-center justify-center gap-1 t-sm ${i === active ? "text-fg font-semibold" : "text-muted"}`}>
              <span className="relative">
                <Icon name={n.icon} size={24} solid={i === active} />
                {n.href === "/worker/applications" && pending > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full ink text-[11px] leading-[18px] text-center font-semibold animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]">{pending}</span>
                )}
              </span>
              <span className="text-[12px] leading-none">{n.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const path = usePathname();
  const pending = usePending();
  const name = useApp((s) => s.profile?.name);
  return (
    <aside className="hidden lg:flex flex-col w-[248px] shrink-0 sticky top-0 h-dvh py-6 pl-6 pr-2">
      <Link href="/" className="px-3 mb-8"><Logo /></Link>
      <nav aria-label="Điều hướng chính">
        <ul className="space-y-1">
          {NAV.map((n) => {
            const on = path.startsWith(n.href);
            return (
              <li key={n.href}>
                <Link href={n.href} aria-current={on ? "page" : undefined} className={`pressable flex items-center gap-3 h-12 px-3 rounded-2xl ${on ? "bg-surface shadow-[var(--shadow-bottom-1)] font-semibold" : "text-muted hover:bg-pale"}`}>
                  <Icon name={n.icon} solid={on} />
                  <span className="flex-1">{n.label}</span>
                  {n.href === "/worker/applications" && pending > 0 && <span className="badge badge-solid tnum">{pending}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto px-3 t-sm text-muted">
        <p className="font-medium text-fg">{name}</p>
        <p>Hỗ trợ tiếng Việt 7h–22h</p>
      </div>
    </aside>
  );
}

export function TopBar({ title, back, right, sub }: { title?: ReactNode; back?: string | true; right?: ReactNode; sub?: ReactNode }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_92%,transparent)] backdrop-blur-xl transition-[background-color,box-shadow] duration-[var(--motion-base)] ${scrolled ? "shadow-[0_1px_0_var(--color-border-neutral-pale)]" : ""}`}>
      <div className="h-14 md:h-16 flex items-center gap-1 px-2 md:px-4">
        {back ? (
          <button className="icon-btn pressable" aria-label="Quay lại" onClick={() => (back === true ? router.back() : router.push(back))}>
            <Icon name="arrow-left" />
          </button>
        ) : (
          <Link href="/" className="px-3 lg:hidden" aria-label="Trang giới thiệu"><Logo compact /></Link>
        )}
        <div className="flex-1 min-w-0 px-1">
          {title && <h1 className="t-sub truncate">{title}</h1>}
          {sub && <p className="t-sm text-muted truncate">{sub}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function BellLink() {
  const pending = usePending();
  return (
    <Link href="/worker/applications" className="icon-btn pressable relative" aria-label={`Thông báo${pending ? `, ${pending} hồ sơ đang chờ` : ""}`}>
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
      const co = jobById(a.jobId)?.company ?? "Nhà máy";
      if (st === "viewed") toast(`${co} đang xem hồ sơ của bạn`, "eye");
      if (st === "approved") toast(`${co} mời bạn phỏng vấn · đã gửi qua Zalo OA`, "check-verified");
      if (st === "rejected") toast(`${co} đã trả lời · xem lý do và gợi ý`, "info-circle");
      if (st === "expired") toast(`${co} chưa trả lời sau 24h · có 3 việc gợi ý`, "hourglass");
    }
  }, [now, s]);
  return null;
}
