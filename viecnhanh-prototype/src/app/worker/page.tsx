"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, FitBadge, Icon, Logo, Sheet } from "@/components/ui";
import { useApp, takeNext } from "@/lib/store";
import { gsap, useGSAP, useReveal } from "@/lib/motion";

type Method = "zalo" | "line" | "phone";

export default function Login() {
  const router = useRouter();
  const { auth, profile, login, logins } = useApp();
  const [sheet, setSheet] = useState<Method | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const done = (method: Method, name: string) => {
    login(method, name);
    setSheet(null);
    router.push(profile ? takeNext("/worker/jobs") : "/worker/onboarding");
  };

  return (
    <div ref={root} className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr]">
      <Hero />
      <div className="flex flex-col px-5 md:px-12 pb-8 pt-4 lg:justify-center lg:max-w-[520px] lg:mx-auto w-full">
        <div className="flex items-center justify-between h-14 lg:hidden" data-reveal>
          <Link href="/hub" aria-label="Trang giới thiệu"><Logo /></Link>
          <span className="badge badge-outline">Tiếng Việt</span>
        </div>
        <div className="lg:hidden my-6" data-reveal><HeroArt compact /></div>

        {auth && profile ? (
          <div data-reveal>
            <p className="t-eyebrow mb-3">Lần đăng nhập thứ {logins}</p>
            <h1 className="t-h2">Chào mừng trở lại, {profile.name.split(" ").slice(-2).join(" ")}</h1>
            <p className="t-lg text-muted mt-3 mb-8">Hồ sơ của bạn đã được lưu. Xem trạng thái hoặc tìm thêm việc.</p>
            <Button size="lg" block iconRight="arrow-right" onClick={() => { login(auth.method, auth.name); router.push(takeNext("/worker/applications")); }}>Vào trang của tôi</Button>
            <Button size="lg" block variant="flat" className="mt-2" onClick={() => useApp.getState().logout()}>Đăng nhập tài khoản khác</Button>
          </div>
        ) : (
          <>
            <h1 className="t-h2 md:t-h1" data-reveal>Tìm việc hợp tay nghề ở Aichi</h1>
            <p className="t-lg text-muted mt-3" data-reveal>Trả lời 3 câu. AI tìm việc đúng visa, có lương thực nhận rõ ràng. Nhà máy trả lời trong 24 giờ.</p>
            <div className="mt-8 grid gap-3" data-reveal>
              <Button size="lg" block onClick={() => setSheet("zalo")}><ZaloMark />Tiếp tục với Zalo</Button>
              <Button size="lg" block variant="secondary" onClick={() => setSheet("line")}><LineMark />Tiếp tục với LINE</Button>
              <Button size="lg" block variant="tertiary" icon="phone" onClick={() => setSheet("phone")}>Dùng số điện thoại</Button>
            </div>
            <ul className="mt-8 grid gap-3 t-sm text-muted" data-reveal>
              <li className="flex gap-3"><Icon name="shield-tick" className="text-fg" />Miễn phí cho người lao động. Không thu phí giới thiệu.</li>
              <li className="flex gap-3"><Icon name="building-02" className="text-fg" />Công ty đăng ký tại Nagoya, có địa chỉ và giấy phép rõ ràng.</li>
              <li className="flex gap-3"><Icon name="message-chat-circle" className="text-fg" />Nhân viên nói tiếng Việt hỗ trợ 7h–22h mỗi ngày.</li>
            </ul>
          </>
        )}
        <p className="t-sm text-muted mt-auto pt-10 lg:mt-10">Tiếp tục nghĩa là bạn đồng ý với Điều khoản và Chính sách bảo mật của KINTRA.</p>
      </div>

      <ZaloSheet open={sheet === "zalo"} onClose={() => setSheet(null)} onAllow={() => done("zalo", "Nguyễn Tuấn Anh")} onPhone={() => setSheet("phone")} />
      <LineSheet open={sheet === "line"} onClose={() => setSheet(null)} onAllow={() => done("line", "Nguyễn Tuấn Anh")} onPhone={() => setSheet("phone")} />
      <PhoneSheet open={sheet === "phone"} onClose={() => setSheet(null)} onDone={() => done("phone", "")} />
    </div>
  );
}

function Hero() {
  return (
    <div className="hidden lg:flex relative ink overflow-hidden flex-col justify-between p-12 min-h-dvh">
      <Link href="/hub" aria-label="Trang giới thiệu" className="text-[var(--color-content-on-accent)]"><Logo inverse /></Link>
      <div className="grid place-items-center"><HeroArt /></div>
      <p className="text-[56px] leading-[1] font-semibold tracking-[-0.05em] max-w-[560px]" data-reveal>
        Đúng visa. Đúng tay nghề.<br /><span className="muted-ink">Có kết quả trong 24 giờ.</span>
      </p>
    </div>
  );
}

