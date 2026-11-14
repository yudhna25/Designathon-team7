"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, resolveViewTransition, withViewTransition } from "@/lib/motion";

/**
 * KINTRA motion layer. One component, wired by event delegation and observers, so no screen layout has to change:
 * route View Transitions, K curtain (landing → app), 3D pass tilt + glare, magnetic buttons, LED number roll,
 * staggered scroll reveal, K confetti on a sent application, spotlight hover. Everything is off for reduced motion.
 */
const quiet = () =>
  document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = () => matchMedia("(pointer: fine)").matches;
const BLUES = ["#1B22A7", "#2F43D2", "#4260E6", "#9FB1FF"];

export function MotionLayer() {
  const router = useRouter();
  const path = usePathname();

  // Finish any pending View Transition when the new route has rendered.
  useEffect(() => { resolveViewTransition(); }, [path]);

  // Login → app: the K stairs open onto the app the first time the worker gets past the login screen.
  const prev = useRef(path);
  // Layout effect: cover the new screen before it paints, so the app never flashes before the stairs.
  useLayoutEffect(() => {
    const from = prev.current;
    prev.current = path;
    if (from === "/worker" && path.startsWith("/worker/") && !quiet()) enterApp();
  }, [path]);

  // Route transitions: K curtain from the landing into an app, View Transition morph inside the app.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.hash || url.pathname === location.pathname) return;
      if (quiet()) return;
      const to = url.pathname + url.search;
      if (location.pathname === "/" && /^\/(worker|hr)/.test(url.pathname)) {
        e.preventDefault();
        curtain(() => router.push(to));
        return;
      }
      // Tab bars switch instantly; the morph is for moving deeper (pass → job detail, list → item).
      if (a.closest("nav, header, aside[aria-label]")) return;
      if (/^\/(worker|hr)/.test(url.pathname)) {
        e.preventDefault();
        withViewTransition(() => router.push(to), { asyncRoute: true });
      }
    };
    // Capture phase: runs before next/link's handler, which then sees defaultPrevented and stands down.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // Pointer effects: pass tilt + glare, magnetic buttons, spotlight cards.
  useEffect(() => {
    if (!fine()) return;
    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    const reset = (el: HTMLElement | null, magnetic = false) => {
      if (!el) return;
      if (magnetic) gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      else gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "expo.out", onComplete: () => el.style.removeProperty("--glare") });
    };
    const onMove = (e: PointerEvent) => {
      if (quiet()) return;
      const t = e.target as Element;
      const pass = t.closest?.(".pass") as HTMLElement | null;
      if (pass !== tilted) { reset(tilted); tilted = pass; }
      if (pass) {
        const r = pass.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(pass, { rotateY: (px - 0.5) * 12, rotateX: (0.5 - py) * 10, transformPerspective: 900, duration: 0.5, ease: "power3.out" });
        pass.style.setProperty("--gx", `${px * 100}%`);
        pass.style.setProperty("--gy", `${py * 100}%`);
        pass.style.setProperty("--glare", "1");
      }
      const m = t.closest?.(".btn-primary, [data-magnetic]") as HTMLElement | null;
      if (m !== magnet) { reset(magnet, true); magnet = m; }
      if (m) {
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: "power3.out" });
      }
      const spot = t.closest?.("[data-spotlight], .pillar") as HTMLElement | null;
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--sx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }
    };
    const onLeave = () => { reset(tilted); reset(magnet, true); tilted = magnet = null; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); };
  }, []);

  // Observers: LED roll, staggered reveal, confetti on a sent application. Re-scan on route change and DOM change.
  useEffect(() => {
    if (quiet()) return;
    const seen = new WeakSet<Element>();
    let queue: HTMLElement[] = [];
    let flush = 0;
    const reveal = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        reveal.unobserve(en.target);
        queue.push(en.target as HTMLElement);
      }
      cancelAnimationFrame(flush);
      flush = requestAnimationFrame(() => {
        gsap.to(queue, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "expo.out", clearProps: "opacity,visibility,transform" });
        queue = [];
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    const roll = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { roll.unobserve(en.target); rollLed(en.target as HTMLElement); }
    }, { threshold: 0.6 });

    const scan = () => {
      // Below-the-fold cards only; anything already on screen stays put (content never waits on motion).
      document.querySelectorAll<HTMLElement>("main .card, main .card-flat, main article").forEach((el) => {
        if (seen.has(el) || el.closest("[data-reveal], .kintra-intro, dialog")) return;
        seen.add(el);
        if (el.getBoundingClientRect().top > innerHeight) { gsap.set(el, { autoAlpha: 0, y: 24 }); reveal.observe(el); }
      });
      document.querySelectorAll<HTMLElement>(".led").forEach((el) => {
        if (seen.has(el) || el.closest(".kintra-intro") || !/\d/.test(el.textContent ?? "")) return;
        seen.add(el);
        roll.observe(el);
      });
      const ok = document.querySelector(".ok-ring");
      if (ok && !seen.has(ok)) { seen.add(ok); confetti(ok as HTMLElement); }
    };
    let t = 0;
    const mo = new MutationObserver(() => { clearTimeout(t); t = window.setTimeout(scan, 120); });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();
    const safety = setTimeout(() => gsap.set(document.querySelectorAll("main .card, main .card-flat, main article"), { clearProps: "opacity,visibility,transform" }), 4000);
    return () => { mo.disconnect(); reveal.disconnect(); roll.disconnect(); clearTimeout(t); clearTimeout(safety); };
  }, [path]);

  return null;
}

