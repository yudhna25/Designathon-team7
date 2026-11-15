"use client";
import { useEffect, useState } from "react";
import { jobById } from "@/lib/data";
import { useLang, useT } from "@/lib/i18n";
import { askerLabel, isRevealed, senpaiFor, senpaiQuestions } from "@/lib/senpai";
import { useApp } from "@/lib/store";
import { SHOWCASE } from "@/lib/showcase";
import { Avatar, Button, Icon, Sheet } from "../ui";

/** Blind 3-question Q&A with an attendance-verified Vietnamese worker at that plant. */
export function SenpaiSheet({ jobId, open, onClose }: { jobId: string; open: boolean; onClose: () => void }) {
  const lang = useLang();
  const t = useT();
  const s = useApp();
  const p = s.profile!;
  const peer = senpaiFor(p, jobId);
  const job = jobById(jobId)!;
  const [picked, setPicked] = useState<string[]>([]);
  const [own, setOwn] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const thread = s.threads.find((th) => th.id === threadId) ?? s.threads.filter((th) => th.jobId === jobId).at(-1);
  const revealed = isRevealed(s.apps, jobId);
  const questions = [...picked, ...(own.trim() ? [own.trim()] : [])].slice(0, 3);
  const presetQs = senpaiQuestions(lang);

  useEffect(() => {
    if (!threadId) return;
    setAnswered(false);
    const tmr = setTimeout(() => setAnswered(true), 2000);
    return () => clearTimeout(tmr);
  }, [threadId]);

  const toggle = (q: string) => setPicked((x) => (x.includes(q) ? x.filter((y) => y !== q) : questions.length < 3 ? [...x, q] : x));
  const send = () => { if (peer) setThreadId(s.askSenpai(jobId, peer.id, questions)); };
  const showAnswers = thread && (thread.id !== threadId || answered);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("Hỏi Senpai", "先輩に質問", "Ask a Senpai")}
      footer={
        peer && !thread ? (
          <Button size="lg" block icon="lock-01" disabled={questions.length === 0} onClick={send}>
            {t(`Gửi ẩn danh · ${questions.length}/3 câu`, `匿名で送信 · ${questions.length}/3問`, `Send anonymously · ${questions.length}/3`)}
          </Button>
        ) : (
          <Button size="lg" block variant="secondary" onClick={onClose}>{t("Đóng", "閉じる", "Close")}</Button>
        )
      }
    >
      {!peer ? (
        <p className="text-muted">
          {t(
            `Hiện chưa có Senpai nào ở ${job.company} sẵn sàng trả lời, hoặc Senpai đang làm cùng công ty hiện tại của bạn nên mình không ghép để giữ kín cho bạn.`,
            `現在${job.company}で回答可能な先輩がいないか、同じ現職企業のためプライバシー保護上マッチングしていません。`,
            `No Senpai at ${job.company} is available right now, or they're at your current company so we kept you unlinked for privacy.`,
          )}
        </p>
      ) : (
        <div className="grid gap-4">
          <div className="card-flat p-4 flex items-center gap-3">
            <Avatar name={peer.name} size={44} src={SHOWCASE.avatars[peer.id]} />
            <div className="min-w-0">
              <p className="font-semibold">{peer.name}</p>
              <p className="t-sm text-muted">{t(`${peer.years} năm ở ${job.company}`, `${job.company}で${peer.years}年勤務`, `${peer.years} yr${peer.years > 1 ? "s" : ""} at ${job.company}`)}</p>
              <p className="t-sm font-semibold text-brand flex items-center gap-1 mt-0.5"><Icon name="check-verified" size={14} solid />{t("Đã xác minh chấm công", "勤怠確認済み", "Attendance-verified")}</p>
            </div>
          </div>

          <p className="t-sm flex items-center gap-2 well px-3 py-2">
            <Icon name="lock-01" size={16} />{t("Bạn hiện là:", "現在の表示名：", "Shown to Senpai as:")} <b>{askerLabel(p, revealed)}</b>
          </p>

          {!thread ? (
            <>
              <fieldset>
                <legend className="font-semibold mb-2">{t("Chọn tối đa 3 câu hỏi", "質問を最大3つ選択", "Pick up to 3 questions")}</legend>
                <div className="flex flex-wrap gap-2">
                  {presetQs.map((q) => {
                    const on = picked.includes(q);
                    return (
                      <button key={q} className="chip pressable !h-auto py-2 text-left" aria-pressed={on} disabled={!on && questions.length >= 3} onClick={() => toggle(q)}>{q}</button>
                    );
                  })}
                </div>
              </fieldset>
              <label className="grid gap-1.5">
                <span className="t-sm font-semibold">{t("Hoặc tự viết", "または自由入力", "Or write your own")}</span>
                <input className="input" maxLength={120} value={own} onChange={(e) => setOwn(e.target.value)} placeholder={t("Ví dụ: Có chỗ để xe đạp không?", "例：駐輪場はありますか？", "e.g., Is there bicycle parking at the dorm?")} disabled={!own && picked.length >= 3} />
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
                    <p className="t-sm text-muted">{t(`${peer.name.split(" ").pop()} đang trả lời…`, `${peer.name.split(" ").pop()}さんが返信中…`, `${peer.name.split(" ").pop()} is typing…`)}</p>
                  )}
                </li>
              ))}
            </ol>
          )}

          <p className="t-sm text-muted">
            {t(
              "Senpai được thưởng giới thiệu khi bạn nhận việc. Câu trả lời là ý kiến cá nhân. Tên của bạn chỉ mở cho Senpai khi bạn bấm Nhận việc. Công ty hiện tại của bạn không bao giờ được hiện.",
              "内定承諾後に先輩へ紹介謝礼が支払われます。回答は個人の意見です。あなたのお名前は「内定を承諾」を押すまで公開されません。現在の勤務先も表示されません。",
              "Senpais earn a referral bonus if you accept an offer. Answers are personal opinions. Your name stays hidden until you click Accept offer, and your current employer is never shown.",
            )}
          </p>
        </div>
      )}
    </Sheet>
  );
}
