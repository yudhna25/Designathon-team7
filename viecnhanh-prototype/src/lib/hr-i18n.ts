import { CERTS, CITIES, JLPT_SHORT, SKILLS, type Job, type Profile } from "./data";
import type { Criterion } from "./scoring";
import type { DisplayStatus } from "./store";

export type Lang = "en" | "ja";

const T = {
  en: {
    brand: "for Business",
    nav: { candidates: "Candidates", jobs: "Job posts", reports: "Reports", settings: "Settings" },
    hiringFor: "Hiring for",
    headcount: (n: number) => `${n} openings`,
    kpi: { fresh: "New in 24h", pending: "Awaiting decision", due: (h: number) => `Due within ${h}h`, approved: "Interviews set" },
    remind: (n: number, h: number) => `${n} candidate${n > 1 ? "s" : ""} will auto-close within ${h}h. Decide now so good people aren't lost.`,
    reviewNow: "Review now",
    th: { cand: "Candidate", match: "Fit level", visa: "Residence status", skills: "Skills", jlpt: "JLPT", start: "Can start", left: "Time left", status: "Status" },
    status: { sent: "New", viewed: "Viewed", approved: "Interview invited", rejected: "Declined", expired: "Expired · auto-declined" } as Record<DisplayStatus, string>,
    excluded: (n: number) => `${n} auto-excluded — residence status doesn't permit this work`,
    excludedHint: "Checked against the residence card before you see them. No manual Zairyu check needed.",
    sortedBy: "Ranked by fit level · visa already verified",
    days: (d: number) => (d === 0 ? "Immediately" : `In ${d} days`),
    back: "All candidates",
    breakdown: "Score breakdown",
    weight: "weight",
    why: "Why ranked here",
    docs: "Verified before you see it",
    card: "Residence card (Zairyu)",
    cardOk: "IC chip verified",
    limit: "Work restriction",
    none: "None",
    myNumber: "My Number",
    declared: "Declared",
    bank: "Bank account",
    afterApprove: "Collected after hiring",
    safety: "Safety training (Art. 59)",
    safetyDone: "Completed",
    safetyTodo: "Required before the first shift",
    decideWithin: "Decide within",
    autoClose: "If no decision, the application auto-closes and the worker is shown other jobs.",
    approve: "Invite",
    decline: "Decline",
    startDate: "Start date",
    confirmApprove: "Send interview invite",
    reason: "Reason (shared with the worker, kindly worded)",
    confirmDecline: "Send decision",
    decided: (s: string) => `Decision sent · ${s}`,
    expiredNote: "This application expired. The worker was notified and shown other jobs.",
    applied: "Applied",
    commute: (km: number) => (km <= 1 ? "same city" : `${km} km commute`),
    nationality: { VN: "Vietnam", ID: "Indonesia", PH: "Philippines" },
    you: "Sato · HR",
    toastApprove: (n: string) => `Interview invite saved for ${n}`,
    toastDecline: (n: string) => `Decision sent to ${n}`,
    empty: "No applicants for this post yet.",
    years: (y: number) => (y === 0 ? "<1 yr" : `${y} yr${y > 1 ? "s" : ""}`),
  },
  ja: {
    brand: "for Business",
    nav: { candidates: "候補者", jobs: "求人", reports: "レポート", settings: "設定" },
    hiringFor: "募集中",
    headcount: (n: number) => `募集 ${n}名`,
    kpi: { fresh: "24時間以内の新着", pending: "判定待ち", due: (h: number) => `${h}時間以内に期限`, approved: "面接設定済み" },
    remind: (n: number, h: number) => `${n}名の応募が${h}時間以内に自動終了します。良い人材を逃さないよう、今すぐ判定してください。`,
    reviewNow: "今すぐ確認",
    th: { cand: "候補者", match: "適合レベル", visa: "在留資格", skills: "スキル", jlpt: "日本語", start: "開始可能日", left: "残り時間", status: "状態" },
    status: { sent: "新着", viewed: "確認中", approved: "面接案内済み", rejected: "見送り", expired: "期限切れ・自動見送り" } as Record<DisplayStatus, string>,
    excluded: (n: number) => `${n}名を自動除外 — 在留資格がこの業務に該当しません`,
    excludedHint: "在留カードで事前に確認済み。手作業での確認は不要です。",
    sortedBy: "適合レベル順・在留資格確認済み",
    days: (d: number) => (d === 0 ? "即日" : `${d}日後`),
    back: "候補者一覧",
    breakdown: "スコア内訳",
    weight: "重み",
    why: "この順位の理由",
    docs: "確認済み書類",
    card: "在留カード",
    cardOk: "ICチップ照合済み",
    limit: "就労制限",
    none: "なし",
    myNumber: "マイナンバー",
    declared: "申告済み",
    bank: "給与口座",
    afterApprove: "採用後に登録",
    safety: "安全衛生教育（第59条）",
    safetyDone: "修了",
    safetyTodo: "初出勤前に受講が必要",
    decideWithin: "判定期限まで",
    autoClose: "期限までに判定がない場合、応募は自動終了し、本人には他の求人が表示されます。",
    approve: "面接に招待",
    decline: "見送る",
    startDate: "勤務開始日",
    confirmApprove: "面接案内を送信",
    reason: "理由（本人に丁寧な表現で伝わります）",
    confirmDecline: "判定を送信",
    decided: (s: string) => `判定送信済み・${s}`,
    expiredNote: "この応募は期限切れです。本人には通知し、他の求人を案内しました。",
    applied: "応募",
    commute: (km: number) => (km <= 1 ? "同じ市内" : `通勤 ${km}km`),
    nationality: { VN: "ベトナム", ID: "インドネシア", PH: "フィリピン" },
    you: "佐藤・人事",
    toastApprove: (n: string) => `${n}さんへの面接案内を保存しました`,
    toastDecline: (n: string) => `${n}さんに判定を送信しました`,
    empty: "この求人への応募はまだありません。",
    years: (y: number) => (y === 0 ? "1年未満" : `${y}年`),
  },
};

