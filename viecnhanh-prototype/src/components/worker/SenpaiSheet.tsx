"use client";
import { useEffect, useState } from "react";
import { jobById } from "@/lib/data";
import { SENPAI_QUESTIONS, askerLabel, hometownLabel, isRevealed, senpaiFor } from "@/lib/senpai";
import { useApp } from "@/lib/store";
import { SHOWCASE } from "@/lib/showcase";
import { Avatar, Button, Icon, Sheet } from "../ui";

/** Blind 3-question Q&A with an attendance-verified Vietnamese worker at that plant. */
export function SenpaiSheet({ jobId, open, onClose }: { jobId: string; open: boolean; onClose: () => void }) {
  const s = useApp();
  const p = s.profile!;
  const peer = senpaiFor(p, jobId);
  const job = jobById(jobId)!;
  const [picked, setPicked] = useState<string[]>([]);
  const [own, setOwn] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const thread = s.threads.find((t) => t.id === threadId) ?? s.threads.filter((t) => t.jobId === jobId).at(-1);
  const revealed = isRevealed(s.apps, jobId);
  const questions = [...picked, ...(own.trim() ? [own.trim()] : [])].slice(0, 3);

  useEffect(() => {
    if (!threadId) return;
    setAnswered(false);
    const t = setTimeout(() => setAnswered(true), 2000);
    return () => clearTimeout(t);
  }, [threadId]);

  const toggle = (q: string) => setPicked((x) => (x.includes(q) ? x.filter((y) => y !== q) : questions.length < 3 ? [...x, q] : x));
  const send = () => { if (peer) setThreadId(s.askSenpai(jobId, peer.id, questions)); };
  const showAnswers = thread && (thread.id !== threadId || answered);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Hỏi Senpai cùng quê"
      footer={
        peer && !thread ? (
          <Button size="lg" block icon="lock-01" disabled={questions.length === 0} onClick={send}>Gửi ẩn danh · {questions.length}/3 câu</Button>
        ) : (
          <Button size="lg" block variant="secondary" onClick={onClose}>Đóng</Button>
        )
      }
    >
      {!peer ? (
        <p className="text-muted">Hiện chưa có Senpai nào ở {job.company} sẵn sàng trả lời, hoặc Senpai đang làm cùng công ty hiện tại của bạn nên mình không ghép để giữ kín cho bạn.</p>
      ) : (
        <div className="grid gap-4">
          <div className="card-flat p-4 flex items-center gap-3">
            <Avatar name={peer.name} size={44} src={SHOWCASE.avatars[peer.id]} />
            <div className="min-w-0">
              <p className="font-semibold">{peer.name}</p>
              <p className="t-sm text-muted">{peer.years} năm ở {job.company} · {hometownLabel(p, peer)}</p>
              <p className="t-sm font-semibold text-brand flex items-center gap-1 mt-0.5"><Icon name="check-verified" size={14} solid />Đã xác minh chấm công</p>
            </div>
          </div>

          <p className="t-sm flex items-center gap-2 well px-3 py-2">
            <Icon name="lock-01" size={16} />Bạn hiện là: <b>{askerLabel(p, revealed, peer.province === p.province)}</b>
          </p>

          {!thread ? (
            <>
              <fieldset>
                <legend className="font-semibold mb-2">Chọn tối đa 3 câu hỏi</legend>
                <div className="flex flex-wrap gap-2">
                  {SENPAI_QUESTIONS.map((q) => {
                    const on = picked.includes(q);
                    return (
                      <button key={q} className="chip pressable !h-auto py-2 text-left" aria-pressed={on} disabled={!on && questions.length >= 3} onClick={() => toggle(q)}>{q}</button>
                    );
                  })}
                </div>
              </fieldset>
              <label className="grid gap-1.5">
                <span className="t-sm font-semibold">Hoặc tự viết</span>
                <input className="input" maxLength={120} value={own} onChange={(e) => setOwn(e.target.value)} placeholder="Ví dụ: Có chỗ để xe đạp không?" disabled={!own && picked.length >= 3} />
              </label>
            </>
          ) : (
            <ol className="grid gap-3" aria-live="polite">
              {thread.questions.map((q, i) => (
                <li key={i} className="grid gap-1.5">
                  <p className="justify-self-end max-w-[85%] rounded-2xl rounded-br-md bg-[#1B22A7] text-white px-3 py-2 t-sm">{q}</p>
                  {showAnswers ? (
                    <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-subtle px-3 py-2 t-sm"><b>{peer.name.split(" ").pop()}:</b> {thread.answers[i]}</p>
                  ) : (
                    <p className="t-sm text-muted">{peer.name.split(" ").pop()} đang trả lời…</p>
                  )}
                </li>
              ))}
            </ol>
          )}

          <p className="t-sm text-muted">Senpai được thưởng giới thiệu khi bạn nhận việc. Câu trả lời là ý kiến cá nhân. Tên của bạn chỉ mở cho Senpai khi bạn bấm <b>Nhận việc</b>. Công ty hiện tại của bạn không bao giờ được hiện.</p>
        </div>
      )}
    </Sheet>
  );
}
