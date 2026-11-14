"use client";
import { Icon } from "@/components/ui";
import { CITIES, JLPT, SKILLS, START_OPTIONS, VISAS, type SkillId } from "@/lib/data";
import { useApp } from "@/lib/store";
import Link from "next/link";

/** Desktop-only right pane when no job is selected: what the AI understood about you. */
export default function JobsIndex() {
  const p = useApp((s) => s.profile)!;
  const start = START_OPTIONS.find((o) => o.days === p.availableInDays);
  return (
    <div className="pt-24 max-w-[560px]">
      <div className="card p-8">
        <p className="t-eyebrow mb-4 flex items-center gap-2"><Icon name="stars-01" solid size={16} />AI hiểu bạn như thế này</p>
        <h2 className="t-h3">{p.name}</h2>
        <dl className="mt-6 grid gap-4">
          <Row k="Visa" v={VISAS[p.visa].vi} />
          <Row k="Kỹ năng" v={(Object.keys(p.skills) as SkillId[]).map((s) => `${SKILLS[s].vi} ${p.skills[s]} năm`).join(" · ")} />
          <Row k="Tiếng Nhật" v={JLPT[p.jlpt]} />
          <Row k="Bắt đầu" v={start ? `${start.vi} · ${start.sub}` : `${p.availableInDays} ngày`} />
          <Row k="Khu vực" v={`${CITIES[p.city].vi}${p.relocate ? " · sẵn sàng ở ký túc xá" : ""}`} />
        </dl>
        <Link href="/worker/onboarding?edit=1" className="btn btn-tertiary pressable mt-8"><Icon name="edit-02" />Sửa hồ sơ</Link>
      </div>
      <p className="t-sm text-muted mt-4 flex gap-2"><Icon name="arrow-left" size={16} className="mt-0.5" />Chọn một việc để xem lý do AI chấm điểm và lương thực nhận.</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="grid grid-cols-[110px_1fr] gap-4"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
