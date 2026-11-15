"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Button, FitBadge, Icon, InlineNote, toast } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { jobById } from "@/lib/data";
import { jobTitle, useLang, useT } from "@/lib/i18n";
import { fitLabel, fitOf, scoreMatch, suggestImprovements } from "@/lib/scoring";
import { useApp } from "@/lib/store";

export default function Page() {
  return <Suspense><Improve /></Suspense>;
}

function Improve() {
  const router = useRouter();
  const jobId = useSearchParams().get("job") ?? "";
  const job = jobById(jobId);
  const { profile, config, setProfile } = useApp();
  const lang = useLang();
  const t = useT();
  const p = profile!;
  const [picked, setPicked] = useState<string[]>([]);
  const suggestions = useMemo(() => (job ? suggestImprovements(p, job, config.weights) : []), [p, job, config.weights]);
  if (!job) return <div className="p-8"><Link className="underline" href="/worker/jobs">{t("Về danh sách việc", "求人一覧に戻る", "Back to jobs")}</Link></div>;

  const draft = suggestions.filter((x) => picked.includes(x.id)).reduce((q, x) => x.apply(q), p);
  const mb = scoreMatch(p, job, config.weights), ma = scoreMatch(draft, job, config.weights);
  const before = mb.total, after = ma.total;
  const fb = fitOf(mb, config.threshold), fa = fitOf(ma, config.threshold);
  const ok = fa === "great";

  const save = () => {
    setProfile(draft);
    toast(t(`AI đã chấm lại: ${fitLabel(fb, lang)} → ${fitLabel(fa, lang)}`, `AI再判定：${fitLabel(fb, lang)} → ${fitLabel(fa, lang)}`, `AI rescored: ${fitLabel(fb, lang)} → ${fitLabel(fa, lang)}`), "stars-01");
    router.push(`/worker/jobs/${job.id}?from=${before}&rescored=${job.id}`);
  };

  return (
    <Screen className="max-w-[760px] lg:pt-4">
      <TopBar back={`/worker/jobs/${job.id}`} title={t("Bổ sung thông tin", "プロフィールを追加", "Add profile details")} sub={`${jobTitle(job, lang)} · ${job.company}`} />
      <div className="px-5 lg:px-4 grid gap-4">
        <section className="card p-6 flex items-center gap-5" data-reveal aria-live="polite">
          <div className="grid gap-2">
            <p className="t-sm text-muted">{t("Mức phù hợp sau khi bổ sung", "追加後のマッチ度", "Match after updates")}</p>
            <div className="flex flex-wrap items-center gap-2"><FitBadge level={fb} />{after !== before && <><Icon name="arrow-right" className="text-muted" /><FitBadge level={fa} size="lg" /></>}</div>
            <p className={`t-sm ${ok ? "font-semibold text-brand" : "text-muted"}`}>
              {ok
                ? t("Đã lên mức Rất phù hợp", "「とても合う」に上がりました", "Upgraded to Great match")
                : after > before
                  ? t("Đã tăng, thêm mục nữa để lên Rất phù hợp", "上がりました。さらに追加すると「とても合う」になります", "Improved—add one more to reach Great match")
                  : t("Chọn mục bên dưới để AI chấm lại", "下の項目を選んでAIに再判定させる", "Select items below for AI rescoring")}
            </p>
          </div>
        </section>

        <div data-reveal>
          <h2 className="t-h4 mb-1">{t("AI gợi ý bổ sung", "AIからの追加提案", "AI-suggested updates")}</h2>
          <p className="text-muted mb-4">{t("Chỉ dành cho việc này. Chọn những gì đúng với bạn.", "この求人向けです。実際に当てはまるものだけ選んでください。", "Tailored for this job. Pick only what is true for you.")}</p>
          {suggestions.length === 0 ? (
            <InlineNote>{t("Hồ sơ đã có đủ thông tin cho việc này. Thử xem các việc khác phù hợp hơn.", "この求人に必要な情報はすでに揃っています。他の求人もご覧ください。", "Your profile already covers everything for this role. Check other jobs for better matches.")}</InlineNote>
          ) : (
            <ul className="grid gap-2">
              {suggestions.map((x) => {
                const on = picked.includes(x.id);
                return (
                  <li key={x.id}>
                    <button
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => setPicked((v) => (on ? v.filter((i) => i !== x.id) : [...v, x.id]))}
                      className={`pressable w-full text-left flex items-center gap-4 rounded-[20px] border p-4 bg-surface ${on ? "border-[var(--color-border-accent-solid)] ring-1 ring-[var(--color-border-accent-solid)]" : "border-line"}`}
                    >
                      <span className={`grid size-6 place-items-center rounded-md border shrink-0 transition-colors duration-[var(--motion-fast)] ${on ? "ink border-transparent" : "border-line"}`}>
                        {on && <Icon name="check" size={16} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="font-semibold block">{x.label}</span>
                        <span className="t-sm text-muted">{x.detail}</span>
                      </span>
                      <span className="badge badge-md bg-brand-soft text-brand shrink-0">
                        {fitOf({ ...mb, total: before + x.gain }, config.threshold) === "great"
                          ? t("→ Rất phù hợp", "→ とても合う", "→ Great match")
                          : t("Tăng mức", "マッチ度UP", "Higher fit")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div data-reveal>
          <InlineNote icon="shield-tick">{t("Chỉ chọn thông tin đúng sự thật. HR sẽ kiểm tra chứng chỉ và tay nghề khi phỏng vấn.", "事実のみ選択してください。面接時にHRが資格や経験を確認します。", "Only select accurate details. HR checks certificates and skills at interview.")}</InlineNote>
        </div>
        <Link href="/worker/onboarding?edit=1" className="t-sm underline underline-offset-4 justify-self-start mb-4" data-reveal>{t("Sửa toàn bộ hồ sơ", "プロフィール全体を編集", "Edit full profile")}</Link>
      </div>
      <div className="fixed lg:sticky bottom-0 inset-x-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl border-t border-hair lg:border-0">
        <div className="px-5 lg:px-4 pt-3 pb-3 safe-b">
          <Button size="lg" block icon="stars-01" disabled={!picked.length} onClick={save}>
            {picked.length ? t("Lưu & để AI chấm lại", "保存してAIに再判定させる", "Save & rescore with AI") : t("Chọn ít nhất 1 mục", "1つ以上選択してください", "Select at least 1 item")}
          </Button>
        </div>
      </div>
    </Screen>
  );
}
