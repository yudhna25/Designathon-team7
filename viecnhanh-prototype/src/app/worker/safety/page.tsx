"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { useApp } from "@/lib/store";
import { gsap, useGSAP } from "@/lib/motion";

const SIGNS = [
  { kanji: "危険", kana: "きけん · kiken", vi: "Nguy hiểm", note: "Khu vực hoặc máy có thể gây thương tích." },
  { kanji: "立入禁止", kana: "たちいりきんし · tachiiri kinshi", vi: "Cấm vào", note: "Không bước vào, kể cả khi đi tắt." },
  { kanji: "火気厳禁", kana: "かきげんきん · kaki genkin", vi: "Tuyệt đối cấm lửa", note: "Không hút thuốc, không dùng bật lửa." },
  { kanji: "保護具着用", kana: "ほごぐちゃくよう · hogogu chakuyō", vi: "Bắt buộc đồ bảo hộ", note: "Kính, mũ, giày bảo hộ trước khi vào." },
  { kanji: "非常停止", kana: "ひじょうていし · hijō teishi", vi: "Dừng khẩn cấp", note: "Nút đỏ. Nhấn ngay khi máy bất thường." },
];

const QUIZ = [
  { q: "Đang vận hành máy tiện, bạn có được đeo găng tay vải không?", a: ["Có, để bảo vệ tay", "Không, găng có thể bị cuốn vào máy"], ok: 1, why: "Găng vải bị trục quay cuốn vào là tai nạn thường gặp nhất ở máy tiện." },
  { q: "Thấy biển 立入禁止 trên đường đi tắt, bạn làm gì?", a: ["Đi đường khác, không vào", "Đi nhanh qua rồi ra"], ok: 0, why: "立入禁止 nghĩa là cấm vào, không có ngoại lệ." },
  { q: "Máy phát ra tiếng lạ khi đang chạy. Việc đầu tiên là gì?", a: ["Tự mở nắp máy kiểm tra", "Nhấn 非常停止 và báo trưởng ca"], ok: 1, why: "Dừng máy trước, rồi báo người phụ trách. Không tự sửa." },
];

export default function Safety() {
  const { safetyDone, completeSafety } = useApp();
  const [flipped, setFlipped] = useState<number[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const correct = answers.filter((a, i) => a === QUIZ[i].ok).length;
  const progress = Math.round(((flipped.length / SIGNS.length) * 0.5 + (answers.filter((a) => a !== null).length / QUIZ.length) * 0.5) * 100);
  const allRight = correct === QUIZ.length;
  const done = safetyDone || allRight;
  useEffect(() => {
    if (allRight && !safetyDone) completeSafety();
  }, [allRight, safetyDone, completeSafety]);

  return (
    <Screen className="max-w-[760px]">
      <TopBar back="/worker/applications" title="An toàn trước ngày 1" sub="8 phút · tiếng Việt · bắt buộc" />
      <div className="px-5 lg:px-4 grid gap-6 pb-6">
        <section className="card p-5" data-reveal>
          <div className="flex items-center justify-between mb-2"><span className="font-semibold">Tiến độ</span><span className="tnum font-semibold">{done ? 100 : progress}%</span></div>
          <div className="meter"><i style={{ transform: `scaleX(${(done ? 100 : progress) / 100})`, transition: "transform var(--motion-slow) var(--ease-emphasized)" }} /></div>
          <p className="t-sm text-muted mt-2">Theo Điều 59 Luật An toàn & Vệ sinh lao động Nhật, nhà máy phải đào tạo an toàn trước khi bạn vào xưởng.</p>
        </section>

        <section data-reveal aria-labelledby="signs-h">
          <h2 id="signs-h" className="t-h4">1 · Biển báo Kanji</h2>
          <p className="text-muted mb-4">Chạm vào thẻ để xem nghĩa. {flipped.length}/{SIGNS.length} đã xem.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SIGNS.map((x, i) => <SignCard key={x.kanji} sign={x} onFlip={() => setFlipped((f) => (f.includes(i) ? f : [...f, i]))} />)}
          </div>
        </section>

        <section data-reveal aria-labelledby="quiz-h">
          <h2 id="quiz-h" className="t-h4 mb-4">2 · Kiểm tra nhanh</h2>
          <ol className="grid gap-3">
            {QUIZ.map((x, i) => <Question key={x.q} n={i + 1} item={x} value={answers[i]} onPick={(v) => setAnswers((a) => a.map((y, k) => (k === i ? v : y)))} />)}
          </ol>
        </section>

        {done ? (
          <Certificate onSave={() => completeSafety()} saved={safetyDone} />
        ) : (
          <p className="t-sm text-muted text-center">Trả lời đúng cả 3 câu để hoàn thành.</p>
        )}
      </div>
    </Screen>
  );
}

