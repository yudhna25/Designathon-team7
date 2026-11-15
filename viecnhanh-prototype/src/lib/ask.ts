// AI Q&A assistant (demo): answers from the job data in the app, citing jobs by number.
// Keyword routing, not an LLM — enough to show the interaction in the prototype.
import { CITIES, JOBS, PEERS, type Profile } from "./data";
import { getLang, jobTitle, tNow, type WLang } from "./i18n";
import { takeHome, yen } from "./pay";
import { senpaiFor } from "./senpai";
import { earliestStart, fmtDate } from "./start";
import { visaGate } from "./scoring";

export type Answer = { q: string; a: string; cites: string[]; follow: string[] };

const SUGGESTED_BY_LANG: Record<WLang, string[]> = {
  vi: [
    "Việc nào lương thực nhận trên ¥200k?",
    "Đổi công ty mất bao lâu mới đi làm được?",
    "Có người Việt nào làm ở Mikawa không?",
    "Việc nào có ký túc xá?",
  ],
  en: [
    "Which jobs pay over ¥200k take-home?",
    "How long does changing companies take?",
    "Are there Vietnamese workers at Mikawa?",
    "Which jobs include a dorm?",
  ],
  ja: [
    "手取り¥20万以上の求人は？",
    "転職から入社までどのくらいかかりますか？",
    "三河精密にベトナム人はいますか？",
    "寮付きの求人はどれですか？",
  ],
};

export const SUGGESTED = SUGGESTED_BY_LANG.vi;
export const suggestedQuestions = (lang: WLang) => SUGGESTED_BY_LANG[lang];

// Same rule as the job list: never point a worker at a job their residence status forbids.
const legal = (p: Profile) => JOBS.filter((j) => visaGate(p, j).pass);
const has = (q: string, ...words: string[]) => words.some((w) => q.toLowerCase().includes(w));

