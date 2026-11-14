// HR side of the M3 market event: 3-month trial, 300 workers in week 1.
import type { HIRE_PLAN } from "./data";
import type { Fit } from "./scoring";
import type { DisplayStatus } from "./store";

type Row = { appId: string; gatePass: boolean; fit: Fit; status: DisplayStatus };

/** Only visa-cleared, great-fit, still-open applications can be invited in a batch. */
export const batchEligible = (rows: Row[]) =>
  rows.filter((r) => r.gatePass && r.fit === "great" && (r.status === "sent" || r.status === "viewed")).map((r) => r.appId);

export function hireProgress(plan: typeof HIRE_PLAN, approvedNow: number) {
  const filled = plan.filledByDay.reduce((a, b) => a + b, 0) + approvedNow;
  return { filled, target: plan.target, pct: Math.round((filled / plan.target) * 100), perDay: plan.filledByDay };
}

/** One HR reviewer clears ~12 profiles an hour; past that the 24h promise needs group invites. */
export const needsBatch = (pending: number, hoursLeft: number, perHourCapacity = 12) => pending > hoursLeft * perHourCapacity;