/** Product-story illustration: a match ring orbited by the 3 promises. */
function HeroArt({ compact }: { compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".orb", { scale: 0.6, autoAlpha: 0, stagger: 0.12, duration: 1, ease: "back.out(1.6)", delay: 0.2 });
      gsap.to(".orb", { y: (i) => (i % 2 ? 6 : -6), duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.3 });
    },
    { scope: ref },
  );
  if (compact)
    return (
      <div ref={ref} className="flex items-center gap-4" aria-hidden>
        <div className="orb grid size-[120px] shrink-0 place-items-center rounded-full ink shadow-[var(--shadow-bottom-2)] text-center"><span><Icon name="check-verified" solid size={28} className="mx-auto" /><span className="block t-sm font-semibold mt-1 leading-tight">Rất<br />phù hợp</span></span></div>
        <div className="grid gap-2 min-w-0">
          <Pill icon="check-verified">Visa đúng ngành</Pill>
          <Pill icon="coins-hand">¥221.526 thực nhận</Pill>
          <Pill icon="clock">HR trả lời ≤ 24h</Pill>
        </div>
      </div>
    );
  return (
    <div ref={ref} className="relative mx-auto h-[380px] w-[520px]" aria-hidden>
      <div className="orb absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface text-fg p-3 shadow-[var(--shadow-bottom-3)]">
        <div className="grid size-[220px] place-items-center rounded-full bg-brand-soft text-brand text-center"><span><Icon name="check-verified" solid size={48} className="mx-auto" /><span className="block t-h4 mt-2">Rất phù hợp</span><span className="block t-sm mt-1"><FitBadge level="great" label="Tiện CNC · 3 năm" /></span></span></div>
      </div>
      <Pill className="absolute left-2 top-10" icon="check-verified">Visa đúng ngành</Pill>
      <Pill className="absolute right-0 top-[150px]" icon="coins-hand">¥221.526 thực nhận</Pill>
      <Pill className="absolute left-10 bottom-8" icon="clock">HR trả lời ≤ 24h</Pill>
    </div>
  );
}

function Pill({ children, className = "", icon }: { children: React.ReactNode; className?: string; icon: "check-verified" | "coins-hand" | "clock" }) {
  return (
    <span className={`orb ${className} justify-self-start inline-flex items-center gap-2 rounded-full bg-surface text-fg pl-2.5 pr-4 h-10 t-sm font-semibold shadow-[var(--shadow-bottom-2)] border border-hair`}>
      <Icon name={icon} size={18} solid />{children}
    </span>
  );
}

function ZaloSheet({ open, onClose, onAllow, onPhone }: { open: boolean; onClose: () => void; onAllow: () => void; onPhone: () => void }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setBusy(false); }, [open]);
  return (
    <Sheet open={open} onClose={onClose} title="Đăng nhập bằng Zalo"
      footer={
        <div className="grid gap-2">
          <Button size="lg" block loading={busy} onClick={() => { setBusy(true); setTimeout(onAllow, 700); }}><ZaloMark />Mở Zalo trên điện thoại này</Button>
          <Button size="lg" block variant="tertiary" icon="phone" onClick={onPhone}>Nhập số điện thoại</Button>
        </div>
      }>
      <p className="text-muted mb-4">Chạm <b className="text-fg">Mở Zalo trên điện thoại này</b> để xác nhận một chạm. Nếu bạn đang mở trên máy tính, dùng điện thoại quét mã QR bên dưới.</p>
      <div className="mx-auto w-fit rounded-[28px] bg-[var(--color-bg-surface)] p-4 border border-hair shadow-[var(--shadow-bottom-1)]"><FakeQR /></div>
      <p className="t-sm text-muted text-center mt-3 flex items-center justify-center gap-2"><Icon name="clock" size={16} />Hoặc quét mã QR nếu bạn đang mở trên máy tính · bản demo</p>
      <p className="t-sm text-muted mt-4 flex gap-2"><Icon name="lock-01" size={16} className="mt-0.5" />KINTRA chỉ lấy tên, ảnh đại diện và số điện thoại. Không đọc tin nhắn hay danh bạ.</p>
    </Sheet>
  );
}

function LineSheet({ open, onClose, onAllow, onPhone }: { open: boolean; onClose: () => void; onAllow: () => void; onPhone: () => void }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setBusy(false); }, [open]);
  return (
    <Sheet open={open} onClose={onClose} title="Đăng nhập bằng LINE"
      footer={
        <div className="grid gap-2">
          <Button size="lg" block loading={busy} onClick={() => { setBusy(true); setTimeout(onAllow, 700); }}><LineMark />Mở LINE trên điện thoại này</Button>
          <Button size="lg" block variant="tertiary" icon="phone" onClick={onPhone}>Nhập số điện thoại</Button>
        </div>
      }>
      <p className="text-muted mb-4">Dùng tài khoản LINE tại Nhật để đăng nhập nhanh và nhận lịch phỏng vấn từ nhà máy qua tin nhắn.</p>
      <div className="well p-4 flex items-center gap-3">
        <LineMark big />
        <div className="min-w-0">
          <p className="font-semibold">KINTRA · Official</p>
          <p className="t-sm text-muted">Chỉ nhận tên hiển thị và ID để báo lịch phỏng vấn</p>
        </div>
      </div>
      <p className="t-sm text-muted mt-4 flex gap-2"><Icon name="lock-01" size={16} className="mt-0.5" />Không tự gửi tin cho bạn bè hoặc đọc nhóm chat của bạn.</p>
    </Sheet>
  );
}

