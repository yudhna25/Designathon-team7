"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Icon, Logo, Segmented, Sheet, KintraMark } from "@/components/ui";
import { useLang, useT, type WLang } from "@/lib/i18n";
import { useApp, takeNext } from "@/lib/store";
import { gsap, useGSAP, useReveal } from "@/lib/motion";

type Method = "zalo" | "line" | "phone";

export default function Login() {
  const router = useRouter();
  const { auth, profile, login, logins, setConfig } = useApp();
  const lang = useLang();
  const t = useT();
  const [sheet, setSheet] = useState<Method | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const done = (method: Method, name: string) => {
    login(method, name);
    setSheet(null);
    router.push(profile ? takeNext("/worker/jobs") : "/worker/onboarding");
  };

  const langSwitch = (
    <div className="w-[172px]">
      <Segmented
        size="sm"
        label={t("Ngôn ngữ", "言語", "Language")}
        value={lang}
        onChange={(v) => setConfig({ workerLang: v as WLang })}
        options={[{ value: "vi", label: "VI" }, { value: "en", label: "EN" }, { value: "ja", label: "日本語" }]}
      />
    </div>
  );

  const first = profile?.name.split(" ").slice(-2).join(" ") ?? "";

  return (
    <div ref={root} className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr]">
      <Hero />
      <div className="flex flex-col px-5 md:px-12 pb-8 pt-4 lg:justify-center lg:max-w-[520px] lg:mx-auto w-full">
        <div className="flex items-center justify-between h-14 lg:hidden" data-reveal>
          <Link href="/hub" aria-label={t("Trang giới thiệu", "紹介ページ", "About KINTRA")}><Logo /></Link>
          {langSwitch}
        </div>
        <div className="hidden lg:flex justify-end mb-6" data-reveal>{langSwitch}</div>
        <div className="lg:hidden my-6" data-reveal><HeroArt compact /></div>

        {auth && profile ? (
          <div data-reveal>
            <p className="t-eyebrow mb-3">{t(`Lần đăng nhập thứ ${logins}`, `ログイン ${logins}回目`, `Sign-in #${logins}`)}</p>
            <h1 className="t-h2">
              {lang === "ja" ? `おかえりなさい、${first}さん` : lang === "en" ? `Welcome back, ${first}` : `Chào mừng trở lại, ${first}`}
            </h1>
            <p className="t-lg text-muted mt-3 mb-8">{t("Hồ sơ của bạn đã được lưu. Xem trạng thái hoặc tìm thêm việc.", "プロフィールは保存済みです。応募状況の確認や求人検索ができます。", "Your profile is saved. Check your application status or browse more jobs.")}</p>
            <Button size="lg" block iconRight="arrow-right" onClick={() => { login(auth.method, auth.name); router.push(takeNext("/worker/applications")); }}>{t("Vào trang của tôi", "マイページへ", "Continue to my account")}</Button>
            <Button size="lg" block variant="flat" className="mt-2" onClick={() => useApp.getState().logout()}>{t("Đăng nhập tài khoản khác", "別のアカウントでログイン", "Use another account")}</Button>
          </div>
        ) : (
          <>
            <h1 className="t-h2 md:t-h1" data-reveal>{t("Tìm việc hợp tay nghề ở Aichi", "愛知県でスキルに合う仕事探し", "Find factory jobs in Aichi that fit your skills")}</h1>
            <p className="t-lg text-muted mt-3" data-reveal>{t("Trả lời 3 câu. AI tìm việc đúng visa, có lương thực nhận rõ ràng. Nhà máy trả lời trong 24 giờ.", "3つの質問に答えるだけ。AIがビザに合う求人と手取り給与を提示。工場から24時間以内に返答。", "Answer 3 questions. AI matches visa-eligible jobs with clear take-home pay. Factories reply within 24 hours.")}</p>
            <div className="mt-8 grid gap-3" data-reveal>
              <Button size="lg" block onClick={() => setSheet("zalo")}><ZaloMark />{t("Tiếp tục với Zalo", "Zaloで続ける", "Continue with Zalo")}</Button>
              <Button size="lg" block variant="secondary" onClick={() => setSheet("line")}><LineMark />{t("Tiếp tục với LINE", "LINEで続ける", "Continue with LINE")}</Button>
              <Button size="lg" block variant="tertiary" icon="phone" onClick={() => setSheet("phone")}>{t("Dùng số điện thoại", "電話番号を使う", "Use phone number")}</Button>
            </div>
            <ul className="mt-8 grid gap-3 t-sm text-muted" data-reveal>
              <li className="flex gap-3"><Icon name="shield-tick" className="text-fg" />{t("Miễn phí cho người lao động. Không thu phí giới thiệu.", "求職者は完全無料。紹介手数料は一切ありません。", "Free for workers. Zero placement or referral fees.")}</li>
              <li className="flex gap-3"><Icon name="building-02" className="text-fg" />{t("Công ty đăng ký tại Nagoya, có địa chỉ và giấy phép rõ ràng.", "名古屋拠点の正規登録会社が運営。所在地・許可番号を公開。", "Registered in Nagoya with verified address and licensing.")}</li>
              <li className="flex gap-3"><Icon name="message-chat-circle" className="text-fg" />{t("Nhân viên nói tiếng Việt hỗ trợ 7h–22h mỗi ngày.", "多言語スタッフが毎日 7:00–22:00 サポート。", "Support staff available daily from 7:00 to 22:00.")}</li>
            </ul>
          </>
        )}
        <p className="t-sm text-muted mt-auto pt-10 lg:mt-10">{t("Tiếp tục nghĩa là bạn đồng ý với Điều khoản và Chính sách bảo mật của KINTRA.", "続行することで、KINTRAの利用規約とプライバシーポリシーに同意したことになります。", "By continuing, you agree to KINTRA's Terms and Privacy Policy.")}</p>
      </div>

      <ZaloSheet open={sheet === "zalo"} onClose={() => setSheet(null)} onAllow={() => done("zalo", "Nguyễn Tuấn Anh")} onPhone={() => setSheet("phone")} />
      <LineSheet open={sheet === "line"} onClose={() => setSheet(null)} onAllow={() => done("line", "Nguyễn Tuấn Anh")} onPhone={() => setSheet("phone")} />
      <PhoneSheet open={sheet === "phone"} onClose={() => setSheet(null)} onDone={() => done("phone", "")} />
    </div>
  );
}

