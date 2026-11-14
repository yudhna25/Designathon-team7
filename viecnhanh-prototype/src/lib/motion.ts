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
      enter(els, { y: 18 }, { duration: 0.8, stagger: 0.045 });
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
