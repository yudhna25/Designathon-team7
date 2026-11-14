import { CERTS, CITIES, JLPT_SHORT, RELATED, SKILLS, VISAS, distanceKm, type CertId, type Job, type Profile, type SkillId } from "./data";

export type Weights = { skills: number; start: number; area: number; jp: number };
export const DEFAULT_WEIGHTS: Weights = { skills: 40, start: 20, area: 20, jp: 20 };

export type CriterionKey = keyof Weights;
export type Criterion = { key: CriterionKey; score: number; weight: number; note: string };

export type Gate = { pass: true; note: string } | { pass: false; reason: string };

export type Match = {
  total: number; // 0..100, 0 when gate fails
  gate: Gate;
  criteria: Criterion[];
  km: number;
};

/** Lowercase for mid-sentence use, keeping acronyms (CNC, JIS). */
const lc = (s: string) => s.split(" ").map((w) => (/[A-Z]{2,}/.test(w) ? w : w.toLowerCase())).join(" ");

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function visaGate(p: Profile, job: Job, startDate = Date.now()): Gate {
  const v = VISAS[p.visa];
  if (v.block) return { pass: false, reason: v.block };
  if (v.weeklyHourCap) return { pass: false, reason: `Visa ${v.vi.toLowerCase()} chỉ được làm tối đa ${v.weeklyHourCap} giờ/tuần, việc này là toàn thời gian.` };
  if (v.fields !== "any" && !v.fields.includes(job.field))
    return { pass: false, reason: `Visa ngành "${v.vi.split("· ")[1]}" không cho làm việc ngành ${job.field === "food" ? "thực phẩm" : "sản xuất công nghiệp"}.` };
  const start = startDate + p.availableInDays * 864e5;
  if (new Date(p.cardExpiry).getTime() < start + 90 * 864e5)
    return { pass: false, reason: "Thẻ cư trú hết hạn trong vòng 3 tháng sau ngày bắt đầu. Cần gia hạn trước." };
  return { pass: true, note: v.fields === "any" ? "Không giới hạn ngành" : "Đúng ngành visa" };
}

function skillScore(p: Profile, job: Job) {
  const per = job.required.map((s) => {
    const own = p.skills[s];
    if (own !== undefined) return { s, v: clamp(72 + own * 6), via: s };
    let best = 0, via: SkillId | null = null;
    for (const [other, ratio] of Object.entries(RELATED[s] ?? {}) as [SkillId, number][]) {
      const y = p.skills[other];
      if (y !== undefined && clamp(72 + y * 6) * ratio > best) { best = clamp(72 + y * 6) * ratio; via = other; }
    }
    return { s, v: best, via };
  });
  let v = per.length ? per.reduce((a, b) => a + b.v, 0) / per.length : 70;
  v += job.nice.filter((s) => p.skills[s] !== undefined).length * 5;
  const missingCerts = job.certs.filter((c) => !p.certs.includes(c));
  if (missingCerts.length) v = Math.min(v, 40);
  v = clamp(Math.round(v));
  const main = per[0];
  let note: string;
  if (missingCerts.length) note = `Thiếu ${missingCerts.map((c) => CERTS[c].vi).join(", ")}`;
  else if (main && main.via === main.s) note = `${p.skills[main.s]} năm ${lc(SKILLS[main.s].vi)}`;
  else if (main && main.via) note = `Có ${lc(SKILLS[main.via].vi)}, gần với ${lc(SKILLS[main.s].vi)}`;
  else note = `Chưa có kinh nghiệm ${main ? lc(SKILLS[main.s].vi) : ""}`.trim();
  return { v, note };
}

function startScore(p: Profile, job: Job) {
  const a = p.availableInDays, w = job.startWithinDays;
  const v = a <= w ? 100 - (w ? (a / w) * 20 : 0) : Math.max(20, 80 - (a - w) * 1.5);
  return { v: Math.round(v), note: a === 0 ? "Bắt đầu được ngay" : `Bắt đầu sau ${a} ngày${a > w ? ` (nhà máy cần trong ${w} ngày)` : ""}` };
}

function areaScore(p: Profile, job: Job) {
  const km = distanceKm(p.city, job.city);
  let v = clamp(100 - Math.max(0, km - 4) * 2.2, 10);
  let note = km <= 1 ? `Cùng ${CITIES[job.city].vi}` : `Cách nơi ở ${km} km`;
  if (job.dorm !== null && p.relocate && v < 65) { v = 65; note += " · có ký túc xá"; }
  return { v: Math.round(v), note, km };
}

