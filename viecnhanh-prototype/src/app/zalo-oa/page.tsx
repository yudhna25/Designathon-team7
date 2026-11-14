"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { Avatar, Button, Icon, InlineNote, Logo, MatchChips, Segmented, Sheet, Toggle, toast } from "@/components/ui";
import {
  D, OA_WEB_URL, RECOMMEND_MIN, RECOMMEND_WEEKLY_CAP, STATUS_TONE, eventIcs, getOaLang, setOaLang, t,
  type GroupMember, type Lang, type OaEvent, type OaJob, type QuestionId, type Recommend, type StatusId, type StatusUpdate,
} from "@/lib/zalo-oa";

// Màn mô phỏng Zalo OA — BRD "ViệcNhanh Aichi · Cửa vào Zalo OA" v1.0. Không dùng logo Zalo (BR8).

type Scenario = "first" | "status" | "recommend" | "event";
type StatusTo = Exclude<StatusId, "pending">;
type RecMode = "pass" | "below";

const scenarios = (): { value: Scenario; label: string }[] => [
  { value: "first", label: t("Lần đầu", "First visit") },
  { value: "status", label: t("Trạng thái", "Status") },
  { value: "recommend", label: t("Gợi ý việc", "New jobs") },
  { value: "event", label: t("Sự kiện", "Events") },
];

const SLIDE = "animate-[zen-slide-up_var(--motion-slow)_var(--ease-spring)_both]";

/** Đổi Sáng/Tối ngay trên màn (lưu chung cấu hình Demo). */
function ThemeToggle({ withLabel }: { withLabel?: boolean }) {
  const setConfig = useApp((s) => s.setConfig);
  useApp((s) => s.config.theme); // re-render khi theme đổi
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  const label = dark ? t("Chuyển sang giao diện sáng", "Switch to light mode") : t("Chuyển sang giao diện tối", "Switch to dark mode");
  const flip = () => setConfig({ theme: dark ? "light" : "dark" });
  return withLabel ? (
    <Button variant="tertiary" size="sm" icon={dark ? "sun" : "moon-01"} onClick={flip} aria-label={label}>{dark ? t("Sáng", "Light") : t("Tối", "Dark")}</Button>
  ) : (
    <button type="button" className="icon-btn sm pressable" aria-label={label} onClick={flip}><Icon name={dark ? "sun" : "moon-01"} /></button>
  );
}

/** Hành động từ tin nhắn lên kịch bản chat: mở nhóm tuyển dụng, phản hồi widget sự kiện. */
type WidgetActions = {
  onOpenGroup?: (r: Recommend) => void;
  onEvent?: (e: OaEvent, act: "yes" | "no" | "undo") => void; events?: Record<string, "yes" | "no">;
};

/** BR6 + AC5: Toast trước, rồi mở link ngoài ở tab mới. */
function openWeb(message = t("Đang mở ViệcNhanh…", "Opening ViệcNhanh…")) {
  toast(message, "arrow-up-right");
  setTimeout(() => window.open(OA_WEB_URL, "_blank", "noopener,noreferrer"), 450);
}

/** Đổi VI / EN. Khung chat dựng lại từ đầu khi đổi để không lẫn hai thứ tiếng. */
function LangToggle({ lang, onChange, size }: { lang: Lang; onChange: (l: Lang) => void; size?: "sm" }) {
  return <Segmented label={t("Ngôn ngữ", "Language")} size={size} value={lang} onChange={onChange} options={[{ value: "vi", label: "VI" }, { value: "en", label: "EN" }]} />;
}

export default function ZaloOaPage() {
  const [lang, setLang] = useState<Lang>("vi");
  setOaLang(lang);
  const SCENARIOS = scenarios();
  const [scenario, setScenario] = useState<Scenario>("first");
  const [run, setRun] = useState(0);
  const [statusTo, setStatusTo] = useState<StatusTo>("interview");
  const [recMode, setRecMode] = useState<RecMode>("pass");
  const [recAttempts, setRecAttempts] = useState(1);
  const [sheet, setSheet] = useState(false);

  const pick = (s: Scenario) => { setScenario(s); setRun((n) => n + 1); };
  const controls = (
    <Controls
      scenario={scenario}
      onRestart={() => { setRun((n) => n + 1); setRecAttempts(1); }}
      statusTo={statusTo}
      onStatus={setStatusTo}
      recMode={recMode}
      onRecMode={(m) => { setRecMode(m); setRecAttempts(1); }}
      recAttempts={recAttempts}
      onRecPush={() => setRecAttempts((n) => n + 1)}
    />
  );

  return (
    <main data-id="zalo-oa-page" className="h-dvh flex flex-col md:h-auto md:min-h-dvh lg:h-dvh lg:flex-row lg:items-center lg:justify-center lg:gap-16 xl:gap-24 lg:px-10">
      {/* < 1024px: thanh trên cùng nằm ngoài khung điện thoại */}
      <header data-id="zalo-oa-topbar" className="lg:hidden shrink-0 bg-canvas border-b border-hair px-3 pt-2 pb-3 md:px-6">
        <div className="flex items-center gap-2 h-11">
          <Link href="/" className="pressable rounded-xl px-1" aria-label={t("Trang giới thiệu", "Home")}><Logo compact /></Link>
          <p className="flex-1 min-w-0 truncate t-sm text-muted"><span className="font-semibold text-fg">Zalo OA</span> {t("(mô phỏng)", "(simulated)")}</p>
          <span className="w-[92px]"><LangToggle lang={lang} onChange={setLang} size="sm" /></span>
          <ThemeToggle />
          <button type="button" className="icon-btn sm pressable" aria-label={t("Tuỳ chọn kịch bản", "Scenario options")} onClick={() => setSheet(true)}>
            <Icon name="sliders-02" />
          </button>
        </div>
        <Segmented label={t("Kịch bản demo", "Demo scenario")} size="sm" options={SCENARIOS} value={scenario} onChange={pick} />
      </header>

      {/* ≥ 1024px: bảng điều khiển bên trái */}
      <section data-id="zalo-oa-panel" className="hidden lg:flex flex-col gap-8 flex-1 max-w-[560px] max-h-dvh overflow-y-auto no-scrollbar py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="pressable rounded-xl"><Logo /></Link>
          <span className="flex items-center gap-2"><span className="w-[104px]"><LangToggle lang={lang} onChange={setLang} size="sm" /></span><ThemeToggle withLabel /></span>
        </div>
        <div>
          <p className="t-eyebrow mb-4">{t("Cửa vào thứ 2 · Zalo OA (mô phỏng)", "Second entry point · Zalo OA (simulated)")}</p>
          <h1 className="t-h1">{t("Có hồ sơ mà không cần mở web", "A profile without opening the web")}</h1>
          <p className="t-lg text-muted mt-3">
            {t(
              "Lần đầu, người lao động trả lời 3 câu bằng tin nhắn (không cần gửi ảnh) và nhận 3 tiêu chí cùng 3 công ty phù hợp. Lần sau, OA gửi trạng thái đơn và việc mới. Mọi nút “Xem chi tiết” mở website ViệcNhanh.",
              "On the first visit, workers answer 3 questions by message (no photo needed) and get their 3 criteria plus 3 matching companies. After that, the OA sends application updates and new jobs. Every “View details” button opens the ViệcNhanh website.",
            )}
          </p>
        </div>
        <div className="grid gap-3">
          <p className="label">{t("Kịch bản demo", "Demo scenario")}</p>
          <Segmented label={t("Kịch bản demo", "Demo scenario")} options={SCENARIOS} value={scenario} onChange={pick} />
        </div>
        {controls}
      </section>

      <Phone key={`${lang}-${scenario}-${run}-${scenario === "status" ? statusTo : ""}-${scenario === "recommend" ? recMode : ""}`}>
        {scenario === "first" && <FirstRunChat />}
        {scenario === "status" && <StatusChat to={statusTo} />}
        {scenario === "recommend" && <RecommendChat mode={recMode} attempts={recAttempts} />}
        {scenario === "event" && <EventChat />}
      </Phone>

      <Sheet open={sheet} onClose={() => setSheet(false)} title={t("Tuỳ chọn kịch bản", "Scenario options")}>
        {controls}
      </Sheet>
    </main>
  );
}

// ---- Bảng điều khiển (desktop: cột trái · mobile: bottom sheet) --------------
function Controls(props: {
  scenario: Scenario; onRestart: () => void;
  statusTo: StatusTo; onStatus: (s: StatusTo) => void;
  recMode: RecMode; onRecMode: (m: RecMode) => void; recAttempts: number; onRecPush: () => void;
}) {
  const { scenario } = props;
  const sent = Math.min(props.recAttempts, RECOMMEND_WEEKLY_CAP);
  return (
    <div data-id="zalo-oa-controls" className="grid gap-6">
      {scenario === "first" && (
        <div className="card p-5 grid gap-4">
          <p className="t-sub">{t("B1 · Lần đầu vào OA", "B1 · First visit to the OA")}</p>
          <ol className="grid gap-2 t-base text-muted list-decimal pl-5">
            <li>{t("Bấm “Bắt đầu tìm việc”.", "Tap “Start job search”.")}</li>
            <li>{t("Trả lời 3 câu bằng tin nhắn (bấm gợi ý hoặc tự gõ), không cần gửi ảnh. Câu nào thiếu, bot hỏi lại đúng câu đó.", "Answer 3 questions by message (tap a suggestion or type), no photo needed. If an answer is missing, the bot re-asks only that question.")}</li>
            <li>{t("Nhận thẻ gồm 3 tiêu chí và 3 công ty phù hợp. Bấm “Xem chi tiết” để mở website.", "Get a card with your 3 criteria and 3 matching companies. Tap “View details” to open the website.")}</li>
          </ol>
          <Button variant="tertiary" size="sm" icon="refresh-ccw-01" className="justify-self-start" onClick={props.onRestart}>{t("Chạy lại từ đầu", "Restart")}</Button>
        </div>
      )}

      {scenario === "status" && (
        <div className="card p-5 grid gap-4">
          <p className="t-sub">{t("B2 · Đơn đổi trạng thái", "B2 · Application status changes")}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("Trạng thái mới", "New status")}>
            {(Object.keys(D().STATUS_UPDATES) as StatusTo[]).map((s) => (
              <button key={s} type="button" className="chip pressable" aria-pressed={props.statusTo === s} onClick={() => props.onStatus(s)}>
                {D().STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <p className="t-sm text-muted">{t("Thông báo trạng thái đơn không bị giới hạn số lần gửi.", "Status updates are not limited in number.")}</p>
        </div>
      )}

      {scenario === "recommend" && (
        <div className="card p-5 grid gap-4">
          <p className="t-sub">{t("B2 · Việc mới hợp với bạn", "B2 · New jobs that fit you")}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("Mức phù hợp của việc mới", "Fit of the new job")}>
            <button type="button" className="chip pressable" aria-pressed={props.recMode === "pass"} onClick={() => props.onRecMode("pass")}>{t("Từ 85% · gửi qua Zalo", "85% or more · sent via Zalo")}</button>
            <button type="button" className="chip pressable" aria-pressed={props.recMode === "below"} onClick={() => props.onRecMode("below")}>{t("84% · chỉ hiện trong app", "84% · in-app only")}</button>
          </div>
          {props.recMode === "pass" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="tertiary" size="sm" icon="plus" onClick={props.onRecPush}>{t("Có thêm việc mới", "Add a new job")}</Button>
              <span className="t-sm text-muted tnum">{t(`Đã gửi ${sent}/${RECOMMEND_WEEKLY_CAP} tuần này`, `${sent}/${RECOMMEND_WEEKLY_CAP} sent this week`)}</span>
            </div>
          )}
        </div>
      )}

      {scenario === "event" && (
        <div className="card p-5 grid gap-4">
          <p className="t-sub">{t("Sự kiện · tham quan nhà máy, hội chợ việc làm", "Events · factory visits, job fairs")}</p>
          <ol className="grid gap-2 t-base text-muted list-decimal pl-5">
            <li>{t("OA gợi ý hoạt động gần bạn (職場見学, hội chợ) kèm địa điểm, nội dung, độ tuổi.", "The OA suggests nearby activities (職場見学, job fairs) with location, content and age range.")}</li>
            <li>{t("“Quan tâm” thêm vào lịch (tải file .ics, nhắc trước 1 ngày).", "“Interested” adds it to the calendar (.ics file, reminder 1 day before).")}</li>
            <li>{t("“Không quan tâm” ẩn thẻ thành một dòng nhỏ để tin cập nhật đơn không bị trôi.", "“Not interested” collapses the card into one line so application updates don’t get buried.")}</li>
          </ol>
          <Button variant="tertiary" size="sm" icon="refresh-ccw-01" className="justify-self-start" onClick={props.onRestart}>{t("Chạy lại", "Restart")}</Button>
        </div>
      )}

      <ul className="grid gap-3 t-sm text-muted">
        <li className="flex gap-3"><Icon name="target-04" size={18} className="mt-0.5" />{t(`Chỉ gửi gợi ý qua Zalo khi mức phù hợp từ ${RECOMMEND_MIN}%, tối đa ${RECOMMEND_WEEKLY_CAP} lần một tuần.`, `Job suggestions go to Zalo only at ${RECOMMEND_MIN}% fit or more, at most ${RECOMMEND_WEEKLY_CAP} times a week.`)}</li>
        <li className="flex gap-3"><Icon name="arrow-up-right" size={18} className="mt-0.5" />{t("Nút “Xem chi tiết” nào cũng mở website ở tab mới, đã đăng nhập sẵn qua Zalo. Ứng tuyển làm trên website.", "Every “View details” button opens the website in a new tab, already signed in via Zalo. Applying happens on the website.")}</li>
        <li className="flex gap-3"><Icon name="info-circle" size={18} className="mt-0.5" />{t("Số liệu và tên nhà máy đều là dữ liệu dựng.", "All figures and factory names are mock data.")}</li>
      </ul>
    </div>
  );
}

// ---- Khung điện thoại 390px ----------------------------------------------------
// Giao diện chat theo Chat Kit của ZEN Kaiz (phong cách Zalo): token --chat-* trong scope data-chat-theme="zalo".
function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      data-id="zalo-oa-phone"
      data-chat-theme="zalo"
      className="relative flex flex-col flex-1 min-h-0 overflow-clip bg-(--chat-canvas) md:flex-none md:w-[390px] md:h-[780px] md:mx-auto md:my-8 md:rounded-[44px] md:border md:border-line md:shadow-[var(--shadow-bottom-4)] lg:mx-0 lg:my-0 lg:h-[min(844px,calc(100dvh-64px))] lg:shrink-0"
    >
      <StatusBar />
      {children}
      <div className="hidden md:grid h-7 shrink-0 place-items-center bg-(--chat-surface)" aria-hidden>
        <i className="block h-[5px] w-[134px] rounded-full bg-[var(--color-content-neutral-strongest)]" />
      </div>
    </div>
  );
}

