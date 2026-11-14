"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { CITIES, JLPT, SKILLS, START_OPTIONS, VISAS, type SkillId } from "@/lib/data";
import { fmtDate, legalPath } from "@/lib/start";
import { useApp, useNow } from "@/lib/store";

/** Desktop right rail on the jobs home: what the AI understood, the assistant, and the road to day one. */
export default function JobsIndex() {
  const p = useApp((s) => s.profile)!;
  const now = useNow(60000);
  const start = START_OPTIONS.find((o) => o.days === p.availableInDays);
  const steps = legalPath(p, now + 864e5);
  return (
    <div className="grid gap-4 lg:sticky lg:top-6">
      <section className="card p-5">
        <p className="t-eyebrow mb-3 flex items-center gap-2"><Icon name="stars-01" solid size={16} />AI hiểu bạn</p>
        <h2 className="t-sub">{p.name}</h2>
        <p className="t-sm text-muted">{p.province ? `Quê ${p.province} · ` : ""}đang ở {CITIES[p.city].vi}</p>
        <dl className="mt-4 grid gap-2.5 t-sm">
          <Row k="Tay nghề" v={(Object.keys(p.skills) as SkillId[]).map((s) => `${SKILLS[s].vi} · ${p.skills[s]} năm`).join(", ")} />
          <Row k="Tiếng Nhật" v={JLPT[p.jlpt]} />
          <Row k="Visa" v={VISAS[p.visa].vi} />
          <Row k="Sẵn sàng" v={start ? `${start.vi} · ${start.sub}` : `${p.availableInDays} ngày`} />
        </dl>
        <Link href="/worker/profile" className="btn btn-tertiary btn-sm pressable mt-4 w-full"><Icon name="edit-02" size={16} />Sửa hồ sơ</Link>
      </section>

      <Link href="/worker/ask" className="card-flat p-5 pressable block bg-brand-soft">
        <p className="font-semibold flex items-center gap-2"><Icon name="stars-01" solid size={18} />Trợ lý AI của bạn</p>
        <p className="t-sm text-muted mt-1">Hỏi về lương, ký túc xá hay ngày bắt đầu, bằng tiếng Việt.</p>
        <span className="mt-3 block rounded-full bg-surface border border-hair px-4 py-2.5 t-sm font-medium">“Việc nào lương thực nhận trên ¥200k?”</span>
      </Link>

      <section className="card p-5" aria-labelledby="road-h">
        <h2 id="road-h" className="t-sub">Lộ trình đến ngày đi làm</h2>
        <p className="t-sm text-muted">{VISAS[p.visa].short} · các mốc là dự kiến</p>
        <ol className="mt-4 grid gap-3">
          {steps.map((st, i) => (
            <li key={st.key} className="flex gap-3">
              <span className={`mt-1 size-3 shrink-0 rounded-full ${i === 0 ? "bg-[#1B22A7]" : "border-2 border-[var(--c-input-border)]"}`} aria-hidden />
              <span className="min-w-0">
                <b className="block t-sm">{st.label}</b>
                <span className="t-sm text-muted">{fmtDate(st.at)} · dự kiến{st.legal ? " · thủ tục bắt buộc" : ""}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="grid grid-cols-[88px_1fr] gap-3"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
