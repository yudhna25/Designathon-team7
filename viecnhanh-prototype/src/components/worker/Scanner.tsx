"use client";
import { useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/motion";
import { Button, Icon } from "../ui";

export type ScanResult = { name: string; visa: "ssw1_mfg"; cardExpiry: string };

/**
 * ZEN "Scanner Viewport" for the residence card. Demo-safe: no camera permission;
 * scans a clearly-labelled SAMPLE card or a photo the user picks (kept in memory only).
 */
export function Scanner({ onResult, done }: { onResult: (r: ScanResult) => void; done: boolean }) {
  const t = useT();
  const [phase, setPhase] = useState<"idle" | "scan" | "done">(done ? "done" : "idle");
  const [photo, setPhoto] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);

  const { contextSafe } = useGSAP({ scope: root });
  const run = contextSafe(() => {
    setPhase("scan");
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("done");
        onResult({ name: "NGUYEN TUAN ANH", visa: "ssw1_mfg", cardExpiry: "2028-03-31" });
      },
    });
    tl.set(".scan-line", { autoAlpha: 1, yPercent: 0 })
      .to(".corner", { scale: 0.92, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 })
      .fromTo(".scan-line", { top: "0%" }, { top: "100%", duration: 0.9, ease: "sine.inOut", repeat: 1, yoyo: true }, 0)
      .fromTo(".ocr-box", { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, stagger: 0.18, duration: 0.4, ease: "back.out(2)" }, 0.5)
      .to(".scan-line", { autoAlpha: 0, duration: 0.2 });
  });

  return (
    <div ref={root}>
      <div className="relative rounded-[24px] ink p-4 overflow-hidden">
        <div className="relative mx-auto aspect-[1.586] max-w-[380px]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={t("Ảnh thẻ bạn đã chọn", "選択したカード写真", "Selected residence card photo")} className="absolute inset-0 size-full object-cover rounded-xl" />
          ) : (
            <SampleCard />
          )}
          {/* OCR highlight boxes over the fields we read (photo mode; sample card marks its own fields) */}
          {photo && <span className="ocr-box invisible absolute left-[6%] top-[27%] w-[50%] h-[11%] rounded-md ring-2 ring-[var(--color-bg-neutral-solid)] bg-[color-mix(in_oklab,var(--color-bg-neutral-solid)_8%,transparent)]" />}
          {photo && <span className="ocr-box invisible absolute left-[6%] top-[46%] w-[60%] h-[11%] rounded-md ring-2 ring-[var(--color-bg-neutral-solid)] bg-[color-mix(in_oklab,var(--color-bg-neutral-solid)_8%,transparent)]" />}
          {photo && <span className="ocr-box invisible absolute left-[6%] top-[64%] w-[40%] h-[11%] rounded-md ring-2 ring-[var(--color-bg-neutral-solid)] bg-[color-mix(in_oklab,var(--color-bg-neutral-solid)_8%,transparent)]" />}
          <span className="scan-line invisible absolute inset-x-[-4%] h-[3px] rounded-full bg-solid shadow-[0_0_20px_4px_color-mix(in_oklab,var(--color-bg-neutral-solid)_35%,transparent)]" />
          {(["left-[-10px] top-[-10px] border-l-[3px] border-t-[3px] rounded-tl-2xl", "right-[-10px] top-[-10px] border-r-[3px] border-t-[3px] rounded-tr-2xl", "left-[-10px] bottom-[-10px] border-l-[3px] border-b-[3px] rounded-bl-2xl", "right-[-10px] bottom-[-10px] border-r-[3px] border-b-[3px] rounded-br-2xl"] as const).map((c) => (
            <span key={c} className={`corner absolute size-8 border-[var(--color-content-on-accent)] ${c}`} aria-hidden />
          ))}
          {phase === "done" && (
            <span className="absolute right-2 bottom-2 badge badge-md bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)] animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]">
              <Icon name="check" size={16} />{t("Đã đọc", "読取済み", "Scanned")}
            </span>
          )}
        </div>
        <p className="text-center t-sm mt-4 muted-ink" aria-live="polite">
          {phase === "idle" && t("Đặt mặt trước thẻ cư trú vào khung", "在留カードの表を枠に合わせてください", "Place front of residence card in frame")}
          {phase === "scan" && t("Đang đọc tên, tư cách lưu trú và hạn thẻ…", "氏名・在留資格・有効期限を読み取り中…", "Reading name, visa status & expiry…")}
          {phase === "done" && t("Đọc xong. Kiểm tra lại thông tin bên dưới.", "読み取り完了。下の情報をご確認ください。", "Scan complete. Review details below.")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button variant="secondary" icon="scan" onClick={run} loading={phase === "scan"}>
          {phase === "done" ? t("Quét lại", "再スキャン", "Scan again") : t("Quét thẻ mẫu", "サンプルをスキャン", "Scan sample card")}
        </Button>
        <Button variant="tertiary" icon="image-plus" onClick={() => file.current?.click()} disabled={phase === "scan"}>
          {t("Chọn ảnh", "写真を選択", "Choose photo")}
        </Button>
        <input
          ref={file}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setPhoto((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
            setTimeout(run, 50);
          }}
        />
      </div>
      <p className="t-sm text-muted mt-3 flex gap-2">
        <Icon name="lock-01" size={16} className="mt-0.5" />
        {t("Ảnh chỉ dùng để đọc thông tin trên máy bạn, không lưu lại. Số thẻ được che.", "写真は端末上での読み取りのみに使用し保存されません。カード番号は隠されます。", "Photo is processed on-device only and never saved. Card number stays hidden.")}
      </p>
    </div>
  );
}

