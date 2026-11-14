"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { ICONS, type IconName } from "./icons.data";
import { gsap, useGSAP } from "@/lib/motion";

type IconBase = IconName extends `${infer B}-${"line" | "solid"}` ? B : never;

export function Icon({ name, size = 20, solid, className = "", label }: { name: IconBase; size?: number; solid?: boolean; className?: string; label?: string }) {
  const g = (ICONS as Record<string, { d: string; eo?: boolean }>)[`${name}-${solid ? "solid" : "line"}`] ?? (ICONS as Record<string, { d: string; eo?: boolean }>)[`${name}-line`];
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="currentColor" className={`shrink-0 ${className}`} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <path d={g.d} fillRule={g.eo ? "evenodd" : undefined} clipRule={g.eo ? "evenodd" : undefined} />
    </svg>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "flat" | "danger";
  size?: "lg" | "md" | "sm" | "xs";
  block?: boolean;
  loading?: boolean;
  icon?: IconBase;
  iconRight?: IconBase;
};
export function Button({ variant = "primary", size = "md", block, loading, icon, iconRight, className = "", children, disabled, ...rest }: BtnProps) {
  const s = size === "md" ? "" : `btn-${size}`;
  return (
    <button {...rest} disabled={disabled || loading} aria-busy={loading || undefined} className={`btn pressable btn-${variant} ${s} ${block ? "btn-block" : ""} ${className}`}>
      {loading ? <Icon name="refresh-ccw-01" className="spin" /> : icon && <Icon name={icon} />}
      <span className="inline-flex items-center gap-2 min-w-0">{children}</span>
      {iconRight && !loading && <Icon name={iconRight} />}
    </button>
  );
}

