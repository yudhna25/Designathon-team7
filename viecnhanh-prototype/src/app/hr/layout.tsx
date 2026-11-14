"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, Icon, Logo, Segmented } from "@/components/ui";
import { hrT } from "@/lib/hr-i18n";
import { displayStatus, useApp, useHydrated, useNow, deadlineOf } from "@/lib/store";
import { KEY_JOB_ID, jobById } from "@/lib/data";

export default function HRLayout({ children }: { children: ReactNode }) {
  const ready = useHydrated();
  const path = usePathname();
  const s = useApp();
  const now = useNow(1000);
  const t = hrT(s.config.hrLang);
  if (!ready) return <div className="min-h-dvh bg-canvas" />;
  const due = s.apps.filter((a) => a.jobId === KEY_JOB_ID && ["sent", "viewed"].includes(displayStatus(a, s, now)) && deadlineOf(a, s) - now < s.config.reminderH * 36e5).length;
  const key = jobById(KEY_JOB_ID)!;

  const nav = [
    { href: "/hr", label: t.nav.candidates, icon: "users", on: path.startsWith("/hr"), badge: due },
    { href: "#", label: t.nav.jobs, icon: "briefcase" },
    { href: "#", label: t.nav.reports, icon: "layout-grid-01" },
    { href: "#", label: t.nav.settings, icon: "settings-02" },
  ] as const;

  return (
    <div className="min-h-dvh bg-canvas lg:flex" lang={s.config.hrLang}>
      <aside className="hidden lg:flex flex-col w-[248px] shrink-0 sticky top-0 h-dvh p-5 hair-b lg:border-b-0 lg:border-r lg:border-hair bg-surface">
        <Link href="/" className="px-2 mb-1"><Logo /></Link>
        <p className="px-2 t-sm text-muted mb-8 ml-9 -mt-1">{t.brand}</p>
        <div className="px-3 py-3 rounded-2xl well mb-6">
          <p className="t-sm text-muted">{key.companyJa}</p>
          <p className="font-semibold">{key.company}</p>
        </div>
        <nav aria-label="HR">
          <ul className="space-y-1">
            {nav.map((n) => (
              <li key={n.label}>
                <Link href={n.href} aria-current={"on" in n && n.on ? "page" : undefined} aria-disabled={n.href === "#" || undefined} onClick={(e) => n.href === "#" && e.preventDefault()}
                  className={`flex items-center gap-3 h-10 px-3 rounded-xl ${"on" in n && n.on ? "bg-subtle font-semibold" : n.href === "#" ? "text-faint cursor-default" : "text-muted hover:bg-pale"}`}>
                  <Icon name={n.icon} size={18} solid={"on" in n && n.on} />
                  <span className="flex-1">{n.label}</span>
                  {"badge" in n && n.badge > 0 && <span className="badge badge-solid tnum">{n.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex items-center gap-3 px-2"><Avatar name="Sato Kenji" size={32} /><span className="t-sm font-medium">{t.you}</span></div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_86%,transparent)] backdrop-blur-xl border-b border-hair">
          <div className="h-16 px-4 md:px-8 flex items-center gap-4">
            <Link href="/" className="lg:hidden"><Logo compact /></Link>
            <p className="t-sm text-muted hidden md:block flex-1">{t.hiringFor} · <b className="text-fg">{s.config.hrLang === "ja" ? key.titleJa : key.titleEn}</b> · {key.company}</p>
            <div className="flex-1 md:hidden" />
            <div className="w-[148px]"><Segmented size="sm" label="Language" value={s.config.hrLang} onChange={(v) => s.setConfig({ hrLang: v })} options={[{ value: "en", label: "EN" }, { value: "ja", label: "日本語" }]} /></div>
            <Link href="/hr" className="icon-btn sm pressable relative" aria-label={`${due} due soon`}>
              <Icon name="bell-01" />
              {due > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-solid ring-2 ring-[var(--color-bg-canvas)]" />}
            </Link>
          </div>
        </header>
        <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1280px]">{children}</main>
      </div>
    </div>
  );
}