function jpScore(p: Profile, job: Job) {
  const d = p.jlpt - job.jlptMin;
  const v = d >= 0 ? clamp(60 + d * 20) : Math.max(0, 60 + d * 30);
  return { v, note: `${JLPT_SHORT[p.jlpt]} · cần ${JLPT_SHORT[job.jlptMin]}` };
}

export function scoreMatch(p: Profile, job: Job, w: Weights = DEFAULT_WEIGHTS, now = Date.now()): Match {
  const gate = visaGate(p, job, now);
  const s = skillScore(p, job), st = startScore(p, job), a = areaScore(p, job), j = jpScore(p, job);
  const criteria: Criterion[] = [
    { key: "skills", score: s.v, weight: w.skills, note: s.note },
    { key: "start", score: st.v, weight: w.start, note: st.note },
    { key: "area", score: a.v, weight: w.area, note: a.note },
    { key: "jp", score: j.v, weight: w.jp, note: j.note },
  ];
  const sumW = criteria.reduce((t, c) => t + c.weight, 0) || 1;
  const total = gate.pass ? Math.round(criteria.reduce((t, c) => t + c.score * c.weight, 0) / sumW) : 0;
  return { total, gate, criteria, km: a.km };
}

export type Suggestion = {
  id: string;
  label: string;
  detail: string;
  apply: (p: Profile) => Profile;
  gain: number;
};

/** What single profile change would lift this match the most? Used by the un-happy path. */
export function suggestImprovements(p: Profile, job: Job, w: Weights = DEFAULT_WEIGHTS): Suggestion[] {
  const base = scoreMatch(p, job, w).total;
  const out: Omit<Suggestion, "gain">[] = [];
  for (const s of job.required)
    if (p.skills[s] === undefined)
      out.push({ id: `skill-${s}`, label: `Thêm kinh nghiệm ${lc(SKILLS[s].vi)}`, detail: "2 năm trở lên, kể cả làm ở công ty cũ hay ở Việt Nam", apply: (q) => ({ ...q, skills: { ...q.skills, [s]: 2 } }) });
  for (const c of job.certs as CertId[])
    if (!p.certs.includes(c))
      out.push({ id: `cert-${c}`, label: `Thêm ${lc(CERTS[c].vi)}`, detail: `${CERTS[c].ja} · chụp ảnh chứng chỉ`, apply: (q) => ({ ...q, certs: [...q.certs, c] }) });
  for (const s of job.nice)
    if (p.skills[s] === undefined)
      out.push({ id: `nice-${s}`, label: `Thêm kỹ năng ${lc(SKILLS[s].vi)}`, detail: "Kỹ năng cộng điểm cho việc này", apply: (q) => ({ ...q, skills: { ...q.skills, [s]: 1 } }) });
  if (p.jlpt < 4)
    out.push({ id: "jlpt", label: `Cập nhật tiếng Nhật lên ${JLPT_SHORT[p.jlpt + 1]}`, detail: "Nếu bạn đã có chứng chỉ JLPT/JFT", apply: (q) => ({ ...q, jlpt: q.jlpt + 1 }) });
  if (p.availableInDays > job.startWithinDays || p.availableInDays > 14)
    out.push({ id: "start", label: "Bắt đầu sớm hơn (2 tuần)", detail: "Nếu công ty cũ đồng ý cho nghỉ sớm", apply: (q) => ({ ...q, availableInDays: Math.min(q.availableInDays, 14) }) });
  if (!p.relocate && job.dorm !== null)
    out.push({ id: "relocate", label: "Sẵn sàng ở ký túc xá", detail: `Ký túc xá ¥${job.dorm.toLocaleString("vi-VN")}/tháng`, apply: (q) => ({ ...q, relocate: true }) });
  // Required skill + its cert unlock together (e.g. forklift): bundle them so the gain is honest.
  if (job.certs.length && job.required.some((s) => p.skills[s] === undefined)) {
    const skills = job.required.filter((s) => p.skills[s] === undefined);
    const certs = (job.certs as CertId[]).filter((c) => !p.certs.includes(c));
    out.unshift({
      id: "bundle",
      label: `Có ${certs.map((c) => lc(CERTS[c].vi)).join(", ")} và đã ${skills.map((s) => lc(SKILLS[s].vi)).join(", ")}`,
      detail: "Thêm cả kinh nghiệm và chứng chỉ",
      apply: (q) => ({ ...q, certs: [...new Set([...q.certs, ...certs])], skills: { ...q.skills, ...Object.fromEntries(skills.map((s) => [s, 1])) } }),
    });
  }
  return out
    .map((s) => ({ ...s, gain: scoreMatch(s.apply(p), job, w).total - base }))
    .filter((s) => s.gain > 0)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 4);
}