/** Animated number (count-up). */
export function Num({ value, format = (n: number) => Math.round(n).toLocaleString("ja-JP"), className = "", duration = 1 }: { value: number; format?: (n: number) => string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(value);
  useGSAP(
    () => {
      const o = { v: last.current };
      gsap.to(o, {
        v: value,
        duration,
        ease: "expo.out",
        onUpdate: () => { if (ref.current) ref.current.textContent = format(o.v); },
        onComplete: () => { last.current = value; },
      });
    },
    { dependencies: [value] },
  );
  return <span ref={ref} className={`tnum ${className}`}>{format(value)}</span>;
}

/** Match score ring — the hero element of the AI scoring. */
export function ScoreRing({ value, size = 64, stroke = 6, label, muted, children }: { value: number; size?: number; stroke?: number; label?: string; muted?: boolean; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const arc = useRef<SVGCircleElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(arc.current, { strokeDashoffset: c }, { strokeDashoffset: c * (1 - value / 100), duration: 1.4, ease: "expo.out" });
    },
    { dependencies: [value, c] },
  );
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${value}% phù hợp`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-bg-neutral-subtle)" strokeWidth={stroke} />
        <circle ref={arc} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={muted ? "var(--color-content-neutral-light)" : "var(--color-bg-neutral-solid)"} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children ?? <span className="font-semibold tnum" style={{ fontSize: size * 0.28 }}><Num value={value} />%</span>}</div>
    </div>
  );
}

export function Meter({ value, label, className = "", delay = 0 }: { value: number; label: string; className?: string; delay?: number }) {
  const bar = useRef<HTMLElement>(null);
  useGSAP(() => { gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: Math.max(0, Math.min(1, value / 100)), duration: 1.2, delay, ease: "expo.out" }); }, { dependencies: [value] });
  return (
    <div className={`meter ${className}`} role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <i ref={bar} />
    </div>
  );
}

/** Segmented control with a sliding thumb. */
export function Segmented<T extends string | number>({ options, value, onChange, label, size = "md" }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; label: string; size?: "md" | "sm" }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const el = wrap.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, options.length]);
  return (
    <div ref={wrap} className="seg" role="group" aria-label={label}>
      {thumb && <span className="seg-thumb" style={{ left: thumb.left, width: thumb.width }} />}
      {options.map((o) => (
        <button key={String(o.value)} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)} className={size === "sm" ? "!h-8 t-sm" : ""}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)} />;
}

export function containDialogFocus(e: ReactKeyboardEvent<HTMLDialogElement>) {
  if (e.key !== "Tab") return;
  const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, summary, [tabindex]"))
    .filter((el) => el.tabIndex >= 0 && !el.matches(":disabled") && el.getClientRects().length > 0);
  const first = controls[0], last = controls[controls.length - 1];
  const outside = !controls.some((el) => el === document.activeElement);
  if (e.shiftKey && (outside || document.activeElement === first)) { e.preventDefault(); last?.focus(); }
  else if (!e.shiftKey && (outside || document.activeElement === last)) { e.preventDefault(); first?.focus(); }
}

/** Bottom sheet on phones, centered dialog from 744px. ZEN rule: overlays on mobile use Bottom Sheet. */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closing = useRef(false);
  useEffect(() => { if (open) { closing.current = false; setMounted(true); } }, [open]);

  useLayoutEffect(() => {
    const el = dialog.current;
    if (!mounted || !el) return;
    const prev = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = "hidden";
    const initial = el.querySelector<HTMLElement>("[autofocus]") ?? el.querySelector<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex='0']");
    initial?.focus({ preventScroll: true });
    return () => { el.close(); document.body.style.overflow = prev; };
  }, [mounted]);

  useGSAP(
    () => {
      if (!mounted || !panel.current) return;
      const desktop = window.matchMedia("(min-width: 744px)").matches;
      if (open) {
        gsap.fromTo(scrim.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
        gsap.fromTo(panel.current, desktop ? { y: 24, scale: 0.96 } : { yPercent: 100 }, desktop ? { y: 0, scale: 1, duration: 0.6 } : { yPercent: 0, duration: 0.7, ease: "expo.out" });
      } else if (!closing.current) {
        closing.current = true;
        gsap.to(scrim.current, { autoAlpha: 0, duration: 0.25, ease: "power2.in" });
        gsap.to(panel.current, { ...(desktop ? { y: 16, autoAlpha: 0, scale: 0.98 } : { yPercent: 100 }), duration: 0.32, ease: "power2.in", onComplete: () => { dialog.current?.close(); setMounted(false); } });
      }
    },
    { dependencies: [open, mounted], revertOnUpdate: true },
  );

  if (!mounted) return null;
  return createPortal(
    <dialog ref={dialog} className="modal-shell open:flex items-end md:items-center justify-center" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : "Thông báo"} onKeyDown={containDialogFocus} onCancel={(e) => { e.preventDefault(); onClose(); }}>
      <div ref={scrim} className="absolute inset-0 scrim backdrop-blur-[2px]" onClick={onClose} />
      <div ref={panel} className="relative w-full md:max-w-[480px] max-h-[92dvh] overflow-auto bg-surface rounded-t-[28px] md:rounded-[28px] shadow-[var(--shadow-bottom-4)]">
        <div className="md:hidden mx-auto mt-2 h-1 w-10 rounded-full bg-subtle" aria-hidden />
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5">
            <h2 id={titleId} className="t-h4">{title}</h2>
            <button className="icon-btn sm pressable -mr-2 -mt-1" onClick={onClose} aria-label="Đóng"><Icon name="x-medium" /></button>
          </div>
        )}
        <div className="px-6 pt-3 pb-4">{children}</div>
        {footer && <div className="sticky bottom-0 bg-surface px-6 pt-2 pb-6 safe-b">{footer}</div>}
      </div>
    </dialog>,
    document.body,
  );
}

// ---- Toasts -----------------------------------------------------------------
type Toast = { id: number; text: string; icon?: IconBase };
const useToasts = create<{ list: Toast[]; push: (t: Omit<Toast, "id">) => void; drop: (id: number) => void }>((set) => ({
  list: [],
  push: (t) => set((s) => ({ list: [...s.list.slice(-2), { ...t, id: Date.now() + Math.random() }] })),
  drop: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
}));
export const toast = (text: string, icon: IconBase = "check-circle") => useToasts.getState().push({ text, icon });

function ToastItem({ t }: { t: Toast }) {
  const ref = useRef<HTMLDivElement>(null);
  const drop = useToasts((s) => s.drop);
  useGSAP(() => { gsap.from(ref.current, { y: -24, scale: 0.94, duration: 0.6, ease: "back.out(1.6)" }); });
  useEffect(() => {
    // Keep reading time independent of the animation-speed setting.
    const id = setTimeout(() => drop(t.id), 5000);
    return () => clearTimeout(id);
  }, [drop, t.id]);
  return (
    <div ref={ref} role="status" className="pointer-events-auto flex items-center gap-3 rounded-full ink pl-3 pr-5 py-2.5 shadow-[var(--shadow-bottom-3)] max-w-[92vw]">
      {t.icon && <Icon name={t.icon} solid />}
      <span className="t-base font-medium">{t.text}</span>
    </div>
  );
}
export function Toaster() {
  const list = useToasts((s) => s.list);
  return (
    <div className="pointer-events-none fixed top-3 inset-x-0 z-[70] flex flex-col items-center gap-2" aria-live="polite">
      {list.map((t) => <ToastItem key={t.id} t={t} />)}
    </div>
  );
}

export function Logo({ className = "", compact, inverse }: { className?: string; compact?: boolean; inverse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-[-0.04em] ${className}`}>
      <span className={`grid size-7 place-items-center rounded-[9px] ${inverse ? "bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)]" : "ink"}`} aria-hidden>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 3.5 6 12.5 8 7.5 10 12.5 13.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      {!compact && <span>ViệcNhanh<span className={`font-medium ${inverse ? "opacity-60" : "text-faint"}`}> Aichi</span></span>}
    </span>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/);
  const initials = (parts.length > 1 ? parts[parts.length - 2][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
  return (
    <span className="inline-grid shrink-0 place-items-center rounded-full bg-subtle font-semibold text-fg" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initials}
    </span>
  );
}