export const hrT = (l: Lang) => T[l];

const CRIT = {
  en: { skills: "Skills & certificates", start: "Start date", area: "Commute", jp: "Japanese" },
  ja: { skills: "スキル・資格", start: "開始日", area: "通勤", jp: "日本語" },
};
export const critLabel = (l: Lang, k: Criterion["key"]) => CRIT[l][k];

/** Localised per-criterion note for HR (scoring notes are written for the worker in Vietnamese). */
export function critNote(l: Lang, c: Criterion, p: Profile, job: Job, km: number) {
  const t = T[l];
  if (c.key === "skills") {
    const main = job.required[0];
    const yrs = p.skills[main];
    const miss = job.certs.filter((x) => !p.certs.includes(x));
    if (miss.length) return l === "en" ? `Missing ${miss.map((x) => CERTS[x].en).join(", ")}` : `${miss.map((x) => CERTS[x].ja).join("、")}なし`;
    if (yrs !== undefined) return `${SKILLS[main][l]} · ${t.years(yrs)}${p.certs.length ? ` · ${p.certs.map((x) => CERTS[x][l]).join(", ")}` : ""}`;
    const own = Object.keys(p.skills).map((s) => SKILLS[s as keyof typeof SKILLS][l]).join(", ");
    return l === "en" ? `No ${SKILLS[main].en} yet · has ${own}` : `${SKILLS[main].ja}経験なし・${own}`;
  }
  if (c.key === "start") return t.days(p.availableInDays) + (p.availableInDays > job.startWithinDays ? (l === "en" ? ` · you need within ${job.startWithinDays}d` : `・${job.startWithinDays}日以内希望`) : "");
  if (c.key === "area") return `${CITIES[p.city][l === "en" ? "vi" : "ja"]} · ${t.commute(km)}${job.dorm !== null && p.relocate ? (l === "en" ? " · OK with dorm" : "・寮希望可") : ""}`;
  return `${JLPT_SHORT[p.jlpt]} · ${l === "en" ? "required" : "必要"} ${JLPT_SHORT[job.jlptMin]}`;
}

export function fmtLeftShort(ms: number, l: Lang) {
  if (ms <= 0) return l === "en" ? "0m" : "0分";
  const h = Math.floor(ms / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  return l === "en" ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}時間${String(m).padStart(2, "0")}分`;
}
