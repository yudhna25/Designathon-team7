"use client";
import Link from "next/link";
import { useRef } from "react";
import { Icon, Logo, Segmented } from "@/components/ui";
import { useLang, type WLang } from "@/lib/i18n";
import { enter, gsap, SplitText, useGSAP } from "@/lib/motion";
import { useApp, useHydrated } from "@/lib/store";

const HUB_COPY = {
  vi: {
    openAppAria: "Mở app người lao động",
    langAria: "Ngôn ngữ",
    eyebrow: "Prototype · Milestone 2 · Aichi, Japan",
    hero1: "Việc đúng tay nghề.",
    hero2Pre: "HR trả lời trong",
    hero2Num: "24 giờ.",
    heroDesc: "KINTRA nối lao động Việt đang ở Aichi với nhà máy cần người. AI đọc thẻ cư trú, đánh giá mức phù hợp với từng việc và cho thấy lương thực nhận trước khi apply. Nhà máy nhận hồ sơ đã kiểm tra visa, xếp theo điểm.",
    stats: [
      { k: "~60.000", v: "lao động Việt ở Aichi, nhóm lớn nhất (24%)" },
      { k: "~2 tháng", v: "không có lương khi đổi việc, phải vay bạn hoặc quẹt thẻ" },
      { k: "25–35%", v: "phí agency nhà máy đang trả trên mỗi giờ lương" },
    ],
    entrySectionAria: "Trải nghiệm app người lao động",
    entryEyebrow: "Vai 1 · Web app mobile",
    entryTitle: "Người lao động",
    entryDesc: "Tuấn Anh, 26 tuổi, thợ tiện CNC, Kỹ năng đặc định 1. Đăng nhập, trả lời 3 câu, xem việc hợp và apply.",
    entryCta: "Mở app người lao động",
    flowTitle: "User flow",
    flowHint: "Mở hai vai ở hai tab cạnh nhau: worker apply thì HR thấy ngay, HR duyệt thì worker nhận thông báo.",
    flow: ["Đăng nhập Zalo / SĐT", "Onboarding 3 câu", "AI dựng profile", "Mức phù hợp + chip ✓ ✗", "Ứng tuyển · câu hỏi thêm", "HR quyết định ≤ 24h", "Phỏng vấn · lý do · 3 việc khác"],
    pillarsTitle: "Mỗi tính năng trả lời một phát hiện",
    pillars: [
      { n: "01", t: "Đăng ký bằng tin nhắn, có cấu trúc", d: "Zalo, LINE hoặc số điện thoại. 3 câu hỏi thay cho form dài, đủ trường HR Nhật cần trước ngày 1.", f: "Finding 3" },
      { n: "02", t: "Visa kiểm tra trước, không để HR lọc tay", d: "Quét thẻ cư trú, sai ngành thì loại ngay. Người lao động chỉ thấy việc hợp pháp với mình.", f: "Finding 2" },
      { n: "03", t: "AI chấm điểm có lý do", d: "Mức phù hợp bằng chữ (Rất phù hợp · Có thể phù hợp · Chưa phù hợp) kèm chip ✓ ✗. Thiếu gì thì gợi ý nâng tay nghề cho đúng việc đó.", f: "Finding 1" },
      { n: "04", t: "Lương thực nhận một con số", d: "Đã trừ bảo hiểm, thuế, ký túc xá. So sánh việc bằng tiền thật về tay, kèm quy đổi VNĐ.", f: "Interview" },
      { n: "05", t: "Học an toàn trước ngày 1", d: "Biển báo Kanji, quy tắc máy tiện, 5S bằng tiếng Việt. Đáp ứng Điều 59 Luật An toàn Lao động.", f: "Finding 4" },
      { n: "06", t: "Ứng lương đã làm, không phải khoản vay", d: "Chỉ trên ca đã xác nhận, tối đa 50%, phí cố định. Lấp khoảng trống ~2 tháng khi đổi việc.", f: "Finding 5" },
    ],
    footerRightPre: "Prototype vibecoded với Claude Code · Dữ liệu demo là giả lập, tên nhà máy là tên giả.",
    footerRightPost1: "Nhấn",
    footerRightPost2: "để mở bảng điều khiển demo.",
  },
  en: {
    openAppAria: "Open worker app",
    langAria: "Language",
    eyebrow: "Prototype · Milestone 2 · Aichi, Japan",
    hero1: "Jobs matched to your skills.",
    hero2Pre: "HR replies in",
    hero2Num: "24 hours.",
    heroDesc: "KINTRA connects Vietnamese factory workers in Aichi with plants hiring now. AI reads your residence card, explains how well each role fits, and shows real take-home pay before you apply. HR receives visa-verified applicants ranked by fit.",
    stats: [
      { k: "~60,000", v: "Vietnamese workers in Aichi — the largest group (24%)" },
      { k: "~2 months", v: "without a paycheck when switching jobs, forcing informal loans" },
      { k: "25–35%", v: "staffing agency markup factories currently pay per worked hour" },
    ],
    entrySectionAria: "Try the worker app",
    entryEyebrow: "Role 1 · Mobile web app",
    entryTitle: "Worker",
    entryDesc: "Tuan Anh, 26, CNC lathe operator, SSW (i). Sign in, answer 3 questions, see matching jobs, and apply.",
    entryCta: "Open worker app",
    flowTitle: "User flow",
    flowHint: "Open Worker and HR side by side: applying updates HR immediately, and HR decisions notify the worker right away.",
    flow: ["Zalo / Phone sign-in", "3-step onboarding", "AI builds profile", "Match label + ✓ ✗ chips", "Apply · extra Qs", "HR decision ≤ 24h", "Interview · feedback · 3 backups"],
    pillarsTitle: "Every feature answers a field finding",
    pillars: [
      { n: "01", t: "Chat login, structured intake", d: "Zalo, LINE, or phone sign-in. Three focused steps instead of long forms, capturing everything Japanese HR needs.", f: "Finding 3" },
      { n: "02", t: "Visa gated up front, no manual filtering", d: "Scan your residence card and ineligible industries stay hidden. Workers only see jobs they can legally take.", f: "Finding 2" },
      { n: "03", t: "Explainable AI match labels", d: "Clear words (Great match · Possible match · Not a match) with ✓ ✗ chips, plus specific steps to raise fit for that job.", f: "Finding 1" },
      { n: "04", t: "One clear take-home pay number", d: "Estimated net pay after taxes, social insurance, and dorm rent—plus VND conversion for fair comparison.", f: "Interview" },
      { n: "05", t: "Safety training before Day 1", d: "Kanji signs, lathe rules, and 5S in your language—meeting Article 59 of Japan's Industrial Safety Act.", f: "Finding 4" },
      { n: "06", t: "Earned wage access, never a loan", d: "Draw up to 50% of factory-confirmed shifts for a flat fee—bridging the ~2-month job-switch gap.", f: "Finding 5" },
    ],
    footerRightPre: "Prototype built with simulated data — all factory names are fictional.",
    footerRightPost1: "Press",
    footerRightPost2: "to open the demo control drawer.",
  },
  ja: {
    openAppAria: "求職者アプリを開く",
    langAria: "言語",
    eyebrow: "Prototype · Milestone 2 · Aichi, Japan",
    hero1: "スキルに合う工場へ。",
    hero2Pre: "HRから返答",
    hero2Num: "24時間以内。",
    heroDesc: "KINTRAは愛知県のベトナム人技能人材と採用中の工場をつなぎます。AIが在留カードを読み取り、求人ごとの適合理由と手取り見込み額を応募前に提示。工場側には在留資格確認済みの候補者がスコア順で届きます。",
    stats: [
      { k: "約60,000人", v: "愛知県内のベトナム人労働者（外国人労働者の24%で最多）" },
      { k: "約2ヶ月", v: "転職時の無給期間。借入やカード分割に頼る原因に" },
      { k: "25–35%", v: "工場側が人材派遣会社へ支払っている時間単価上乗せ手数料" },
    ],
    entrySectionAria: "求職者アプリを体験",
    entryEyebrow: "ロール1 · モバイルWebアプリ",
    entryTitle: "求職者（ワーカー）",
    entryDesc: "トゥアン・アイン（26歳・CNC旋盤・特定技能1号）。ログインして3問に答え、合う求人に応募。",
    entryCta: "求職者アプリを開く",
    flowTitle: "ユーザーフロー",
    flowHint: "求職者側とHR側を別タブで並べると、応募や選考結果が即座に同期します。",
    flow: ["Zalo / 電話番号ログイン", "3ステップ登録", "AIプロフィール作成", "マッチ度＋✓✗根拠", "応募・追加質問", "HRが24h以内に判断", "面接案内・不採用理由＋代替3件"],
    pillarsTitle: "現場の課題に対応する6つの設計",
    pillars: [
      { n: "01", t: "チャット連携と構造化された3ステップ", d: "Zalo・LINE・SMSで簡単ログイン。長い履歴書フォームをなくし、日本のHRが必要な項目を漏れなく取得。", f: "Finding 3" },
      { n: "02", t: "在留資格を事前判定し手作業フィルタを削減", d: "在留カードを読み取り、就労不可の業種を自動で非表示。法律上働ける求人のみを表示します。", f: "Finding 2" },
      { n: "03", t: "根拠付きのAIマッチング", d: "「とても合う・合いそう・不適合」のラベルと ✓ ✗ チップで理由を明示し、不足スキルの補完も提案。", f: "Finding 1" },
      { n: "04", t: "税・保険・寮費控除後の手取り額を一目で", d: "額面ではなく実際の手取り見込み額とベトナムドン換算を表示し、納得できる求人比較を実現。", f: "Interview" },
      { n: "05", t: "入社初日前の安全教育", d: "安全標識・旋盤ルール・5Sを母国語で事前に学習でき、労働安全衛生法第59条の要件に対応。", f: "Finding 4" },
      { n: "06", t: "借入ではない給与即時受取（EWA）", d: "工場承認済みシフトの最大50%を定額手数料で先受けし、転職後約2ヶ月の収入空白を埋めます。", f: "Finding 5" },
    ],
    footerRightPre: "デモ用プロトタイプです。工場名・数値データはすべて架空のサンプルです。",
    footerRightPost1: "",
    footerRightPost2: "を押すとデモ操作パネルが開きます。",
  },
} as const;

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const storeLang = useLang();
  const lang: WLang = hydrated ? storeLang : "vi";
  const setConfig = useApp((s) => s.setConfig);
  const c = HUB_COPY[lang];

  useGSAP(
    () => {
      const split = SplitText.create(".hero-line", { type: "lines,words", mask: "lines", linesClass: "pb-[0.14em] -mb-[0.14em]" });
      gsap.from(split.words, { yPercent: 110, duration: 1.1, stagger: 0.04, ease: "expo.out" });
      enter("[data-hero]", { y: 20 }, { stagger: 0.08, duration: 0.9, delay: 0.35 });
      enter(".entry", { y: 40 }, { stagger: 0.1, duration: 1, delay: 0.5 });
      enter(".flow-step", { x: -12 }, { stagger: 0.05, duration: 0.6, delay: 0.7 });
      // Below-the-fold: reveal on scroll without ScrollTrigger (keeps bundle small).
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { gsap.to(e.target, { y: 0, autoAlpha: 1, duration: 0.9, clearProps: "transform,opacity,visibility" }); io.unobserve(e.target); }
      }, { rootMargin: "0px 0px -10% 0px" });
      gsap.utils.toArray<HTMLElement>(".pillar").forEach((el) => { gsap.set(el, { y: 32 }); io.observe(el); });
      return () => { io.disconnect(); split.revert(); };
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="min-h-dvh bg-canvas" data-type="base-16">
      <header className="mx-auto max-w-[1280px] px-5 md:px-10 h-20 flex items-center justify-between gap-4">
        <Link href="/worker/jobs" className="pressable rounded-xl" aria-label={c.openAppAria}><Logo /></Link>
        <div className="flex items-center gap-4">
          <span className="t-eyebrow hidden md:block">Team 7 · Konoha Village · Designathon 2026</span>
          <div className="w-[172px]">
            <Segmented
              size="sm"
              label={c.langAria}
              value={lang}
              onChange={(v) => setConfig({ workerLang: v as WLang })}
              options={[{ value: "vi", label: "VI" }, { value: "en", label: "EN" }, { value: "ja", label: "日本語" }]}
            />
          </div>
        </div>
      </header>

      <main key={lang} className="mx-auto max-w-[1280px] px-5 md:px-10">
        <section className="pt-8 md:pt-16 pb-12 md:pb-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <p className="t-eyebrow mb-6" data-hero>{c.eyebrow}</p>
            <h1 className="hero-line text-[44px] leading-[1.02] md:text-[76px] md:leading-[0.98] font-semibold tracking-[-0.055em]">
              {c.hero1}<br />
              <span className="text-faint">{c.hero2Pre}</span>{" "}
              <span className="inline-block whitespace-nowrap">{c.hero2Num}</span>
            </h1>
            <p className="t-lg text-muted mt-6 max-w-[560px]" data-hero>{c.heroDesc}</p>
          </div>
          <div className="lg:col-span-5 lg:pt-14 grid gap-4 content-start" data-hero>
            {c.stats.map((s) => <Stat key={s.k} k={s.k} v={s.v} />)}
          </div>
        </section>

        <section className="grid gap-4 md:gap-6 pb-14" aria-label={c.entrySectionAria}>
          <Entry
            href="/worker"
            eyebrow={c.entryEyebrow}
            title={c.entryTitle}
            desc={c.entryDesc}
            cta={c.entryCta}
            icon="phone"
          />
        </section>

        <section className="pb-16" aria-labelledby="flow-h">
          <div className="flex items-end justify-between gap-6 mb-5">
            <h2 id="flow-h" className="t-h3">{c.flowTitle}</h2>
            <p className="t-sm text-muted max-w-[360px] hidden md:block">{c.flowHint}</p>
          </div>
          <ol className="flex flex-wrap gap-2">
            {c.flow.map((s, i) => (
              <li key={s} className="flow-step flex items-center gap-2">
                <span className="badge badge-md badge-outline"><span className="mono text-faint">{String(i + 1).padStart(2, "0")}</span>{s}</span>
                {i < c.flow.length - 1 && <Icon name="arrow-narrow-right" size={16} className="text-faint" />}
              </li>
            ))}
          </ol>
        </section>

        <section className="pb-20" aria-labelledby="pillars-h">
          <h2 id="pillars-h" className="t-h3 mb-6">{c.pillarsTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-hair">
            {c.pillars.map((p) => (
              <article key={p.n} className="pillar border-r border-b border-hair p-6 md:p-8 bg-surface/40">
                <div className="flex items-center justify-between mb-10">
                  <span className="mono text-faint">{p.n}</span>
                  <span className="badge badge-outline">{p.f}</span>
                </div>
                <h3 className="t-sub mb-2">{p.t}</h3>
                <p className="text-muted">{p.d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="hair-t">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10 py-8 grid md:grid-cols-2 gap-4 t-sm text-muted">
          <p>UI: ZEN Kaiz Design System (Free) · Dizai Studio · zen.dizai.studio<br />Font: Be Vietnam Pro, JetBrains Mono (SIL OFL 1.1) · Code: Next.js, React, Tailwind CSS, GSAP</p>
          <p className="md:text-right">{c.footerRightPre}<br />{c.footerRightPost1 ? `${c.footerRightPost1} ` : ""}<kbd className="mono text-fg">Shift + D</kbd> {c.footerRightPost2}</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-5 hair-b pb-4">
      <span className="t-h2 tnum w-[150px] shrink-0">{k}</span>
      <span className="text-muted">{v}</span>
    </div>
  );
}

function Entry({ href, eyebrow, title, desc, cta, icon, dark }: { href: string; eyebrow: string; title: string; desc: string; cta: string; icon: "phone" | "monitor-01"; dark?: boolean }) {
  return (
    <Link href={href} className={`entry group relative overflow-hidden rounded-[32px] p-7 md:p-10 min-h-[320px] flex flex-col justify-between pressable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-canvas)] ${dark ? "ink" : "card"}`}>
      <div className="flex items-start justify-between">
        <span className={`t-eyebrow ${dark ? "!text-[color:var(--color-content-on-dark-overlay-base)]" : ""}`}>{eyebrow}</span>
        <span className={`grid size-12 place-items-center rounded-full transition-transform duration-[var(--motion-slow)] [transition-timing-function:var(--ease-spring)] group-hover:rotate-[-45deg] ${dark ? "bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)]" : "ink"}`}>
          <Icon name="arrow-right" />
        </span>
      </div>
      <div>
        <Icon name={icon} size={28} className="mb-5 opacity-70" />
        <h2 className="text-[40px] md:text-[56px] leading-none font-semibold tracking-[-0.05em]">{title}</h2>
        <p className={`mt-4 max-w-[440px] ${dark ? "muted-ink" : "text-muted"}`}>{desc}</p>
        <span className="mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-1">{cta}</span>
      </div>
    </Link>
  );
}
