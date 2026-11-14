"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { SEED_CANDIDATES, jobById, type Profile } from "./data";
import { DEFAULT_WEIGHTS, scoreMatch, type Weights } from "./scoring";
import { answerFor, type Thread } from "./senpai";

export const INTERVIEW_SLOTS = ["2026-11-18T10:00", "2026-11-18T14:00", "2026-11-19T10:00"];
export const fmtSlot = (iso: string, lang: "vi" | "en" | "ja" = "vi") =>
  new Date(iso).toLocaleString(lang === "vi" ? "vi-VN" : lang === "ja" ? "ja-JP" : "en-GB", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export type AppStatus = "sent" | "viewed" | "approved" | "rejected";
export type Application = {
  id: string;
  jobId: string;
  candidateId: string; // "me" = the worker using the prototype
  appliedAt: number; // simulated ms
  status: AppStatus;
  decidedAt?: number;
  viewedAt?: number;
  rejectReason?: string;
  startDate?: string;
  flagged?: boolean; // applied below "Rất phù hợp"
  answers?: Record<string, string>; // employer extra questions
  interview?: { slot: string; mode: "onsite" | "online" };
  accepted?: boolean; // worker formally accepted the offer → senpai profiles unlock
};

export type Config = {
  deadlineH: number;
  reminderH: number;
  threshold: number;
  weights: Weights;
  speed: number; // simulated seconds per real second
  motion: "normal" | "slow" | "off";
  hrLang: "en" | "ja";
  theme: "system" | "light" | "dark";
  showDemo: boolean;
};

export const DEFAULT_CONFIG: Config = {
  deadlineH: 24,
  reminderH: 4,
  threshold: 80,
  weights: DEFAULT_WEIGHTS,
  speed: 1,
  motion: "normal",
  hrLang: "en",
  theme: "system",
  showDemo: true,
};

type Auth = { method: "zalo" | "line" | "phone"; name: string };
type Withdrawal = { id: string; amount: number; fee: number; at: number };

type State = {
  config: Config;
  clock: { real: number; sim: number };
  auth: Auth | null;
  logins: number;
  profile: Profile | null;
  scanned: boolean;
  apps: Application[];
  seedSafety: Record<string, boolean>;
  safetyDone: boolean;
  withdrawals: Withdrawal[];
  threads: Thread[];
};

type Actions = {
  setConfig: (c: Partial<Config>) => void;
  setSpeed: (speed: number) => void;
  advance: (hours: number) => void;
  login: (method: Auth["method"], name: string) => void;
  logout: () => void;
  setProfile: (p: Profile) => void;
  setScanned: (v: boolean) => void;
  apply: (jobId: string, opts?: { flagged?: boolean; answers?: Record<string, string> }) => string;
  markViewed: (appId: string) => void;
  decide: (appId: string, status: "approved" | "rejected", extra?: { reason?: string; startDate?: string; interview?: Application["interview"] }) => void;
  completeSafety: () => void;
  withdraw: (amount: number, fee: number) => void;
  decideMany: (appIds: string[], interview: Application["interview"]) => void;
  askSenpai: (jobId: string, peerId: string, questions: string[]) => string;
  acceptOffer: (appId: string) => void;
  reset: () => void;
};

const initial = (): State => {
  const now = Date.now();
  return {
    config: DEFAULT_CONFIG,
    clock: { real: now, sim: now },
    auth: null,
    logins: 0,
    profile: null,
    scanned: false,
    apps: SEED_CANDIDATES.map((c) => ({
      id: `a-${c.id}`,
      jobId: c.jobId,
      candidateId: c.id,
      appliedAt: now - c.hoursAgo * 36e5,
      status: c.status,
      viewedAt: c.status !== "sent" ? now - (c.hoursAgo - 0.5) * 36e5 : undefined,
      decidedAt: c.status === "approved" || c.status === "rejected" ? now - (c.hoursAgo - 2) * 36e5 : undefined,
      rejectReason: c.status === "rejected" ? "skills" : undefined,
      startDate: c.status === "approved" ? "2026-12-01" : undefined,
      interview: c.status === "approved" ? { slot: INTERVIEW_SLOTS[0], mode: "onsite" as const } : undefined,
    })),
    seedSafety: Object.fromEntries(SEED_CANDIDATES.map((c) => [c.id, !!c.safetyDone])),
    safetyDone: false,
    withdrawals: [],
    threads: [],
  };
};

export const simNow = (clock: State["clock"], speed: number) => clock.sim + (Date.now() - clock.real) * speed;

export const useApp = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),
      setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
      setSpeed: (speed) =>
        set((s) => ({ clock: { real: Date.now(), sim: simNow(s.clock, s.config.speed) }, config: { ...s.config, speed } })),
      advance: (hours) =>
        set((s) => ({ clock: { real: Date.now(), sim: simNow(s.clock, s.config.speed) + hours * 36e5 } })),
      login: (method, name) => set((s) => ({ auth: { method, name }, logins: s.logins + 1 })),
      logout: () => set({ auth: null }),
      setProfile: (profile) => set({ profile }),
      setScanned: (scanned) => set({ scanned }),
      apply: (jobId, opts) => {
        const existing = get().apps.find((a) => a.candidateId === "me" && a.jobId === jobId && !isClosed(a, get()));
        if (existing) return existing.id;
        const id = `a-me-${jobId}-${Date.now()}`;
        const at = simNow(get().clock, get().config.speed);
        set((s) => ({ apps: [{ id, jobId, candidateId: "me", appliedAt: at, status: "sent", flagged: opts?.flagged, answers: opts?.answers }, ...s.apps] }));
        return id;
      },
      markViewed: (appId) =>
        set((s) => ({
          apps: s.apps.map((a) =>
            a.id === appId && a.status === "sent" && !isExpired(a, s) ? { ...a, status: "viewed", viewedAt: simNow(s.clock, s.config.speed) } : a,
          ),
        })),
      decide: (appId, status, extra) =>
        set((s) => ({
          apps: s.apps.map((a) =>
            a.id === appId && !isExpired(a, s)
              ? { ...a, status, decidedAt: simNow(s.clock, s.config.speed), rejectReason: extra?.reason, startDate: extra?.startDate, interview: extra?.interview }
              : a,
          ),
        })),
      completeSafety: () => set({ safetyDone: true }),
      withdraw: (amount, fee) =>
        set((s) => ({ withdrawals: [{ id: `w${Date.now()}`, amount, fee, at: simNow(s.clock, s.config.speed) }, ...s.withdrawals] })),
      decideMany: (appIds, interview) => appIds.forEach((id) => get().decide(id, "approved", { interview })),
      askSenpai: (jobId, peerId, questions) => {
        const id = `t${Date.now()}`;
        const qs = questions.slice(0, 3);
        set((s) => ({ threads: [...s.threads, { id, jobId, peerId, questions: qs, answers: qs.map(answerFor), at: simNow(s.clock, s.config.speed) }] }));
        return id;
      },
      acceptOffer: (appId) =>
        set((s) => ({ apps: s.apps.map((a) => (a.id === appId && a.status === "approved" ? { ...a, accepted: true } : a)) })),
      reset: () => set({ ...initial(), config: get().config }),
    }),
    {
      name: "viecnhanh-demo-v2",
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return { ...current, ...p, config: { ...DEFAULT_CONFIG, ...p.config } };
      },
    },
  ),
);