function SignCard({ sign, onFlip }: { sign: (typeof SIGNS)[number]; onFlip: () => void }) {
  const [back, setBack] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP({ scope: ref });
  const flip = contextSafe(() => {
    const next = !back;
    gsap.to(ref.current, { rotateY: 90, duration: 0.18, ease: "power2.in", onComplete: () => { setBack(next); gsap.fromTo(ref.current, { rotateY: -90 }, { rotateY: 0, duration: 0.45, ease: "back.out(1.6)" }); } });
    if (next) onFlip();
  });
  return (
    <button ref={ref} onClick={flip} aria-pressed={back} aria-label={back ? `${sign.kanji}: ${sign.vi}` : `Biển ${sign.kanji}, chạm để xem nghĩa`}
      className={`aspect-[4/5] rounded-[20px] p-4 text-left flex flex-col justify-between [transform-style:preserve-3d] ${back ? "ink" : "card"}`} style={{ perspective: 800 }}>
      {back ? (
        <>
          <span className="t-sm muted-ink">{sign.kanji}</span>
          <span><span className="t-h4 block">{sign.vi}</span><span className="t-sm muted-ink block mt-1">{sign.note}</span></span>
        </>
      ) : (
        <>
          <span className="flex items-center justify-between w-full"><Icon name="alert-triangle" className="text-faint" /><Icon name="refresh-ccw-01" size={16} className="text-faint" /></span>
          <span><span className="block text-[clamp(20px,6vw,28px)] whitespace-nowrap leading-tight font-bold tracking-[-0.02em]" lang="ja">{sign.kanji}</span><span className="t-sm text-muted block mt-1" lang="ja">{sign.kana}</span></span>
        </>
      )}
    </button>
  );
}

function Question({ n, item, value, onPick }: { n: number; item: (typeof QUIZ)[number]; value: number | null; onPick: (v: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const { contextSafe } = useGSAP({ scope: ref });
  const pick = contextSafe((v: number) => {
    onPick(v);
    if (v !== item.ok) gsap.fromTo(ref.current, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  });
  const answered = value !== null;
  return (
    <li ref={ref} className="card p-5">
      <p className="font-semibold"><span className="tnum text-muted mr-2">{n}.</span>{item.q}</p>
      <div className="grid gap-2 mt-3" role="radiogroup" aria-label={`Câu ${n}`}>
        {item.a.map((a, i) => {
          const chosen = value === i;
          const right = i === item.ok;
          return (
            <button key={a} role="radio" aria-checked={chosen} onClick={() => pick(i)}
              className={`pressable text-left rounded-2xl border px-4 py-3 flex items-center gap-3 ${chosen && right ? "ink border-transparent" : chosen ? "border-dashed border-line-strong" : "border-line"}`}>
              <span className={`grid size-5 place-items-center rounded-full border shrink-0 ${chosen ? "border-current" : "border-line"}`}>{chosen && <span className="size-2.5 rounded-full bg-current" />}</span>
              <span className="flex-1">{a}</span>
              {chosen && <Icon name={right ? "check-circle" : "x-circle"} solid />}
            </button>
          );
        })}
      </div>
      {answered && <p className="t-sm mt-3 flex gap-2" aria-live="polite"><Icon name={value === item.ok ? "check" : "info-circle"} size={16} className="mt-0.5" /><span><b>{value === item.ok ? "Đúng." : "Chưa đúng."}</b> {item.why}</span></p>}
    </li>
  );
}

function Certificate({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.fromTo(ref.current, { y: 24, scale: 0.96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "back.out(1.4)" }); }, { scope: ref });
  return (
    <div ref={ref} className="ink rounded-[28px] p-6 text-center">
      <Icon name="award-01" size={40} solid className="mx-auto" />
      <p className="mt-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.14em] px-2.5 py-1 rounded-full border border-current/25 uppercase">
          安全教育修了 · Verified
        </span>
      </p>
      <p className="t-h3 mt-2.5">Hoàn thành an toàn</p>
      <p className="muted-ink mt-1">Nhà máy sẽ thấy trạng thái này trong hồ sơ của bạn.</p>
      {saved ? (
        <Link href="/worker/applications" className="btn btn-lg btn-inverse btn-block pressable mt-5">Về hồ sơ đã gửi</Link>
      ) : (
        <Button size="lg" block variant="inverse" className="mt-5" onClick={onSave}>Gửi kết quả cho nhà máy</Button>
      )}
    </div>
  );
}