function Hero() {
  const t = useT();
  return (
    <div className="hidden lg:flex relative ink overflow-hidden flex-col justify-between p-12 min-h-dvh">
      <Link href="/hub" aria-label={t("Trang giới thiệu", "紹介ページ", "About KINTRA")} className="text-[var(--color-content-on-accent)]"><Logo inverse /></Link>
      <div className="grid place-items-center"><HeroArt /></div>
      {/* One phrase per line, never broken mid-phrase; size follows the column width. */}
      <p className="text-[clamp(36px,3.4vw,56px)] leading-[1.04] font-semibold tracking-[-0.045em]" data-reveal>
        <span className="block whitespace-nowrap">{t("Đúng visa.", "ビザに適合。", "Visa matched.")}</span>
        <span className="block whitespace-nowrap">{t("Đúng tay nghề.", "技術に適合。", "Skills matched.")}</span>
        <span className="block whitespace-nowrap muted-ink">{t("Có kết quả trong 24 giờ.", "24時間以内に返答。", "Results in 24 hours.")}</span>
      </p>
    </div>
  );
}

/** Brand moment: the KINTRA Step K, with the 3 promises in a row underneath (never on top of the mark). */
function HeroArt({ compact }: { compact?: boolean }) {
  const lang = useLang();
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".orb", { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "expo.out", delay: 0.2 });
    },
    { scope: ref },
  );
  const p1 = t("Visa đúng ngành", "ビザ適合のみ", "Visa-eligible only");
  const p2 = lang === "ja" ? "手取り ¥221,526" : lang === "en" ? "¥221,526 take-home" : "¥221.526 thực nhận";
  const p3 = t("HR trả lời ≤ 24h", "HR返答 ≤ 24h", "HR reply ≤ 24h");
  if (compact)
    return (
      <div ref={ref} className="flex items-center gap-4" aria-hidden>
        <div className="orb grid size-[96px] shrink-0 place-items-center rounded-[28px] bg-brand-soft"><KintraMark size={64} /></div>
        <div className="grid gap-2 min-w-0">
          <Pill icon="check-verified">{p1}</Pill>
          <Pill icon="coins-hand">{p2}</Pill>
          <Pill icon="clock">{p3}</Pill>
        </div>
      </div>
    );
  return (
    <div ref={ref} className="grid justify-items-center gap-10" aria-hidden>
      <div className="orb grid place-items-center">
        <KintraMark size={200} mono="#fff" />
        <p className="mt-6 text-[40px] font-extrabold tracking-[0.22em] leading-none text-white">KINTRA</p>
        <p className="mt-3 t-sm tracking-[0.08em] muted-ink">Your skills. Your next move.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 max-w-[560px]">
        <Pill icon="check-verified">{p1}</Pill>
        <Pill icon="coins-hand">{p2}</Pill>
        <Pill icon="clock">{p3}</Pill>
      </div>
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
  const t = useT();
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setBusy(false); }, [open]);
  const openZaloText = t("Mở Zalo trên điện thoại này", "この端末でZaloを開く", "Open Zalo on this device");
  return (
    <Sheet open={open} onClose={onClose} title={t("Đăng nhập bằng Zalo", "Zaloでログイン", "Sign in with Zalo")}
      footer={
        <div className="grid gap-2">
          <Button size="lg" block loading={busy} onClick={() => { setBusy(true); setTimeout(onAllow, 700); }}><ZaloMark />{openZaloText}</Button>
          <Button size="lg" block variant="tertiary" icon="phone" onClick={onPhone}>{t("Nhập số điện thoại", "電話番号を入力", "Enter phone number")}</Button>
        </div>
      }>
      <p className="text-muted mb-4">{t("Chạm", "「", "Tap")} <b className="text-fg">{openZaloText}</b> {t("để xác nhận một chạm. Nếu bạn đang mở trên máy tính, dùng điện thoại quét mã QR bên dưới.", "」をタップしてワンタップ認証。PCで開いている場合は下のQRコードをスマホで読み取ってください。", "for one-tap sign-in. On a computer, scan the QR code below with your phone.")}</p>
      <div className="mx-auto w-fit rounded-[28px] bg-[var(--color-bg-surface)] p-4 border border-hair shadow-[var(--shadow-bottom-1)]"><FakeQR label={t("Mã QR đăng nhập Zalo (minh hoạ)", "Zaloログイン用QRコード（サンプル）", "Zalo sign-in QR code (demo)")} /></div>
      <p className="t-sm text-muted text-center mt-3 flex items-center justify-center gap-2"><Icon name="clock" size={16} />{t("Hoặc quét mã QR nếu bạn đang mở trên máy tính · bản demo", "PCではQRコード読み取りにも対応 · デモ", "Or scan QR code if on desktop · demo")}</p>
      <p className="t-sm text-muted mt-4 flex gap-2"><Icon name="lock-01" size={16} className="mt-0.5" />{t("KINTRA chỉ lấy tên, ảnh đại diện và số điện thoại. Không đọc tin nhắn hay danh bạ.", "KINTRAは氏名・アイコン・電話番号のみを取得します。トーク履歴や連絡先は読み取りません。", "KINTRA only receives your name, photo, and phone number—never messages or contacts.")}</p>
    </Sheet>
  );
}