// --- derived helpers -------------------------------------------------------

type ClockState = Pick<State, "clock" | "config">;

export const deadlineOf = (a: Application, s: ClockState) => a.appliedAt + s.config.deadlineH * 36e5;
export const isExpired = (a: Application, s: ClockState, now = simNow(s.clock, s.config.speed)) =>
  (a.status === "sent" || a.status === "viewed") && now > deadlineOf(a, s);
export const isClosed = (a: Application, s: ClockState) => a.status === "approved" || a.status === "rejected" || isExpired(a, s);

export type DisplayStatus = AppStatus | "expired";
export const displayStatus = (a: Application, s: ClockState, now?: number): DisplayStatus =>
  isExpired(a, s, now) ? "expired" : a.status;

export function profileOf(candidateId: string, me: Profile | null): Profile | null {
  if (candidateId === "me") return me;
  return SEED_CANDIDATES.find((c) => c.id === candidateId)?.profile ?? null;
}

export function matchOf(a: Application, me: Profile | null, w: Weights, now?: number) {
  const p = profileOf(a.candidateId, me);
  const job = jobById(a.jobId);
  if (!p || !job) return null;
  return scoreMatch(p, job, w, now);
}

// --- hooks -----------------------------------------------------------------

/** Rehydrate once on the client and keep tabs in sync (worker tab ↔ HR tab). */
export function useHydrated() {
  // persist API is absent during SSR, so start false and settle on the client.
  const [ok, setOk] = useState(() => typeof window !== "undefined" && !!useApp.persist?.hasHydrated());
  useEffect(() => {
    if (!useApp.persist.hasHydrated()) useApp.persist.rehydrate();
    const unsub = useApp.persist.onFinishHydration(() => setOk(true));
    if (useApp.persist.hasHydrated()) setOk(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === useApp.persist.getOptions().name) useApp.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return ok;
}

/** Simulated "now" that re-renders on a timer. */
export function useNow(intervalMs = 1000) {
  const clock = useApp((s) => s.clock);
  const speed = useApp((s) => s.config.speed);
  const [now, setNow] = useState(() => simNow(clock, speed));
  useEffect(() => {
    setNow(simNow(clock, speed));
    const id = setInterval(() => setNow(simNow(clock, speed)), speed > 1 ? Math.min(intervalMs, 250) : intervalMs);
    return () => clearInterval(id);
  }, [clock, speed, intervalMs]);
  return now;
}

export function fmtLeft(ms: number) {
  if (ms <= 0) return "00:00:00";
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
