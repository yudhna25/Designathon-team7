// Anonymous senpai Q&A. The asker stays anonymous until they formally accept the offer.
import { PEERS, jobById, type Peer, type Profile } from "./data";
import type { Application } from "./store";

export const SENPAI_QUESTIONS = [
  "Tăng ca thật mỗi tháng bao nhiêu giờ?",
  "Ký túc xá thế nào?",
  "Sếp và người Nhật ở đó đối xử ra sao?",
  "Lương có trả đúng như mô tả không?",
];

// Demo answers — mô phỏng. Honest, including the not-so-good parts.
const ANSWERS: Record<string, string> = {
  [SENPAI_QUESTIONS[0]]: "Khoảng 15–25 giờ, tháng cao điểm có lúc 30. Tổ trưởng báo trước 1 ngày.",
  [SENPAI_QUESTIONS[1]]: "Phòng 1 người, có bếp chung. Hơi xa ga, đi xe đưa đón 15 phút.",
  [SENPAI_QUESTIONS[2]]: "Tổ trưởng nghiêm nhưng dạy kỹ. Tuần đầu mệt vì phải nhớ quy tắc 5S.",
  [SENPAI_QUESTIONS[3]]: "Đúng như bảng lương, trả ngày 25. Tháng đầu ít hơn vì chưa đủ ngày công.",
};
export const answerFor = (q: string) => ANSWERS[q] ?? "Câu này anh chưa chắc, gặp nhau ngày đầu anh chỉ tận nơi nhé.";

/** Best volunteer to ask: attendance-verified, never at the asker's current company, most experienced first. */
export function senpaiFor(p: Profile, jobId: string): Peer | null {
  if (p.currentCompany && jobById(jobId)?.company === p.currentCompany) return null;
  const pool = (PEERS[jobId]?.peers ?? []).filter((x) => x.askable && x.attendanceVerified);
  return [...pool].sort((a, b) => b.years - a.years)[0] ?? null;
}

/** What the senpai sees. Name only after the asker accepts the offer. */
export function askerLabel(p: Profile, revealed: boolean): string {
  return revealed ? p.name : "Thợ ẩn danh";
}

export const isRevealed = (apps: Pick<Application, "jobId" | "candidateId" | "accepted">[], jobId: string) =>
  apps.some((a) => a.candidateId === "me" && a.jobId === jobId && a.accepted === true);

export type Thread = { id: string; jobId: string; peerId: string; questions: string[]; answers: string[]; at: number };