export function InlineNote({ icon = "info-circle", children, tone = "neutral" }: { icon?: IconBase; children: ReactNode; tone?: "neutral" | "ink" | "warn" }) {
  return (
    <div className={`flex gap-3 rounded-2xl p-4 t-sm ${tone === "ink" ? "ink" : tone === "warn" ? "border border-dashed border-line-strong bg-surface" : "well"}`}>
      <Icon name={icon} className="mt-px" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// ---- Fit level (words, not %) ------------------------------------------------
export type FitLevel = "great" | "possible" | "not";
const FIT_TEXT: Record<FitLevel, string> = { great: "Rất phù hợp", possible: "Có thể phù hợp", not: "Chưa phù hợp" };
export function FitBadge({ level, size = "md", label }: { level: FitLevel; size?: "md" | "lg"; label?: string }) {
  const n = level === "great" ? 3 : level === "possible" ? 2 : 1;
  const tone = level === "great" ? "ink" : level === "possible" ? "bg-brand-soft text-brand" : "bg-surface text-muted border border-dashed border-line";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-semibold whitespace-nowrap ${tone} ${size === "lg" ? "h-11 pl-3 pr-4 t-base" : "h-8 pl-2.5 pr-3 t-sm"}`}>
      <Icon name={level === "great" ? "check-verified" : level === "possible" ? "trend-up-01" : "info-circle"} size={size === "lg" ? 20 : 16} solid={level === "great"} />
      {label ?? FIT_TEXT[level]}
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => <i key={i} className={`block w-1.5 rounded-full ${size === "lg" ? "h-3.5" : "h-3"} ${i < n ? "bg-current" : "bg-current opacity-25"}`} />)}
      </span>
    </span>
  );
}

export function MatchChips({ chips, lang = "vi", max }: { chips: { ok: boolean; vi: string; en: string; ja: string }[]; lang?: "vi" | "en" | "ja"; max?: number }) {
  const list = max ? [...chips].sort((a, b) => Number(a.ok) - Number(b.ok)).slice(0, max) : chips;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={lang === "vi" ? "Tiêu chí phù hợp" : lang === "ja" ? "適合条件" : "Match criteria"}>
      {list.map((c) => (
        <li key={c.vi} className={`badge badge-md ${c.ok ? "bg-brand-soft text-brand" : "badge-dash text-muted"}`}>
          <Icon name={c.ok ? "check" : "x-medium"} size={14} />
          <span className="sr-only">{c.ok ? (lang === "vi" ? "Đạt: " : lang === "ja" ? "可: " : "Met: ") : lang === "vi" ? "Thiếu: " : lang === "ja" ? "不足: " : "Missing: "}</span>{c[lang]}
        </li>
      ))}
    </ul>
  );
}

/** ZEN dropdown: trigger like an input, options in a sheet with search (works the same on phone and desktop). */
export function Picker<T extends string>({ id, label, value, options, onChange, searchable, placeholder = "Chọn…" }: { id: string; label: string; value: T | ""; options: { value: T; label: string; sub?: string }[]; onChange: (v: T) => void; searchable?: boolean; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const cur = options.find((o) => o.value === value);
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
  const shown = q ? options.filter((o) => norm(`${o.label} ${o.sub ?? ""}`).includes(norm(q))) : options;
  return (
    <>
      <button id={id} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setQ(""); setOpen(true); }}
        className="input pressable flex items-center gap-3 text-left !pr-4 min-w-0 [contain:inline-size]">
        <span className="flex-1 min-w-0 truncate">{cur ? <>{cur.label}{cur.sub && <span className="text-muted t-base"> · {cur.sub}</span>}</> : <span className="text-faint">{placeholder}</span>}</span>
        <Icon name="chevron-down" className="text-muted" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        {searchable && (
          <div className="relative mb-3">
            <Icon name="search-md" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input autoFocus className="input !pl-12" placeholder="Tìm kiếm…" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Tìm ${label}`} />
          </div>
        )}
        <ul role="listbox" aria-label={label} className="grid gap-1 max-h-[52dvh] overflow-y-auto -mx-2 px-2 pb-2">
          {shown.map((o) => {
            const on = o.value === value;
            return (
              <li key={o.value}>
                <button type="button" role="option" aria-selected={on} onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`pressable w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3 ${on ? "bg-brand-soft" : "hover:bg-pale"}`}>
                  <span className="flex-1 min-w-0"><span className={`block ${on ? "font-semibold text-brand" : "font-medium"}`}>{o.label}</span>{o.sub && <span className="t-sm text-muted">{o.sub}</span>}</span>
                  {on && <Icon name="check" className="text-brand" />}
                </button>
              </li>
            );
          })}
          {shown.length === 0 && <li className="px-4 py-6 text-center text-muted">Không tìm thấy “{q}”</li>}
        </ul>
      </Sheet>
    </>
  );
}
