"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, Flip, SplitText, DrawSVGPlugin);
gsap.defaults({ ease: "expo.out", duration: 0.7 });

export { gsap, useGSAP, Flip, SplitText };

/** Stagger-in every [data-reveal] inside scope. Runs before paint, so no flash. */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
      if (!els.length) return;
      // Content must never wait on animation: skip when hidden (rAF paused) or motion is off.
      const quiet = document.visibilityState !== "visible" || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
      if (quiet) return;
      enter(els, { y: 18 }, { duration: 0.8, stagger: 0.045 });
      const t = setTimeout(() => gsap.set(els, { clearProps: "opacity,visibility,transform" }), 1500);
      return () => clearTimeout(t);
    },
    { scope, dependencies: deps },
  );
}

/**
 * Entrance tween with explicit end values. ZEN .pressable has CSS transitions on transform/opacity,
 * which make gsap.from() read a mid-transition end value (stuck at 0) — so we pin ends and pause transitions.
 */
export function enter(targets: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars = {}) {
  const end: gsap.TweenVars = { autoAlpha: 1, ease: "expo.out", clearProps: "transition,transform,opacity,visibility", ...to };
  for (const k of ["x", "y", "xPercent", "yPercent"]) if (k in from && !(k in end)) end[k] = 0;
  if ("scale" in from && !("scale" in end)) end.scale = 1;
  return gsap.fromTo(targets, { transition: "none", ...from }, end);
}

/** Apply the Demo "motion" setting + prefers-reduced-motion to GSAP. */
export function applyMotion(mode: "normal" | "slow" | "off") {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const effective = mode === "normal" && reduce ? "off" : mode;
  document.documentElement.dataset.motion = effective;
  gsap.globalTimeline.timeScale(effective === "slow" ? 1 / 3 : effective === "off" ? 1000 : 1);
}

let resolvePendingVT: (() => void) | null = null;

/** Finish an active route View Transition once the destination view mounts. */
export function resolveViewTransition() {
  if (resolvePendingVT) {
    const r = resolvePendingVT;
    resolvePendingVT = null;
    requestAnimationFrame(() => r());
  }
}

/** Run a state or route transition inside the View Transitions API when supported and motion is active. */
export function withViewTransition(fn: () => void, opts?: { asyncRoute?: boolean }) {
  if (typeof document === "undefined") { fn(); return; }
  const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
  type VT = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };
  const doc = document as Document & { startViewTransition?: (cb: () => void | Promise<void>) => VT };
  // A newer transition skips the older one; that rejection is expected, not an error.
  const quietly = (t: VT) => { t.ready.catch(() => {}); t.finished.catch(() => {}); t.updateCallbackDone.catch(() => {}); };
  if (quiet || typeof doc.startViewTransition !== "function") {
    fn();
    return;
  }
  if (!opts?.asyncRoute) {
    quietly(doc.startViewTransition(fn));
    return;
  }
  quietly(doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        resolvePendingVT = resolve;
        fn();
        setTimeout(() => {
          if (resolvePendingVT === resolve) {
            resolvePendingVT = null;
            resolve();
          }
        }, 320);
      }),
  ));
}
