"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Icon } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { AIThinking } from "@/components/worker/Blocks";
import { jobById } from "@/lib/data";
import { SUGGESTED, answer, type Answer } from "@/lib/ask";
import { useNow, useViewer } from "@/lib/store";

const THINK = [
  { title: "Đọc câu hỏi của bạn", sub: "Tiếng Việt, có dấu hoặc không dấu" },
  { title: "Tìm trong việc làm đang tuyển", sub: "Lương thực nhận, ký túc xá, người Việt" },
];

/** AI Q&A: ask in Vietnamese, answers cite specific jobs. */
export default function Ask() {
  const { p } = useViewer();
  const now = useNow(60000);
  const [q, setQ] = useState("");
  const [log, setLog] = useState<Answer[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setQ("");
    setBusy(t);
  };
  const mic = () => {
    setListening(true);
    setTimeout(() => { setListening(false); setQ(SUGGESTED[1]); }, 1500);
  };
  const last = log.at(-1);

  return (
    <Screen>
      <TopBar back="/worker/jobs" title="Hỏi trợ lý AI" sub="Trả lời từ việc làm trong app" />
      <div className="px-5 lg:px-0 max-w-[640px] grid grid-cols-1 gap-4 pb-40">
        {log.length === 0 && !busy && (
          <section className="card-flat p-5">
            <p className="t-sub">Bạn muốn biết gì?</p>
            <p className="t-sm text-muted mt-1">Hỏi bằng tiếng Việt, gõ hoặc nói. Trợ lý chỉ dẫn số [1], [2] tới việc cụ thể.</p>
            <div className="mt-3 flex flex-wrap gap-2">{SUGGESTED.map((s) => <button key={s} className="chip pressable !h-auto py-2 text-left" onClick={() => ask(s)}>{s}</button>)}</div>
          </section>
        )}
        {log.map((x, i) => (
          <article key={i} className="grid grid-cols-1 gap-2">
            <p className="justify-self-end max-w-[85%] rounded-2xl rounded-br-md bg-[#1B22A7] text-white px-3 py-2">{x.q}</p>
            <div className="card p-4">
              <p className="t-sm font-semibold flex items-center gap-1.5 mb-1.5"><Icon name="stars-01" solid size={16} />Trợ lý</p>
              <p>{x.a}</p>
              {x.cites.length > 0 && (
                <ol className="mt-3 grid grid-cols-1 gap-1.5">
                  {x.cites.map((id, k) => {
                    const j = jobById(id)!;
                    return <li key={id}><Link href={`/worker/jobs/${id}`} className="flex items-center gap-2 well px-3 py-2 pressable t-sm"><b className="tnum">[{k + 1}]</b><span className="flex-1 min-w-0 truncate">{j.title} · {j.company}</span><Icon name="chevron-right-01" size={16} /></Link></li>;
                  })}
                </ol>
              )}
            </div>
          </article>
        ))}
        {busy && (
          <div className="card p-4" aria-live="polite">
            <p className="justify-self-end mb-3 t-sm text-muted">“{busy}”</p>
            <AIThinking steps={THINK} stepMs={500} onDone={() => { setLog((l) => [...l, answer(busy, p, now)]); setBusy(null); }} />
          </div>
        )}
        {last && !busy && (
          <div className="flex flex-wrap gap-2">{last.follow.map((f) => <button key={f} className="chip pressable !h-auto py-2 text-left" onClick={() => ask(f)}>{f}</button>)}</div>
        )}
        <p className="t-sm text-muted">Trợ lý trả lời từ dữ liệu việc làm trong app. Bạn luôn là người quyết định.</p>
      </div>

      <form className="fixed bottom-0 inset-x-0 z-20 lg:left-[max(248px,calc((100vw-1440px)/2+248px))] bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl border-t border-hair" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
        <div className="mx-auto max-w-[640px] px-5 pt-3 pb-3 safe-b flex gap-2">
          <button type="button" className={`icon-btn pressable ${listening ? "ink" : "bg-subtle"}`} aria-label={listening ? "Đang nghe" : "Nói câu hỏi"} onClick={mic} disabled={listening}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg></button>
          <input className="input flex-1" value={listening ? "Đang nghe…" : q} onChange={(e) => setQ(e.target.value)} placeholder="Hỏi về lương, ký túc xá, ngày bắt đầu…" aria-label="Câu hỏi" readOnly={listening} />
          <Button type="submit" disabled={!q.trim() || !!busy} aria-label="Gửi câu hỏi" icon="send-01">Hỏi</Button>
        </div>
      </form>
    </Screen>
  );
}