export function answer(q: string, p: Profile, now = Date.now()): Answer {
  const lang = getLang();
  const sug = SUGGESTED_BY_LANG[lang];
  if (has(q, "ứng lương", "trong lúc chờ", "advance", "earned wage", "pay advance", "前払い")) {
    return {
      q,
      a: tNow(
        "Được. Ứng lương tính theo ngày công đã làm và đã được nhà máy xác nhận, không phải khoản vay, không lãi. Trong lúc chờ thủ tục đổi công ty, bạn vẫn ứng được ở chỗ làm hiện tại nếu chỗ đó dùng KINTRA.",
        "可能です。稼働済みの確認された勤務日分のみ前払いでき、ローンや利息はありません。転職手続き中も現在の職場がKINTRAを導入していれば利用できます。",
        "Yes. Wage advances are calculated on verified shifts you've already worked — zero interest and not a loan. While waiting on your transfer, you can still withdraw from your current workplace if it uses KINTRA.",
      ),
      cites: [],
      follow: [sug[0]],
    };
  }
  if (has(q, "lương", "200k", "thực nhận", "tiền", "pay", "salary", "take-home", "¥200", "手取り", "給与", "20万")) {
    const rows = legal(p).map((j) => ({ j, net: takeHome(j, p.relocate).net })).filter((r) => r.net > 200000).sort((a, b) => b.net - a.net);
    return {
      q,
      a: rows.length
        ? tNow(
            `Có ${rows.length} việc thực nhận trên ¥200k mỗi tháng: ${rows.map((r, i) => `${r.j.title} ở ${r.j.company} ${yen(r.net)} [${i + 1}]`).join("; ")}. Đây là ước tính sau khấu trừ.`,
            `手取り月¥20万以上の求人は${rows.length}件あります：${rows.map((r, i) => `${r.j.company}の${jobTitle(r.j, "ja")} ${yen(r.net)} [${i + 1}]`).join("；")}（控除後の目安）。`,
            `${rows.length} job${rows.length > 1 ? "s" : ""} pay over ¥200k take-home/month: ${rows.map((r, i) => `${jobTitle(r.j, "en")} at ${r.j.company} ${yen(r.net)} [${i + 1}]`).join("; ")}. These are post-deduction estimates.`,
          )
        : tNow(
            "Hiện chưa có việc nào thực nhận trên ¥200k với hồ sơ của bạn.",
            "現在のプロフィールでは手取り¥20万以上の求人がまだありません。",
            "No eligible jobs currently exceed ¥200k monthly take-home for your profile.",
          ),
      cites: rows.map((r) => r.j.id),
      follow: [sug[3], sug[1]],
    };
  }
  if (has(q, "bao lâu", "đổi công ty", "khi nào", "bắt đầu", "how long", "start", "chang", "どのくらい", "開始", "転職")) {
    const s = earliestStart(p, now + 864e5);
    return {
      q,
      a: tNow(
        `Nếu HR duyệt trong 24 giờ, bạn có thể bắt đầu sớm nhất ngày ${fmtDate(s.date)} (dự kiến). ${s.reason}`,
        `HRが24時間以内に承認した場合、最短で${fmtDate(s.date)}（予定）に入社できます。${s.reason}`,
        `If HR approves within 24 hours, your earliest estimated start date is ${fmtDate(s.date)}. ${s.reason}`,
      ),
      cites: [],
      follow: [
        tNow("Trong lúc chờ có ứng lương được không?", "待機中に給与の前払いはできますか？", "Can I use wage advances while waiting?"),
        sug[0],
      ],
    };
  }
  if (has(q, "người việt", "senpai", "mikawa", "vietnamese", "coworker", "ベトナム", "先輩", "三河")) {
    const id = "mikawa-cnc";
    const peer = senpaiFor(p, id);
    return {
      q,
      a: tNow(
        `Ở Mikawa Precision có ${PEERS[id].count} người Việt đang làm [1].${peer ? ` Anh ${peer.name} sẵn sàng trả lời ẩn danh 3 câu hỏi của bạn.` : ""}`,
        `三河精密工業（Mikawa Precision）では${PEERS[id].count}名のベトナム人が働いています [1]。${peer ? `${peer.name}さんが匿名で3つの質問に回答可能です。` : ""}`,
        `${PEERS[id].count} Vietnamese workers work at Mikawa Precision [1].${peer ? ` ${peer.name} is verified to answer up to 3 anonymous questions.` : ""}`,
      ),
      cites: [id],
      follow: [sug[3], sug[1]],
    };
  }
  if (has(q, "ký túc", "chỗ ở", "nhà", "dorm", "housing", "寮")) {
    const rows = legal(p).filter((j) => j.dorm !== null);
    return {
      q,
      a: tNow(
        `${rows.length} việc có ký túc xá: ${rows.map((j, i) => `${j.company} ở ${CITIES[j.city].vi}, ${yen(j.dorm!)}/tháng [${i + 1}]`).join("; ")}.`,
        `寮付きの求人は${rows.length}件あります：${rows.map((j, i) => `${j.company}（${CITIES[j.city].ja}）、月${yen(j.dorm!)} [${i + 1}]`).join("；")}。`,
        `${rows.length} job${rows.length > 1 ? "s" : ""} include a dorm: ${rows.map((j, i) => `${j.company} in ${CITIES[j.city].vi}, ${yen(j.dorm!)}/mo [${i + 1}]`).join("; ")}.`,
      ),
      cites: rows.map((j) => j.id),
      follow: [sug[0]],
    };
  }
  return {
    q,
    a: tNow(
      "Mình chưa chắc câu này. Bạn hỏi cụ thể hơn, ví dụ về lương, ký túc xá, ngày bắt đầu hoặc người Việt ở nhà máy nhé.",
      "この質問にはまだお答えできません。給与、寮、開始日、職場のベトナム人などについて具体的に聞いてみてください。",
      "I'm not sure about that one yet. Try asking specifically about take-home pay, dorms, start dates, or Vietnamese coworkers.",
    ),
    cites: [],
    follow: sug.slice(0, 3),
  };
}
