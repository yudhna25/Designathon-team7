"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { useLang, useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { gsap, useGSAP } from "@/lib/motion";

const SIGNS = [
  { kanji: "危険", kana: "きけん · kiken", vi: "Nguy hiểm", en: "Danger", ja: "危険", note: "Khu vực hoặc máy có thể gây thương tích.", noteEn: "Area or machine that can cause injury.", noteJa: "けがの恐れがある場所や機械。" },
  { kanji: "立入禁止", kana: "たちいりきんし · tachiiri kinshi", vi: "Cấm vào", en: "Keep out", ja: "立入禁止", note: "Không bước vào, kể cả khi đi tắt.", noteEn: "Do not enter, even as a shortcut.", noteJa: "近道でも絶対に入らないでください。" },
  { kanji: "火気厳禁", kana: "かきげんきん · kaki genkin", vi: "Tuyệt đối cấm lửa", en: "No open flame", ja: "火気厳禁", note: "Không hút thuốc, không dùng bật lửa.", noteEn: "No smoking and no lighters or sparks.", noteJa: "禁煙・ライターなど火の使用厳禁。" },
  { kanji: "保護具着用", kana: "ほごぐちゃくよう · hogogu chakuyō", vi: "Bắt buộc đồ bảo hộ", en: "Wear PPE", ja: "保護具着用", note: "Kính, mũ, giày bảo hộ trước khi vào.", noteEn: "Safety glasses, helmet, and boots required.", noteJa: "入場前に保護メガネ・ヘルメット・安全靴を着用。" },
  { kanji: "非常停止", kana: "ひじょうていし · hijō teishi", vi: "Dừng khẩn cấp", en: "Emergency stop", ja: "非常停止", note: "Nút đỏ. Nhấn ngay khi máy bất thường.", noteEn: "Red button. Press immediately if something is wrong.", noteJa: "赤いボタン。異常時はすぐ押してください。" },
];

const QUIZ = [
  {
    q: "Đang vận hành máy tiện, bạn có được đeo găng tay vải không?",
    qEn: "Should you wear cloth gloves while operating a lathe?",
    qJa: "旋盤の運転中に軍手を着用してもよいですか？",
    a: ["Có, để bảo vệ tay", "Không, găng có thể bị cuốn vào máy"],
    aEn: ["Yes, to protect my hands", "No, gloves can get caught in the spindle"],
    aJa: ["はい、手を守るために着ける", "いいえ、回転軸に巻き込まれる恐れがある"],
    ok: 1,
    why: "Găng vải bị trục quay cuốn vào là tai nạn thường gặp nhất ở máy tiện.",
    whyEn: "Cloth gloves catching on a spinning spindle is one of the most common lathe accidents.",
    whyJa: "軍手が回転部分に巻き込まれる事故は旋盤作業で最も多い労災の一つです。",
  },
  {
    q: "Thấy biển 立入禁止 trên đường đi tắt, bạn làm gì?",
    qEn: "If you see a 立入禁止 sign along a shortcut, what should you do?",
    qJa: "近道に「立入禁止」の表示がある場合、どうしますか？",
    a: ["Đi đường khác, không vào", "Đi nhanh qua rồi ra"],
    aEn: ["Take another route and stay out", "Walk through quickly"],
    aJa: ["別ルートを通って入らない", "素早く通り抜ける"],
    ok: 0,
    why: "立入禁止 nghĩa là cấm vào, không có ngoại lệ.",
    whyEn: "立入禁止 means strictly off-limits, with no exceptions.",
    whyJa: "「立入禁止」は例外なく進入禁止を意味します。",
  },
  {
    q: "Máy phát ra tiếng lạ khi đang chạy. Việc đầu tiên là gì?",
    qEn: "A running machine starts making an unusual noise. What is the first step?",
    qJa: "機械から異音がしたとき、最初にするべきことは？",
    a: ["Tự mở nắp máy kiểm tra", "Nhấn 非常停止 và báo trưởng ca"],
    aEn: ["Open the cover to inspect it yourself", "Press 非常停止 and tell your line leader"],
    aJa: ["自分でカバーを開けて確認する", "非常停止を押して班長に報告する"],
    ok: 1,
    why: "Dừng máy trước, rồi báo người phụ trách. Không tự sửa.",
    whyEn: "Stop the machine first, then call your supervisor. Never repair it yourself.",
    whyJa: "まず機械を止めて責任者に報告します。自己判断で修理しないでください。",
  },
];