function LineSheet({ open, onClose, onAllow, onPhone }: { open: boolean; onClose: () => void; onAllow: () => void; onPhone: () => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setBusy(false); }, [open]);
  return (
    <Sheet open={open} onClose={onClose} title={t("Đăng nhập bằng LINE", "LINEでログイン", "Sign in with LINE")}
      footer={
        <div className="grid gap-2">
          <Button size="lg" block loading={busy} onClick={() => { setBusy(true); setTimeout(onAllow, 700); }}><LineMark />{t("Mở LINE trên điện thoại này", "この端末でLINEを開く", "Open LINE on this device")}</Button>
          <Button size="lg" block variant="tertiary" icon="phone" onClick={onPhone}>{t("Nhập số điện thoại", "電話番号を入力", "Enter phone number")}</Button>
        </div>
      }>
      <p className="text-muted mb-4">{t("Dùng tài khoản LINE tại Nhật để đăng nhập nhanh và nhận lịch phỏng vấn từ nhà máy qua tin nhắn.", "日本でお使いのLINEアカウントでかんたんログインし、面接日程の通知をLINEで受け取れます。", "Use your LINE account in Japan for quick sign-in and interview schedule alerts.")}</p>
      <div className="well p-4 flex items-center gap-3">
        <LineMark big />
        <div className="min-w-0">
          <p className="font-semibold">KINTRA · Official</p>
          <p className="t-sm text-muted">{t("Chỉ nhận tên hiển thị và ID để báo lịch phỏng vấn", "面接日程の通知用に表示名とIDのみを使用します", "Uses only display name & ID for interview alerts")}</p>
        </div>
      </div>
      <p className="t-sm text-muted mt-4 flex gap-2"><Icon name="lock-01" size={16} className="mt-0.5" />{t("Không tự gửi tin cho bạn bè hoặc đọc nhóm chat của bạn.", "友だちへの自動送信やグループトークの閲覧は行いません。", "Never messages your friends or reads group chats.")}</p>
    </Sheet>
  );
}