/** Thanh trạng thái iOS mô phỏng — cùng màu header Chat Kit (chỉ hiện khi có khung điện thoại, từ 744px). */
function StatusBar() {
  return (
    <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-[54px] shrink-0 px-7 pt-2 bg-(--chat-header-bg) bg-(image:--chat-header-gradient) text-(--chat-header-fg) transition-colors duration-[var(--motion-base)]" aria-hidden>
      <span className="justify-self-start pl-3 text-[16px] leading-none font-semibold tnum tracking-[-0.02em]">9:41</span>
      <span className="block h-[34px] w-[122px] rounded-full bg-[#000]" />
      <span className="justify-self-end flex items-center gap-[6px] pr-1">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.3c2.2 0 4.2.8 5.7 2.2l1.1-1.1A9.6 9.6 0 0 0 8 .7 9.6 9.6 0 0 0 1.2 3.4l1.1 1.1A8 8 0 0 1 8 2.3Z" />
          <path d="M8 5.6c1.3 0 2.5.5 3.4 1.3l1.1-1.1A6.4 6.4 0 0 0 8 4a6.4 6.4 0 0 0-4.5 1.8l1.1 1.1A4.8 4.8 0 0 1 8 5.6Z" />
          <path d="M8 8.2c.6 0 1.1.2 1.5.6L8 10.3 6.5 8.8c.4-.4.9-.6 1.5-.6Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity=".5" />
        </svg>
      </span>
    </div>
  );
}

/** Avatar OA ViệcNhanh (không dùng logo Zalo — BR8). */
function OaAvatar({ size = 40 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full ink" style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 16 16" fill="none"><path d="M2.5 3.5 6 12.5 8 7.5 10 12.5 13.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

/** Chat Header · variant brand (Chat Kit): nền gradient ngang #0087FF→#01AFFB, cao 56, nút tròn 40, tên 16 đậm + tick OA cam, phụ đề 12. */
function ChatHeader({ typing, onInfo }: { typing: boolean; onInfo?: () => void }) {
  return (
    <header data-id="zalo-oa-header" className="relative z-20 flex h-14 shrink-0 items-center gap-1 px-2 bg-(--chat-header-bg) bg-(image:--chat-header-gradient) text-(--chat-header-fg) transition-colors duration-[var(--motion-base)]">
      <Link href="/" aria-label={t("Quay lại", "Back")} className="pressable group/hb inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-(--chat-header-fg)/15 active:bg-(--chat-header-fg)/25">
        <Icon name="arrow-left" size={24} className="transition-transform duration-[var(--motion-base)] [transition-timing-function:var(--ease-spring)] group-hover/hb:-translate-x-0.5" />
      </Link>
      <button type="button" onClick={onInfo} aria-label={t("Mở hồ sơ OA", "Open OA profile")} className="pressable flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-base)] py-1 text-left">
        <span className="rounded-full ring-2 ring-(--chat-header-fg)/30"><OaAvatar /></span>
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1">
            <span className="truncate t-lg font-bold">ViệcNhanh Aichi</span>
            <span className="inline-flex shrink-0 text-(--chat-verified)"><Icon name="check-verified" size={16} solid label={t("Official Account đã xác thực", "Verified Official Account")} /></span>
          </span>
          <span key={String(typing)} className="truncate t-sm text-(--chat-header-fg-muted) animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]" data-id="zalo-oa-header-subtitle">
            {typing ? t("đang soạn tin…", "typing…") : t("Official Account · Zalo OA (mô phỏng)", "Official Account · Zalo OA (simulated)")}
          </span>
        </span>
      </button>
      <HeaderIcon icon="menu-01" label={t("Thông tin Official Account", "Official Account info")} onClick={onInfo} />
    </header>
  );
}

/** Logo mô phỏng cho nhà máy (dữ liệu dựng): ô màu + hình khối riêng, chọn theo chữ cái tên nhà máy. */
const LOGO_TONES = [
  "bg-[var(--color-bg-accent-subtle)] text-[var(--color-content-accent-strongest)]",
  "bg-[var(--color-bg-positive-subtle)] text-[var(--color-content-positive-strongest)]",
  "bg-[var(--color-bg-warning-subtle)] text-[var(--color-content-warning-strongest)]",
  "bg-[var(--color-bg-negative-subtle)] text-[var(--color-content-negative-strongest)]",
];
const LOGO_SHAPES = [
  <circle key="c" cx="10" cy="10" r="5.5" />,
  <path key="t" d="M10 4 16 15H4Z" />,
  <path key="d" d="m10 3.5 6.5 6.5-6.5 6.5L3.5 10Z" />,
  <path key="h" d="m10 3.5 5.6 3.25v6.5L10 16.5l-5.6-3.25v-6.5Z" />,
  <path key="b" d="M4 5h12v3H4Zm0 4.5h12v3H4ZM4 14h7v3H4Z" />,
  <path key="s" d="M4 16a6 6 0 0 1 12 0Zm2-12h8v3H6Z" />,
];
function FactoryLogo({ name, size = 40 }: { name: string; size?: number }) {
  const letter = (name.match(/(?:Nhà máy|Factory)\s+(\S)/)?.[1] ?? name[0] ?? "A").toUpperCase();
  const i = letter.charCodeAt(0) - 65;
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl ${LOGO_TONES[((i % 4) + 4) % 4]}`} style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20" fill="currentColor">{LOGO_SHAPES[((i % 6) + 6) % 6]}</svg>
    </span>
  );
}
const splitJob = (s: string) => { const [title, factory = ""] = s.split(" · "); return { title, factory }; };

// ---- Khung chat dùng chung: danh sách tin + chip trả lời nhanh + ô nhập --------
/** Link trong tin nhắn chữ: mặc định mở website (BR6); có group → mở nhóm tuyển dụng trong Zalo. */
type MsgLink = { label: string; sub?: string; group?: Recommend };
type Msg = { id: number; at: string } & (
  | { kind: "text"; from: "bot" | "me"; text: string; links?: MsgLink[] }
  | { kind: "typing" }
  | { kind: "day"; text: string }
  | { kind: "note"; text: string }
  | { kind: "event"; data: OaEvent }
  | { kind: "oa-intro" }
  | { kind: "welcome" }
  | { kind: "assess"; answers: Answers }
  | { kind: "status"; data: StatusUpdate }
  | { kind: "recommend"; data: Recommend }
);

type Answers = { q1?: string; q2?: string; q3?: string };
type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, "id" | "at"> : never) : never;

type Role = "bot" | "me" | "sys";
const roleOf = (m: Msg): Role => (m.kind === "text" ? m.from : m.kind === "day" || m.kind === "note" || m.kind === "oa-intro" ? "sys" : "bot");
type Pos = "single" | "first" | "middle" | "last";
/* Góc bo theo cụm (Chat Kit): phía người gửi bo 2px ở chỗ nối giữa các tin */
const RADIUS: Record<"in" | "out", Record<Pos, string>> = {
  in: { single: "", first: "rounded-bl-[var(--radius-2xs)]", middle: "rounded-l-[var(--radius-2xs)]", last: "rounded-tl-[var(--radius-2xs)]" },
  out: { single: "", first: "rounded-br-[var(--radius-2xs)]", middle: "rounded-r-[var(--radius-2xs)]", last: "rounded-tr-[var(--radius-2xs)]" },
};
const BUBBLE_IN = "rounded-[var(--radius-base)] border border-(--chat-bubble-in-border) bg-(--chat-bubble-in-bg) text-(--chat-bubble-fg) shadow-[var(--shadow-bottom-1)]";
const BUBBLE_OUT = "rounded-[var(--radius-base)] border border-(--chat-bubble-out-border) bg-(--chat-bubble-out-bg) text-(--chat-bubble-fg) shadow-[var(--shadow-bottom-1)]";
/** Khối widget OA: cùng nền/viền với tin đến của Chat Kit. */
const WIDGET = `w-full min-w-0 grid-cols-[minmax(0,1fr)] ${BUBBLE_IN}`;

function Chat({ msgs, chips, onChip, onSend, busy, placeholder = t("Nhập tin nhắn", "Type a message"), actions }: {
  msgs: Msg[]; chips: string[]; onChip: (c: string) => void; onSend: (t: string) => void; busy?: boolean; placeholder?: string; actions?: WidgetActions;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const typing = msgs.some((m) => m.kind === "typing");

  // Luôn cuộn xuống tin mới nhất, kể cả khi widget nở ra sau skeleton.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const toEnd = () => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    toEnd();
    const ro = new ResizeObserver(toEnd);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [msgs]);

  const roles = msgs.map(roleOf);
  const lastMe = roles.lastIndexOf("me");
  const seen = lastMe >= 0 && roles.slice(lastMe + 1).includes("bot");

  return (
    <>
      <div className={showProfile ? "hidden" : "contents"}>
      <ChatHeader typing={typing} onInfo={() => setShowProfile(true)} />
      <div ref={list} data-id="zalo-oa-messages" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-3" aria-live="polite">
        <div className="flex flex-col">
          {msgs.map((m, i) => {
            const r = roles[i];
            const first = roles[i - 1] !== r, last = roles[i + 1] !== r;
            const pos: Pos = first && last ? "single" : first ? "first" : last ? "last" : "middle";
            if (m.kind === "oa-intro") return <OaIntro key={m.id} />;
            if (r === "sys") return <SystemPill key={m.id} m={m} />;
            if (r === "me") return <MeRow key={m.id} m={m} pos={pos} status={i === lastMe ? (seen ? t("Đã xem", "Seen") : t("Đã nhận", "Delivered")) : undefined} />;
            // Bong bóng của OA gom cụm riêng; widget đứng một mình (bo đủ 4 góc, không avatar).
            const bubble = (x?: Msg) => !!x && (x.kind === "text" ? x.from === "bot" : x.kind === "typing");
            const bf = !bubble(msgs[i - 1]), bl = !bubble(msgs[i + 1]);
            const bpos: Pos = !bubble(m) ? "single" : bf && bl ? "single" : bf ? "first" : bl ? "last" : "middle";
            return <BotRow key={m.id} m={m} pos={bpos} gapTop={bubble(m) ? bf : true} avatar={bubble(m) && bl} actions={actions} onStart={chips.includes(START()) && !busy ? () => onChip(START()) : undefined} />;
          })}
        </div>
      </div>

      {chips.length > 0 && (
        <div data-id="zalo-oa-quick-replies" className="shrink-0 flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2 pt-1" role="group" aria-label={t("Trả lời nhanh", "Quick replies")}>
          {chips.map((c) => (
            <button key={c} type="button" disabled={busy} onClick={() => onChip(c)}
              className={`pressable shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-(--color-border-accent-subtle) bg-(--chat-surface) text-(--chat-link) t-base font-medium shadow-[var(--shadow-bottom-1)] hover:bg-(--chat-list-active) disabled:opacity-50 disabled:cursor-not-allowed ${SLIDE}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      <ChatComposer onSend={onSend} busy={busy} placeholder={placeholder} />
      </div>
      {showProfile && <OaProfilePanel onBack={() => setShowProfile(false)} />}
    </>
  );
}

/** Chat Composer (Chat Kit), chỉ nhập chữ: ô nhập tự giãn tới 5 dòng, Enter gửi, viền trên đổi xanh khi focus, nút Gửi pop khi có chữ. */
function ChatComposer({ onSend, busy, placeholder }: { onSend: (t: string) => void; busy?: boolean; placeholder: string }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const has = text.trim().length > 0;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);
  const send = () => { if (!has || busy) return; onSend(text.trim()); setText(""); };
  return (
    <div data-id="zalo-oa-composer" className="flex min-h-14 shrink-0 items-end gap-1 border-t border-hair bg-(--chat-surface) pl-4 pr-2 py-2 transition-colors duration-[var(--motion-fast)] focus-within:border-(--color-border-accent-solid) safe-b md:pb-2">
      <textarea ref={ref} rows={1} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={t("Nội dung tin nhắn", "Message")}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
        className="min-h-10 flex-1 resize-none bg-transparent px-1 py-2 t-lg text-fg caret-[var(--color-content-accent-base)] outline-none placeholder:text-[var(--color-content-placeholder)]" />
      <button type="button" onClick={send} aria-label={t("Gửi", "Send")} disabled={busy || !has}
        className={`pressable group/cb inline-flex size-10 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed ${has && !busy ? "text-[var(--color-content-accent-base)] hover:bg-[var(--color-bg-accent-flat-hover)] animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]" : "text-[var(--color-content-neutral-light)]"}`}>
        <Icon name="send-01" size={24} solid className="transition-transform duration-[var(--motion-base)] [transition-timing-function:var(--ease-spring)] group-hover/cb:translate-x-0.5 group-hover/cb:-rotate-12" />
      </button>
    </div>
  );
}

