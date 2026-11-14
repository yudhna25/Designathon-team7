// Self-check for the matching rules. Run: npx tsx scripts/check-scoring.ts
import assert from "node:assert/strict";
import { DEMO_PROFILE, JOBS, jobById } from "../src/lib/data";
import { matchChips, matchGuidance, scoreMatch, suggestImprovements } from "../src/lib/scoring";
import { takeHome, yen } from "../src/lib/pay";
import { hrT } from "../src/lib/hr-i18n";

const p = DEMO_PROFILE;
for (const j of JOBS) {
  const m = scoreMatch(p, j);
  console.log(j.id.padEnd(16), String(m.total).padStart(3), m.gate.pass ? "" : "GATE", m.criteria.map((c) => `${c.key}:${c.score}`).join(" "));
}
const key = scoreMatch(p, jobById("mikawa-cnc")!);
assert.ok(key.total >= 75 && key.total <= 90, "persona should match the key client well");
assert.equal(scoreMatch(p, jobById("nagoya-food")!).gate.pass, false, "food line must fail the SSW mfg visa gate");
assert.equal(scoreMatch({ ...p, visa: "intern" }, jobById("mikawa-cnc")!).total, 0, "interns cannot switch jobs");
assert.equal(scoreMatch({ ...p, visa: "student" }, jobById("mikawa-cnc")!).gate.pass, false, "students capped at 28h/week");
assert.equal(scoreMatch({ ...p, cardExpiry: "2026-12-01" }, jobById("mikawa-cnc")!, undefined, Date.parse("2026-11-14")).gate.pass, false, "expiring card fails");

const fork = jobById("anjo-forklift")!;
const before = scoreMatch(p, fork).total;
const sug = suggestImprovements(p, fork);
assert.ok(sug.length > 0 && sug[0].gain > 0, "forklift job should have an improvement");
assert.equal(scoreMatch(sug[0].apply(p), fork).total, before + sug[0].gain, "gain must equal the real rescore delta");
assert.equal(scoreMatch(p, jobById("mikawa-cnc")!, { skills: 0, start: 0, area: 0, jp: 0 }).total, 0, "zero weights do not divide by zero");

const pay = takeHome(jobById("mikawa-cnc")!, p.relocate);
assert.ok(pay.net > 150000 && pay.net < pay.gross, "take-home is plausible");
assert.equal(pay.gross - pay.deductions.reduce((a, d) => a + d.amount, 0), pay.net, "net = gross - deductions");
const commuterPay = takeHome(jobById("mikawa-cnc")!, false);
assert.equal(commuterPay.net - pay.net, 30000, "housing preference must account for both dorm and utilities");
assert.equal(commuterPay.deductions.some((d) => d.key === "dorm" || d.key === "util"), false, "commuters do not pay dorm costs in the estimate");
assert.match(commuterPay.housingNote, /Chưa trừ/, "the housing assumption stays visible with the amount");
assert.equal(yen(pay.net), "¥221.526", "worker yen amounts use Vietnamese grouping consistently");

const nc = jobById("okazaki-nc")!;
const junior = { ...p, skills: { cnc_lathe: 1 }, availableInDays: 30 };
const partial = scoreMatch(junior, nc);
assert.equal(partial.total, 77, "regression fixture has partial fit despite meeting the visible criteria");
assert.ok(matchChips(junior, nc, partial).every((c) => c.ok), "N4 meets this job's requirement");
assert.doesNotMatch(matchGuidance(junior, nc, partial), /thiếu|n4/i, "do not turn the lowest weighted score into a missing N4 requirement");
assert.match(matchGuidance(p, fork, scoreMatch(p, fork)), /Chứng chỉ xe nâng/, "genuinely missing certificates stay actionable");
const blocked = { ...p, visa: "intern" as const };
const blockedMatch = scoreMatch(blocked, nc);
assert.equal(matchGuidance(blocked, nc, blockedMatch), !blockedMatch.gate.pass ? blockedMatch.gate.reason : "", "visa failure keeps the concrete gate reason");
assert.match(hrT("ja").toastApprove("Tuấn Anh"), /面接案内/, "Japanese approval feedback means interview invitation");
assert.doesNotMatch(hrT("ja").toastApprove("Tuấn Anh"), /採用/, "an interview invitation must not announce hiring");
console.log("take-home mikawa:", pay);
console.log("OK");
