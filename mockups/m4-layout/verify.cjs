// Run from any folder: node mockups/m4-layout/verify.cjs
// This checks the static artifacts and source data; it does not replace a browser layout check.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const files = [
  'w01-home-mobile.html', 'w01-home-desktop.html',
  'w02-job-mobile.html', 'w02-job-desktop.html',
  'w03-applications-mobile.html', 'h01-hr-desktop.html', 'index.html',
];
const pages = Object.fromEntries(files.map(file => [file, fs.readFileSync(path.join(__dirname, file), 'utf8')]));
for (const [file, html] of Object.entries(pages)) {
  assert(html.startsWith('<!doctype html>'), file);
  assert(html.includes('<meta charset="utf-8">'), file);
  assert(html.includes('<style>') && !/<script[^>]+src=/.test(html), file);
  assert(!html.includes('\uFFFD') && !html.includes('undefined'), file);
  assert.equal((html.match(/<main\b/g) || []).length, 1, file);
  const sizes = [...html.matchAll(/\bfont-size\s*:\s*(\d+(?:\.\d+)?)px\b/g), ...html.matchAll(/\bfont\s*:\s*[^;{}]*?\b(\d+(?:\.\d+)?)px(?=[/\s;])/g)];
  for (const declaration of sizes) assert(Number(declaration[1]) >= 12, `${file}: text below 12px`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate ids`);
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1], { filename: file });
  for (const link of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    if (/^https?:/.test(link[1])) continue;
    assert(fs.existsSync(path.join(__dirname, link[1].split('#')[0])), `${file}: missing ${link[1]}`);
  }
}
assert.equal((pages['index.html'].match(/<iframe /g) || []).length, 6);
for (const file of files.filter(f => f.startsWith('w01'))) {
  assert(pages[file].includes('class="pass"'));
  assert(pages[file].includes('Hỏi Senpai cùng quê · ẩn danh'));
  assert(pages[file].includes('41–64 ngày'));
  assert(pages[file].includes('Chưa trừ chi phí chỗ ở'));
  assert.equal((pages[file].match(/data-job-filter=/g) || []).length, 6);
}
for (const file of files.filter(f => f.startsWith('w02'))) {
  assert(pages[file].includes('Hạn nộp: chưa được nhà máy cung cấp'));
  for (const id of ['details', 'pay', 'company', 'peers', 'legal']) assert(pages[file].includes(`id="${id}"`));
}
assert(pages['w02-job-mobile.html'].includes('class="sticky-apply"'));
assert.equal((pages['w03-applications-mobile.html'].match(/data-app-group=/g) || []).length, 3);
assert.equal((pages['w03-applications-mobile.html'].match(/class="card app-card"/g) || []).length, 4);

const prototype = path.resolve(__dirname, '../../viecnhanh-prototype');
const ts = require(path.join(prototype, 'node_modules/typescript'));
const cache = new Map();
function source(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'exports', 'module', code)(name => source(path.resolve(path.dirname(file), name + '.ts')), module.exports, module);
  return module.exports;
}
const data = source(path.join(prototype, 'src/lib/data.ts'));
const { takeHome, yen } = source(path.join(prototype, 'src/lib/pay.ts'));
const { earliestStart, fmtDate } = source(path.join(prototype, 'src/lib/start.ts'));
const { scoreMatch, fitOf } = source(path.join(prototype, 'src/lib/scoring.ts'));
const now = Date.parse('2026-11-15T09:00:00+09:00');
assert.equal(takeHome(data.JOBS[0], true).net, 221526);
assert.equal(fmtDate(earliestStart(data.DEMO_PROFILE, now + 864e5).date), '07/01/2027');
for (const job of data.JOBS.filter(j => j.field === 'mfg')) {
  for (const file of ['w01-home-mobile.html', 'w01-home-desktop.html']) {
    assert(pages[file].includes(job.company), job.company);
    assert(pages[file].includes(yen(takeHome(job, true).net)), job.company);
  }
}
const hr = pages['h01-hr-desktop.html'];
assert(hr.includes('<html lang="en">'));
assert(hr.includes('aria-valuenow="162"') && hr.includes('54% of target'));
assert(!hr.includes('class="led"') && !hr.includes('class="progress-count led"'));
const rows = [...hr.matchAll(/<tr data-candidate-row[\s\S]*?<\/tr>/g)].map(m => m[0]);
assert.equal(rows.length, 8);
let selectable = 0;
for (const candidate of data.SEED_CANDIDATES) {
  const match = scoreMatch(candidate.profile, data.JOBS[0], undefined, now);
  const row = rows.find(r => r.includes(`data-name="${candidate.profile.name}"`));
  assert.equal(Boolean(row), match.gate.pass, candidate.profile.name);
  if (!row) continue;
  assert(row.includes(`<td>${data.JLPT_SHORT[candidate.profile.jlpt]}</td>`), `${candidate.profile.name}: JLPT`);
  const expected = ['sent', 'viewed'].includes(candidate.status) && candidate.hoursAgo < 24 && fitOf(match, 80) === 'great';
  const input = row.match(/<input[^>]*data-pick[^>]*>/)[0];
  assert.equal(!/\bdisabled\b/.test(input), expected, `${candidate.profile.name}: batch gate`);
  if (expected) selectable++;
}
assert.equal(selectable, 5);

function luminance(hex) {
  return hex.match(/[a-f\d]{2}/gi).map(x => parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4)
    .reduce((sum, x, i) => sum + x * [.2126, .7152, .0722][i], 0);
}
for (const [fg, bg] of [['FFFFFF','1B22A7'], ['FFFFFF','2B33C9'], ['DCE3FC','2B33C9'], ['5B5B5B','FAFAFA'], ['5B5B5B','FFFFFF'], ['1B22A7','F1F4FC'], ['0D0D0D','EDEDED']]) {
  const values = [luminance(fg), luminance(bg)].sort((a,b) => b-a);
  assert((values[0] + .05) / (values[1] + .05) >= 4.5, `${fg} on ${bg}: contrast`);
}
console.log('PASS: 7 self-contained HTML files; text sizes >=12px; inline JS syntax; local files; source pay/start/JLPT; 8 HR rows; 5 batch-eligible candidates; 7 AA color pairs. Browser rendering not checked.');
