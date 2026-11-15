// Anonymous senpai Q&A. The asker stays anonymous until they formally accept the offer.
import { PEERS, jobById, type Peer, type Profile } from "./data";
import { tNow, type WLang } from "./i18n";
import type { Application } from "./store";

export const SENPAI_QA = [
  {
    vi: "Tăng ca thật mỗi tháng bao nhiêu giờ?",
    en: "How many real overtime hours per month?",
    ja: "実際の残業は月何時間くらいですか？",
    ansVi: "Khoảng 15–25 giờ, tháng cao điểm có lúc 30. Tổ trưởng báo trước 1 ngày.",
    ansEn: "Around 15–25 hours, up to 30 during busy months. Line leaders give 1 day's notice.",
    ansJa: "月15〜25時間ほどで、繁忙期は30時間になることもあります。前日に班長から連絡があります。",
  },
  {
    vi: "Ký túc xá thế nào?",
    en: "How is the dormitory?",
    ja: "寮の様子はどうですか？",
    ansVi: "Phòng 1 người, có bếp chung. Hơi xa ga, đi xe đưa đón 15 phút.",
    ansEn: "Single private room with a shared kitchen. A bit far from the station — 15 min by shuttle bus.",
    ansJa: "個室で共用キッチン付きです。駅からは少し離れており、送迎バスで15分ほどです。",
  },
  {
    vi: "Sếp và người Nhật ở đó đối xử ra sao?",
    en: "How are the supervisors and Japanese coworkers?",
    ja: "上司や日本人スタッフの雰囲気はどうですか？",
    ansVi: "Tổ trưởng nghiêm nhưng dạy kỹ. Tuần đầu mệt vì phải nhớ quy tắc 5S.",
    ansEn: "Line leader is strict but teaches carefully. The first week is tiring with all the 5S rules.",
    ansJa: "班長は厳しいですが丁寧に教えてくれます。最初の1週間は5Sルールを覚えるのが大変です。",
  },
  {
    vi: "Lương có trả đúng như mô tả không?",
    en: "Is pay accurate to the job post?",
    ja: "給与は募集要項通りに支払われますか？",
    ansVi: "Đúng như bảng lương, trả ngày 25. Tháng đầu ít hơn vì chưa đủ ngày công.",
    ansEn: "Matches the payslip, paid on the 25th. First month is smaller because it's a partial pay period.",
    ansJa: "記載通りで毎月25日払いです。初月は日割りなので少なめになります。",
  },
] as const;

export const SENPAI_QUESTIONS = SENPAI_QA.map((x) => x.vi);
export const senpaiQuestions = (lang: WLang) => SENPAI_QA.map((x) => x[lang]);

export function answerFor(q: string): string {
  const item = SENPAI_QA.find((x) => x.vi === q || x.en === q || x.ja === q);
  if (item) return tNow(item.ansVi, item.ansJa, item.ansEn);
  return tNow(
    "Câu này anh chưa chắc, gặp nhau ngày đầu anh chỉ tận nơi nhé.",
    "その点はまだはっきり分かりませんが、初日に現場で案内しますね。",
    "Not 100% sure on that — I'll show you in person on your first day!",
  );
}

/** Best volunteer to ask: attendance-verified, never at the asker's current company, most experienced first. */
export function senpaiFor(p: Profile, jobId: string): Peer | null {
  if (p.currentCompany && jobById(jobId)?.company === p.currentCompany) return null;
  const pool = (PEERS[jobId]?.peers ?? []).filter((x) => x.askable && x.attendanceVerified);
  return [...pool].sort((a, b) => b.years - a.years)[0] ?? null;
}

/** What the senpai sees. Name only after the asker accepts the offer. */
export function askerLabel(p: Profile, revealed: boolean): string {
  return revealed ? p.name : tNow("Thợ ẩn danh", "匿名の応募者", "Anonymous worker");
}

export const isRevealed = (apps: Pick<Application, "jobId" | "candidateId" | "accepted">[], jobId: string) =>
  apps.some((a) => a.candidateId === "me" && a.jobId === jobId && a.accepted === true);

export type Thread = { id: string; jobId: string; peerId: string; questions: string[]; answers: string[]; at: number };
