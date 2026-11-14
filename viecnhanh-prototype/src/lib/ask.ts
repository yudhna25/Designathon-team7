// AI Q&A assistant (demo): answers from the job data in the app, citing jobs by number.
// Keyword routing, not an LLM — enough to show the interaction in the prototype.
import { CITIES, JOBS, PEERS, type Profile } from "./data";
import { takeHome, yen } from "./pay";
import { senpaiFor } from "./senpai";
import { earliestStart, fmtDate } from "./start";
import { visaGate } from "./scoring";

export type Answer = { q: string; a: string; cites: string[]; follow: string[] };

export const SUGGESTED = [
  "Việc nào lương thực nhận trên ¥200k?",
  "Đổi công ty mất bao lâu mới đi làm được?",
  "Có người Việt nào làm ở Mikawa không?",
  "Việc nào có ký túc xá?",
];

// Same rule as the job list: never point a worker at a job their residence status forbids.
const legal = (p: Profile) => JOBS.filter((j) => visaGate(p, j).pass);
const has = (q: string, ...words: string[]) => words.some((w) => q.toLowerCase().includes(w));

export function answer(q: string, p: Profile, now = Date.now()): Answer {
  if (has(q, "ứng lương", "trong lúc chờ")) {
    return {
      q,
      a: "Được. Ứng lương tính theo ngày công đã làm và đã được nhà máy xác nhận, không phải khoản vay, không lãi. Trong lúc chờ thủ tục đổi công ty, bạn vẫn ứng được ở chỗ làm hiện tại nếu chỗ đó dùng KINTRA.",
      cites: [],
      follow: ["Việc nào lương thực nhận trên ¥200k?"],
    };
  }
  if (has(q, "lương", "200k", "thực nhận", "tiền")) {
    const rows = legal(p).map((j) => ({ j, net: takeHome(j, p.relocate).net })).filter((r) => r.net > 200000).sort((a, b) => b.net - a.net);
    return {
      q,
      a: rows.length ? `Có ${rows.length} việc thực nhận trên ¥200k mỗi tháng: ${rows.map((r, i) => `${r.j.title} ở ${r.j.company} ${yen(r.net)} [${i + 1}]`).join("; ")}. Đây là ước tính sau khấu trừ.` : "Hiện chưa có việc nào thực nhận trên ¥200k với hồ sơ của bạn.",
      cites: rows.map((r) => r.j.id),
      follow: ["Việc nào có ký túc xá?", "Đổi công ty mất bao lâu mới đi làm được?"],
    };
  }
  if (has(q, "bao lâu", "đổi công ty", "khi nào", "bắt đầu")) {
    const s = earliestStart(p, now + 864e5);
    return {
      q,
      a: `Nếu HR duyệt trong 24 giờ, bạn có thể bắt đầu sớm nhất ngày ${fmtDate(s.date)} (dự kiến). ${s.reason}`,
      cites: [],
      follow: ["Trong lúc chờ có ứng lương được không?", "Việc nào lương thực nhận trên ¥200k?"],
    };
  }
  if (has(q, "người việt", "senpai", "mikawa")) {
    const id = "mikawa-cnc";
    const peer = senpaiFor(p, id);
    return {
      q,
      a: `Ở Mikawa Precision có ${PEERS[id].count} người Việt đang làm [1].${peer ? ` Anh ${peer.name} (quê ${peer.province}) sẵn sàng trả lời ẩn danh 3 câu hỏi của bạn.` : ""}`,
      cites: [id],
      follow: ["Việc nào có ký túc xá?", "Đổi công ty mất bao lâu mới đi làm được?"],
    };
  }
  if (has(q, "ký túc", "chỗ ở", "nhà")) {
    const rows = legal(p).filter((j) => j.dorm !== null);
    return {
      q,
      a: `${rows.length} việc có ký túc xá: ${rows.map((j, i) => `${j.company} ở ${CITIES[j.city].vi}, ${yen(j.dorm!)}/tháng [${i + 1}]`).join("; ")}.`,
      cites: rows.map((j) => j.id),
      follow: ["Việc nào lương thực nhận trên ¥200k?"],
    };
  }
  return { q, a: "Mình chưa chắc câu này. Bạn hỏi cụ thể hơn, ví dụ về lương, ký túc xá, ngày bắt đầu hoặc người Việt ở nhà máy nhé.", cites: [], follow: SUGGESTED.slice(0, 3) };
}