/** Split-flap style roll on a clone laid over the LED number, so React's own text node is never touched. */
function rollLed(el: HTMLElement) {
  const final = el.textContent ?? "";
  const r = el.getBoundingClientRect();
  if (!r.width) return;
  const clone = el.cloneNode(true) as HTMLElement;
  const cs = getComputedStyle(el);
  Object.assign(clone.style, { position: "fixed", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: "0", pointerEvents: "none", zIndex: "60", color: cs.color, fontSize: cs.fontSize, lineHeight: cs.lineHeight });
  clone.removeAttribute("data-count");
  document.body.appendChild(clone);
  el.style.visibility = "hidden";
  const state = { p: 0 };
  gsap.to(state, {
    p: 1, duration: 0.75, ease: "power2.out",
    onUpdate: () => {
      const keep = Math.floor(state.p * final.length);
      clone.textContent = final.split("").map((c, i) => (i < keep || !/\d/.test(c) ? c : String((Math.random() * 10) | 0))).join("");
    },
    onComplete: () => { clone.remove(); el.style.visibility = ""; },
  });
  setTimeout(() => { if (clone.isConnected) { clone.remove(); el.style.visibility = ""; } }, 1500);
}

/** Small burst of brand-blue squares (the Step K blocks) from the success check. */
function confetti(from: HTMLElement) {
  const r = from.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("span");
    const size = 6 + Math.random() * 8;
    Object.assign(s.style, { position: "fixed", left: `${cx}px`, top: `${cy}px`, width: `${size}px`, height: `${size}px`, background: BLUES[i % BLUES.length], borderRadius: "2px", zIndex: "120", pointerEvents: "none" });
    document.body.appendChild(s);
    const angle = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 120;
    gsap.timeline({ onComplete: () => s.remove() })
      .to(s, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 40, rotate: Math.random() * 360, duration: 0.7, ease: "expo.out" })
      .to(s, { y: "+=120", autoAlpha: 0, duration: 0.8, ease: "power2.in" }, "-=0.15");
  }
}

/** Landing → app: a blue curtain rises in Step K stairs, the route changes underneath, then it lifts away. */
function curtain(go: () => void) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, { position: "fixed", inset: "0", zIndex: "110", pointerEvents: "none", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" });
  const cols = Array.from({ length: 4 }, () => {
    const c = document.createElement("span");
    c.style.background = "#1B22A7";
    host.appendChild(c);
    return c;
  });
  document.body.appendChild(host);
  gsap.set(cols, { yPercent: 100 });
  gsap.timeline({ onComplete: () => host.remove() })
    .to(cols, { yPercent: 0, duration: 0.5, stagger: 0.07, ease: "expo.inOut" })
    .add(() => go())
    .to(cols, { yPercent: -100, duration: 0.55, stagger: 0.07, ease: "expo.inOut", delay: 0.35 });
  setTimeout(() => host.remove(), 2500); // never leave the curtain up
}

/** Login → app entrance: blue stairs cover the screen with the white Step K, the K builds, then the stairs lift. */
function enterApp() {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, { position: "fixed", inset: "0", zIndex: "110", pointerEvents: "none" });
  const grid = document.createElement("div");
  Object.assign(grid.style, { position: "absolute", inset: "0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" });
  const cols = Array.from({ length: 4 }, () => {
    const c = document.createElement("span");
    c.style.background = "#1B22A7";
    grid.appendChild(c);
    return c;
  });
  host.appendChild(grid);
  const mark = document.createElement("div");
  Object.assign(mark.style, { position: "absolute", inset: "0", display: "grid", placeItems: "center" });
  mark.innerHTML = '<svg width="96" height="96" viewBox="0 0 256 256"><g transform="translate(-6 0)" fill="#fff"><path data-k d="M48 32h44v192H48z"/><path data-k d="M112 152h44l64 72h-44z"/><path data-s d="M92 152v-40h40v40z"/><path data-s d="M132 112V72h40v40z"/><path data-s d="M172 72V32h40v40z"/></g></svg>';
  host.appendChild(mark);
  document.body.appendChild(host);
  const steps = mark.querySelectorAll("[data-s]");
  gsap.timeline({ onComplete: () => host.remove() })
    .from(mark.querySelectorAll("[data-k]"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.32, ease: "expo.out" })
    .from(steps, { scale: 0, transformOrigin: "50% 50%", duration: 0.28, stagger: 0.08, ease: "back.out(2.4)" }, "-=0.1")
    .to(mark, { autoAlpha: 0, scale: 0.9, duration: 0.2, ease: "power2.in" }, "+=0.12")
    .to(cols, { yPercent: -100, duration: 0.55, stagger: 0.07, ease: "expo.inOut" }, "-=0.05");
  setTimeout(() => host.remove(), 2600); // never leave the stairs up
}