/** Stylised, obviously-sample residence card (not a reproduction of the real document). */
function SampleCard() {
  const t = useT();
  return (
    <div className="absolute inset-0 rounded-xl bg-[var(--color-bg-inverse-solid)] text-[var(--color-content-neutral-strongest)] p-[5%] overflow-hidden select-none" aria-label={t("Thẻ cư trú mẫu", "見本在留カード", "Sample residence card")}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[clamp(10px,3.4vw,14px)]">在留カード · RESIDENCE CARD</span>
        <span className="mono text-[clamp(8px,2.4vw,10px)] opacity-60">No. ●●●● ●●●● 47</span>
      </div>
      <div className="mt-[6%] grid grid-cols-[1fr_26%] gap-[4%] text-[clamp(9px,2.8vw,12px)] leading-tight">
        <div className="space-y-[7%]">
          <p className="relative"><span className="ocr-box invisible absolute -inset-x-1.5 -inset-y-1 rounded-md ring-2 ring-[var(--color-bg-neutral-solid)] bg-[color-mix(in_oklab,var(--color-bg-neutral-solid)_8%,transparent)]" aria-hidden /><span className="opacity-50 block text-[0.8em]">氏名 NAME</span><b>NGUYEN TUAN ANH</b></p>
          <p className="relative"><span className="ocr-box invisible absolute -inset-x-1.5 -inset-y-1 rounded-md ring-2 ring-[var(--color-bg-neutral-solid)] bg-[color-mix(in_oklab,var(--color-bg-neutral-solid)_8%,transparent)]" aria-hidden /><span className="opacity-50 block text-[0.8em]">在留資格 STATUS</span><b>特定技能1号 (工業製品製造業)</b></p>
          <p className="relative"><span className="ocr-box invisible absolute -inset-x-1.5 -inset-y-1 rounded-md ring-2 ring-[var(--color-bg-neutral-solid)] bg-[color-mix(in_oklab,var(--color-bg-neutral-solid)_8%,transparent)]" aria-hidden /><span className="opacity-50 block text-[0.8em]">在留期間 PERIOD · 満了日</span><b>2028年03月31日</b></p>
        </div>
        <div className="rounded-lg bg-subtle grid place-items-center"><Icon name="user" size={28} className="opacity-40" /></div>
      </div>
      <span className="absolute -right-[8%] bottom-[10%] rotate-[-18deg] mono font-bold tracking-[0.3em] text-[clamp(16px,6vw,26px)] opacity-[0.12]">SAMPLE · MẪU</span>
    </div>
  );
}