/** Decorative QR-like code (demo only, encodes nothing). */
function FakeQR() {
  const n = 25, cells: [number, number][] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && !(x > 9 && x < 15 && y > 9 && y < 15) && rnd() > 0.5) cells.push([x, y]);
  const F = ({ x, y }: { x: number; y: number }) => (<g><rect x={x} y={y} width="7" height="7" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(0.5 0.5)" /><rect x={x + 2} y={y + 2} width="3" height="3" rx="0.8" /></g>);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width="196" height="196" className="text-brand" fill="currentColor" role="img" aria-label="Mã QR đăng nhập Zalo (minh hoạ)">
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width="0.8" height="0.8" rx="0.25" />)}
      <F x={0} y={0} /><F x={n - 7} y={0} /><F x={0} y={n - 7} />
      <rect x="10" y="10" width="5" height="5" rx="1.4" className="fill-[var(--color-bg-accent-solid)]" />
      <text x="12.5" y="13.1" textAnchor="middle" fontSize="1.7" fontWeight="700" fill="#fff">Zalo</text>
    </svg>
  );
}

function PhoneSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [cc, setCc] = useState("+81");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const boxes = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) { setStep("phone"); setOtp(""); } }, [open]);
  // Demo: the code "arrives" and fills itself in.
  useEffect(() => {
    if (step !== "otp") return;
    const code = "482913";
    const timers = code.split("").map((_, i) => setTimeout(() => setOtp(code.slice(0, i + 1)), 900 + i * 120));
    return () => timers.forEach(clearTimeout);
  }, [step]);
  useGSAP(() => { if (otp) gsap.fromTo(boxes.current?.children[otp.length - 1] ?? null, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "back.out(2.5)" }); }, { dependencies: [otp] });
  const valid = phone.replace(/\D/g, "").length >= 9;
  return (
    <Sheet open={open} onClose={onClose} title={step === "phone" ? "Số điện thoại của bạn" : "Nhập mã xác nhận"}
      footer={
        step === "phone" ? (
          <Button size="lg" block disabled={!valid} onClick={() => setStep("otp")}>Gửi mã qua SMS</Button>
        ) : (
          <Button size="lg" block disabled={otp.length < 6} onClick={onDone}>Xác nhận</Button>
        )
      }>
      {step === "phone" ? (
        <div className="field">
          <label htmlFor="ph">Số điện thoại Nhật hoặc Việt Nam</label>
          <div className="flex gap-2">
            <select aria-label="Mã quốc gia" className="input !w-[104px]" value={cc} onChange={(e) => setCc(e.target.value)}>
              <option value="+81">+81 JP</option>
              <option value="+84">+84 VN</option>
            </select>
            <input id="ph" className="input tnum" inputMode="tel" autoComplete="tel-national" placeholder="090 1234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <p className="t-sm text-muted">Chúng tôi gửi mã 6 số. Không dùng cho quảng cáo.</p>
        </div>
      ) : (
        <div>
          <p className="text-muted mb-4">Đã gửi tới {cc} {phone}. <button type="button" className="underline underline-offset-4 text-fg" onClick={() => setStep("phone")}>Đổi số</button></p>
          <div className="relative">
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-label="Mã xác nhận 6 số"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="peer absolute inset-0 z-10 size-full opacity-0 cursor-text"
            />
            <div ref={boxes} className="grid grid-cols-6 gap-2 peer-focus-visible:[&>div:first-child]:ring-2 peer-focus-visible:[&>div]:border-line-strong" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => {
                const active = i === Math.min(otp.length, 5);
                return (
                  <div key={i} className={`h-14 rounded-2xl grid place-items-center t-h4 tnum border transition-colors ${otp[i] ? "border-line-strong bg-surface" : active ? "border-[var(--color-border-accent-solid)] bg-surface" : "border-line"}`}>
                    {otp[i] ?? ""}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="t-sm text-muted mt-3">{otp.length < 6 ? "Gõ hoặc dán mã 6 số (bản demo cũng tự điền)…" : "Đã nhận mã."}</p>
        </div>
      )}
    </Sheet>
  );
}

function ZaloMark({ big }: { big?: boolean }) {
  return <span className={`grid place-items-center rounded-[8px] bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)] font-bold ${big ? "size-11 rounded-2xl text-[13px]" : "size-6 text-[9px]"}`} aria-hidden>Zalo</span>;
}

function LineMark({ big }: { big?: boolean }) {
  return <span className={`grid place-items-center rounded-[8px] bg-[#06C755] text-white font-bold ${big ? "size-11 rounded-2xl text-[13px]" : "size-6 text-[9px]"}`} aria-hidden>LINE</span>;
}