/** Decorative QR-like code (demo only, encodes nothing). */
function FakeQR({ label }: { label: string }) {
  const n = 25, cells: [number, number][] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && !(x > 9 && x < 15 && y > 9 && y < 15) && rnd() > 0.5) cells.push([x, y]);
  const F = ({ x, y }: { x: number; y: number }) => (<g><rect x={x} y={y} width="7" height="7" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(0.5 0.5)" /><rect x={x + 2} y={y + 2} width="3" height="3" rx="0.8" /></g>);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width="196" height="196" className="text-brand" fill="currentColor" role="img" aria-label={label}>
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width="0.8" height="0.8" rx="0.25" />)}
      <F x={0} y={0} /><F x={n - 7} y={0} /><F x={0} y={n - 7} />
      <rect x="10" y="10" width="5" height="5" rx="1.4" className="fill-[var(--color-bg-accent-solid)]" />
      <text x="12.5" y="13.1" textAnchor="middle" fontSize="1.7" fontWeight="700" fill="#fff">Zalo</text>
    </svg>
  );
}

function PhoneSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const t = useT();
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
    <Sheet open={open} onClose={onClose} title={step === "phone" ? t("Số điện thoại của bạn", "電話番号を入力", "Your phone number") : t("Nhập mã xác nhận", "認証コードを入力", "Enter verification code")}
      footer={
        step === "phone" ? (
          <Button size="lg" block disabled={!valid} onClick={() => setStep("otp")}>{t("Gửi mã qua SMS", "SMSでコード送信", "Send SMS code")}</Button>
        ) : (
          <Button size="lg" block disabled={otp.length < 6} onClick={onDone}>{t("Xác nhận", "認証する", "Verify")}</Button>
        )
      }>
      {step === "phone" ? (
        <div className="field">
          <label htmlFor="ph">{t("Số điện thoại Nhật hoặc Việt Nam", "日本またはベトナムの電話番号", "Japan or Vietnam phone number")}</label>
          <div className="flex gap-2">
            <select aria-label={t("Mã quốc gia", "国番号", "Country code")} className="input !w-[104px]" value={cc} onChange={(e) => setCc(e.target.value)}>
              <option value="+81">+81 JP</option>
              <option value="+84">+84 VN</option>
            </select>
            <input id="ph" className="input tnum" inputMode="tel" autoComplete="tel-national" placeholder="090 1234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <p className="t-sm text-muted">{t("Chúng tôi gửi mã 6 số. Không dùng cho quảng cáo.", "6桁の認証コードをお送りします。広告目的には使用しません。", "We send a 6-digit code. Never used for marketing.")}</p>
        </div>
      ) : (
        <div>
          <p className="text-muted mb-4">{t("Đã gửi tới", "送信先:", "Sent to")} {cc} {phone}. <button type="button" className="underline underline-offset-4 text-fg" onClick={() => setStep("phone")}>{t("Đổi số", "番号を変更", "Change number")}</button></p>
          <div className="relative">
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-label={t("Mã xác nhận 6 số", "6桁の認証コード", "6-digit verification code")}
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
          <p className="t-sm text-muted mt-3">{otp.length < 6 ? t("Gõ hoặc dán mã 6 số (bản demo cũng tự điền)…", "6桁コードを入力または貼り付け（デモでは自動入力されます）…", "Enter or paste the 6-digit code (auto-fills in demo)…") : t("Đã nhận mã.", "コードを確認しました。", "Code received.")}</p>
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
