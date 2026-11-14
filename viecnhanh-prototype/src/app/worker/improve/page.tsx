"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Button, FitBadge, Icon, InlineNote, toast } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { jobById } from "@/lib/data";
import { FIT_VI, fitOf, scoreMatch, suggestImprovements } from "@/lib/scoring";
import { useApp } from "@/lib/store";

export default function Page() {
  return <Suspense><Improve /></Suspense>;
}

function Improve() {
  const router = useRouter();
  const jobId = useSearchParams().get("job") ?? "";
  const job = jobById(jobId);
  const { profile, config, setProfile } = useApp();
  const p = profile!;
  const [picked, setPicked] = useState<string[]>([]);
  const suggestions = useMemo(() => (job ? suggestImprovements(p, job, config.weights) : []), [p, job, config.weights]);
  if (!job) return <div className="p-8"><Link className="underline" href="/worker/jobs">Về danh sách việc</Link></div>;

  const draft = suggestions.filter((x) => picked.includes(x.id)).reduce((q, x) => x.apply(q), p);
  const mb = scoreMatch(p, job, config.weights), ma = scoreMatch(draft, job, config.weights);
  const before = mb.total, after = ma.total;
  const fb = fitOf(mb, config.threshold), fa = fitOf(ma, config.threshold);
  const ok = fa === "great";

  const save = () => {
    setProfile(draft);
    toast(`AI đã chấm lại: ${FIT_VI[fb]} → ${FIT_VI[fa]}`, "stars-01");
    router.push(`/worker/jobs/${job.id}?from=${before}&rescored=${job.id}`);
  };

  return (
    <Screen className="max-w-[760px] lg:pt-4">
      <TopBar back={`/worker/jobs/${job.id}`} title="Bổ sung thông tin" sub={`${job.title} · ${job.company}`} />
      <div className="px-5 lg:px-4 grid gap-4">
        <section className="card p-6 flex items-center gap-5" data-reveal aria-live="polite">
          <div className="grid gap-2">
            <p className="t-sm text-muted">Mức phù hợp sau khi bổ sung</p>
            <div className="flex flex-wrap items-center gap-2"><FitBadge level={fb} />{after !== before && <><Icon name="arrow-right" className="text-muted" /><FitBadge level={fa} size="lg" /></>}</div>
            <p className={`t-sm ${ok ? "font-semibold text-brand" : "text-muted"}`}>{ok ? "Đã lên mức Rất phù hợp" : after > before ? "Đã tăng, thêm mục nữa để lên Rất phù hợp" : "Chọn mục bên dưới để AI chấm lại"}</p>
          </div>
        </section>

        <div data-reveal>
          <h2 className="t-h4 mb-1">AI gợi ý bổ sung</h2>
          <p className="text-muted mb-4">Chỉ dành cho việc này. Chọn những gì đúng với bạn.</p>
          {suggestions.length === 0 ? (
            <InlineNote>Hồ sơ đã có đủ thông tin cho việc này. Thử xem các việc khác phù hợp hơn.</InlineNote>
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
                      <span className="badge badge-md bg-brand-soft text-brand shrink-0">{fitOf({ ...mb, total: before + x.gain }, config.threshold) === "great" ? "→ Rất phù hợp" : "Tăng mức"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div data-reveal>
          <InlineNote icon="shield-tick">Chỉ chọn thông tin đúng sự thật. HR sẽ kiểm tra chứng chỉ và tay nghề khi phỏng vấn.</InlineNote>
        </div>
        <Link href="/worker/onboarding?edit=1" className="t-sm underline underline-offset-4 justify-self-start mb-4" data-reveal>Sửa toàn bộ hồ sơ</Link>
      </div>
      <div className="fixed lg:sticky bottom-0 inset-x-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl border-t border-hair lg:border-0">
        <div className="px-5 lg:px-4 pt-3 pb-3 safe-b">
          <Button size="lg" block icon="stars-01" disabled={!picked.length} onClick={save}>
            {picked.length ? "Lưu & để AI chấm lại" : "Chọn ít nhất 1 mục"}
          </Button>
        </div>
      </div>
    </Screen>
  );
}