export type Fit = "great" | "possible" | "not";
/** Fit level in words (workers never see raw %). great ≥ threshold, possible ≥ threshold − 20. */
export const fitOf = (m: Match, threshold: number): Fit =>
  !m.gate.pass ? "not" : m.total >= threshold ? "great" : m.total >= threshold - 20 ? "possible" : "not";
export const FIT_VI: Record<Fit, string> = { great: "Rất phù hợp", possible: "Có thể phù hợp", not: "Chưa phù hợp" };
export const FIT_EN: Record<Fit, string> = { great: "Great fit", possible: "Possible fit", not: "Not a fit yet" };
export const FIT_JA: Record<Fit, string> = { great: "高い適合", possible: "適合の可能性", not: "現時点で不適合" };
export const matchLabel = (n: number, threshold: number) => (n >= threshold ? FIT_VI.great : n >= threshold - 20 ? FIT_VI.possible : FIT_VI.not);

export type Chip = { ok: boolean; vi: string; en: string; ja: string };
/** ✓ / ✗ chips explaining a match at a glance. */
export function matchChips(p: Profile, job: Job, m: Match): Chip[] {
  const out: Chip[] = [];
  out.push(m.gate.pass
    ? { ok: true, vi: job.field === "food" ? "Visa thực phẩm" : "Visa sản xuất", en: "Visa OK", ja: "在留資格OK" }
    : { ok: false, vi: "Sai ngành visa", en: "Visa mismatch", ja: "在留資格不一致" });
  for (const s of job.required) {
    const y = p.skills[s];
    out.push(y !== undefined
      ? { ok: true, vi: `${y === 0 ? "<1" : y} năm ${SKILLS[s].vi}`, en: `${y} yr ${SKILLS[s].en}`, ja: `${SKILLS[s].ja} ${y}年` }
      : { ok: false, vi: SKILLS[s].vi, en: SKILLS[s].en, ja: SKILLS[s].ja });
  }
  for (const c of job.certs) {
    const ok = p.certs.includes(c);
    out.push({ ok, vi: CERTS[c].vi, en: CERTS[c].en, ja: CERTS[c].ja });
  }
  const jp = p.jlpt >= job.jlptMin;
  out.push({ ok: jp, vi: `Tiếng Nhật ${JLPT_SHORT[p.jlpt]}`, en: `JLPT ${JLPT_SHORT[p.jlpt]}`, ja: `日本語 ${JLPT_SHORT[p.jlpt]}` });
  const area = m.criteria.find((x) => x.key === "area")!;
  out.push(m.km <= 1
    ? { ok: true, vi: "Cùng thành phố", en: "Same city", ja: "同じ市内" }
    : { ok: area.score >= 60, vi: `Cách ${m.km} km`, en: `${m.km} km`, ja: `${m.km}km` });
  const st = p.availableInDays <= job.startWithinDays;
  out.push({ ok: st, vi: st ? "Kịp ngày bắt đầu" : "Bắt đầu trễ", en: st ? "Start date OK" : "Late start", ja: st ? "開始日OK" : "開始が遅い" });
  return out;
}

/** Explain unmet criteria separately from the weighted recommendation. */
export function matchGuidance(p: Profile, job: Job, m: Match): string {
  if (!m.gate.pass) return m.gate.reason;
  const unmet = matchChips(p, job, m).filter((c) => !c.ok);
  return unmet.length
    ? `Cần xem lại: ${unmet.map((c) => c.vi).join("; ")}. Bạn vẫn có thể ứng tuyển để HR xem xét.`
    : "Bạn đạt các tiêu chí đang hiển thị. Mức gợi ý còn xét kinh nghiệm, thời điểm và khoảng cách. Bạn vẫn có thể ứng tuyển.";
}
