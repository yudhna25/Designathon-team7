"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { Avatar, Button, FitBadge, Icon, InlineNote, Logo, MatchChips, ScoreRing, Segmented, Sheet, toast } from "@/components/ui";
import {
  OA_WEB_URL, QUESTIONS, RECOMMENDS, RECOMMEND_BELOW, RECOMMEND_MIN, RECOMMEND_WEEKLY_CAP, STATUS_LABEL, STATUS_TONE, STATUS_UPDATES,
  FIT_LABEL, GROUP_ADMINS, fitLevel, fmtMonthly, fmtMonthlyYen, fmtPay, groupPosts, parseAnswer, profile, top3, type OaJob, type QuestionId, type Recommend, type StatusId, type StatusUpdate,
} from "@/lib/zalo-oa";

// Màn mô phỏng Zalo OA — BRD "ViệcNhanh Aichi · Cửa vào Zalo OA" v1.0. Không dùng logo Zalo (BR8).

type Scenario = "first" | "status" | "recommend";
type StatusTo = Exclude<StatusId, "pending">;
type RecMode = "pass" | "below";

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "first", label: "Lần đầu" },
  { value: "status", label: "Trạng thái đơn" },
  { value: "recommend", label: "Gợi ý việc" },
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
  const label = dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";
  const flip = () => setConfig({ theme: dark ? "light" : "dark" });
  return withLabel ? (
    <Button variant="tertiary" size="sm" icon={dark ? "sun" : "moon-01"} onClick={flip} aria-label={label}>{dark ? "Sáng" : "Tối"}</Button>
  ) : (
    <button type="button" className="icon-btn sm pressable" aria-label={label} onClick={flip}><Icon name={dark ? "sun" : "moon-01"} /></button>
  );
}

/** Điền sẵn câu hỏi vào ô soạn tin và đưa con trỏ vào đó ("Mở box chat"). */
function compose(text: string) {
  window.dispatchEvent(new CustomEvent<string>("oa-compose", { detail: text }));
}

/** Hành động từ widget lên kịch bản chat (ứng tuyển ngay trong Zalo). */
type WidgetActions = { onApply?: (job: string, pay: number) => void; applied?: string[]; onOpenGroup?: (r: Recommend) => void };

/** BR6 + AC5: Toast trước, rồi mở link ngoài ở tab mới. */
function openWeb(message = "Đang mở ViệcNhanh…") {
  toast(message, "arrow-up-right");
  setTimeout(() => window.open(OA_WEB_URL, "_blank", "noopener,noreferrer"), 450);
}

