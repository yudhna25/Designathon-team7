"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DEMO_PROFILE, jobById } from "@/lib/data";
import { DEFAULT_WEIGHTS, type Weights } from "@/lib/scoring";
import { DEFAULT_CONFIG, displayStatus, useApp, useNow } from "@/lib/store";
import { gsap, useGSAP } from "@/lib/motion";
import { STATUS_VI } from "@/lib/labels";
import { Button, containDialogFocus, Icon, Segmented, toast } from "./ui";

const SCREENS: { group: string; items: { href: string; label: string; needsProfile?: boolean }[] }[] = [
  {
    group: "Người lao động · mobile",
    items: [
      { href: "/worker", label: "1 · Đăng nhập Zalo / LINE / SĐT" },
      { href: "/worker/onboarding", label: "2 · Onboarding 3 câu" },
      { href: "/worker/analyzing", label: "3 · AI dựng profile & chấm điểm", needsProfile: true },
      { href: "/worker/jobs", label: "4 · Danh sách việc phù hợp", needsProfile: true },
      { href: "/worker/jobs/mikawa-cnc", label: "5a · Chi tiết việc ≥ ngưỡng (happy)", needsProfile: true },
      { href: "/worker/jobs/kariya-mill", label: "5b · Chi tiết việc < ngưỡng (un-happy)", needsProfile: true },
      { href: "/worker/improve?job=kariya-mill", label: "6 · Bổ sung thông tin · AI chấm lại", needsProfile: true },
      { href: "/worker/applications", label: "7 · Dashboard trạng thái", needsProfile: true },
      { href: "/worker/safety", label: "8 · Học an toàn trước ngày 1", needsProfile: true },
      { href: "/worker/wallet", label: "9 · Ứng lương đã làm (EWA)", needsProfile: true },
    ],
  },
  {
    group: "HR nhà máy · desktop",
    items: [
      { href: "/hr", label: "Danh sách ứng viên xếp theo %" },
      { href: "/hr/candidates/a-c3", label: "Breakdown điểm · sắp hết hạn" },
    ],
  },
];