export default function Safety() {
  const { safetyDone, completeSafety } = useApp();
  const t = useT();
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
      <TopBar back="/worker/applications" title={t("An toàn trước ngày 1", "入社前 安全教育", "Day-1 safety training")} sub={t("8 phút · tiếng Việt · bắt buộc", "8分 · 多言語 · 必須", "8 min · English · required")} />
      <div className="px-5 lg:px-4 grid gap-6 pb-6">
        <section className="card p-5" data-reveal>
          <div className="flex items-center justify-between mb-2"><span className="font-semibold">{t("Tiến độ", "進捗", "Progress")}</span><span className="tnum font-semibold">{done ? 100 : progress}%</span></div>
          <div className="meter"><i style={{ transform: `scaleX(${(done ? 100 : progress) / 100})`, transition: "transform var(--motion-slow) var(--ease-emphasized)" }} /></div>
          <p className="t-sm text-muted mt-2">{t("Theo Điều 59 Luật An toàn & Vệ sinh lao động Nhật, nhà máy phải đào tạo an toàn trước khi bạn vào xưởng.", "日本の労働安全衛生法第59条に基づき、工場では作業開始前の安全教育が義務付けられています。", "Under Article 59 of Japan's Industrial Safety and Health Act, factories must provide safety training before you enter the floor.")}</p>
        </section>

        <section data-reveal aria-labelledby="signs-h">
          <h2 id="signs-h" className="t-h4">{t("1 · Biển báo Kanji", "1 · 工場の安全標識", "1 · Kanji warning signs")}</h2>
          <p className="text-muted mb-4">{t(`Chạm vào thẻ để xem nghĩa. ${flipped.length}/${SIGNS.length} đã xem.`, `カードをタップして意味を確認 (${flipped.length}/${SIGNS.length} 確認済み)`, `Tap a card to see its meaning. ${flipped.length}/${SIGNS.length} viewed.`)}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SIGNS.map((x, i) => <SignCard key={x.kanji} sign={x} onFlip={() => setFlipped((f) => (f.includes(i) ? f : [...f, i]))} />)}
          </div>
        </section>

        <section data-reveal aria-labelledby="quiz-h">
          <h2 id="quiz-h" className="t-h4 mb-4">{t("2 · Kiểm tra nhanh", "2 · 確認クイズ", "2 · Quick check")}</h2>
          <ol className="grid gap-3">
            {QUIZ.map((x, i) => <Question key={x.q} n={i + 1} item={x} value={answers[i]} onPick={(v) => setAnswers((a) => a.map((y, k) => (k === i ? v : y)))} />)}
          </ol>
        </section>

        {done ? (
          <Certificate onSave={() => completeSafety()} saved={safetyDone} />
        ) : (
          <p className="t-sm text-muted text-center">{t("Trả lời đúng cả 3 câu để hoàn thành.", "全3問に正解すると完了します。", "Answer all 3 questions correctly to complete.")}</p>
        )}
      </div>
    </Screen>
  );
}

function SignCard({ sign, onFlip }: { sign: (typeof SIGNS)[number]; onFlip: () => void }) {
  const lang = useLang();
  const t = useT();
  const [back, setBack] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP({ scope: ref });
  const flip = contextSafe(() => {
    const next = !back;
    gsap.to(ref.current, { rotateY: 90, duration: 0.18, ease: "power2.in", onComplete: () => { setBack(next); gsap.fromTo(ref.current, { rotateY: -90 }, { rotateY: 0, duration: 0.45, ease: "back.out(1.6)" }); } });
    if (next) onFlip();
  });
  const title = lang === "ja" ? sign.ja : lang === "en" ? sign.en : sign.vi;
  const note = lang === "ja" ? sign.noteJa : lang === "en" ? sign.noteEn : sign.note;
  return (
    <button ref={ref} onClick={flip} aria-pressed={back} aria-label={back ? `${sign.kanji}: ${title}` : t(`Biển ${sign.kanji}, chạm để xem nghĩa`, `標識「${sign.kanji}」、タップして確認`, `${sign.kanji} sign, tap for meaning`)}
      className={`aspect-[4/5] rounded-[20px] p-4 text-left flex flex-col justify-between [transform-style:preserve-3d] ${back ? "ink" : "card"}`} style={{ perspective: 800 }}>
      {back ? (
        <>
          <span className="t-sm muted-ink">{sign.kanji}</span>
          <span><span className="t-h4 block">{title}</span><span className="t-sm muted-ink block mt-1">{note}</span></span>
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
  const lang = useLang();
  const t = useT();
  const ref = useRef<HTMLLIElement>(null);
  const { contextSafe } = useGSAP({ scope: ref });
  const pick = contextSafe((v: number) => {
    onPick(v);
    if (v !== item.ok) gsap.fromTo(ref.current, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  });
  const answered = value !== null;
  const qText = lang === "ja" ? item.qJa : lang === "en" ? item.qEn : item.q;
  const options = lang === "ja" ? item.aJa : lang === "en" ? item.aEn : item.a;
  const why = lang === "ja" ? item.whyJa : lang === "en" ? item.whyEn : item.why;
  return (
    <li ref={ref} className="card p-5">
      <p className="font-semibold"><span className="tnum text-muted mr-2">{n}.</span>{qText}</p>
      <div className="grid gap-2 mt-3" role="radiogroup" aria-label={t(`Câu ${n}`, `質問 ${n}`, `Question ${n}`)}>
        {options.map((a, i) => {
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
      {answered && <p className="t-sm mt-3 flex gap-2" aria-live="polite"><Icon name={value === item.ok ? "check" : "info-circle"} size={16} className="mt-0.5" /><span><b>{value === item.ok ? t("Đúng.", "正解。", "Correct.") : t("Chưa đúng.", "不正解。", "Not quite.")}</b> {why}</span></p>}
    </li>
  );
}

function Certificate({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const t = useT();
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
      <p className="t-h3 mt-2.5">{t("Hoàn thành an toàn", "安全教育 完了", "Safety training complete")}</p>
      <p className="muted-ink mt-1">{t("Nhà máy sẽ thấy trạng thái này trong hồ sơ của bạn.", "この完了ステータスが工場側の画面に表示されます。", "Factories will see this verified status on your application.")}</p>
      {saved ? (
        <Link href="/worker/applications" className="btn btn-lg btn-inverse btn-block pressable mt-5">{t("Về hồ sơ đã gửi", "応募履歴に戻る", "Back to applications")}</Link>
      ) : (
        <Button size="lg" block variant="inverse" className="mt-5" onClick={onSave}>{t("Gửi kết quả cho nhà máy", "完了ステータスを送信", "Send completion status")}</Button>
      )}
    </div>
  );
}
