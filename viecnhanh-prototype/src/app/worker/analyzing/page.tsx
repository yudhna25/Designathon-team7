"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Button, FitBadge, Icon } from "@/components/ui";
import { AIThinking } from "@/components/worker/Blocks";
import { CERTS, JLPT, JOBS, SKILLS, VISAS, type SkillId } from "@/lib/data";
import { cityName, jobTitle, useLang, useT } from "@/lib/i18n";
import { takeHome, yen } from "@/lib/pay";
import { fitOf, scoreMatch } from "@/lib/scoring";
import { useApp, takeNext } from "@/lib/store";
import { enter, useGSAP } from "@/lib/motion";

export default function Analyzing() {
  const router = useRouter();
  const profile = useApp((s) => s.profile)!;
  const cfg = useApp((s) => s.config);
  const lang = useLang();
  const t = useT();
  const [done, setDone] = useState(false);
  const result = useRef<HTMLDivElement>(null);

  const ranked = useMemo(
    () => JOBS.map((j) => { const m = scoreMatch(profile, j, cfg.weights); return { j, m, fit: fitOf(m, cfg.threshold) }; }).sort((a, b) => b.m.total - a.m.total),
    [profile, cfg.weights, cfg.threshold],
  );
  const great = ranked.filter((r) => r.fit === "great");
  const possible = ranked.filter((r) => r.m.gate.pass && r.fit === "possible");
  const hidden = ranked.filter((r) => !r.m.gate.pass);
  const skills = (Object.keys(profile.skills) as SkillId[]).map((s) => {
    const y = profile.skills[s];
    const yr = !y ? t("<1 năm", "1年未満", "<1 yr") : `${y} ${t("năm", "年", y === 1 ? "yr" : "yrs")}`;
    return `${SKILLS[s][lang]} ${yr}`;
  });
  const certs = profile.certs.map((c) => CERTS[c][lang]);
  const extra = [profile.otherSkills?.trim(), profile.otherCerts?.trim()].filter(Boolean).join(" · ");

  const steps = [
    { title: t("Đọc thẻ cư trú", "在留カードを読み取り中", "Reading residence card"), sub: `${VISAS[profile.visa][lang]}` },
    {
      title: t(`Kiểm tra visa với ${JOBS.length} nhà máy`, `${JOBS.length}社の工場と在留資格を照合`, `Checking visa against ${JOBS.length} factories`),
      sub: hidden.length ? t(`Ẩn ${hidden.length} việc visa không cho phép`, `在留資格に合わない${hidden.length}件を非表示`, `Hiding ${hidden.length} visa-ineligible jobs`) : t("Visa hợp lệ với tất cả việc", "すべての求人で在留資格が適合", "Eligible for all open jobs"),
    },
    { title: t("So kỹ năng & chứng chỉ", "スキル・資格を照合", "Matching skills & certificates"), sub: skills.join(", ") },
    {
      title: t("Tính đường đi & lương thực nhận", "通勤と手取り給与を計算", "Calculating commute & take-home pay"),
      sub: t(`Từ ${cityName(profile.city, lang)}, đã trừ thuế và bảo hiểm; chi phí chỗ ở theo lựa chọn hồ sơ`, `${cityName(profile.city, lang)}から。税金・保険控除済み、寮費は希望設定に応じて計算`, `From ${cityName(profile.city, lang)}, after taxes & insurance; housing based on dorm preference`),
    },
    {
      title: t("Xếp việc theo mức phù hợp", "マッチ度順に並べ替え", "Ranking jobs by fit"),
      sub: t(`${great.length} việc rất phù hợp`, `とても合う求人 ${great.length}件`, `${great.length} great ${great.length === 1 ? "match" : "matches"}`),
    },
  ];

  useGSAP(() => { if (done) enter("[data-res]", { y: 24 }, { stagger: 0.08, duration: 0.9 }); }, { scope: result, dependencies: [done] });

  // What the AI understood, in plain words with icons (replaces the raw data block).
  const facts = [
    { icon: "shield-tick" as const, k: t("Visa", "在留資格", "Visa"), v: VISAS[profile.visa][lang], ok: !VISAS[profile.visa].block },
    { icon: "tool-02" as const, k: t("Tay nghề", "スキル", "Skills"), v: skills.length ? skills.join(" · ") : t("Chưa chọn kỹ năng trong danh sách", "リストから未選択", "No skills selected from list"), ok: skills.length > 0 },
    { icon: "certificate" as const, k: t("Chứng chỉ", "資格", "Certificates"), v: certs.length ? certs.join(" · ") : t("Chưa có trong danh sách — có thể bổ sung sau", "リストに未登録（後で追加可）", "None selected — can add later"), ok: certs.length > 0 },
    { icon: "translate" as const, k: t("Tiếng Nhật", "日本語", "Japanese"), v: profile.jlpt === 0 ? t("Chưa có", "なし", "None") : JLPT[profile.jlpt], ok: profile.jlpt >= 2 },
    ...(extra ? [{ icon: "edit-02" as const, k: t("Bạn tự ghi thêm · HR sẽ xem, AI chưa tính điểm", "自由記入 · HRが確認（AI加点なし）", "Added notes · HR will see, not scored"), v: extra, ok: false }] : []),
    { icon: "marker-pin-02" as const, k: t("Nơi ở", "居住地", "Location"), v: `${cityName(profile.city, lang)}, Aichi${profile.relocate ? t(" · ở được ký túc xá", " · 寮可", " · open to dorms") : ""}`, ok: true },
  ];

  return (
    <div className="min-h-dvh mx-auto w-full max-w-[640px] px-5 md:px-0 pt-10 pb-36">
      <p className="t-eyebrow mb-3 flex items-center gap-2 !text-brand"><Icon name="stars-01" solid size={16} />{t("AI đang dựng hồ sơ", "AIがプロフィール作成中", "AI building your profile")}</p>
      <h1 className="t-h2 mb-6">
        {done
          ? (great.length ? t(`Có ${great.length} việc rất phù hợp với bạn`, `とても合う求人が${great.length}件あります`, `${great.length} great ${great.length === 1 ? "match" : "matches"} found`) : t("AI đã kiểm tra hồ sơ của bạn", "プロフィールを確認しました", "AI finished checking your profile"))
          : t("Chờ một chút, AI đang đọc hồ sơ…", "プロフィールを読み取り中…", "One moment, AI is reading your profile…")}
      </h1>

      <div className={`card p-5 ${done ? "hidden" : ""}`}>
        <AIThinking steps={steps} onDone={() => setDone(true)} />
        <div className="mt-4 pt-3 hair-t flex justify-end">
          <Button size="sm" variant="flat" iconRight="arrow-right" onClick={() => setDone(true)}>{t("Xem kết quả ngay", "今すぐ結果を見る", "Skip to results")}</Button>
        </div>
      </div>

      <div ref={result} className={done ? "grid gap-4" : "hidden"}>
        <section data-res className="card p-5" aria-labelledby="ai-h">
          <h2 id="ai-h" className="t-sub mb-1">{t("AI hiểu về bạn như sau", "AIが読み取った内容", "What AI understood")}</h2>
          <p className="t-sm text-muted mb-4">{t("Sai chỗ nào bạn có thể sửa lại sau trong mục Tôi.", "間違いがあればマイページからいつでも修正できます。", "You can fix anything later in the Me tab.")}</p>
          <ul className="grid gap-3">
            {facts.map((f) => (
              <li key={f.k} className="flex gap-3">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${f.ok ? "bg-brand-soft text-brand" : "bg-subtle text-muted"}`}><Icon name={f.icon} /></span>
                <span className="min-w-0"><span className="t-sm text-muted block">{f.k}</span><span className="font-medium">{f.v}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section data-res aria-labelledby="great-h">
          <h2 id="great-h" className="t-h4 mb-3 flex items-center gap-2">{t("Rất phù hợp", "とても合う", "Great match")} <span className="badge badge-md bg-brand-soft text-brand tnum">{great.length}</span></h2>
          <ul className="grid gap-2">{great.map((r) => <JobRow key={r.j.id} r={r} relocate={profile.relocate} />)}</ul>
          {!great.length && (
            <p className="text-muted">
              {possible.length
                ? t("Chưa có việc rất phù hợp. Xem các việc có thể phù hợp bên dưới.", "「とても合う」求人はありません。下の「合いそう」をご覧ください。", "No great matches yet. Check the possible matches below.")
                : t("Chưa có việc rất phù hợp. Xem tất cả việc để biết lý do và kiểm tra lại hồ sơ.", "「とても合う」求人はありません。すべての求人で理由を確認してください。", "No great matches yet. View all jobs to see why and update your profile.")}
            </p>
          )}
        </section>

        {possible.length > 0 && (
          <section data-res aria-labelledby="pos-h">
            <h2 id="pos-h" className="t-h4 mb-1 flex items-center gap-2">{t("Có thể phù hợp", "合いそう", "Possible match")} <span className="badge badge-md tnum">{possible.length}</span></h2>
            <p className="t-sm text-muted mb-3">{t("Mức gợi ý tổng hợp nhiều tiêu chí. Bạn vẫn có thể xem và quyết định ứng tuyển.", "複数条件での総合評価です。詳細を見て応募するか決められます。", "Combined across multiple criteria. You can still review and decide.")}</p>
            <ul className="grid gap-2">{possible.map((r) => <JobRow key={r.j.id} r={r} relocate={profile.relocate} />)}</ul>
          </section>
        )}

        {hidden.length > 0 && (
          <p data-res className="t-sm text-muted flex gap-2 rounded-2xl border border-dashed border-line p-4">
            <Icon name="lock-01" size={18} />
            {t(`${hidden.length} việc đã ẩn vì visa của bạn không cho phép làm ngành đó.`, `現在の在留資格で就労できない${hidden.length}件を非表示にしました。`, `${hidden.length} ${hidden.length === 1 ? "job" : "jobs"} hidden because your visa does not cover that industry.`)}
          </p>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl border-t border-hair">
        <div className="mx-auto max-w-[640px] px-5 md:px-0 pt-3 safe-b">
          <Button size="lg" block disabled={!done} onClick={() => router.push(takeNext("/worker/jobs"))} iconRight="arrow-right">
            {done ? t("Xem tất cả việc", "すべての求人を見る", "View all jobs") : t("Đang chấm điểm…", "照合中…", "Matching…")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function JobRow({ r, relocate }: { r: { j: (typeof JOBS)[number]; fit: "great" | "possible" | "not" }; relocate: boolean }) {
  const lang = useLang();
  const t = useT();
  const pay = takeHome(r.j, relocate);
  return (
    <li>
      <Link href={`/worker/jobs/${r.j.id}`} className="card pressable flex items-center gap-4 p-4 hover:shadow-[var(--shadow-bottom-2)]">
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${r.fit === "great" ? "ink" : "bg-brand-soft text-brand"}`}><Icon name="building-02" /></span>
        <span className="flex-1 min-w-0">
          <span className="font-semibold block truncate">{jobTitle(r.j, lang)}</span>
          <span className="t-sm text-muted block truncate">{r.j.company} · {cityName(r.j.city, lang)}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-2"><FitBadge level={r.fit} /><span className="t-sm font-semibold tnum">{yen(pay.net)}<span className="text-muted font-normal">{t("/tháng ước tính", "/月（推定）", "/mo est.")}</span></span></span>
          <span className="t-sm text-muted block mt-1">{pay.housingNote}</span>
        </span>
        <Icon name="chevron-right-01" className="text-faint" />
      </Link>
    </li>
  );
}
