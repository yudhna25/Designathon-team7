"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { KintraMark } from "../ui";

const KEY = "kintra-intro";

/**
 * First visit per session: the Step K builds itself (stem → steps climb → leg), an LED counter runs to 100,
 * then the blue curtain splits open. ≤1.6s, skippable. Skipped entirely for reduced motion, hidden tabs and
 * repeat visits (the boot script in layout.tsx sets html[data-intro="seen"] before paint, so no flash).
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      const quiet = html.dataset.intro === "seen" || html.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches || document.visibilityState !== "visible";
      const finish = () => { try { sessionStorage.setItem(KEY, "1"); } catch {} html.dataset.intro = "seen"; setGone(true); };
      if (quiet) { finish(); return; }
      const q = gsap.utils.selector(root);
      const count = { v: 0 };
      const num = q("[data-count]")[0] as HTMLElement;
      const t = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: finish });
      t.set(q("[data-k=stem]"), { scaleY: 0, transformOrigin: "50% 100%" })
        .set(q("[data-step], [data-k=leg]"), { scale: 0, transformOrigin: "50% 50%" })
        .set(q("[data-word] span"), { yPercent: 110 })
        .to(q("[data-k=stem]"), { scaleY: 1, duration: 0.42 })
        .to(q("[data-step]"), { scale: 1, duration: 0.36, stagger: 0.11, ease: "back.out(2.4)" }, "-=0.12")
        .to(q("[data-k=leg]"), { scale: 1, duration: 0.34, ease: "back.out(1.8)" }, "-=0.18")
        .to(q("[data-word] span"), { yPercent: 0, duration: 0.5, stagger: 0.035 }, "-=0.35")
        .to(count, { v: 100, duration: 1.05, ease: "power2.inOut", onUpdate: () => { if (num) num.textContent = String(Math.round(count.v)).padStart(3, "0"); } }, 0)
        .to(q("[data-inner]"), { autoAlpha: 0, y: -12, duration: 0.25, ease: "power2.in" }, "+=0.08")
        .to(q("[data-half=top]"), { yPercent: -100, duration: 0.55, ease: "expo.inOut" }, "<0.05")
        .to(q("[data-half=bottom]"), { yPercent: 100, duration: 0.55, ease: "expo.inOut" }, "<");
      tl.current = t;
      const safety = setTimeout(finish, 3200); // never trap the demo behind the curtain
      return () => clearTimeout(safety);
    },
    { scope: root },
  );

  if (gone) return null;
  return (
    <div ref={root} className="kintra-intro fixed inset-0 z-[100]" role="status" aria-label="Đang mở KINTRA">
      <div data-half="top" className="absolute inset-x-0 top-0 h-1/2 bg-[#1B22A7]" />
      <div data-half="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-[#1B22A7]" />
      <div data-inner className="absolute inset-0 grid place-items-center text-white">
        <div className="grid justify-items-center gap-5">
          <KintraMark size={112} mono="#fff" />
          <p data-word className="overflow-hidden text-[34px] font-extrabold tracking-[0.22em] leading-none flex" aria-hidden>
            {"KINTRA".split("").map((c, i) => <span key={i} className="inline-block">{c}</span>)}
          </p>
          <p className="t-sm tracking-[0.08em] opacity-80">Your skills. Your next move.</p>
        </div>
        <span data-count className="led absolute bottom-8 right-8 text-[44px] leading-none opacity-90" aria-hidden>000</span>
        <button className="absolute bottom-8 left-8 t-sm underline underline-offset-4 opacity-80 hover:opacity-100 min-h-11 px-2" onClick={() => tl.current?.progress(1)}>Bỏ qua</button>
      </div>
    </div>
  );
}