export default function ZaloOaPage() {
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
          <Link href="/" className="pressable rounded-xl px-1" aria-label="Trang giới thiệu"><Logo compact /></Link>
          <p className="flex-1 min-w-0 truncate t-sm text-muted"><span className="font-semibold text-fg">Zalo OA</span> (mô phỏng) · Demo</p>
          <ThemeToggle />
          <button type="button" className="icon-btn sm pressable" aria-label="Tuỳ chọn kịch bản" onClick={() => setSheet(true)}>
            <Icon name="sliders-02" />
          </button>
        </div>
        <Segmented label="Kịch bản demo" size="sm" options={SCENARIOS} value={scenario} onChange={pick} />
      </header>

      {/* ≥ 1024px: bảng điều khiển bên trái */}
      <section data-id="zalo-oa-panel" className="hidden lg:flex flex-col gap-8 flex-1 max-w-[560px] max-h-dvh overflow-y-auto no-scrollbar py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="pressable rounded-xl"><Logo /></Link>
          <ThemeToggle withLabel />
        </div>
        <div>
          <p className="t-eyebrow mb-4">Cửa vào thứ 2 · Zalo OA (mô phỏng)</p>
          <h1 className="t-h1">Có hồ sơ mà không cần mở web</h1>
          <p className="t-lg text-muted mt-3">
            Lần đầu, người lao động trả lời 3 câu ngay trong chat và nhận bản đánh giá cùng Top 3 việc. Lần sau, OA tự gửi trạng thái đơn và việc phù hợp từ 85%.
          </p>
        </div>
        <div className="grid gap-3">
          <p className="label">Kịch bản demo</p>
          <Segmented label="Kịch bản demo" options={SCENARIOS} value={scenario} onChange={pick} />
        </div>
        {controls}
      </section>

      <Phone key={`${scenario}-${run}-${scenario === "status" ? statusTo : ""}-${scenario === "recommend" ? recMode : ""}`}>
        {scenario === "first" && <FirstRunChat />}
        {scenario === "status" && <StatusChat to={statusTo} />}
        {scenario === "recommend" && <RecommendChat mode={recMode} attempts={recAttempts} />}
      </Phone>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Tuỳ chọn kịch bản">
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
          <p className="t-sub">B1 · Lần đầu vào OA</p>
          <ol className="grid gap-2 t-base text-muted list-decimal pl-5">
            <li>Bấm “Bắt đầu tìm việc”.</li>
            <li>Trả lời 3 câu bằng ô gợi ý hoặc tự gõ. Câu nào thiếu, bot hỏi lại đúng câu đó.</li>
            <li>Chờ khoảng 1,5 giây để xem bản đánh giá và Top 3 việc.</li>
          </ol>
          <Button variant="tertiary" size="sm" icon="refresh-ccw-01" className="justify-self-start" onClick={props.onRestart}>Chạy lại từ đầu</Button>
        </div>
      )}

      {scenario === "status" && (
        <div className="card p-5 grid gap-4">
          <p className="t-sub">B2 · Đơn đổi trạng thái</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Trạng thái mới">
            {(Object.keys(STATUS_UPDATES) as StatusTo[]).map((s) => (
              <button key={s} type="button" className="chip pressable" aria-pressed={props.statusTo === s} onClick={() => props.onStatus(s)}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <p className="t-sm text-muted">Widget trạng thái đơn không bị giới hạn số lần gửi.</p>
        </div>
      )}

      {scenario === "recommend" && (
        <div className="card p-5 grid gap-4">
          <p className="t-sub">B2 · Việc mới hợp với bạn</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Mức phù hợp của việc mới">
            <button type="button" className="chip pressable" aria-pressed={props.recMode === "pass"} onClick={() => props.onRecMode("pass")}>Từ 85% · gửi qua Zalo</button>
            <button type="button" className="chip pressable" aria-pressed={props.recMode === "below"} onClick={() => props.onRecMode("below")}>84% · chỉ hiện trong app</button>
          </div>
          {props.recMode === "pass" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="tertiary" size="sm" icon="plus" onClick={props.onRecPush}>Có thêm việc mới</Button>
              <span className="t-sm text-muted tnum">Đã gửi {sent}/{RECOMMEND_WEEKLY_CAP} tuần này</span>
            </div>
          )}
        </div>
      )}

      <ul className="grid gap-3 t-sm text-muted">
        <li className="flex gap-3"><Icon name="target-04" size={18} className="mt-0.5" />Chỉ gửi gợi ý qua Zalo khi mức phù hợp từ {RECOMMEND_MIN}%, tối đa {RECOMMEND_WEEKLY_CAP} lần một tuần.</li>
        <li className="flex gap-3"><Icon name="arrow-up-right" size={18} className="mt-0.5" />Bấm widget nào cũng mở web ở tab mới, đã đăng nhập sẵn qua Zalo.</li>
        <li className="flex gap-3"><Icon name="info-circle" size={18} className="mt-0.5" />Số liệu và tên nhà máy đều là dữ liệu dựng.</li>
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
      className="relative flex flex-col flex-1 min-h-0 overflow-hidden bg-(--chat-canvas) md:flex-none md:w-[390px] md:h-[780px] md:mx-auto md:my-8 md:rounded-[44px] md:border md:border-line md:shadow-[var(--shadow-bottom-4)] lg:mx-0 lg:my-0 lg:h-[min(844px,calc(100dvh-64px))] lg:shrink-0"
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
function ChatHeader({ typing }: { typing: boolean }) {
  return (
    <header data-id="zalo-oa-header" className="relative z-20 flex h-14 shrink-0 items-center gap-1 px-2 bg-(--chat-header-bg) bg-(image:--chat-header-gradient) text-(--chat-header-fg) transition-colors duration-[var(--motion-base)]">
      <Link href="/" aria-label="Quay lại" className="pressable group/hb inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-(--chat-header-fg)/15 active:bg-(--chat-header-fg)/25">
        <Icon name="arrow-left" size={24} className="transition-transform duration-[var(--motion-base)] [transition-timing-function:var(--ease-spring)] group-hover/hb:-translate-x-0.5" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-3 py-1">
        <span className="rounded-full ring-2 ring-(--chat-header-fg)/30"><OaAvatar /></span>
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1">
            <span className="truncate t-lg font-bold">ViệcNhanh Aichi</span>
            <span className="inline-flex shrink-0 text-(--chat-verified)"><Icon name="check-verified" size={16} solid label="Official Account đã xác thực" /></span>
          </span>
          <span key={String(typing)} className="truncate t-sm text-(--chat-header-fg-muted) animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]" data-id="zalo-oa-header-subtitle">
            {typing ? "đang soạn tin…" : "Official Account · Zalo OA (mô phỏng)"}
          </span>
        </span>
      </div>
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
  const letter = (name.match(/Nhà máy\s+(\S)/)?.[1] ?? name[0] ?? "A").toUpperCase();
  const i = letter.charCodeAt(0) - 65;
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl ${LOGO_TONES[((i % 4) + 4) % 4]}`} style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20" fill="currentColor">{LOGO_SHAPES[((i % 6) + 6) % 6]}</svg>
    </span>
  );
}
const splitJob = (s: string) => { const [title, factory = ""] = s.split(" · "); return { title, factory }; };

// ---- Khung chat dùng chung: danh sách tin + chip trả lời nhanh + ô nhập --------
type Msg = { id: number; at: string } & (
  | { kind: "text"; from: "bot" | "me"; text: string }
  | { kind: "card-photo" }
  | { kind: "typing" }
  | { kind: "day"; text: string }
  | { kind: "note"; text: string }
  | { kind: "evaluating" }
  | { kind: "assess"; answers: Answers }
  | { kind: "status"; data: StatusUpdate }
  | { kind: "recommend"; data: Recommend }
  | { kind: "oa-intro" }
  | { kind: "welcome" }
);

type Answers = { q1?: string; card?: boolean; q2?: string; q3?: string };
type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, "id" | "at"> : never) : never;

type Role = "bot" | "me" | "sys";
const roleOf = (m: Msg): Role => (m.kind === "text" ? m.from : m.kind === "card-photo" ? "me" : m.kind === "day" || m.kind === "note" || m.kind === "oa-intro" ? "sys" : "bot");
type Pos = "single" | "first" | "middle" | "last";
/* Góc bo theo cụm (Chat Kit): phía người gửi bo 2px ở chỗ nối giữa các tin */
const RADIUS: Record<"in" | "out", Record<Pos, string>> = {
  in: { single: "", first: "rounded-bl-[var(--radius-2xs)]", middle: "rounded-l-[var(--radius-2xs)]", last: "rounded-tl-[var(--radius-2xs)]" },
  out: { single: "", first: "rounded-br-[var(--radius-2xs)]", middle: "rounded-r-[var(--radius-2xs)]", last: "rounded-tr-[var(--radius-2xs)]" },
};
const BUBBLE_IN = "rounded-[var(--radius-base)] border border-(--chat-bubble-in-border) bg-(--chat-bubble-in-bg) text-(--chat-bubble-fg) shadow-[var(--shadow-bottom-1)]";
const BUBBLE_OUT = "rounded-[var(--radius-base)] border border-(--chat-bubble-out-border) bg-(--chat-bubble-out-bg) text-(--chat-bubble-fg) shadow-[var(--shadow-bottom-1)]";
/** Khối widget OA: cùng nền/viền với tin đến của Chat Kit. */
const WIDGET = `w-full ${BUBBLE_IN}`;

function Chat({ msgs, chips, onChip, onSend, onCamera, busy, placeholder = "Nhập tin nhắn", actions }: {
  msgs: Msg[]; chips: string[]; onChip: (c: string) => void; onSend: (t: string) => void; onCamera: () => void; busy?: boolean; placeholder?: string; actions?: WidgetActions;
}) {
  const list = useRef<HTMLDivElement>(null);
  const typing = msgs.some((m) => m.kind === "typing" || m.kind === "evaluating");

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
      <ChatHeader typing={typing} />
      <div ref={list} data-id="zalo-oa-messages" className="flex-1 min-h-0 overflow-y-auto px-3 pb-3" aria-live="polite">
        <div className="flex flex-col">
          {msgs.map((m, i) => {
            const r = roles[i];
            const first = roles[i - 1] !== r, last = roles[i + 1] !== r;
            const pos: Pos = first && last ? "single" : first ? "first" : last ? "last" : "middle";
            if (m.kind === "oa-intro") return <OaIntro key={m.id} />;
            if (r === "sys") return <SystemPill key={m.id} m={m} />;
            if (r === "me") return <MeRow key={m.id} m={m} pos={pos} status={i === lastMe ? (seen ? "Đã xem" : "Đã nhận") : undefined} />;
            // Bong bóng của OA gom cụm riêng; widget đứng một mình (bo đủ 4 góc, không avatar).
            const bubble = (x?: Msg) => !!x && (x.kind === "text" ? x.from === "bot" : x.kind === "typing");
            const bf = !bubble(msgs[i - 1]), bl = !bubble(msgs[i + 1]);
            const bpos: Pos = !bubble(m) ? "single" : bf && bl ? "single" : bf ? "first" : bl ? "last" : "middle";
            return <BotRow key={m.id} m={m} pos={bpos} gapTop={bubble(m) ? bf : true} avatar={bubble(m) && bl} actions={actions} onStart={chips.includes(START) && !busy ? () => onChip(START) : undefined} />;
          })}
        </div>
      </div>

      {chips.length > 0 && (
        <div data-id="zalo-oa-quick-replies" className="shrink-0 flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2 pt-1" role="group" aria-label="Trả lời nhanh">
          {chips.map((c) => (
            <button key={c} type="button" disabled={busy} onClick={() => onChip(c)}
              className={`pressable shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-(--color-border-accent-subtle) bg-(--chat-surface) text-(--chat-link) t-base font-medium shadow-[var(--shadow-bottom-1)] hover:bg-(--chat-list-active) disabled:opacity-50 disabled:cursor-not-allowed ${SLIDE}`}>
              {c === "Gửi ảnh thẻ cư trú" && <Icon name="camera" size={16} />}
              {c}
            </button>
          ))}
        </div>
      )}

      <ChatComposer onSend={onSend} onCamera={onCamera} busy={busy} placeholder={placeholder} />
    </>
  );
}

/** Chat Composer (Chat Kit): ô nhập tự giãn tới 5 dòng, Enter gửi, viền trên đổi xanh khi focus. Ô trống → nút ảnh; có chữ → nút Gửi pop. */
function ChatComposer({ onSend, onCamera, busy, placeholder }: { onSend: (t: string) => void; onCamera: () => void; busy?: boolean; placeholder: string }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const has = text.trim().length > 0;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);
  useEffect(() => {
    const on = (e: Event) => { setText((e as CustomEvent<string>).detail); requestAnimationFrame(() => { ref.current?.focus(); const n = ref.current?.value.length ?? 0; ref.current?.setSelectionRange(n, n); }); };
    window.addEventListener("oa-compose", on);
    return () => window.removeEventListener("oa-compose", on);
  }, []);
  const send = () => { if (!has || busy) return; onSend(text.trim()); setText(""); };
  const btn = "pressable group/cb inline-flex size-10 shrink-0 items-center justify-center rounded-full text-(--chat-meta) hover:bg-[var(--color-bg-neutral-flat-hover)] hover:text-fg disabled:opacity-50";
  const ico = "transition-transform duration-[var(--motion-base)] [transition-timing-function:var(--ease-spring)] group-hover/cb:scale-110";
  return (
    <div data-id="zalo-oa-composer" className="flex min-h-14 shrink-0 items-end gap-1 border-t border-hair bg-(--chat-surface) px-2 py-2 transition-colors duration-[var(--motion-fast)] focus-within:border-(--color-border-accent-solid) safe-b md:pb-2">
      <button type="button" className={btn} aria-label="Chụp thẻ cư trú" onClick={onCamera} disabled={busy}>
        <Icon name="camera" size={24} className={ico} />
      </button>
      <textarea ref={ref} rows={1} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Nội dung tin nhắn"
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
        className="min-h-10 flex-1 resize-none bg-transparent px-1 py-2 t-lg text-fg caret-[var(--color-content-accent-base)] outline-none placeholder:text-[var(--color-content-placeholder)]" />
      {has ? (
        <button type="button" onClick={send} aria-label="Gửi" disabled={busy}
          className="pressable group/cb inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--color-content-accent-base)] hover:bg-[var(--color-bg-accent-flat-hover)] animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)] disabled:opacity-50">
          <Icon name="send-01" size={24} solid className="transition-transform duration-[var(--motion-base)] [transition-timing-function:var(--ease-spring)] group-hover/cb:translate-x-0.5 group-hover/cb:-rotate-12" />
        </button>
      ) : (
        <span className="flex items-center animate-[zen-slide-in-right_var(--motion-slow)_var(--ease-spring)_both]">
          <button type="button" className={btn} aria-label="Gửi ảnh" onClick={onCamera} disabled={busy}><Icon name="image-plus" size={24} className={ico} /></button>
        </span>
      )}
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
  const showMeta = pos === "last" || pos === "single";
  return (
    <div className={`flex flex-col items-end ${pos === "first" || pos === "single" ? "mt-3" : "mt-0.5"} ${SLIDE}`}>
      {m.kind === "card-photo" ? (
        <figure data-id="chat-bubble-photo" className={`w-60 overflow-hidden ${BUBBLE_OUT} ${RADIUS.out[pos]}`}>
          <div className="m-1.5 rounded-[10px] bg-surface text-fg p-3 grid grid-cols-[1fr_44px] gap-2" aria-hidden>
            <div className="grid gap-1.5">
              <span className="t-sm font-semibold">在留カード</span>
              <i className="block h-1.5 w-24 rounded-full bg-subtle" />
              <i className="block h-1.5 w-20 rounded-full bg-subtle" />
              <i className="block h-1.5 w-28 rounded-full bg-subtle" />
              <span className="t-sm text-muted">特定技能1号</span>
            </div>
            <span className="h-14 rounded-lg bg-subtle grid place-items-center"><Icon name="user" className="text-faint" /></span>
          </div>
          <figcaption className="px-3 pb-2 t-sm text-(--chat-meta)">Ảnh thẻ cư trú (mẫu){showMeta && <Time at={m.at} />}</figcaption>
        </figure>
      ) : m.kind === "text" ? (
        <div data-id="chat-bubble-me" className={`max-w-[78%] px-3 py-2 t-lg break-words ${BUBBLE_OUT} ${RADIUS.out[pos]}`}>
          {m.text}
          {showMeta && <Time at={m.at} />}
        </div>
      ) : null}
      {status && (
        <span key={status} className="mt-1 inline-flex items-center gap-1 rounded-full bg-(--chat-separator-bg) px-2 py-0.5 t-sm text-(--chat-separator-fg) animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]">
          <Icon name={status === "Đã xem" ? "check-circle" : "check"} size={12} />{status}
        </span>
      )}
    </div>
  );
}

/** Tin đến từ OA. Avatar 32 chỉ đứng cạnh bong bóng tin nhắn (tin cuối của một chuỗi bong bóng), không đứng cạnh widget. Widget chiếm hết bề ngang. */
function BotRow({ m, pos, gapTop, avatar, onStart, actions }: { m: Msg; pos: Pos; gapTop: boolean; avatar: boolean; onStart?: () => void; actions?: WidgetActions }) {
  const showMeta = pos === "last" || pos === "single";
  const isBubble = m.kind === "text" || m.kind === "typing";
  return (
    <div className={`flex items-end gap-2 ${gapTop ? "mt-3" : "mt-0.5"} ${SLIDE}`}>
      {isBubble && <div className="flex w-8 shrink-0 justify-center self-end">{avatar && <OaAvatar size={32} />}</div>}
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <BotContent m={m} pos={pos} showMeta={showMeta} onStart={onStart} actions={actions} />
      </div>
    </div>
  );
}

function BotContent({ m, pos, showMeta, onStart, actions }: { m: Msg; pos: Pos; showMeta: boolean; onStart?: () => void; actions?: WidgetActions }) {
  switch (m.kind) {
    case "welcome":
      return <WelcomeCard radius={RADIUS.in[pos]} onStart={onStart} />;
    case "typing":
      return (
        <span className={`inline-flex gap-1 px-3 py-3 ${BUBBLE_IN} ${RADIUS.in[pos]}`} aria-label="Đang soạn tin">
          {[0, 1, 2].map((d) => <i key={d} className="block size-1.5 rounded-full bg-(--chat-meta) animate-[zen-typing_1s_var(--ease-standard)_infinite]" style={{ animationDelay: `${d * 120}ms` }} />)}
        </span>
      );
    case "text":
      return (
        <div data-id="chat-bubble-bot" className={`max-w-[88%] px-3 py-2 t-lg break-words ${BUBBLE_IN} ${RADIUS.in[pos]}`}>
          {m.text}
          {showMeta && <Time at={m.at} />}
        </div>
      );
    case "evaluating":
      return (
        <div data-id="zalo-oa-evaluating" className={`p-4 grid gap-3 ${WIDGET} ${RADIUS.in[pos]}`} role="status">
          <p className="t-sm font-medium flex items-center gap-2"><Icon name="stars-01" size={16} className="text-brand" />Đang đánh giá…</p>
          <div className="h-1.5 rounded-full bg-subtle overflow-hidden" role="progressbar" aria-label="Đang đánh giá">
            <span className="block h-full w-1/3 rounded-full bg-solid animate-[oa-indeterminate_1.1s_var(--ease-standard)_infinite]" />
          </div>
          <div className="flex items-center gap-3"><span className="skeleton size-14 !rounded-full" /><span className="grid gap-2 flex-1"><span className="skeleton h-3 w-2/3" /><span className="skeleton h-3 w-1/2" /></span></div>
          {[0, 1, 2].map((i) => <span key={i} className="skeleton h-11" />)}
        </div>
      );
    case "assess":
      return <AssessWidget answers={m.answers} radius={RADIUS.in[pos]} actions={actions} />;
    case "status":
      return <StatusWidget data={m.data} radius={RADIUS.in[pos]} actions={actions} />;
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
    <section data-id="zalo-oa-intro" className={`mt-3 overflow-hidden ${BUBBLE_IN} ${SLIDE}`} aria-label="Giới thiệu Official Account">
      <div className="h-16 bg-(--chat-header-bg) bg-(image:--chat-header-gradient)" aria-hidden />
      <div className="px-4 pb-4 -mt-8 grid justify-items-center text-center gap-2">
        <span className="rounded-full ring-4 ring-(--chat-bubble-in-bg)"><OaAvatar size={64} /></span>
        <div>
          <p className="flex items-center justify-center gap-1 t-sub">
            ViệcNhanh Aichi
            <span className="inline-flex text-(--chat-verified)"><Icon name="check-verified" size={18} solid label="Official Account đã xác thực" /></span>
          </p>
          <p className="t-sm text-(--chat-meta)">Official Account · Việc làm cho người Việt tại Aichi</p>
        </div>
        <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Cam kết">
          {[
            { icon: "shield-tick", t: "Miễn phí cho người lao động" },
            { icon: "clock-fast-forward", t: "Nhà máy trả lời trong 24h" },
            { icon: "translate", t: "Tiếng Việt 7h–22h" },
          ].map((x) => (
            <li key={x.t} className="badge badge-md bg-(--chat-canvas) text-fg"><Icon name={x.icon as "shield-tick"} size={14} />{x.t}</li>
          ))}
        </ul>
        <Button size="sm" variant={follow ? "secondary" : "primary"} icon={follow ? "check" : "plus"} className="mt-1 min-w-[140px]" aria-pressed={follow}
          onClick={() => { setFollow((v) => !v); if (!follow) toast("Đã quan tâm ViệcNhanh Aichi · bạn sẽ nhận báo việc mới tại đây", "bell-01"); }}>
          <span key={String(follow)} className="animate-[zen-fade-in_var(--motion-base)_var(--ease-standard)_both]">{follow ? "Đã quan tâm" : "Quan tâm"}</span>
        </Button>
      </div>
    </section>
  );
}

const WELCOME_STEPS = [
  { icon: "passport", t: "Thời hạn visa và ngành nghề hiện tại", s: "Chụp thẻ cư trú, mình tự đọc" },
  { icon: "tool-02", t: "Kỹ năng và chứng chỉ liên quan", s: "Bấm chọn, không cần gõ" },
  { icon: "marker-pin-02", t: "Thời gian nhận việc và khu vực làm việc", s: "Để chọn nhà máy gần bạn" },
] as const;

/** Thẻ chào mừng: nói rõ 3 câu hỏi gì, nhận lại gì, rồi một nút bắt đầu. */
function WelcomeCard({ radius, onStart }: { radius: string; onStart?: () => void }) {
  return (
    <article data-id="zalo-oa-widget-welcome" className={`p-4 grid gap-4 ${WIDGET} ${radius}`}>
      <div>
        <p className="t-eyebrow">Khoảng 1 phút</p>
        <p className="t-sub mt-1">Trả lời 3 câu, nhận 3 việc hợp nhất</p>
      </div>
      <ol className="grid gap-3">
        {WELCOME_STEPS.map((x) => (
          <li key={x.t} className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon name={x.icon} size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{x.t}</span>
              <span className="block t-sm text-(--chat-meta)">{x.s}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3 rounded-[var(--radius-base)] bg-(--chat-canvas) px-3 py-2.5">
        <Icon name="stars-01" size={18} solid className="text-brand shrink-0" />
        <p className="t-sm">Bạn nhận lại <b>mức phù hợp</b> và <b>3 việc đúng visa</b>, kèm lý do đạt hoặc còn thiếu.</p>
      </div>
      <Button block className="t-lg" icon={onStart ? "rocket" : "check"} disabled={!onStart} onClick={onStart}>{onStart ? "Bắt đầu tìm việc" : "Đã bắt đầu"}</Button>
    </article>
  );
}

// ---- Widget: Bản đánh giá + Top 3 (BR2, BR3) ----------------------------------
/** Dòng việc: bấm phần thông tin → mở web; nút "Nộp hồ sơ" → nộp ngay trong chat. Không hiện %, chỉ nhãn mức phù hợp. */
function JobRow({ j, actions }: { j: OaJob; actions?: WidgetActions }) {
  const job = `${j.title} · ${j.factory}`;
  const done = !!actions?.applied?.includes(job);
  const lv = fitLevel(j.fit);
  return (
    <li className="flex items-center gap-2 rounded-2xl px-3 py-2.5 hover:bg-pale transition-colors duration-[var(--motion-fast)]">
      <button type="button" onClick={() => openWeb()} className="pressable flex flex-1 min-w-0 items-center gap-3 text-left">
        <FactoryLogo name={j.factory} size={36} />
        <span className="flex-1 min-w-0">
          <span className="block font-semibold truncate">{j.title}</span>
          <span className="flex mt-0.5 mb-1"><FitBadge level={lv} size="xs" label={FIT_LABEL[lv]} /></span>
          <span className="block t-sm text-muted truncate">{j.factory} · {j.area} · {j.km} km</span>
          <span className="block t-sm font-semibold tnum" title={fmtMonthlyYen(j.pay)}>{fmtMonthly(j.pay)}</span>
        </span>
      </button>
      <Button size="sm" variant={done ? "secondary" : "primary"} icon={done ? "check" : undefined} disabled={done || !actions?.onApply}
        onClick={() => actions?.onApply?.(job, j.pay)}>{done ? "Đã nộp" : "Nộp hồ sơ"}</Button>
    </li>
  );
}

function AssessWidget({ answers, radius = "", actions }: { answers: Answers; radius?: string; actions?: WidgetActions }) {
  const jobs = [...top3].sort((a, b) => b.fit - a.fit).slice(0, 3);
  const { done, total } = profile.steps;
  // Chỉ hiện những gì người dùng đã có — không liệt kê thứ còn thiếu.
  const chips = [
    { ok: true, vi: answers.q1 ?? profile.visa, en: "", ja: "" },
    ...(answers.q2 ? [answers.q2] : profile.skills).map((s) => ({ ok: true, vi: s, en: "", ja: "" })),
    { ok: true, vi: answers.q3 ?? `${profile.start} · ${profile.area}`, en: "", ja: "" },
  ];
  return (
    <article data-id="zalo-oa-widget-assess" className={`overflow-hidden ${WIDGET} ${radius}`}>
      <div className="p-4 grid gap-3">
        <p className="t-eyebrow">Bản đánh giá hồ sơ</p>
        <div className="flex items-center gap-3">
          <ScoreRing value={(done / total) * 100} size={60} stroke={6} label={`Hồ sơ đã bổ sung ${done} trên ${total} bước`}>
            <span className="t-sm font-semibold tnum">{done}/{total}</span>
          </ScoreRing>
          <div className="grid gap-0.5 min-w-0">
            <p className="t-sub truncate">{profile.name}</p>
            <p className="t-sm text-muted">Hồ sơ đã bổ sung {done}/{total} bước</p>
          </div>
        </div>
        <MatchChips chips={chips} />
      </div>
      <div className="hair-t p-2">
        <p className="px-3 pt-2 pb-1 t-sm font-semibold">Top 3 việc hợp với bạn</p>
        {jobs.length === 0 ? (
          <div data-id="zalo-oa-empty" className="grid justify-items-center gap-2 px-4 py-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-subtle"><Icon name="search-md" /></span>
            <p className="font-semibold">Chưa có việc phù hợp</p>
            <p className="t-sm text-muted">Mình sẽ nhắn ngay khi có việc mới hợp với bạn.</p>
          </div>
        ) : (
          <ul className="grid">{jobs.map((j) => <JobRow key={j.id} j={j} actions={actions} />)}</ul>
        )}
        {jobs.length > 0 && jobs.length < 3 && <p className="px-3 py-2 t-sm text-muted">Đang tìm thêm việc cho bạn</p>}
      </div>
      <div className="px-4 pb-4">
        <Button variant="secondary" block iconRight="arrow-up-right" onClick={() => openWeb()}>Xem chi tiết trên ViệcNhanh</Button>
      </div>
    </article>
  );
}

// ---- Widget: Cập nhật ứng tuyển (BR7) -------------------------------------------
function StatusBadge({ s, from }: { s: StatusId; from?: boolean }) {
  const tone = STATUS_TONE[s];
  const cls = from
    ? "badge-outline text-muted"
    : tone === "positive"
      ? "bg-[var(--color-bg-positive-subtle)] text-[var(--color-content-positive-strongest)]"
      : tone === "negative"
        ? "bg-[var(--color-bg-negative-subtle)] text-[var(--color-content-negative-strongest)]"
        : "bg-brand-soft text-brand";
  return <span className={`badge badge-md ${cls}`}>{STATUS_LABEL[s]}</span>;
}

/** Khối tên việc: logo nhà máy · tên việc · nhà máy (+ dòng phụ) · lương giờ và ước tính tháng. */
function JobHead({ job, pay, sub }: { job: string; pay: number; sub?: string }) {
  const { title, factory } = splitJob(job);
  return (
    <div className="flex items-center gap-3">
      <FactoryLogo name={factory} />
      <div className="flex-1 min-w-0">
        <p className="t-sub truncate">{title}</p>
        <p className="t-sm text-muted truncate">{sub ?? factory}</p>
      </div>
      <div className="shrink-0 text-right" aria-label={`Lương ${fmtMonthlyYen(pay)}, tức ${fmtPay(pay)}`}>
        <p className="font-semibold tnum">{fmtMonthly(pay)}</p>
        <p className="t-sm text-muted tnum">{fmtPay(pay)}</p>
      </div>
    </div>
  );
}

function StatusWidget({ data, radius = "", actions }: { data: StatusUpdate; radius?: string; actions?: WidgetActions }) {
  return (
    <article data-id="zalo-oa-widget-status" className={`p-4 grid gap-3 ${WIDGET} ${radius}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="t-eyebrow">Cập nhật ứng tuyển</p>
        <span className="t-sm text-muted tnum">{data.at}</span>
      </div>
      <JobHead job={data.job} pay={data.pay} />
      <div className="flex items-center gap-2" aria-label={`Trạng thái: ${STATUS_LABEL[data.to]}`}>
        <span className="animate-[zen-pop_var(--motion-slower)_var(--ease-bounce)_both] [animation-delay:200ms]"><StatusBadge s={data.to} /></span>
      </div>
      <InlineNote icon={data.to === "interview" ? "calendar-check" : data.to === "viewed" ? "eye" : data.to === "pending" ? "hourglass" : "info-circle"}>{data.note}</InlineNote>
      {data.upskill && <InlineNote icon="lightbulb" tone="warn">{data.upskill}</InlineNote>}
      {data.alternatives && <ul className="grid -mx-2">{data.alternatives.map((j) => <JobRow key={j.id} j={j} actions={actions} />)}</ul>}
      <Button block iconRight="arrow-up-right" onClick={() => openWeb()}>Xem chi tiết</Button>
    </article>
  );
}

// ---- Widget: Việc mới hợp với bạn (BR4) -----------------------------------------
function RecommendWidget({ data, radius = "", actions }: { data: Recommend; radius?: string; actions?: WidgetActions }) {
  const { factory } = splitJob(data.job);
  const applied = !!actions?.applied?.includes(data.job);
  const lv = fitLevel(data.fit);
  return (
    <article data-id="zalo-oa-widget-recommend" onClick={() => openWeb()}
      className={`p-4 grid gap-3 cursor-pointer pressable ${WIDGET} ${radius}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="t-eyebrow">Việc mới hợp với bạn</p>
        <FitBadge level={lv} size="sm" label={FIT_LABEL[lv]} />
      </div>
      <JobHead job={data.job} pay={data.pay} sub={`${factory} · ${data.area} · cách nhà ${data.km} km`} />
      <MatchChips chips={data.chips.map((c) => ({ ok: c.ok, vi: c.label, en: "", ja: "" }))} />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); openWeb(); }}>Xem chi tiết</Button>
        <Button icon={applied ? "check" : undefined} iconRight={applied ? undefined : "send-01"} disabled={applied}
          onClick={(e) => { e.stopPropagation(); if (actions?.onApply) actions.onApply(data.job, data.pay); else openWeb("Đang mở ViệcNhanh để ứng tuyển…"); }}>
          {applied ? "Đã ứng tuyển" : "Ứng tuyển"}
        </Button>
      </div>
      <button type="button" data-id="zalo-oa-open-chat" onClick={(e) => { e.stopPropagation(); if (actions?.onOpenGroup) actions.onOpenGroup(data); else compose(`Mình muốn hỏi thêm về việc ${data.job}: `); }}
        className="pressable -mx-4 -mb-4 mt-1 flex items-center justify-center gap-1.5 border-t border-hair py-3 t-base font-medium text-(--chat-link) hover:bg-(--chat-list-active) rounded-b-[var(--radius-base)]">
        <Icon name="message-chat-circle" size={18} />Mở box chat
      </button>
    </article>
  );
}

// ---- Kịch bản B1 · Lần đầu --------------------------------------------------------
type Stage = "idle" | QuestionId | "evaluating" | "done";
const START = "Bắt đầu tìm việc";
const CARD = "Gửi ảnh thẻ cư trú";
const SKIP = "Bỏ qua";
const UNSURE = "Không rõ visa của mình";
const AGAIN = "Làm lại từ đầu";
const NEXT: Record<QuestionId, Stage> = { q1: "q2", q2: "q3", q3: "evaluating" };

const clock = () => new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

function useMessages(initial: () => NewMsg[]) {
  const seq = useRef(0);
  const [msgs, setMsgs] = useState<Msg[]>(() => initial().map((m) => ({ ...m, id: ++seq.current, at: clock() }) as Msg));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const push = useCallback((...m: NewMsg[]) => setMsgs((x) => [...x.filter((y) => y.kind !== "typing" && y.kind !== "evaluating"), ...m.map((y) => ({ ...y, id: ++seq.current, at: clock() }) as Msg)]), []);
  const later = useCallback((ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); }, []);
  return { msgs, setMsgs, push, later };
}

/** Nộp hồ sơ ngay trong chat → từ đây OA tự gửi widget trạng thái đơn mỗi khi đổi trạng thái. */
function useApply(push: (...m: NewMsg[]) => void, later: (ms: number, fn: () => void) => void) {
  const [applied, setApplied] = useState<string[]>([]);
  const sent = useRef(new Set<string>());
  const apply = (job: string, pay: number) => {
    if (sent.current.has(job)) return;
    sent.current.add(job);
    setApplied((a) => [...a, job]);
    const factory = splitJob(job).factory;
    push({ kind: "text", from: "me", text: `Nộp hồ sơ ${job}` });
    later(500, () => push({ kind: "typing" }));
    later(1200, () => push({ kind: "text", from: "bot", text: `Đã gửi hồ sơ tới ${factory}. Từ giờ mỗi khi đơn đổi trạng thái, mình sẽ nhắn bạn ngay tại đây.` }));
    later(2200, () => push({ kind: "status", data: { job, pay, from: "pending", to: "pending", note: `Hồ sơ đã tới HR ${factory}. Nhà máy cam kết trả lời trong 24h.`, at: clock() } }));
    later(5200, () => push({ kind: "status", data: { job, pay, from: "pending", to: "viewed", note: `HR ${factory} đang xem hồ sơ của bạn.`, at: clock() } }));
  };
  return { applied, apply };
}

/**
 * Nhóm chat của việc ("Mở box chat"): nhóm thông báo, chỉ trưởng nhóm và phó nhóm được gửi tin.
 * Thành viên chỉ đọc và thả reaction. Dữ liệu dựng.
 */
function GroupChat({ data, onBack }: { data: Recommend; onBack: () => void }) {
  const { title, factory } = splitJob(data.job);
  const posts = groupPosts(title, factory, data.area, data.km, fmtMonthly(data.pay), fmtPay(data.pay));
  const [mine, setMine] = useState<Record<string, boolean>>({});
  return (
    <div data-id="zalo-oa-group" className="flex flex-col flex-1 min-h-0 animate-[zen-slide-in-right_var(--motion-slow)_var(--ease-spring)_both]">
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-1 px-2 bg-(--chat-header-bg) bg-(image:--chat-header-gradient) text-(--chat-header-fg)">
        <button type="button" onClick={onBack} aria-label="Quay lại OA" className="pressable group/hb inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-(--chat-header-fg)/15">
          <Icon name="arrow-left" size={24} className="transition-transform duration-[var(--motion-base)] group-hover/hb:-translate-x-0.5" />
        </button>
        <span className="rounded-xl ring-2 ring-(--chat-header-fg)/30"><FactoryLogo name={factory} size={40} /></span>
        <span className="ml-2 flex min-w-0 flex-col">
          <span className="truncate t-lg font-bold">Nhóm {title} · {factory}</span>
          <span className="truncate t-sm text-(--chat-header-fg-muted)">Nhóm tuyển dụng · 128 thành viên</span>
        </span>
      </header>
      <div className="flex items-center gap-2 px-4 py-2 bg-(--chat-surface) border-b border-hair t-sm">
        <Icon name="calendar-check" size={16} className="text-(--chat-link) shrink-0" />
        <span className="truncate"><b>Đã ghim:</b> Phỏng vấn online thứ Ba 18/11, 10:00</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        <div role="separator" className="flex justify-center py-3"><span className="rounded-full bg-(--chat-separator-bg) px-3 py-1 t-sm text-(--chat-separator-fg)">Bạn đã tham gia nhóm qua ViệcNhanh Aichi</span></div>
        {posts.map((p, i) => {
          const admin = GROUP_ADMINS[p.by];
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
                      <p className="t-sub mb-2">Thông tin việc {title}</p>
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
                  <button type="button" aria-pressed={on} aria-label={on ? "Bỏ thích" : "Thích"} onClick={() => setMine((m) => ({ ...m, [p.id]: !m[p.id] }))}
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
        <p className="flex-1 t-sm text-(--chat-meta)">Chỉ trưởng nhóm và phó nhóm được gửi tin trong nhóm này.</p>
        <Button size="sm" variant="secondary" onClick={onBack}>Nhắn OA</Button>
      </div>
    </div>
  );
}

const GREETING: NewMsg[] = [
  { kind: "oa-intro" },
  { kind: "day", text: "Hôm nay" },
  { kind: "text", from: "bot", text: "Xin chào bạn! Mình là trợ lý tìm việc của ViệcNhanh Aichi." },
  { kind: "text", from: "bot", text: "Mình giúp bạn tìm việc đúng visa, gần nơi ở, và báo kết quả ứng tuyển ngay trong Zalo." },
  { kind: "welcome" },
];

/** Câu hỏi nhanh trước khi bắt đầu — trả lời các lo lắng thường gặp. */
const FAQ: Record<string, string[]> = {
  "Có mất phí không?": ["Hoàn toàn miễn phí cho người lao động. ViệcNhanh không thu phí giới thiệu."],
  "Cần chuẩn bị gì?": ["Bạn chỉ cần thẻ cư trú (在留カード) để chụp ở câu 1. Các câu sau chỉ cần bấm chọn."],
  "Hỏi người thật": ["Nhân viên nói tiếng Việt trực 7h–22h mỗi ngày. Bạn cứ nhắn ở đây, mình chuyển cho bạn ấy nhé."],
};

function FirstRunChat() {
  const { msgs, push, later } = useMessages(() => GREETING);
  const [stage, setStage] = useState<Stage>("idle");
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const { applied, apply } = useApply(push, later);

  /** Bot gõ một lúc rồi mới trả lời. */
  const bot = (texts: string[], then?: () => void, wait = 700) => {
    setBusy(true);
    push({ kind: "typing" });
    later(wait, () => {
      push(...texts.map((t) => ({ kind: "text" as const, from: "bot" as const, text: t })));
      setBusy(false);
      then?.();
    });
  };

  const ask = (q: QuestionId) => { setStage(q); bot([QUESTIONS[q].ask]); };

  const advance = (from: QuestionId, a: Answers) => {
    const nx = NEXT[from];
    if (nx === "evaluating") {
      setStage("evaluating");
      setBusy(true);
      later(400, () => {
        push({ kind: "evaluating" });
        later(1500, () => {
          push({ kind: "assess", answers: a }, { kind: "text", from: "bot", text: "Hồ sơ đã lưu theo tài khoản Zalo của bạn. Mở ViệcNhanh trên web sẽ không phải trả lời lại 3 câu." });
          setStage("done");
          setBusy(false);
        });
      });
    } else ask(nx as QuestionId);
  };

  const restart = () => {
    setAnswers({});
    push({ kind: "note", text: "Bắt đầu lại" });
    ask("q1");
  };

  const handle = (raw: string, viaChip: boolean) => {
    const text = raw.trim();
    push({ kind: "text", from: "me", text });

    if (text === AGAIN) return restart();
    if (stage === "idle") {
      if (FAQ[text]) { setAsked((a) => [...a, text]); return bot([...FAQ[text], "Nếu bạn đã sẵn sàng thì bấm “Bắt đầu tìm việc” nhé."]); }
      if (viaChip || /bat dau|tim viec|start/.test(text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase())) return ask("q1");
      return bot(["Bạn bấm “Bắt đầu tìm việc” để mình hỏi 3 câu nhé."]);
    }
    if (stage === "done" || stage === "evaluating") return bot(["Bấm vào việc trong bản đánh giá để xem chi tiết. Muốn trả lời lại thì chọn “Làm lại từ đầu”."]);

    const q = stage;
    if (q === "q1" && text === UNSURE) return bot(["Không sao. Bạn chụp mặt trước thẻ cư trú (在留カード), mình đọc loại visa và hạn thẻ giúp bạn."]);
    const val = text === SKIP ? null : viaChip && QUESTIONS[q].chips.includes(text) ? text : parseAnswer(q, text);
    if (!val) {
      // AC2: chỉ hỏi lại đúng câu đang dở.
      return bot([text === SKIP ? "Câu này cần để chấm điểm nên mình chưa bỏ qua được." : "Mình chưa hiểu câu trả lời này.", QUESTIONS[q].retry]);
    }
    const a = { ...answers, [q]: val };
    setAnswers(a);
    if (q === "q1" && !a.card) {
      return bot([`Đã ghi: ${val}. Bạn gửi thêm ảnh thẻ cư trú nhé, bấm biểu tượng máy ảnh hoặc ô bên dưới.`]);
    }
    advance(q, a);
  };

  const sendCard = () => {
    if (stage !== "q1") { toast("Ảnh thẻ cư trú chỉ cần ở câu 1", "info-circle"); return; }
    push({ kind: "card-photo" });
    const a = { ...answers, card: true, q1: answers.q1 ?? "Kỹ năng đặc định · Sản xuất" };
    setAnswers(a);
    bot([`Đã đọc thẻ: ${a.q1}, còn hạn đến 31/03/2028.`], () => advance("q1", a), 900);
  };

  const chips =
    stage === "idle" ? [START, ...Object.keys(FAQ).filter((q) => !asked.includes(q))]
      : stage === "q1" ? (answers.q1 ? [CARD] : [...QUESTIONS.q1.chips, UNSURE, CARD, SKIP])
        : stage === "q2" || stage === "q3" ? [...QUESTIONS[stage].chips, SKIP]
          : stage === "done" ? [AGAIN] : [];

  return (
    <Chat msgs={msgs} chips={chips} busy={busy} actions={{ onApply: apply, applied }}
      onChip={(c) => (c === CARD ? sendCard() : handle(c, true))}
      onSend={(t) => handle(t, false)}
      onCamera={sendCard} />
  );
}

// ---- Kịch bản B2 · Trạng thái đơn ---------------------------------------------
function StatusChat({ to }: { to: StatusTo }) {
  const data = STATUS_UPDATES[to];
  const { msgs, push, later } = useMessages(() => [
    { kind: "day", text: "Hôm qua" },
    { kind: "text", from: "bot", text: `Bạn đã ứng tuyển ${data.job}. Mình sẽ nhắn ngay khi nhà máy trả lời.` },
    { kind: "day", text: "Hôm nay" },
    { kind: "typing" },
  ]);
  // Hẹn giờ riêng + tự huỷ khi effect chạy lại (StrictMode / hot reload) để widget không bị gửi 2 lần.
  useEffect(() => {
    const id = setTimeout(() => push({ kind: "status", data }), 800);
    return () => clearTimeout(id);
  }, [data, push]);
  const { applied, apply } = useApply(push, later);
  return <Chat msgs={msgs} chips={[]} onChip={() => {}} onCamera={() => toast("Ảnh thẻ cư trú chỉ cần ở lần đầu", "info-circle")} actions={{ onApply: apply, applied }}
    onSend={(t) => { push({ kind: "text", from: "me", text: t }); later(600, () => push({ kind: "text", from: "bot", text: "Mình là trợ lý tự động. Bấm vào thẻ để xem chi tiết trên ViệcNhanh nhé." })); }} />;
}

// ---- Kịch bản B2 · Gợi ý việc ≥ 85% (BR4, BR5) ---------------------------------
function RecommendChat({ mode, attempts }: { mode: RecMode; attempts: number }) {
  const { msgs, push, later } = useMessages(() => [
    { kind: "day", text: "Thứ Hai" },
    { kind: "text", from: "bot", text: "Hồ sơ của bạn đã sẵn sàng. Có việc mới rất hợp với bạn, mình sẽ nhắn ở đây." },
    { kind: "day", text: "Hôm nay" },
  ]);
  const shown = useRef(0);
  const noted = useRef(false);
  const { applied, apply } = useApply(push, later);
  const [group, setGroup] = useState<Recommend | null>(null);

  useEffect(() => {
    if (mode === "below") {
      if (noted.current) return;
      noted.current = true;
      // AC4: việc 84% không được gửi qua Zalo.
      push({ kind: "note", text: `Ghi chú demo: có việc mới ${RECOMMEND_BELOW.fit}% (${RECOMMEND_BELOW.job}). Dưới ${RECOMMEND_MIN}% nên chỉ hiện trong app, không gửi qua Zalo.` });
      return;
    }
    while (shown.current < attempts) {
      const i = shown.current++;
      if (i < RECOMMEND_WEEKLY_CAP) {
        const rec = RECOMMENDS[i % RECOMMENDS.length];
        if (rec.fit >= RECOMMEND_MIN) push({ kind: "recommend", data: rec });
      } else {
        push({ kind: "note", text: `Ghi chú demo: đã gửi đủ ${RECOMMEND_WEEKLY_CAP} gợi ý tuần này. Việc mới chỉ hiện trong app.` });
      }
    }
  }, [attempts, mode, push]);

  return (
    <>
      <div className={group ? "hidden" : "contents"}>
        <Chat msgs={msgs} chips={[]} onChip={() => {}} onCamera={() => toast("Ảnh thẻ cư trú chỉ cần ở lần đầu", "info-circle")} actions={{ onApply: apply, applied, onOpenGroup: setGroup }}
          onSend={(t) => { push({ kind: "text", from: "me", text: t }); later(600, () => push({ kind: "text", from: "bot", text: "Mình đã nhận câu hỏi. Nhân viên tiếng Việt sẽ trả lời bạn trong giờ hỗ trợ 7h–22h." })); }} />
      </div>
      {group && <GroupChat data={group} onBack={() => setGroup(null)} />}
    </>
  );
}
