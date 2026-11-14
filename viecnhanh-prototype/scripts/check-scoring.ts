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

// --- M4: earliest start, legal path, 3-month trial, peers, 300-hire plan ---
import { earliestStart, fmtDate, legalPath } from "../src/lib/start";
import { PEERS, HIRE_PLAN } from "../src/lib/data";
const hrDay = Date.parse("2026-11-16T09:00:00+09:00");
assert.equal(fmtDate(earliestStart(p, hrDay).date), "07/01/2027", "SSW job change = HR day + 7 + 45");
assert.equal(earliestStart(p, hrDay).statusChange, true);
const res = { ...p, visa: "resident" as const, availableInDays: 14 };
assert.equal(fmtDate(earliestStart(res, hrDay).date), "30/11/2026", "residents need no status change");
assert.equal(fmtDate(earliestStart({ ...p, availableInDays: 60 }, hrDay).date), "15/01/2027", "later of review and own availability");
assert.match(earliestStart(p, hrDay).reason, /chuyển đổi tư cách lưu trú/);
assert.equal(jobById("mikawa-cnc")!.headcount, 300);
assert.equal(jobById("mikawa-cnc")!.contractMonths, 3);
assert.ok(JOBS.every((j) => typeof j.verified === "boolean"));
assert.ok(PEERS["mikawa-cnc"].peers.some((x) => x.askable), "key job has a volunteer to ask");
const path = legalPath(p, hrDay);
assert.deepEqual(path.map((x) => x.key), ["approve", "docs", "file", "review", "card", "day1"]);
assert.equal(fmtDate(path.at(-1)!.at), fmtDate(earliestStart(p, hrDay).date), "flight-path ends on the start date");
assert.deepEqual(legalPath(res, hrDay).map((x) => x.key), ["approve", "day1"]);
assert.ok(!path.some((x) => /đảm bảo|guarantee/i.test(x.label + x.note)), "never promise a date");
assert.ok(PEERS["mikawa-cnc"].peers.every((x) => x.attendanceVerified || !x.askable), "only attendance-verified peers are askable");
assert.equal(HIRE_PLAN.jobId, "mikawa-cnc"); assert.equal(HIRE_PLAN.target, 300); assert.equal(HIRE_PLAN.filledByDay.length, HIRE_PLAN.days);
console.log("M4 data checks OK");

// --- M4: anonymous senpai (hometown matching removed) ---
import { askerLabel, senpaiFor, isRevealed } from "../src/lib/senpai";
assert.equal(senpaiFor(p, "mikawa-cnc")!.years, Math.max(...PEERS["mikawa-cnc"].peers.filter((x) => x.askable && x.attendanceVerified).map((x) => x.years)), "most experienced first");
assert.equal(senpaiFor({ ...p, currentCompany: jobById("mikawa-cnc")!.company }, "mikawa-cnc"), null, "never match a senpai at the asker's current company");
assert.equal(askerLabel(p, false), "Thợ ẩn danh");
assert.ok(!askerLabel(p, false).includes(p.name) && !askerLabel(p, false).includes(p.currentCompany!), "no identity leaks before accept");
const offer = { id: "x", jobId: "mikawa-cnc", candidateId: "me", appliedAt: 0, status: "approved" as const };
assert.equal(isRevealed([offer], "mikawa-cnc"), false, "approval alone does not reveal");
assert.equal(isRevealed([{ ...offer, accepted: true }], "mikawa-cnc"), true);
console.log("M4 senpai checks OK");

// --- M4: HR 300-hire plan, batch approve ---
import { batchEligible, hireProgress, needsBatch } from "../src/lib/hire";
const rows = [
  { appId: "a", gatePass: true, fit: "great" as const, status: "sent" as const },
  { appId: "b", gatePass: false, fit: "great" as const, status: "sent" as const },
  { appId: "c", gatePass: true, fit: "possible" as const, status: "viewed" as const },
  { appId: "d", gatePass: true, fit: "great" as const, status: "approved" as const },
  { appId: "e", gatePass: true, fit: "great" as const, status: "expired" as const },
];
assert.deepEqual(batchEligible(rows), ["a"], "batch never approves gate-failed, weaker or decided candidates");
assert.equal(hireProgress(HIRE_PLAN, 2).filled, 160);
assert.equal(hireProgress(HIRE_PLAN, 2).pct, 53);
assert.equal(needsBatch(300, 20), true); assert.equal(needsBatch(10, 20), false);
console.log("M4 HR checks OK");

// --- M4: AI Q&A assistant ---
import { answer } from "../src/lib/ask";
assert.ok(answer("đổi công ty mất bao lâu", p).a.includes("dự kiến"), "start-date answers stay estimates");
assert.equal(answer("xyz", p).cites.length, 0, "unknown questions cite nothing");
assert.ok(answer("Có người Việt nào làm ở Mikawa không?", p).cites.includes("mikawa-cnc"));
assert.ok(answer("Việc nào lương thực nhận trên ¥200k?", p).cites.every((id) => takeHome(jobById(id)!, p.relocate).net > 200000), "pay answer cites only jobs above 200k");
assert.match(answer("Trong lúc chờ có ứng lương được không?", p).a, /ngày công/, "wage-advance follow-up is not routed to the pay answer");
assert.ok(answer("Việc nào lương thực nhận trên ¥200k?", p).cites.every((id) => scoreMatch(p, jobById(id)!).gate.pass), "assistant never suggests jobs the visa forbids");
assert.ok(answer("Việc nào có ký túc xá?", p).cites.every((id) => scoreMatch(p, jobById(id)!).gate.pass), "dorm answer respects the visa gate too");
assert.match(answer("đổi công ty mất bao lâu", p, hrDay - 864e5).a, /07\/01\/2027/, "assistant uses the simulated clock it is given");
console.log("M4 ask checks OK");
