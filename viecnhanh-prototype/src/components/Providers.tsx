"use client";
import { useEffect, type ReactNode } from "react";
import { useApp, useHydrated } from "@/lib/store";
import { applyMotion } from "@/lib/motion";
import { Toaster } from "./ui";
import { DemoPanel } from "./DemoPanel";

export function Providers({ children }: { children: ReactNode }) {
  const ready = useHydrated();
  const theme = useApp((s) => s.config.theme);
  const motion = useApp((s) => s.config.motion);

  useEffect(() => {
    if (!ready) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const set = () => (document.documentElement.dataset.theme = theme === "dark" || (theme === "system" && mq.matches) ? "dark" : "light");
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, [theme, ready]);

  useEffect(() => { if (ready) applyMotion(motion); }, [motion, ready]);

  return (
    <>
      {children}
      <Toaster />
      {ready && <DemoPanel />}
    </>
  );
}