/** Chat System Message (Chat Kit): pill mốc ngày / ghi chú giữa dòng chat. */
function SystemPill({ m }: { m: Msg }) {
  if (m.kind !== "day" && m.kind !== "note") return null;
  return (
    <div role="separator" className="flex w-full justify-center py-3 animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]">
      <span className="max-w-[90%] rounded-full bg-(--chat-separator-bg) px-3 py-1 text-center t-sm text-(--chat-separator-fg)">{m.text}</span>
    </div>
  );
}

function Time({ at }: { at: string }) {
  return <span className="block mt-1 t-sm text-(--chat-meta) tnum">{at}</span>;
}

/** Tin đi: phải, nền xanh nhạt, bo theo cụm; tin cuối có pill "Đã nhận / Đã xem". */
function MeRow({ m, pos, status }: { m: Msg; pos: Pos; status?: string }) {
  if (m.kind !== "text") return null;
  const showMeta = pos === "last" || pos === "single";
  return (
    <div className={`flex flex-col items-end ${pos === "first" || pos === "single" ? "mt-3" : "mt-0.5"} ${SLIDE}`}>
      <div data-id="chat-bubble-me" className={`max-w-[78%] px-3 py-2 t-lg break-words ${BUBBLE_OUT} ${RADIUS.out[pos]}`}>
        {m.text}
        {showMeta && <Time at={m.at} />}
      </div>
      {status && (
        <span key={status} className="mt-1 inline-flex items-center gap-1 rounded-full bg-(--chat-separator-bg) px-2 py-0.5 t-sm text-(--chat-separator-fg) animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]">
          <Icon name={status === t("Đã xem", "Seen") ? "check-circle" : "check"} size={12} />{status}
        </span>
      )}
    </div>
  );
}

/** Tin đến từ OA. Avatar 32 chỉ đứng cạnh bong bóng tin nhắn (tin cuối của một chuỗi bong bóng), không đứng cạnh widget sự kiện. */
function BotRow({ m, pos, gapTop, avatar, actions, onStart }: { m: Msg; pos: Pos; gapTop: boolean; avatar: boolean; actions?: WidgetActions; onStart?: () => void }) {
  const showMeta = pos === "last" || pos === "single";
  const isBubble = m.kind === "text" || m.kind === "typing";
  return (
    <div className={`flex items-end gap-2 ${gapTop ? "mt-3" : "mt-0.5"} ${SLIDE}`}>
      {isBubble && <div className="flex w-8 shrink-0 justify-center self-end">{avatar && <OaAvatar size={32} />}</div>}
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <BotContent m={m} pos={pos} showMeta={showMeta} actions={actions} onStart={onStart} />
      </div>
    </div>
  );
}

