"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Button, FitBadge, Icon } from "@/components/ui";
import { AIThinking } from "@/components/worker/Blocks";
import { CERTS, CITIES, JLPT, JOBS, SKILLS, VISAS, type SkillId } from "@/lib/data";
import { takeHome, yen } from "@/lib/pay";
import { fitOf, scoreMatch } from "@/lib/scoring";
import { useApp } from "@/lib/store";
import { enter, useGSAP } from "@/lib/motion";

export default function Analyzing() {
  const router = useRouter();
  const profile = useApp((s) => s.profile)!;
  const cfg = useApp((s) => s.config);
  const [done, setDone] = useState(false);
  const result = useRef<HTMLDivElement>(null);

  const ranked = useMemo(
    () => JOBS.map((j) => { const m = scoreMatch(profile, j, cfg.weights); return { j, m, fit: fitOf(m, cfg.threshold) }; }).sort((a, b) => b.m.total - a.m.total),
    [profile, cfg.weights, cfg.threshold],
  );
  const great = ranked.filter((r) => r.fit === "great");
  const possible = ranked.filter((r) => r.m.gate.pass && r.fit === "possible");
  const hidden = ranked.filter((r) => !r.m.gate.pass);
  const skills = (Object.keys(profile.skills) as SkillId[]).map((s) => `${SKILLS[s].vi} ${profile.skills[s] || "<1"} năm`);
  const certs = profile.certs.map((c) => CERTS[c].vi);
  const extra = [profile.otherSkills?.trim(), profile.otherCerts?.trim()].filter(Boolean).join(" · ");

  const steps = [
    { title: "Đọc thẻ cư trú", sub: `${VISAS[profile.visa].vi}` },
    { title: `Kiểm tra visa với ${JOBS.length} nhà máy`, sub: hidden.length ? `Ẩn ${hidden.length} việc visa không cho phép` : "Visa hợp lệ với tất cả việc" },
    { title: "So kỹ năng & chứng chỉ", sub: skills.join(", ") },
    { title: "Tính đường đi & lương thực nhận", sub: `Từ ${CITIES[profile.city].vi}, đã trừ thuế và bảo hiểm; chi phí chỗ ở theo lựa chọn hồ sơ` },
    { title: "Xếp việc theo mức phù hợp", sub: `${great.length} việc rất phù hợp` },
  ];

  useGSAP(() => { if (done) enter("[data-res]", { y: 24 }, { stagger: 0.08, duration: 0.9 }); }, { scope: result, dependencies: [done] });

  // What the AI understood, in plain words with icons (replaces the raw data block).
  const facts = [
    { icon: "shield-tick" as const, k: "Visa", v: VISAS[profile.visa].vi, ok: !VISAS[profile.visa].block },
    { icon: "tool-02" as const, k: "Tay nghề", v: skills.length ? skills.join(" · ") : "Chưa chọn kỹ năng trong danh sách", ok: skills.length > 0 },
    { icon: "certificate" as const, k: "Chứng chỉ", v: certs.length ? certs.join(" · ") : "Chưa có trong danh sách — có thể bổ sung sau", ok: certs.length > 0 },
    { icon: "translate" as const, k: "Tiếng Nhật", v: JLPT[profile.jlpt], ok: profile.jlpt >= 2 },
    ...(extra ? [{ icon: "edit-02" as const, k: "Bạn tự ghi thêm · HR sẽ xem, AI chưa tính điểm", v: extra, ok: false }] : []),
    { icon: "marker-pin-02" as const, k: "Nơi ở", v: `${CITIES[profile.city].vi}, Aichi${profile.relocate ? " · ở được ký túc xá" : ""}`, ok: true },
  ];

  return (
    <div className="min-h-dvh mx-auto w-full max-w-[640px] px-5 md:px-0 pt-10 pb-36">
      <p className="t-eyebrow mb-3 flex items-center gap-2 !text-brand"><Icon name="stars-01" solid size={16} />AI đang dựng hồ sơ</p>
      <h1 className="t-h2 mb-6">{done ? (great.length ? `Có ${great.length} việc rất phù hợp với bạn` : "AI đã kiểm tra hồ sơ của bạn") : "Chờ một chút, AI đang đọc hồ sơ…"}</h1>

      <div className={`card p-5 ${done ? "hidden" : ""}`}>
        <AIThinking steps={steps} onDone={() => setDone(true)} />
        <div className="mt-4 pt-3 hair-t flex justify-end">
          <Button size="sm" variant="flat" iconRight="arrow-right" onClick={() => setDone(true)}>Xem kết quả ngay</Button>
        </div>
      </div>

      <div ref={result} className={done ? "grid gap-4" : "hidden"}>
        <section data-res className="card p-5" aria-labelledby="ai-h">
          <h2 id="ai-h" className="t-sub mb-1">AI hiểu về bạn như sau</h2>
          <p className="t-sm text-muted mb-4">Sai chỗ nào bạn có thể sửa lại sau trong mục Tôi.</p>
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
          <h2 id="great-h" className="t-h4 mb-3 flex items-center gap-2">Rất phù hợp <span className="badge badge-md bg-brand-soft text-brand tnum">{great.length}</span></h2>
          <ul className="grid gap-2">{great.map((r) => <JobRow key={r.j.id} r={r} relocate={profile.relocate} />)}</ul>
          {!great.length && <p className="text-muted">{possible.length ? "Chưa có việc rất phù hợp. Xem các việc có thể phù hợp bên dưới." : "Chưa có việc rất phù hợp. Xem tất cả việc để biết lý do và kiểm tra lại hồ sơ."}</p>}
        </section>

        {possible.length > 0 && (
          <section data-res aria-labelledby="pos-h">
            <h2 id="pos-h" className="t-h4 mb-1 flex items-center gap-2">Có thể phù hợp <span className="badge badge-md tnum">{possible.length}</span></h2>
            <p className="t-sm text-muted mb-3">Mức gợi ý tổng hợp nhiều tiêu chí. Bạn vẫn có thể xem và quyết định ứng tuyển.</p>
            <ul className="grid gap-2">{possible.map((r) => <JobRow key={r.j.id} r={r} relocate={profile.relocate} />)}</ul>
          </section>
        )}

        {hidden.length > 0 && (
          <p data-res className="t-sm text-muted flex gap-2 rounded-2xl border border-dashed border-line p-4"><Icon name="lock-01" size={18} />{hidden.length} việc đã ẩn vì visa của bạn không cho phép làm ngành đó.</p>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl border-t border-hair">
        <div className="mx-auto max-w-[640px] px-5 md:px-0 pt-3 safe-b">
          <Button size="lg" block disabled={!done} onClick={() => router.push("/worker/jobs")} iconRight="arrow-right">{done ? "Xem tất cả việc" : "Đang chấm điểm…"}</Button>
        </div>
      </div>
    </div>
  );
}

function JobRow({ r, relocate }: { r: { j: (typeof JOBS)[number]; fit: "great" | "possible" | "not" }; relocate: boolean }) {
  const pay = takeHome(r.j, relocate);
  return (
    <li>
      <Link href={`/worker/jobs/${r.j.id}`} className="card pressable flex items-center gap-4 p-4 hover:shadow-[var(--shadow-bottom-2)]">
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${r.fit === "great" ? "ink" : "bg-brand-soft text-brand"}`}><Icon name="building-02" /></span>
        <span className="flex-1 min-w-0">
          <span className="font-semibold block truncate">{r.j.title}</span>
          <span className="t-sm text-muted block truncate">{r.j.company} · {CITIES[r.j.city].vi}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-2"><FitBadge level={r.fit} /><span className="t-sm font-semibold tnum">{yen(pay.net)}<span className="text-muted font-normal">/tháng ước tính</span></span></span>
          <span className="t-sm text-muted block mt-1">{pay.housingNote}</span>
        </span>
        <Icon name="chevron-right-01" className="text-faint" />
      </Link>
    </li>
  );
}
