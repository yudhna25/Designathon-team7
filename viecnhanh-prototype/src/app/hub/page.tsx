"use client";
import Link from "next/link";
import { useRef } from "react";
import { Icon, Logo } from "@/components/ui";
import { enter, gsap, SplitText, useGSAP } from "@/lib/motion";

const PILLARS = [
  { n: "01", t: "Đăng ký bằng tin nhắn, có cấu trúc", d: "Zalo, LINE hoặc số điện thoại. 3 câu hỏi thay cho form dài, đủ trường HR Nhật cần trước ngày 1.", f: "Finding 3" },
  { n: "02", t: "Visa kiểm tra trước, không để HR lọc tay", d: "Quét thẻ cư trú, sai ngành thì loại ngay. Người lao động chỉ thấy việc hợp pháp với mình.", f: "Finding 2" },
  { n: "03", t: "AI chấm điểm có lý do", d: "Mức phù hợp bằng chữ (Rất phù hợp · Có thể phù hợp · Chưa phù hợp) kèm chip ✓ ✗. Thiếu gì thì gợi ý nâng tay nghề cho đúng việc đó.", f: "Finding 1" },
  { n: "04", t: "Lương thực nhận một con số", d: "Đã trừ bảo hiểm, thuế, ký túc xá. So sánh việc bằng tiền thật về tay, kèm quy đổi VNĐ.", f: "Interview" },
  { n: "05", t: "Học an toàn trước ngày 1", d: "Biển báo Kanji, quy tắc máy tiện, 5S bằng tiếng Việt. Đáp ứng Điều 59 Luật An toàn Lao động.", f: "Finding 4" },
  { n: "06", t: "Ứng lương đã làm, không phải khoản vay", d: "Chỉ trên ca đã xác nhận, tối đa 50%, phí cố định. Lấp khoảng trống ~2 tháng khi đổi việc.", f: "Finding 5" },
];

const FLOW = ["Đăng nhập Zalo / SĐT", "Onboarding 3 câu", "AI dựng profile", "Mức phù hợp + chip ✓ ✗", "Ứng tuyển · câu hỏi thêm", "HR quyết định ≤ 24h", "Phỏng vấn · lý do · 3 việc khác"];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
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
    { scope: root },
  );

  return (
    <div ref={root} className="min-h-dvh bg-canvas" data-type="base-16">
      <header className="mx-auto max-w-[1280px] px-5 md:px-10 h-20 flex items-center justify-between">
        <Link href="/worker/jobs" className="pressable rounded-xl" aria-label="Mở app người lao động"><Logo /></Link>
        <span className="t-eyebrow hidden sm:block">Team 7 · Konoha Village · Designathon 2026</span>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 md:px-10">
        <section className="pt-8 md:pt-16 pb-12 md:pb-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <p className="t-eyebrow mb-6" data-hero>Prototype · Milestone 2 · Aichi, Japan</p>
            <h1 className="hero-line text-[44px] leading-[1.02] md:text-[76px] md:leading-[0.98] font-semibold tracking-[-0.055em]">
              Việc đúng tay nghề.<br />
              <span className="text-faint">HR trả lời trong</span>{" "}
              <span className="inline-block whitespace-nowrap">24&nbsp;giờ.</span>
            </h1>
            <p className="t-lg text-muted mt-6 max-w-[560px]" data-hero>
              ViệcNhanh nối lao động Việt đang ở Aichi với nhà máy cần người. AI đọc thẻ cư trú, đánh giá mức phù hợp với từng việc
              và cho thấy lương thực nhận trước khi apply. Nhà máy nhận hồ sơ đã kiểm tra visa, xếp theo điểm.
            </p>
          </div>
          <div className="lg:col-span-5 lg:pt-14 grid gap-4 content-start" data-hero>
            <Stat k="~60.000" v="lao động Việt ở Aichi, nhóm lớn nhất (24%)" />
            <Stat k="~2 tháng" v="không có lương khi đổi việc, phải vay bạn hoặc quẹt thẻ" />
            <Stat k="25–35%" v="phí agency nhà máy đang trả trên mỗi giờ lương" />
          </div>
        </section>

        <section className="grid gap-4 md:gap-6 pb-14" aria-label="Trải nghiệm app người lao động">
          <Entry
            href="/worker"
            eyebrow="Vai 1 · Web app mobile"
            title="Người lao động"
            desc="Tuấn Anh, 26 tuổi, thợ tiện CNC, Kỹ năng đặc định 1. Đăng nhập, trả lời 3 câu, xem việc hợp và apply."
            cta="Mở app người lao động"
            icon="phone"
          />
        </section>

        <section className="pb-16" aria-labelledby="flow-h">
          <div className="flex items-end justify-between gap-6 mb-5">
            <h2 id="flow-h" className="t-h3">User flow</h2>
            <p className="t-sm text-muted max-w-[360px] hidden md:block">Mở hai vai ở hai tab cạnh nhau: worker apply thì HR thấy ngay, HR duyệt thì worker nhận thông báo.</p>
          </div>
          <ol className="flex flex-wrap gap-2">
            {FLOW.map((s, i) => (
              <li key={s} className="flow-step flex items-center gap-2">
                <span className="badge badge-md badge-outline"><span className="mono text-faint">{String(i + 1).padStart(2, "0")}</span>{s}</span>
                {i < FLOW.length - 1 && <Icon name="arrow-narrow-right" size={16} className="text-faint" />}
              </li>
            ))}
          </ol>
        </section>

        <section className="pb-20" aria-labelledby="pillars-h">
          <h2 id="pillars-h" className="t-h3 mb-6">Mỗi tính năng trả lời một phát hiện</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-hair">
            {PILLARS.map((p) => (
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
          <p>UI xây trên ZEN Kaiz Design System (Free) · Dizai Studio · zen.dizai.studio<br />Font: Be Vietnam Pro, JetBrains Mono (SIL OFL 1.1) · Code: Next.js, React, Tailwind CSS, GSAP</p>
          <p className="md:text-right">Prototype vibecoded với Claude Code · Dữ liệu demo là giả lập, tên nhà máy là tên giả.<br />Nhấn <kbd className="mono text-fg">Shift + D</kbd> để mở bảng điều khiển demo.</p>
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