export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const show = useApp((s) => s.config.showDemo);
  const setConfig = useApp((s) => s.setConfig);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.shiftKey && e.key.toLowerCase() === "d") { setConfig({ showDemo: true }); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setConfig]);

  return (
    <>
      {show && !open && (
        // Phones: slim tab on the right edge so it never covers a CTA. Desktop: pill bottom-right.
        <button
          onClick={() => setOpen(true)}
          className="pressable fixed z-40 right-0 top-[38%] lg:top-auto lg:right-5 lg:bottom-5 flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2 rounded-l-xl lg:rounded-full bg-surface px-1.5 py-3 lg:pl-3 lg:pr-4 lg:py-0 lg:h-10 shadow-[var(--shadow-bottom-2)] border border-hair border-r-0 lg:border-r t-sm font-semibold"
          aria-label="Mở bảng điều khiển demo (Shift + D)"
        >
          <Icon name="sliders-02" size={18} /><span className="[writing-mode:vertical-rl] lg:[writing-mode:horizontal-tb] text-[12px] lg:text-[length:var(--text-body-small)] tracking-wide">Demo</span>
        </button>
      )}
      {open && <Drawer onClose={() => setOpen(false)} />}
    </>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  const s = useApp();
  const now = useNow(500);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useLayoutEffect(() => {
    const el = dialog.current!;
    const prev = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = "hidden";
    return () => { el.close(); document.body.style.overflow = prev; };
  }, []);

  useGSAP(() => {
    gsap.from(scrim.current, { autoAlpha: 0, duration: 0.3 });
    gsap.from(panel.current, { xPercent: 104, duration: 0.7, ease: "expo.out" });
    gsap.from("[data-d]", { x: 24, autoAlpha: 0, stagger: 0.03, duration: 0.6, delay: 0.1 });
  }, { scope: panel });

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    gsap.to(scrim.current, { autoAlpha: 0, duration: 0.2 });
    gsap.to(panel.current, { xPercent: 104, duration: 0.35, ease: "power2.in", onComplete: onClose });
  };

  const go = (href: string, needsProfile?: boolean) => {
    if (needsProfile && !s.profile) {
      s.login("zalo", DEMO_PROFILE.name);
      s.setProfile(DEMO_PROFILE);
      s.setScanned(true);
      toast("Đã nạp hồ sơ mẫu Tuấn Anh", "user-circle");
    }
    router.push(href);
    close();
  };

  const mine = s.apps.find((a) => a.candidateId === "me");
  const mineStatus = mine ? displayStatus(mine, s, now) : null;
  const setW = (k: keyof Weights, v: number) => s.setConfig({ weights: { ...s.config.weights, [k]: v } });
  const wSum = Object.values(s.config.weights).reduce((a, b) => a + b, 0);

  return (
    <dialog ref={dialog} className="modal-shell" aria-modal="true" aria-label="Bảng điều khiển demo" onKeyDown={containDialogFocus} onCancel={(e) => { e.preventDefault(); close(); }}>
      <div ref={scrim} className="absolute inset-0 scrim" onClick={close} />
      <div ref={panel} className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-surface shadow-[var(--shadow-bottom-4)] flex flex-col" data-type="base-16">
        <header className="flex items-center justify-between px-5 h-16 hair-b shrink-0">
          <div>
            <p className="t-eyebrow">Prototype controls</p>
            <h2 className="t-sub">Bảng điều khiển demo</h2>
          </div>
          <button className="icon-btn pressable" onClick={close} aria-label="Đóng"><Icon name="x-medium" /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7 t-sm">
          <section data-d>
            <h3 className="t-eyebrow mb-3">Mở song song để xem đồng bộ</h3>
            <div className="grid grid-cols-2 gap-2">
              <a className="btn btn-tertiary btn-sm pressable" href="/worker" target="_blank" rel="noreferrer"><Icon name="phone" />Tab người lao động</a>
              <a className="btn btn-tertiary btn-sm pressable" href="/hr" target="_blank" rel="noreferrer"><Icon name="monitor-01" />Tab HR</a>
            </div>
          </section>

          <section data-d>
            <h3 className="t-eyebrow mb-2">Nhảy tới màn hình</h3>
            {SCREENS.map((g) => (
              <div key={g.group} className="mb-3">
                <p className="text-muted mb-1">{g.group}</p>
                <ul className="divide-y divide-[var(--color-border-neutral-pale)] rounded-2xl border border-hair overflow-hidden">
                  {g.items.map((it) => (
                    <li key={it.href}>
                      <button onClick={() => go(it.href, it.needsProfile)} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-pale transition-colors">
                        <span>{it.label}</span><Icon name="chevron-right-01" size={16} className="text-faint" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section data-d>
            <h3 className="t-eyebrow mb-3">Thời gian mô phỏng</h3>
            <div className="well p-4 flex items-baseline justify-between">
              <span className="text-muted">Bây giờ</span>
              <span className="mono t-lg font-semibold tnum">{new Date(now).toLocaleString("vi-VN", { weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit" })}</span>
            </div>
            <div className="mt-3">
              <Segmented label="Tốc độ thời gian" value={s.config.speed} onChange={(v) => s.setSpeed(v)} options={[{ value: 1, label: "×1" }, { value: 60, label: "×60" }, { value: 3600, label: "×3600" }]} />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[1, 4, 20].map((h) => (
                <Button key={h} size="sm" variant="secondary" icon="clock-fast-forward" onClick={() => { s.advance(h); toast(`Đã tua +${h} giờ`, "clock-fast-forward"); }}>+{h}h</Button>
              ))}
            </div>
          </section>

          <section data-d>
            <h3 className="t-eyebrow mb-3">Giả lập HR cho hồ sơ của bạn</h3>
            {mine ? (
              <>
                <p className="mb-2 text-muted">{jobById(mine.jobId)?.company} · trạng thái: <b className="text-fg">{mineStatus && STATUS_VI[mineStatus]}</b></p>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant="secondary" disabled={mineStatus !== "sent"} onClick={() => s.markViewed(mine.id)}>HR xem</Button>
                  <Button size="sm" variant="secondary" disabled={!(mineStatus === "sent" || mineStatus === "viewed")} onClick={() => s.decide(mine.id, "approved", { interview: { slot: "2026-11-18T10:00", mode: "onsite" } })}>Mời phỏng vấn</Button>
                  <Button size="sm" variant="secondary" disabled={!(mineStatus === "sent" || mineStatus === "viewed")} onClick={() => s.decide(mine.id, "rejected", { reason: "filled" })}>Từ chối</Button>
                </div>
              </>
            ) : (
              <p className="text-muted">Chưa có hồ sơ nào được gửi.</p>
            )}
          </section>

          <section data-d>
            <h3 className="t-eyebrow mb-3">Quy tắc</h3>
            <Range label="HR phải quyết định trong" unit="giờ" min={1} max={72} value={s.config.deadlineH} onChange={(v) => s.setConfig({ deadlineH: v })} />
            <Range label="Nhắc HR khi còn" unit="giờ" min={1} max={12} value={s.config.reminderH} onChange={(v) => s.setConfig({ reminderH: v })} />
            <Range label="Ngưỡng “Rất phù hợp”" unit="%" min={40} max={95} value={s.config.threshold} onChange={(v) => s.setConfig({ threshold: v })} />
            <div className="mt-4 flex items-center justify-between">
              <p className="font-medium">Trọng số chấm điểm</p>
              <span className={`t-sm tnum ${wSum === 100 ? "text-muted" : "text-warn font-medium"}`}>Tổng {wSum}{wSum !== 100 && " · tự chuẩn hoá"}</span>
            </div>
            <Range label="Kỹ năng & chứng chỉ" unit="" min={0} max={100} value={s.config.weights.skills} onChange={(v) => setW("skills", v)} />
            <Range label="Ngày bắt đầu" unit="" min={0} max={100} value={s.config.weights.start} onChange={(v) => setW("start", v)} />
            <Range label="Khu vực" unit="" min={0} max={100} value={s.config.weights.area} onChange={(v) => setW("area", v)} />
            <Range label="Tiếng Nhật" unit="" min={0} max={100} value={s.config.weights.jp} onChange={(v) => setW("jp", v)} />
            <p className="t-sm text-muted mt-1">Visa không có trọng số: sai ngành là bị loại (gate).</p>
            <button className="mt-2 underline underline-offset-4 text-muted hover:text-fg" onClick={() => s.setConfig({ weights: DEFAULT_WEIGHTS, deadlineH: DEFAULT_CONFIG.deadlineH, reminderH: DEFAULT_CONFIG.reminderH, threshold: DEFAULT_CONFIG.threshold })}>Về mặc định</button>
          </section>

          <section data-d className="space-y-3">
            <h3 className="t-eyebrow">Hiển thị</h3>
            <Row label="Animation"><Segmented size="sm" label="Animation" value={s.config.motion} onChange={(v) => s.setConfig({ motion: v })} options={[{ value: "normal", label: "Chuẩn" }, { value: "slow", label: "Chậm ×3" }, { value: "off", label: "Tắt" }]} /></Row>
            <Row label="Giao diện"><Segmented size="sm" label="Giao diện" value={s.config.theme} onChange={(v) => s.setConfig({ theme: v })} options={[{ value: "system", label: "Tự động" }, { value: "light", label: "Sáng" }, { value: "dark", label: "Tối" }]} /></Row>
            <Row label="Ngôn ngữ HR"><Segmented size="sm" label="Ngôn ngữ HR" value={s.config.hrLang} onChange={(v) => s.setConfig({ hrLang: v })} options={[{ value: "en", label: "EN" }, { value: "ja", label: "日本語" }]} /></Row>
            <Row label="Nút Demo"><button className="btn btn-xs btn-secondary pressable" onClick={() => { s.setConfig({ showDemo: false }); close(); toast("Đã ẩn · nhấn Shift + D để mở lại", "eye"); }}>Ẩn khi thuyết trình</button></Row>
          </section>

          <section data-d className="pb-6">
            {confirmReset ? (
              <div className="well p-4">
                <p className="mb-3">Xoá hồ sơ, đơn ứng tuyển và lịch sử ứng lương của bản demo này?</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => { s.reset(); setConfirmReset(false); toast("Đã reset dữ liệu demo", "refresh-ccw-01"); router.push("/"); close(); }}>Reset</Button>
                  <Button size="sm" variant="flat" onClick={() => setConfirmReset(false)}>Huỷ</Button>
                </div>
              </div>
            ) : (
              <Button block variant="danger" icon="refresh-ccw-01" onClick={() => setConfirmReset(true)}>Reset dữ liệu demo</Button>
            )}
            <p className="mt-4 text-muted"><Link href="/" className="underline underline-offset-4" onClick={close}>Về trang giới thiệu</Link> · Phím tắt <kbd className="mono">Shift + D</kbd></p>
          </section>
        </div>
      </div>
    </dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><span className="font-medium shrink-0">{label}</span><div className="w-[220px]">{children}</div></div>;
}

function Range({ label, unit, min, max, value, onChange }: { label: string; unit: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block mt-3">
      <span className="flex justify-between"><span>{label}</span><b className="tnum">{value}{unit && ` ${unit}`}</b></span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full mt-1 accent-[var(--color-bg-neutral-solid)]" />
    </label>
  );
}