function BotContent({ m, pos, showMeta, actions, onStart }: { m: Msg; pos: Pos; showMeta: boolean; actions?: WidgetActions; onStart?: () => void }) {
  switch (m.kind) {
    case "typing":
      return (
        <span className={`inline-flex gap-1 px-3 py-3 ${BUBBLE_IN} ${RADIUS.in[pos]}`} aria-label={t("Đang soạn tin", "Typing")}>
          {[0, 1, 2].map((d) => <i key={d} className="block size-1.5 rounded-full bg-(--chat-meta) animate-[zen-typing_1s_var(--ease-standard)_infinite]" style={{ animationDelay: `${d * 120}ms` }} />)}
        </span>
      );
    case "text":
      return (
        <div data-id="chat-bubble-bot" className={`max-w-[88%] px-3 py-2 t-lg break-words whitespace-pre-line ${BUBBLE_IN} ${RADIUS.in[pos]}`}>
          {m.text}
          {m.links && (
            <ul className="mt-1.5 grid gap-2 whitespace-normal">
              {m.links.map((l) => (
                <li key={l.label}>
                  <button type="button" onClick={() => (l.group ? actions?.onOpenGroup?.(l.group) : openWeb())}
                    className="pressable group/lk flex w-full items-start gap-1.5 text-left">
                    <Icon name={l.group ? "users" : "arrow-up-right"} size={18} className="mt-[3px] shrink-0 text-(--chat-link)" />
                    <span className="min-w-0">
                      <span className="block font-medium text-(--chat-link) underline underline-offset-2 decoration-(--chat-link)/40 group-hover/lk:decoration-(--chat-link)">{l.label}</span>
                      {l.sub && <span className="block t-sm text-(--chat-meta)">{l.sub}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showMeta && <Time at={m.at} />}
        </div>
      );
    case "event":
      return <EventWidget data={m.data} radius={RADIUS.in[pos]} actions={actions} />;
    case "welcome":
      return <WelcomeCard radius={RADIUS.in[pos]} onStart={onStart} />;
    case "assess":
      return <AssessWidget answers={m.answers} radius={RADIUS.in[pos]} />;
    case "status":
      return <StatusWidget data={m.data} radius={RADIUS.in[pos]} />;
    case "recommend":
      return <RecommendWidget data={m.data} radius={RADIUS.in[pos]} actions={actions} />;
    default:
      return null;
  }
}

// ---- Mở đầu hội thoại: thẻ giới thiệu OA + thẻ chào mừng -----------------------
/** Thẻ giới thiệu OA ở đầu hội thoại (giống hồ sơ OA thu gọn): cover gradient, avatar, tick, 3 cam kết, nút Quan tâm. */
function OaIntro() {
  const [follow, setFollow] = useState(false);
  return (
    <section data-id="zalo-oa-intro" className={`mt-3 overflow-hidden ${BUBBLE_IN} ${SLIDE}`} aria-label={t("Giới thiệu Official Account", "About this Official Account")}>
      <div className="h-16 bg-(--chat-header-bg) bg-(image:--chat-header-gradient)" aria-hidden />
      <div className="px-4 pb-4 -mt-8 grid justify-items-center text-center gap-2">
        <span className="rounded-full ring-4 ring-(--chat-bubble-in-bg)"><OaAvatar size={64} /></span>
        <div>
          <p className="flex items-center justify-center gap-1 t-sub">
            ViệcNhanh Aichi
            <span className="inline-flex text-(--chat-verified)"><Icon name="check-verified" size={18} solid label={t("Official Account đã xác thực", "Verified Official Account")} /></span>
          </p>
          <p className="t-sm text-(--chat-meta)">{t("Official Account · Việc làm cho người Việt tại Aichi", "Official Account · Jobs for Vietnamese workers in Aichi")}</p>
        </div>
        <ul className="flex flex-wrap justify-center gap-1.5" aria-label={t("Cam kết", "Commitments")}>
          {[
            { icon: "shield-tick", t: t("Miễn phí cho người lao động", "Free for workers") },
            { icon: "clock-fast-forward", t: t("Nhà máy trả lời trong 24h", "Factories reply within 24h") },
            { icon: "translate", t: t("Tiếng Việt 7h–22h", "Vietnamese support 7:00–22:00") },
          ].map((x) => (
            <li key={x.t} className="badge badge-md bg-(--chat-canvas) text-fg"><Icon name={x.icon as "shield-tick"} size={14} />{x.t}</li>
          ))}
        </ul>
        <Button size="sm" variant={follow ? "secondary" : "primary"} icon={follow ? "check" : "plus"} className="mt-1 min-w-[140px]" aria-pressed={follow}
          onClick={() => { setFollow((v) => !v); if (!follow) toast(t("Đã quan tâm ViệcNhanh Aichi · bạn sẽ nhận báo việc mới tại đây", "Following ViệcNhanh Aichi · new jobs will arrive here"), "bell-01"); }}>
          <span key={String(follow)} className="animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]">{follow ? t("Đã quan tâm", "Following") : t("Quan tâm", "Follow")}</span>
        </Button>
      </div>
    </section>
  );
}

const welcomeSteps = () => [
  { icon: "passport" as const, t: t("Thời hạn visa và ngành nghề hiện tại", "Visa validity and current field"), s: t("Gõ hoặc bấm chọn, không cần gửi ảnh", "Type or tap, no photo needed") },
  { icon: "tool-02" as const, t: t("Kỹ năng và chứng chỉ liên quan", "Related skills and certificates"), s: t("Bấm chọn, không cần gõ", "Tap to choose, no typing") },
  { icon: "marker-pin-02" as const, t: t("Thời gian nhận việc và khu vực làm việc", "Start date and work area"), s: t("Để chọn nhà máy gần bạn", "To pick factories near you") },
];

/** Thẻ chào mừng: nói rõ 3 câu hỏi gì, nhận lại gì, rồi một nút bắt đầu (gửi tin “Bắt đầu tìm việc”). */
function WelcomeCard({ radius, onStart }: { radius: string; onStart?: () => void }) {
  return (
    <article data-id="zalo-oa-widget-welcome" className={`p-4 grid gap-4 ${WIDGET} ${radius}`}>
      <div>
        <p className="t-eyebrow">{t("Khoảng 1 phút", "About 1 minute")}</p>
        <p className="t-sub mt-1">{t("Trả lời 3 câu, nhận 3 công ty phù hợp", "Answer 3 questions, get 3 matching companies")}</p>
      </div>
      <ol className="grid gap-3">
        {welcomeSteps().map((x) => (
          <li key={x.t} className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon name={x.icon} size={20} /></span>
            <span className="min-w-0">
              <span className="block font-semibold">{x.t}</span>
              <span className="block t-sm text-(--chat-meta)">{x.s}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3 rounded-[var(--radius-base)] bg-(--chat-canvas) px-3 py-2.5">
        <Icon name="stars-01" size={18} solid className="text-brand shrink-0" />
        <p className="t-sm">{t("Bạn nhận lại 3 tiêu chí và 3 công ty phù hợp, bấm “Xem chi tiết” để mở trên ViệcNhanh.", "You get your 3 criteria and 3 matching companies; tap “View details” to open them on ViệcNhanh.")}</p>
      </div>
      <Button block className="t-lg" icon={onStart ? "rocket" : "check"} disabled={!onStart} onClick={onStart}>{onStart ? START() : t("Đã bắt đầu", "Started")}</Button>
    </article>
  );
}

// ---- Widget: 3 tiêu chí + 3 công ty phù hợp ------------------------------------------
/** Dòng công ty: logo · tên việc · nhà máy, khu vực, km · lương tháng; nút “Xem chi tiết” mở website (không badge, không %). */
function JobRow({ j }: { j: OaJob }) {
  return (
    <li className="flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5">
      <FactoryLogo name={j.factory} size={36} />
      <span className="flex-1 min-w-0">
        <span className="block font-semibold truncate">{j.title}</span>
        <span className="block t-sm text-muted truncate">{j.factory} · {j.area} · {j.km} km</span>
        <span className="block t-sm font-semibold tnum" title={D().fmtMonthlyYen(j.pay)}>{D().fmtMonthly(j.pay)}</span>
      </span>
      <Button size="sm" variant="secondary" iconRight="arrow-up-right" onClick={() => openWeb()}>{t("Xem chi tiết", "View details")}</Button>
    </li>
  );
}

function AssessWidget({ answers, radius = "" }: { answers: Answers; radius?: string }) {
  const jobs = [...D().top3].sort((a, b) => b.fit - a.fit).slice(0, 3);
  const criteria = [
    { icon: "passport" as const, k: t("Visa và ngành", "Visa and field"), v: answers.q1 ?? D().profile.visa },
    { icon: "tool-02" as const, k: t("Kỹ năng", "Skills"), v: answers.q2 ?? D().profile.skills[0] },
    { icon: "marker-pin-02" as const, k: t("Bắt đầu và khu vực", "Start and area"), v: answers.q3 ?? `${D().profile.start} · ${D().profile.area}` },
  ];
  return (
    <article data-id="zalo-oa-widget-assess" className={`overflow-hidden ${WIDGET} ${radius}`}>
      <div className="p-4 grid gap-3">
        <div>
          <p className="t-eyebrow">{t("Gợi ý cho", "Suggestions for")} {D().profile.name}</p>
          <p className="t-sub mt-1">{t("3 tiêu chí của bạn", "Your 3 criteria")}</p>
        </div>
        <ul className="grid gap-2">
          {criteria.map((c) => (
            <li key={c.k} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon name={c.icon} size={18} /></span>
              <span className="min-w-0">
                <span className="block t-sm text-(--chat-meta)">{c.k}</span>
                <span className="block font-medium">{c.v}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hair-t p-2">
        <p className="px-3 pt-2 pb-1 t-sm font-semibold">{t("3 công ty phù hợp với bạn", "3 companies that fit you")}</p>
        {jobs.length === 0 ? (
          <div data-id="zalo-oa-empty" className="grid justify-items-center gap-2 px-4 py-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-subtle"><Icon name="search-md" /></span>
            <p className="font-semibold">{t("Chưa có công ty phù hợp", "No matching companies yet")}</p>
            <p className="t-sm text-muted">{t("Mình sẽ nhắn ngay khi có việc mới hợp với bạn.", "I’ll message you as soon as a matching job comes up.")}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-[minmax(0,1fr)]">{jobs.map((j) => <JobRow key={j.id} j={j} />)}</ul>
        )}
        {jobs.length > 0 && jobs.length < 3 && <p className="px-3 py-2 t-sm text-muted">{t("Đang tìm thêm việc cho bạn", "Looking for more jobs for you")}</p>}
      </div>
    </article>
  );
}

// ---- Widget: Cập nhật ứng tuyển (BR7) -------------------------------------------
function StatusBadge({ s }: { s: StatusId }) {
  const tone = STATUS_TONE[s];
  const cls = tone === "positive"
    ? "bg-[var(--color-bg-positive-subtle)] text-[var(--color-content-positive-strongest)]"
    : tone === "negative"
      ? "bg-[var(--color-bg-negative-subtle)] text-[var(--color-content-negative-strongest)]"
      : "bg-brand-soft text-brand";
  return <span className={`badge badge-md ${cls}`}>{D().STATUS_LABEL[s]}</span>;
}

/** Khối tên việc: logo nhà máy · tên việc · nhà máy (+ dòng phụ) · lương tháng và lương giờ. */
function JobHead({ job, pay, sub }: { job: string; pay: number; sub?: string }) {
  const { title, factory } = splitJob(job);
  return (
    <div className="flex items-center gap-3">
      <FactoryLogo name={factory} />
      <div className="flex-1 min-w-0">
        <p className="t-sub truncate">{title}</p>
        <p className="t-sm text-muted truncate">{sub ?? factory}</p>
      </div>
      <div className="shrink-0 text-right" aria-label={t(`Lương ${D().fmtMonthlyYen(pay)}, tức ${D().fmtPay(pay)}`, `Pay ${D().fmtMonthlyYen(pay)}, ${D().fmtPay(pay)}`)}>
        <p className="font-semibold tnum">{D().fmtMonthly(pay)}</p>
        <p className="t-sm text-muted tnum">{D().fmtPay(pay)}</p>
      </div>
    </div>
  );
}

function StatusWidget({ data, radius = "" }: { data: StatusUpdate; radius?: string }) {
  return (
    <article data-id="zalo-oa-widget-status" className={`p-4 grid gap-3 ${WIDGET} ${radius}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="t-eyebrow">{t("Cập nhật ứng tuyển", "Application update")}</p>
        <span className="t-sm text-muted tnum">{data.at}</span>
      </div>
      <JobHead job={data.job} pay={data.pay} />
      <div className="flex items-center gap-2" aria-label={`${t("Trạng thái", "Status")}: ${D().STATUS_LABEL[data.to]}`}>
        <span className="animate-[zen-pop_var(--motion-slower)_var(--ease-bounce)_both] [animation-delay:200ms]"><StatusBadge s={data.to} /></span>
      </div>
      <InlineNote icon={data.to === "interview" ? "calendar-check" : data.to === "viewed" ? "eye" : data.to === "pending" ? "hourglass" : "info-circle"}>{data.note}</InlineNote>
      {data.upskill && <InlineNote icon="lightbulb" tone="warn">{data.upskill}</InlineNote>}
      {data.alternatives && <ul className="grid grid-cols-[minmax(0,1fr)] -mx-3">{data.alternatives.map((j) => <JobRow key={j.id} j={j} />)}</ul>}
      <Button block iconRight="arrow-up-right" onClick={() => openWeb()}>{t("Xem chi tiết", "View details")}</Button>
    </article>
  );
}

// ---- Widget: Việc mới hợp với bạn (BR4) -----------------------------------------
function RecommendWidget({ data, radius = "", actions }: { data: Recommend; radius?: string; actions?: WidgetActions }) {
  const { factory } = splitJob(data.job);
  return (
    <article data-id="zalo-oa-widget-recommend" className={`p-4 grid gap-3 ${WIDGET} ${radius}`}>
      <p className="t-eyebrow">{t("Việc mới hợp với bạn", "New job that fits you")}</p>
      <JobHead job={data.job} pay={data.pay} sub={`${factory} · ${data.area} · ${t(`cách nhà ${data.km} km`, `${data.km} km from home`)}`} />
      <MatchChips lang={getOaLang()} chips={data.chips.filter((c) => c.ok).map((c) => ({ ok: true, vi: c.label, en: c.label, ja: c.label }))} />
      <Button block iconRight="arrow-up-right" onClick={() => openWeb()}>{t("Xem chi tiết", "View details")}</Button>
      {actions?.onOpenGroup && (
        <button type="button" data-id="zalo-oa-open-chat" onClick={() => actions.onOpenGroup?.(data)}
          className="pressable -mx-4 -mb-4 mt-1 flex items-center justify-center gap-1.5 border-t border-hair py-3 t-base font-medium text-(--chat-link) hover:bg-(--chat-list-active) rounded-b-[var(--radius-base)]">
          <Icon name="message-chat-circle" size={18} />{t("Mở box chat", "Open group chat")}
        </button>
      )}
    </article>
  );
}

// ---- Kịch bản B1 · Lần đầu --------------------------------------------------------
type Stage = "idle" | QuestionId | "evaluating" | "done";
const START = () => t("Bắt đầu tìm việc", "Start job search");
const SKIP = () => t("Bỏ qua", "Skip");
const UNSURE = () => t("Không rõ visa của mình", "Not sure about my visa");
const AGAIN = () => t("Làm lại từ đầu", "Start over");
const NEXT: Record<QuestionId, Stage> = { q1: "q2", q2: "q3", q3: "evaluating" };

const clock = () => new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

function useMessages(initial: () => NewMsg[]) {
  const seq = useRef(0);
  const [msgs, setMsgs] = useState<Msg[]>(() => initial().map((m) => ({ ...m, id: ++seq.current, at: clock() }) as Msg));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const push = useCallback((...m: NewMsg[]) => setMsgs((x) => [...x.filter((y) => y.kind !== "typing"), ...m.map((y) => ({ ...y, id: ++seq.current, at: clock() }) as Msg)]), []);
  const later = useCallback((ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); }, []);
  return { msgs, setMsgs, push, later };
}

/**
 * Nhóm chat của việc ("Mở box chat"): nhóm thông báo, chỉ trưởng nhóm và phó nhóm được gửi tin.
 * Thành viên chỉ đọc và thả reaction. Dữ liệu dựng.
 */
function GroupChat({ data, onBack }: { data: Recommend; onBack: () => void }) {
  const { title, factory } = splitJob(data.job);
  const posts = D().groupPosts(title, factory, data.area, data.km, D().fmtMonthly(data.pay), D().fmtPay(data.pay));
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<"chat" | "info" | "members">("chat");
  return (
    <div data-id="zalo-oa-group" className="flex flex-col flex-1 min-h-0 animate-[zen-slide-in-right_var(--motion-slow)_var(--ease-spring)_both]">
      <div className={view === "chat" ? "contents" : "hidden"}>
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-1 px-2 bg-(--chat-header-bg) bg-(image:--chat-header-gradient) text-(--chat-header-fg)">
        <button type="button" onClick={onBack} aria-label={t("Quay lại OA", "Back to OA")} className="pressable group/hb inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-(--chat-header-fg)/15">
          <Icon name="arrow-left" size={24} className="transition-transform duration-[var(--motion-base)] group-hover/hb:-translate-x-0.5" />
        </button>
        <span className="rounded-xl ring-2 ring-(--chat-header-fg)/30"><FactoryLogo name={factory} size={40} /></span>
        <button type="button" onClick={() => setView("info")} aria-label={t("Mở thông tin nhóm", "Open group info")} className="pressable ml-2 flex min-w-0 flex-1 flex-col text-left">
          <span className="truncate t-lg font-bold">{t(`Nhóm ${title} · ${factory}`, `${title} · ${factory} group`)}</span>
          <span className="truncate t-sm text-(--chat-header-fg-muted)">{t(`Cộng đồng · ${GROUP_SIZE} thành viên`, `Community · ${GROUP_SIZE} members`)}</span>
        </button>
        <HeaderIcon icon="menu-01" label={t("Thông tin nhóm", "Group info")} onClick={() => setView("info")} />
      </header>
      <div className="flex items-center gap-2 px-4 py-2 bg-(--chat-surface) border-b border-hair t-sm">
        <Icon name="calendar-check" size={16} className="text-(--chat-link) shrink-0" />
        <span className="truncate"><b>{t("Đã ghim:", "Pinned:")}</b> {t("Phỏng vấn online thứ Tư 18/11, 10:00", "Online interview Wed Nov 18, 10:00")}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        <div role="separator" className="flex justify-center py-3"><span className="rounded-full bg-(--chat-separator-bg) px-3 py-1 t-sm text-(--chat-separator-fg)">{t("Bạn đã tham gia nhóm qua ViệcNhanh Aichi", "You joined via ViệcNhanh Aichi")}</span></div>
        {posts.map((p, i) => {
          const admin = D().GROUP_ADMINS[p.by];
          const head = posts[i - 1]?.by !== p.by;
          const on = !!mine[p.id];
          return (
            <div key={p.id} className={`flex items-end gap-2 ${head ? "mt-3" : "mt-1"} ${SLIDE}`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-8 shrink-0">{(posts[i + 1]?.by !== p.by) && <Avatar name={admin.name.split(" · ")[0]} size={32} />}</div>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                {head && (
                  <span className="flex items-center gap-1.5 px-1 pb-1 t-sm text-(--chat-meta)">
                    {admin.name}
                    <span className={`badge ${p.by === "lead" ? "bg-[var(--color-bg-warning-subtle)] text-[var(--color-content-warning-strongest)]" : "bg-brand-soft text-brand"}`}>{admin.role}</span>
                  </span>
                )}
                <div className={`relative max-w-[92%] px-3 py-2 t-lg ${BUBBLE_IN} ${p.info ? "w-full" : ""}`}>
                  {p.text}
                  {p.info && (
                    <div>
                      <p className="t-sub mb-2">{t(`Thông tin việc ${title}`, `${title} · job details`)}</p>
                      <dl className="grid gap-1.5 t-base">
                        {p.info.map((r) => (
                          <div key={r.k} className="grid grid-cols-[88px_1fr] gap-2">
                            <dt className="text-(--chat-meta)">{r.k}</dt>
                            <dd className="font-medium">{r.v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                  <span className="mt-1 flex items-center gap-2 t-sm text-(--chat-meta) tnum">{p.at}<span aria-hidden>·</span><Icon name="eye" size={12} />{p.seen}</span>
                  <button type="button" aria-pressed={on} aria-label={on ? t("Bỏ thích", "Unlike") : t("Thích", "Like")} onClick={() => setMine((m) => ({ ...m, [p.id]: !m[p.id] }))}
                    className={`pressable absolute -bottom-3 right-2 inline-flex h-6 items-center gap-1 rounded-full border px-2 t-sm tnum shadow-[var(--shadow-bottom-1)] ${on ? "border-(--color-border-accent-subtle) bg-(--chat-list-active) text-(--chat-link)" : "border-(--chat-bubble-in-border) bg-(--chat-surface) text-(--chat-meta)"}`}>
                    <span key={String(on)} className={on ? "inline-flex animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]" : "inline-flex"}><Icon name="thumbs-up" size={14} solid={on} /></span>
                    {p.up + (on ? 1 : 0)}
                  </button>
                </div>
                <span className="h-3" aria-hidden />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex min-h-14 shrink-0 items-center gap-3 border-t border-hair bg-(--chat-surface) px-4 py-2 safe-b md:pb-2">
        <Icon name="lock-01" size={20} className="text-(--chat-meta) shrink-0" />
        <p className="flex-1 t-sm text-(--chat-meta)">{t("Chỉ trưởng nhóm và phó nhóm được gửi tin trong nhóm này.", "Only the owner and deputies can post in this group.")}</p>
        <Button size="sm" variant="secondary" onClick={onBack}>{t("Nhắn OA", "Message OA")}</Button>
      </div>
      </div>
      {view === "info" && <GroupInfoPanel title={t(`Nhóm ${title} · ${factory}`, `${title} · ${factory} group`)} factory={factory} onBack={() => setView("chat")} onMembers={() => setView("members")} onLeave={onBack} />}
      {view === "members" && <MembersPanel onBack={() => setView("info")} />}
    </div>
  );
}

// ---- Side tab: chrome dùng chung (theo màn "Thông tin" của Zalo) -------------------
const GROUP_SIZE = 128;
const notInDemo = () => toast(t("Mục này chỉ là mô phỏng trong bản demo", "This item is only simulated in the demo"), "info-circle");

function HeaderIcon({ icon, label, onClick }: { icon: "menu-01" | "edit-02" | "search-md" | "users"; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className="pressable group/hb inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-(--chat-header-fg)/15 active:bg-(--chat-header-fg)/25">
      <Icon name={icon} size={24} className="transition-transform duration-[var(--motion-base)] [transition-timing-function:var(--ease-spring)] group-hover/hb:scale-110" />
    </button>
  );
}

/** Thanh đầu side tab: nền gradient, nút quay lại, tiêu đề, tối đa 2 nút phải. */
function PanelHeader({ title, onBack, children }: { title: string; onBack: () => void; children?: ReactNode }) {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-1 px-2 bg-(--chat-header-bg) bg-(image:--chat-header-gradient) text-(--chat-header-fg)">
      <button type="button" onClick={onBack} aria-label={t("Quay lại", "Back")} className="pressable group/hb inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-(--chat-header-fg)/15">
        <span className="inline-flex transition-transform duration-[var(--motion-base)] group-hover/hb:-translate-x-0.5"><Icon name="chevron-down" size={26} className="rotate-90" /></span>
      </button>
      <h2 className="flex-1 min-w-0 truncate pl-1 t-h4 font-medium">{title}</h2>
      {children}
    </header>
  );
}

type RowIcon = "users" | "globe-02" | "file-check" | "bell-01" | "layout-grid-01" | "translate" | "eye" | "alert-triangle" | "x-circle" | "log-out-01" | "clock" | "marker-pin-02" | "phone-call" | "image-plus";
/** Dòng cài đặt: icon 24 · nhãn 16 · giá trị phụ · mũi tên hoặc công tắc; đường kẻ thụt thẳng cột chữ. */
function PanelRow({ icon, label, value, badge, danger, onClick, toggle, info }: {
  icon: RowIcon; label: string; value?: string; badge?: string; danger?: boolean; onClick?: () => void; toggle?: { on: boolean; set: (v: boolean) => void };
  /** Dòng chỉ hiển thị thông tin: không bấm được, không mũi tên. */
  info?: boolean;
}) {
  const body = (
    <>
      <Icon name={icon} size={24} className={danger ? "text-[var(--color-content-negative-base)]" : "text-(--chat-meta)"} />
      <span className="flex flex-1 min-w-0 items-center gap-2 self-stretch border-b border-hair group-last/rows:border-0">
        <span className={`truncate t-lg ${danger ? "text-[var(--color-content-negative-base)]" : ""}`}>{label}</span>
        {badge && <span className="badge bg-[var(--color-bg-positive-solid)] text-white">{badge}</span>}
        <span className="flex-1" />
        {value && <span className="t-base font-medium text-(--chat-meta)">{value}</span>}
        {toggle ? <Toggle checked={toggle.on} onChange={toggle.set} label={label} /> : !danger && !info && <Icon name="chevron-down" size={20} className="-rotate-90 text-(--chat-meta)" />}
      </span>
    </>
  );
  const cls = "group/rows flex h-14 w-full items-center gap-4 pl-4 pr-4 text-left";
  return toggle || info ? <div className={cls}>{body}</div> : <button type="button" onClick={onClick ?? notInDemo} className={`${cls} pressable hover:bg-(--chat-list-hover)`}>{body}</button>;
}

function PanelBlock({ children }: { children: ReactNode }) {
  return <section className="bg-(--chat-surface) [&>*:last-child>span]:border-0">{children}</section>;
}

function RoundAction({ icon, label, onClick, on }: { icon: "search-md" | "users" | "bell-01" | "phone-call" | "globe-02" | "send-01"; label: string; onClick?: () => void; on?: boolean }) {
  return (
    <button type="button" onClick={onClick ?? notInDemo} className="pressable group/qa flex flex-col items-center gap-2 rounded-[var(--radius-base)] py-2">
      <span className={`grid size-12 place-items-center rounded-full transition-transform duration-[var(--motion-base)] [transition-timing-function:var(--ease-spring)] group-hover/qa:-translate-y-0.5 ${on ? "bg-(--chat-list-active) text-(--chat-link)" : "bg-(--chat-canvas) text-fg"}`}>
        <Icon name={icon} size={22} solid={on} />
      </span>
      <span key={label} className="t-base text-center animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]">{label}</span>
    </button>
  );
}

/** Ô ảnh mô phỏng (không dùng ảnh thật): khối màu + icon. */
function MediaStrip({ onMore }: { onMore?: () => void }) {
  const tiles = ["bg-[var(--color-bg-accent-subtle)]", "bg-[var(--color-bg-positive-subtle)]", "bg-[var(--color-bg-warning-subtle)]", "bg-[var(--color-bg-negative-subtle)]"];
  const icons = ["building-02", "tool-02", "truck", "users"] as const;
  return (
    <div className="grid grid-cols-5 gap-1.5 pl-14 pr-4 pb-4">
      {tiles.map((t, i) => (
        <span key={t} className={`aspect-square rounded-lg grid place-items-center text-(--chat-meta) ${t}`} aria-hidden><Icon name={icons[i]} size={22} /></span>
      ))}
      <button type="button" onClick={onMore ?? notInDemo} aria-label={t("Xem tất cả ảnh, file, link", "See all photos, files, links")} className="pressable aspect-square rounded-lg grid place-items-center bg-(--chat-canvas)"><Icon name="arrow-right" size={22} /></button>
    </div>
  );
}

/** Side tab hồ sơ Official Account (Chat Kit · OAProfilePanel), mở từ header. */
function OaProfilePanel({ onBack }: { onBack: () => void }) {
  const [follow, setFollow] = useState(true);
  const [muted, setMuted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [more, setMore] = useState(false);
  return (
    <aside data-id="zalo-oa-profile" aria-label={t("Hồ sơ ViệcNhanh Aichi", "ViệcNhanh Aichi profile")} className="flex flex-col flex-1 min-h-0 animate-[zen-slide-in-right_var(--motion-slow)_var(--ease-spring)_both]">
      <PanelHeader title={t("Thông tin", "Info")} onBack={onBack} />
      <div className="flex-1 min-h-0 overflow-y-auto bg-(--chat-canvas) grid content-start gap-2 pb-4">
        <PanelBlock>
          <div className="grid justify-items-center gap-2 px-4 pt-6 pb-4 text-center">
            <OaAvatar size={88} />
            <h3 className="mt-1 flex items-center gap-1 t-h4">ViệcNhanh Aichi<span className="inline-flex text-(--chat-verified)"><Icon name="check-verified" size={20} solid label={t("Đã xác thực", "Verified")} /></span></h3>
            <span className="badge badge-md bg-(--chat-list-active) text-(--chat-link)">Official Account</span>
            <p className="t-base text-(--chat-meta)">{t("Việc làm · Aichi · 12,4k người quan tâm", "Jobs · Aichi · 12.4k followers")}</p>
            <div className="mt-2 grid w-full grid-cols-2 gap-2">
              <Button variant={follow ? "secondary" : "primary"} icon={follow ? "check" : "plus"} onClick={() => setFollow((v) => !v)}>
                <span key={String(follow)} className="animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]">{follow ? t("Đã quan tâm", "Following") : t("Quan tâm", "Follow")}</span>
              </Button>
              <Button variant="tertiary" icon="message-chat-circle" onClick={onBack}>{t("Nhắn tin", "Message")}</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 px-4 pb-4">
            <RoundAction icon="search-md" label={t("Tìm tin nhắn", "Search messages")} />
            <RoundAction icon="globe-02" label="Website" onClick={() => openWeb()} />
            <RoundAction icon="bell-01" label={muted ? t("Bật thông báo", "Unmute") : t("Tắt thông báo", "Mute")} on={muted} onClick={() => setMuted((v) => !v)} />
          </div>
        </PanelBlock>
        <PanelBlock>
          <div className="px-4 py-3 grid gap-1">
            <p className="t-sub">{t("Giới thiệu", "About")}</p>
            <p key={String(more)} className={`t-base text-muted animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both] ${more ? "" : "line-clamp-3"}`}>
              {t(
                "ViệcNhanh Aichi giúp người Việt ở Aichi tìm việc đúng visa, gần nơi ở. AI chấm mức phù hợp giữa hồ sơ và tin tuyển dụng, nhà máy cam kết trả lời trong 24 giờ. Miễn phí cho người lao động, không thu phí giới thiệu. Nhân viên nói tiếng Việt hỗ trợ 7h–22h mỗi ngày.",
                "ViệcNhanh Aichi helps Vietnamese workers in Aichi find jobs that match their visa, close to where they live. AI scores the fit between a profile and each job post, and factories commit to replying within 24 hours. Free for workers, with no placement fee. Vietnamese-speaking staff help from 7:00 to 22:00 every day.",
              )}
            </p>
            <button type="button" onClick={() => setMore((v) => !v)} className="pressable justify-self-start t-base font-medium text-(--chat-link)">{more ? t("Thu gọn", "Show less") : t("Xem thêm", "Show more")}</button>
          </div>
        </PanelBlock>
        <PanelBlock>
          <PanelRow icon="clock" label={t("Giờ hỗ trợ", "Support hours")} value="7:00–22:00" info />
          <PanelRow icon="marker-pin-02" label={t("Khu vực", "Area")} value={t("Aichi, Nhật Bản", "Aichi, Japan")} info />
          <PanelRow icon="globe-02" label={t("Website ViệcNhanh", "ViệcNhanh website")} onClick={() => openWeb()} />
        </PanelBlock>
        <PanelBlock>
          <PanelRow icon="image-plus" label={t("Ảnh, file, link", "Photos, files, links")} />
          <MediaStrip />
        </PanelBlock>
        <PanelBlock>
          <PanelRow icon="bell-01" label={t("Thông báo", "Notifications")} value={muted ? t("Đã tắt", "Off") : t("Đang bật", "On")} />
          <PanelRow icon="eye" label={t("Ẩn trò chuyện", "Hide chat")} toggle={{ on: hidden, set: setHidden }} />
        </PanelBlock>
        <PanelBlock>
          <PanelRow icon="alert-triangle" label={t("Báo xấu", "Report")} />
          <PanelRow icon="x-circle" label={t("Xoá trò chuyện", "Delete chat")} danger />
          <PanelRow icon="log-out-01" label={t("Bỏ quan tâm", "Unfollow")} danger onClick={() => { setFollow(false); toast(t("Đã bỏ quan tâm · bạn sẽ không nhận báo việc mới", "Unfollowed · you won’t get new job alerts"), "info-circle"); }} />
        </PanelBlock>
      </div>
    </aside>
  );
}

/** Side tab "Thông tin" của nhóm/cộng đồng việc (theo màn Zalo): hành động nhanh, ảnh, thành viên, cài đặt. */
function GroupInfoPanel({ title, factory, onBack, onMembers, onLeave }: { title: string; factory: string; onBack: () => void; onMembers: () => void; onLeave: () => void }) {
  const [muted, setMuted] = useState(false);
  const [hidden, setHidden] = useState(false);
  return (
    <aside data-id="zalo-oa-group-info" aria-label={`${t("Thông tin", "Info")} ${title}`} className="flex flex-col flex-1 min-h-0 animate-[zen-slide-in-right_var(--motion-slow)_var(--ease-spring)_both]">
      <PanelHeader title={t("Thông tin", "Info")} onBack={onBack}><HeaderIcon icon="edit-02" label={t("Đổi tên nhóm", "Rename group")} onClick={notInDemo} /></PanelHeader>
      <div className="flex-1 min-h-0 overflow-y-auto bg-(--chat-canvas) grid content-start gap-2 pb-4">
        <PanelBlock>
          <div className="grid justify-items-center gap-2 px-4 pt-6 pb-2 text-center">
            <span className="rounded-full overflow-hidden"><FactoryLogo name={factory} size={88} /></span>
            <h3 className="mt-1 t-h4">{title}</h3>
            <span className="badge badge-md bg-(--chat-canvas) text-(--chat-link)">{t("Cộng đồng", "Community")}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 px-4 pb-4">
            <RoundAction icon="search-md" label={t("Tìm tin nhắn", "Search messages")} />
            <RoundAction icon="users" label={t("Mời tham gia", "Invite")} />
            <RoundAction icon="bell-01" label={muted ? t("Bật thông báo", "Unmute") : t("Tắt thông báo", "Mute")} on={muted} onClick={() => setMuted((v) => !v)} />
          </div>
        </PanelBlock>
        <PanelBlock>
          <PanelRow icon="image-plus" label={t("Ảnh, file, link", "Photos, files, links")} />
          <MediaStrip />
          <PanelRow icon="users" label={t(`Thành viên (${GROUP_SIZE})`, `Members (${GROUP_SIZE})`)} onClick={onMembers} />
          <PanelRow icon="globe-02" label={t("Link cộng đồng", "Community link")} value={t("Đang bật", "On")} />
          <PanelRow icon="file-check" label={t("Bảng tin cộng đồng", "Community board")} />
        </PanelBlock>
        <PanelBlock>
          <PanelRow icon="bell-01" label={t("Thông báo", "Notifications")} value={muted ? t("Đã tắt", "Off") : undefined} />
          <PanelRow icon="layout-grid-01" label={t("Sắp xếp và phân loại", "Sort and label")} />
          <PanelRow icon="translate" label={t("Dịch trò chuyện", "Translate chat")} badge={t("Mới", "New")} />
          <PanelRow icon="eye" label={t("Ẩn trò chuyện", "Hide chat")} toggle={{ on: hidden, set: setHidden }} />
        </PanelBlock>
        <PanelBlock>
          <PanelRow icon="alert-triangle" label={t("Báo xấu", "Report")} />
          <PanelRow icon="x-circle" label={t("Xoá trò chuyện", "Delete chat")} danger />
          <PanelRow icon="log-out-01" label={t("Rời cộng đồng", "Leave community")} danger onClick={() => { toast(t("Đã rời cộng đồng", "Left the community"), "log-out-01"); onLeave(); }} />
        </PanelBlock>
      </div>
    </aside>
  );
}

/** Danh sách thành viên: trưởng/phó cộng đồng có huy hiệu, còn lại ghi cách tham gia. */
function MembersPanel({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<GroupMember | null>(null);
  if (open) return <UserProfilePanel m={open} onBack={() => setOpen(null)} />;
  return (
    <aside data-id="zalo-oa-group-members" aria-label={t("Thành viên", "Members")} className="flex flex-col flex-1 min-h-0 animate-[zen-slide-in-right_var(--motion-slow)_var(--ease-spring)_both]">
      <PanelHeader title={t("Thành viên", "Members")} onBack={onBack}>
        <HeaderIcon icon="users" label={t("Mời thành viên", "Invite members")} onClick={notInDemo} />
        <HeaderIcon icon="search-md" label={t("Tìm thành viên", "Search members")} onClick={notInDemo} />
      </PanelHeader>
      <div className="flex-1 min-h-0 overflow-y-auto bg-(--chat-surface)">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="t-base font-semibold text-(--chat-link)">{t(`Thành viên (${GROUP_SIZE})`, `Members (${GROUP_SIZE})`)}</p>
          <button type="button" onClick={notInDemo} aria-label={t("Tuỳ chọn", "Options")} className="pressable icon-btn sm text-(--chat-meta)"><Icon name="dots-horizontal" /></button>
        </div>
        <ul>
          {D().GROUP_MEMBERS.map((m, i) => (
            <li key={m.name} className={`flex items-center gap-2 pl-2 pr-4 ${SLIDE}`} style={{ animationDelay: `${i * 40}ms` }}>
              <button type="button" onClick={() => setOpen(m)} aria-label={t(`Xem trang cá nhân ${m.name}`, `View ${m.name}’s profile`)} className="pressable flex flex-1 min-w-0 items-center gap-4 rounded-[var(--radius-base)] px-2 py-2.5 text-left hover:bg-(--chat-list-hover)">
              <span className="relative">
                <Avatar name={m.me ? D().profile.name : m.name.split(" · ")[0]} size={52} />
                {m.admin && (
                  <span className={`absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full ring-2 ring-(--chat-surface) ${m.admin === "lead" ? "bg-[var(--color-bg-warning-solid)] text-white" : "bg-[var(--color-content-neutral-light)] text-white"}`} aria-label={m.note}>
                    <Icon name="shield-tick" size={12} solid />
                  </span>
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block truncate t-lg">{m.name}</span>
                <span className="block truncate t-base text-(--chat-meta)">{m.note}</span>
              </span>
              </button>
              {!m.me && <button type="button" onClick={notInDemo} aria-label={t(`Kết bạn với ${m.name}`, `Add ${m.name} as a friend`)} className="pressable icon-btn sm text-(--chat-meta)"><AddFriendIcon size={20} /></button>}
            </li>
          ))}
        </ul>
        <p className="px-4 py-4 t-sm text-(--chat-meta)">{t("Tên thành viên là dữ liệu dựng.", "Member names are mock data.")}</p>
      </div>
    </aside>
  );
}

/** Icon "kết bạn": người + dấu cộng ở góc trên phải (bộ icon của prototype không có sẵn). */
const initials = (n: string) => { const p = n.trim().split(/\s+/); return (p.length > 1 ? p[p.length - 2][0] + p[p.length - 1][0] : p[0].slice(0, 2)).toUpperCase(); };

function AddFriendIcon({ size = 22 }: { size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }} aria-hidden>
      <Icon name="user" size={size} />
      <span className="absolute -top-0.5 -right-1 grid place-items-center rounded-full bg-[inherit]" style={{ width: size * 0.5, height: size * 0.5 }}>
        <Icon name="plus" size={Math.round(size * 0.5)} />
      </span>
    </span>
  );
}

/** Trang cá nhân thành viên (theo màn Zalo): cover, avatar lớn, tên, ghi chú quyền riêng tư, Nhắn tin + Kết bạn. Dữ liệu dựng. */
function UserProfilePanel({ m, onBack }: { m: GroupMember; onBack: () => void }) {
  const [sent, setSent] = useState(false);
  const name = m.me ? D().profile.name : m.name.split(" · ")[0];
  const btn = "pressable inline-flex size-10 items-center justify-center rounded-full text-white [filter:drop-shadow(0_1px_2px_rgb(0_0_0/.45))] hover:bg-white/15";
  return (
    <aside data-id="zalo-oa-user-profile" aria-label={t(`Trang cá nhân ${name}`, `${name}’s profile`)} className="relative flex flex-col flex-1 min-h-0 overflow-y-auto bg-(--chat-list-pinned) animate-[zen-slide-in-right_var(--motion-slow)_var(--ease-spring)_both]">
      <div className="relative h-56 shrink-0 overflow-hidden bg-(--chat-header-bg) bg-(image:--chat-header-gradient)" aria-hidden>
        <svg viewBox="0 0 390 224" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full text-white">
          <circle cx="320" cy="50" r="70" fill="currentColor" opacity=".12" /><circle cx="60" cy="190" r="90" fill="currentColor" opacity=".1" />
          <path d="M0 170 C90 140 170 190 260 160 S360 140 390 150 V224 H0Z" fill="currentColor" opacity=".16" />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-0 flex items-center gap-1 px-2 h-14">
        <button type="button" onClick={onBack} aria-label={t("Quay lại", "Back")} className={btn}><Icon name="chevron-down" size={26} className="rotate-90" /></button>
        <span className="flex-1" />
        {!m.me && <button type="button" onClick={notInDemo} aria-label={t(`Gọi ${name}`, `Call ${name}`)} className={btn}><Icon name="phone" size={22} /></button>}
        <button type="button" onClick={notInDemo} aria-label={t("Tuỳ chọn", "Options")} className={btn}><Icon name="dots-horizontal" size={24} /></button>
      </div>
      <div className="relative z-10 -mt-16 grid justify-items-center gap-2 px-6 pb-6 text-center">
        <span className="grid size-[120px] place-items-center rounded-full border-4 border-white bg-(--chat-header-bg) bg-(image:--chat-header-gradient) text-[44px] font-semibold text-white shadow-[var(--shadow-bottom-2)] animate-[zen-pop_var(--motion-slower)_var(--ease-bounce)]" aria-hidden>{initials(name)}</span>
        <h3 className="mt-2 flex items-center gap-2 t-h3">{m.me ? `${name} (${t("Bạn", "You")})` : name}</h3>
        {m.admin && <span className={`badge badge-md ${m.admin === "lead" ? "bg-[var(--color-bg-warning-subtle)] text-[var(--color-content-warning-strongest)]" : "bg-brand-soft text-brand"}`}>{m.note}</span>}
        {m.me ? (
          <p className="t-lg text-muted">{t("Đây là trang cá nhân của bạn trong cộng đồng.", "This is your profile in the community.")}</p>
        ) : (
          <>
            <p className="t-lg text-muted">{t(`Bạn chưa thể xem nhật ký của ${name} khi chưa là bạn bè.`, `You can’t see ${name}’s timeline until you’re friends.`)}</p>
            <div className="mt-3 flex w-full items-center gap-3">
              <button type="button" onClick={notInDemo} className="pressable flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-bg-accent-subtle)] hover:bg-[var(--color-bg-accent-subtle-hover)] t-lg font-semibold text-(--chat-link)">
                <Icon name="message-chat-circle" size={22} />{t("Nhắn tin", "Message")}
              </button>
              <button type="button" onClick={() => { setSent((v) => !v); if (!sent) toast(t(`Đã gửi lời mời kết bạn tới ${name}`, `Friend request sent to ${name}`), "user"); }} aria-pressed={sent}
                aria-label={sent ? t("Huỷ lời mời kết bạn", "Cancel friend request") : t(`Kết bạn với ${name}`, `Add ${name} as a friend`)} className={`pressable grid h-12 w-16 place-items-center rounded-full ${sent ? "bg-(--chat-list-active) text-(--chat-link)" : "bg-(--chat-surface) text-fg"}`}>
                <span key={String(sent)} className="inline-flex animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]">{sent ? <Icon name="check" size={22} /> : <AddFriendIcon size={22} />}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/** Widget sự kiện (職場見学 / hội chợ). Quan tâm → thêm lịch (.ics). Không quan tâm → thu thành 1 dòng để không che tin cập nhật đơn. */
function EventWidget({ data, radius = "", actions }: { data: OaEvent; radius?: string; actions?: WidgetActions }) {
  const st = actions?.events?.[data.id];
  if (st === "no") {
    return (
      <div data-id="zalo-oa-event-hidden" className={`w-full flex items-center gap-2 rounded-full bg-(--chat-separator-bg) px-3 py-1.5 t-sm text-(--chat-separator-fg) animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]`}>
        <Icon name="eye" size={14} />
        <span className="flex-1 min-w-0 truncate">{t("Đã ẩn:", "Hidden:")} {data.title}</span>
        <button type="button" onClick={() => actions?.onEvent?.(data, "undo")} className="pressable font-semibold underline underline-offset-2">{t("Hoàn tác", "Undo")}</button>
      </div>
    );
  }
  const rows: { icon: "calendar" | "marker-pin-02" | "briefcase" | "users"; v: string }[] = [
    { icon: "calendar", v: `${data.date} · ${data.time}` },
    { icon: "marker-pin-02", v: `${data.place} · ${t(`cách bạn ${data.km} km`, `${data.km} km from you`)}` },
    { icon: "briefcase", v: data.scope },
    { icon: "users", v: `${data.age} · ${data.who}` },
  ];
  return (
    <article data-id="zalo-oa-widget-event" className={`p-4 grid gap-3 overflow-hidden ${WIDGET} ${radius}`}>
      <EventCover data={data} />
      <div className="flex items-center justify-between gap-2">
        <p className="t-eyebrow">{data.type} · {data.jp}</p>
        {data.seats && <span className="badge bg-[var(--color-bg-warning-subtle)] text-[var(--color-content-warning-strongest)]">{data.seats}</span>}
      </div>
      <div className="flex items-center gap-3">
        <FactoryLogo name={data.host} />
        <div className="min-w-0">
          <p className="t-sub">{data.title}</p>
          <p className="t-sm text-muted">{t("Tổ chức:", "Hosted by")} {data.host}</p>
        </div>
      </div>
      <ul className="grid gap-2">
        {rows.map((r) => (
          <li key={r.icon} className="flex gap-2.5 t-base"><Icon name={r.icon} size={18} className="mt-0.5 shrink-0 text-(--chat-meta)" /><span className="min-w-0">{r.v}</span></li>
        ))}
      </ul>
      <MatchChips lang={getOaLang()} chips={data.perks.map((p) => ({ ok: true, vi: p, en: p, ja: p }))} />
      {st === "yes" ? (
        <div className="grid gap-2">
          <Button block variant="secondary" icon="calendar-check" disabled>{t("Đã thêm vào lịch", "Added to calendar")}</Button>
          <button type="button" onClick={() => downloadIcs(data)} className="pressable justify-self-center t-base font-medium text-(--chat-link)">{t("Tải lại file lịch (.ics)", "Download calendar file again (.ics)")}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => actions?.onEvent?.(data, "no")}>{t("Không quan tâm", "Not interested")}</Button>
          <Button icon="calendar-check" onClick={() => actions?.onEvent?.(data, "yes")}>{t("Quan tâm", "Interested")}</Button>
        </div>
      )}
    </article>
  );
}

/** Ảnh cover minh hoạ cho sự kiện (vẽ bằng SVG, không dùng ảnh thật): nhà máy cho 職場見学, gian hàng cho hội chợ. Ngày nổi trên góc. */
function EventCover({ data }: { data: OaEvent }) {
  const fair = data.id.startsWith("fair");
  return (
    <div className="relative -mx-4 -mt-4 mb-1 h-36 overflow-hidden bg-(--chat-header-bg) bg-(image:--chat-header-gradient)" aria-hidden>
      <svg viewBox="0 0 360 144" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full text-white">
        <circle cx="300" cy="34" r="18" fill="currentColor" opacity=".35" />
        <path d="M0 118 C70 100 140 128 220 112 S330 100 360 108 V144 H0Z" fill="currentColor" opacity=".18" />
        {fair ? (
          <g fill="currentColor">
            {[24, 104, 184, 264].map((x, i) => (
              <g key={x} opacity={i % 2 ? 0.75 : 0.95}>
                <path d={`M${x} 92 L${x + 36} 70 L${x + 72} 92 Z`} />
                <rect x={x + 6} y="92" width="60" height="34" rx="3" opacity=".85" />
                <rect x={x + 22} y="104" width="28" height="22" rx="2" fill="var(--chat-header-bg)" opacity=".55" />
              </g>
            ))}
            <path d="M18 70 Q180 40 342 70" stroke="currentColor" strokeWidth="2" fill="none" opacity=".6" />
            {[60, 120, 180, 240, 300].map((x) => <path key={x} d={`M${x} ${x === 180 ? 55 : 60} l6 10 h-12z`} opacity=".8" />)}
          </g>
        ) : (
          <g fill="currentColor">
            <rect x="34" y="64" width="16" height="44" rx="2" opacity=".9" />
            <rect x="60" y="50" width="14" height="58" rx="2" opacity=".9" />
            <path d="M24 126 V92 L74 72 V92 L124 72 V92 L174 72 V92 L224 72 V126 Z" opacity=".95" />
            <rect x="234" y="88" width="104" height="38" rx="3" opacity=".8" />
            {[44, 94, 144, 194].map((x) => <rect key={x} x={x} y="100" width="22" height="14" rx="2" fill="var(--chat-header-bg)" opacity=".5" />)}
            <rect x="248" y="100" width="76" height="6" rx="3" fill="var(--chat-header-bg)" opacity=".5" />
            <circle cx="42" cy="44" r="9" opacity=".35" /><circle cx="56" cy="32" r="7" opacity=".25" /><circle cx="70" cy="24" r="5" opacity=".18" />
          </g>
        )}
      </svg>
      <span className="absolute left-3 top-3 badge badge-md bg-(--chat-surface) font-semibold text-fg tnum shadow-[var(--shadow-bottom-1)]">
        <Icon name="calendar" size={14} className="text-(--chat-link)" />{data.badge}
      </span>
      <span className="absolute right-3 bottom-3 badge badge-md bg-(--chat-surface)/90 text-fg">{data.jp}</span>
    </div>
  );
}

function downloadIcs(e: OaEvent) {
  const url = URL.createObjectURL(new Blob([eventIcs(e)], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${e.id}.ics` });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const greeting = (): NewMsg[] => [
  { kind: "oa-intro" },
  { kind: "day", text: t("Hôm nay", "Today") },
  { kind: "text", from: "bot", text: t("Xin chào bạn! Mình là trợ lý tìm việc của ViệcNhanh Aichi.", "Hi there! I’m the job assistant of ViệcNhanh Aichi.") },
  { kind: "text", from: "bot", text: t("Mình giúp bạn tìm việc đúng visa, gần nơi ở, và báo kết quả ứng tuyển ngay trong Zalo.", "I help you find jobs that match your visa, close to home, and send your application results right here in Zalo.") },
  { kind: "welcome" },
];

/** Câu hỏi nhanh trước khi bắt đầu — trả lời các lo lắng thường gặp. */
const faq = (): Record<string, string[]> => ({
  [t("Có mất phí không?", "Is it free?")]: [t("Hoàn toàn miễn phí cho người lao động. ViệcNhanh không thu phí giới thiệu.", "It’s completely free for workers. ViệcNhanh charges no placement fee.")],
  [t("Cần chuẩn bị gì?", "What do I need?")]: [t("Không cần chuẩn bị gì. Bạn chỉ cần biết loại visa của mình (dòng 在留資格 trên thẻ cư trú). Các câu sau bấm chọn hoặc gõ là xong.", "Nothing special. You only need to know your visa type (the 在留資格 line on your residence card). For the other questions, just tap or type.")],
  [t("Hỏi người thật", "Talk to a person")]: [t("Nhân viên nói tiếng Việt trực 7h–22h mỗi ngày. Bạn cứ nhắn ở đây, mình chuyển cho bạn ấy nhé.", "Vietnamese-speaking staff are online 7:00–22:00 every day. Just message here and I’ll pass it on.")],
});

// ---- Kịch bản B1 · Lần đầu: chỉ trao đổi bằng chữ ---------------------------------
function FirstRunChat() {
  const { msgs, push, later } = useMessages(greeting);
  const FAQ = useState(faq)[0];
  const [stage, setStage] = useState<Stage>("idle");
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);

  /** Bot gõ một lúc rồi mới trả lời. */
  const bot = (items: (string | NewMsg)[], then?: () => void, wait = 700) => {
    setBusy(true);
    push({ kind: "typing" });
    later(wait, () => {
      push(...items.map((t) => (typeof t === "string" ? { kind: "text" as const, from: "bot" as const, text: t } : t)));
      setBusy(false);
      then?.();
    });
  };

  const ask = (q: QuestionId) => { setStage(q); bot([D().QUESTIONS[q].ask]); };

  /** Đủ 3 câu → 1 tin 3 tiêu chí + 1 tin 3 công ty (link ra website). */
  const finish = (a: Answers) => {
    setStage("evaluating");
    bot([t("Cảm ơn bạn! Mình đang đối chiếu hồ sơ với các việc đang tuyển, chờ chút nhé.", "Thanks! I’m matching your profile against open jobs, just a moment.")], () => {
      setBusy(true);
      push({ kind: "typing" });
      later(1500, () => {
        push(
          { kind: "assess", answers: a },
          { kind: "text", from: "bot", text: t("Hồ sơ đã lưu theo tài khoản Zalo của bạn. Mở ViệcNhanh trên web sẽ không phải trả lời lại 3 câu.", "Your profile is saved to your Zalo account. On the ViệcNhanh website you won’t need to answer the 3 questions again.") },
        );
        setStage("done");
        setBusy(false);
      });
    });
  };

  const restart = () => {
    setAnswers({});
    push({ kind: "note", text: t("Bắt đầu lại", "Starting over") });
    ask("q1");
  };

  const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();

  const handle = (raw: string, viaChip: boolean) => {
    const text = raw.trim();
    push({ kind: "text", from: "me", text });

    if (text === AGAIN()) return restart();
    if (stage === "idle") {
      if (FAQ[text]) { setAsked((a) => [...a, text]); return bot([...FAQ[text], t("Nếu bạn đã sẵn sàng thì bấm “Bắt đầu tìm việc” nhé.", "When you’re ready, tap “Start job search”.")]); }
      if (viaChip || /bat dau|tim viec|start|begin/.test(norm(text))) return ask("q1");
      return bot([t("Bạn bấm “Bắt đầu tìm việc” hoặc gõ “bắt đầu” để mình hỏi 3 câu nhé.", "Tap “Start job search” or type “start” and I’ll ask you 3 questions.")]);
    }
    if (stage === "done" || stage === "evaluating") return bot([t("Bấm “Xem chi tiết” ở công ty bạn quan tâm để mở trên ViệcNhanh. Muốn trả lời lại thì chọn “Làm lại từ đầu”.", "Tap “View details” on a company to open it on ViệcNhanh. To answer again, choose “Start over”.")]);

    const q = stage;
    if (q === "q1" && text === UNSURE()) return bot([t("Không sao. Bạn xem dòng 在留資格 trên thẻ cư trú rồi gõ lại giúp mình, ví dụ “kỹ năng đặc định sản xuất” hoặc “thực tập sinh”.", "No problem. Check the 在留資格 line on your residence card and type it here, e.g. “specified skilled worker manufacturing” or “technical intern”.")]);
    const val = text === SKIP() ? null : viaChip && D().QUESTIONS[q].chips.includes(text) ? text : D().parseAnswer(q, text);
    if (!val) {
      // AC2: chỉ hỏi lại đúng câu đang dở.
      return bot([text === SKIP() ? t("Câu này cần để tìm việc đúng cho bạn nên mình chưa bỏ qua được.", "I need this one to find the right jobs, so it can’t be skipped.") : t("Mình chưa hiểu câu trả lời này.", "I didn’t quite get that."), D().QUESTIONS[q].retry]);
    }
    const a = { ...answers, [q]: val };
    setAnswers(a);
    const nx = NEXT[q];
    if (nx === "evaluating") finish(a); else ask(nx as QuestionId);
  };

  const chips =
    stage === "idle" ? [START(), ...Object.keys(FAQ).filter((q) => !asked.includes(q))]
      : stage === "q1" ? [...D().QUESTIONS.q1.chips, UNSURE(), SKIP()]
        : stage === "q2" || stage === "q3" ? [...D().QUESTIONS[stage].chips, SKIP()]
          : stage === "done" ? [AGAIN()] : [];

  return <Chat msgs={msgs} chips={chips} busy={busy} onChip={(c) => handle(c, true)} onSend={(t) => handle(t, false)} />;
}

const replyLater = (push: (...m: NewMsg[]) => void, later: (ms: number, fn: () => void) => void) => (msg: string) => {
  push({ kind: "text", from: "me", text: msg });
  later(600, () => push({ kind: "text", from: "bot", text: t("Mình đã nhận câu hỏi. Nhân viên tiếng Việt sẽ trả lời bạn trong giờ hỗ trợ 7h–22h.", "Got your question. Vietnamese-speaking staff will reply during support hours, 7:00–22:00.") }));
};

// ---- Kịch bản B2 · Trạng thái đơn: tin nhắn chữ ------------------------------------
function StatusChat({ to }: { to: StatusTo }) {
  const data = D().STATUS_UPDATES[to];
  const { msgs, push, later } = useMessages(() => [
    { kind: "day", text: t("Hôm qua", "Yesterday") },
    { kind: "text", from: "bot", text: t(`Bạn đã ứng tuyển ${data.job}. Mình sẽ nhắn ngay khi nhà máy trả lời.`, `You applied for ${data.job}. I’ll message you as soon as the factory replies.`) },
    { kind: "day", text: t("Hôm nay", "Today") },
    { kind: "typing" },
  ]);
  // Hẹn giờ riêng + tự huỷ khi effect chạy lại (StrictMode / hot reload) để tin không bị gửi 2 lần.
  useEffect(() => {
    const id = setTimeout(() => push({ kind: "status", data }), 800);
    return () => clearTimeout(id);
  }, [data, push]);
  return <Chat msgs={msgs} chips={[]} onChip={() => {}} onSend={replyLater(push, later)} />;
}

// ---- Kịch bản B2 · Gợi ý việc ≥ 85% (BR4, BR5): tin nhắn chữ + link -----------------
function RecommendChat({ mode, attempts }: { mode: RecMode; attempts: number }) {
  const { msgs, push, later } = useMessages(() => [
    { kind: "day", text: t("Thứ Hai", "Monday") },
    { kind: "text", from: "bot", text: t("Hồ sơ của bạn đã sẵn sàng. Có việc mới rất hợp với bạn, mình sẽ nhắn ở đây.", "Your profile is ready. When a new job fits you well, I’ll message you here.") },
    { kind: "day", text: t("Hôm nay", "Today") },
  ]);
  const shown = useRef(0);
  const noted = useRef(false);
  const [group, setGroup] = useState<Recommend | null>(null);

  useEffect(() => {
    if (mode === "below") {
      if (noted.current) return;
      noted.current = true;
      // AC4: việc 84% không được gửi qua Zalo.
      push({ kind: "note", text: t(`Ghi chú demo: có việc mới ${D().RECOMMEND_BELOW.fit}% (${D().RECOMMEND_BELOW.job}). Dưới ${RECOMMEND_MIN}% nên chỉ hiện trong app, không gửi qua Zalo.`, `Demo note: a new job at ${D().RECOMMEND_BELOW.fit}% (${D().RECOMMEND_BELOW.job}). Below ${RECOMMEND_MIN}%, so it only shows in the app, not on Zalo.`) });
      return;
    }
    while (shown.current < attempts) {
      const i = shown.current++;
      if (i < RECOMMEND_WEEKLY_CAP) {
        const rec = D().RECOMMENDS[i % D().RECOMMENDS.length];
        if (rec.fit >= RECOMMEND_MIN) push({ kind: "recommend", data: rec });
      } else {
        push({ kind: "note", text: t(`Ghi chú demo: đã gửi đủ ${RECOMMEND_WEEKLY_CAP} gợi ý tuần này. Việc mới chỉ hiện trong app.`, `Demo note: ${RECOMMEND_WEEKLY_CAP} suggestions already sent this week. New jobs only show in the app.`) });
      }
    }
  }, [attempts, mode, push]);

  return (
    <>
      <div className={group ? "hidden" : "contents"}>
        <Chat msgs={msgs} chips={[]} onChip={() => {}} actions={{ onOpenGroup: setGroup }} onSend={replyLater(push, later)} />
      </div>
      {group && <GroupChat data={group} onBack={() => setGroup(null)} />}
    </>
  );
}

// ---- Kịch bản · Sự kiện (widget hợp lệ của Zalo OA) --------------------------------
function EventChat() {
  const { msgs, push, later } = useMessages(() => [
    { kind: "day", text: t("Hôm qua", "Yesterday") },
    { kind: "status", data: D().STATUS_UPDATES.interview },
    { kind: "day", text: t("Hôm nay", "Today") },
    { kind: "text", from: "bot", text: t("Tuần này có 2 hoạt động gần bạn. Đi tham quan trước giúp bạn biết rõ chỗ làm, lương và ký túc xá trước khi nộp hồ sơ.", "There are 2 activities near you this week. Visiting first helps you see the workplace, pay and dormitory before you apply.") },
    ...D().EVENTS.map((e) => ({ kind: "event" as const, data: e })),
  ]);
  const [events, setEvents] = useState<Record<string, "yes" | "no">>({});

  const onEvent = (e: OaEvent, act: "yes" | "no" | "undo") => {
    setEvents(({ [e.id]: _, ...rest }) => (act === "undo" ? rest : { ...rest, [e.id]: act }));
    if (act === "yes") {
      downloadIcs(e);
      toast(t("Đã thêm vào lịch · nhắc bạn trước 1 ngày", "Added to calendar · reminder 1 day before"), "calendar-check");
      later(600, () => push({ kind: "typing" }));
      later(1300, () => push({ kind: "text", from: "bot", text: t(`Đã ghi bạn quan tâm “${e.title}”. Mình sẽ nhắc trước 1 ngày và gửi hướng dẫn đường đi qua đây.`, `Noted that you’re interested in “${e.title}”. I’ll remind you 1 day before and send directions here.`) }));
    }
  };

  return <Chat msgs={msgs} chips={[]} onChip={() => {}} actions={{ onEvent, events }} onSend={replyLater(push, later)} />;
}
