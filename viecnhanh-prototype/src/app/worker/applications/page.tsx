"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { BellLink, Screen, TopBar } from "@/components/worker/Shell";
import { AppCard, useMyApps } from "@/components/worker/Applications";
import { useApp } from "@/lib/store";

export default function Applications() {
  const s = useApp();
  const { now, mine, invites, open, closed } = useMyApps();
  const first = s.profile?.name.split(" ").slice(-2).join(" ");
  const summary = invites.length
    ? `Bạn có ${invites.length} lời mời phỏng vấn.`
    : open.length ? `${open.length} hồ sơ đang chờ HR trả lời.` : closed.length ? "Bạn đã có kết quả. Xem bên dưới." : "Bạn chưa gửi hồ sơ nào.";
  const groups = [
    { key: "inv", title: "Lời mời phỏng vấn", list: invites },
    { key: "open", title: "Đang chờ HR trả lời", list: open },
    { key: "closed", title: "Kết quả khác", list: closed },
  ].filter((g) => g.list.length);

  return (
    <Screen deps={[invites.length, open.length, closed.length]}>
      <TopBar title="Hồ sơ đã gửi" right={<BellLink />} />
      <div className="px-5 lg:px-0 max-w-[760px]">
        <div className="mb-5" data-reveal>
          <h1 className="t-h2">Chào {first}</h1>
          <p className={`mt-1 ${invites.length ? "font-semibold text-brand" : "text-muted"}`}>{summary}</p>
        </div>
        {groups.map((g) => (
          <section key={g.key} className="mb-6" aria-labelledby={`g-${g.key}`}>
            <h2 id={`g-${g.key}`} className="t-sub mb-3 flex items-center gap-2" data-reveal>{g.title}<span className="badge tnum">{g.list.length}</span></h2>
            <div className="grid gap-3">{g.list.map((a) => <div key={a.id} data-reveal><AppCard a={a} now={now} /></div>)}</div>
          </section>
        ))}
        {mine.length === 0 && (
          <div className="card-flat p-8 text-center" data-reveal>
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-subtle mb-4"><Icon name="file-check" size={24} /></span>
            <p className="t-sub">Chưa có hồ sơ nào</p>
            <p className="text-muted mt-1 mb-5">Ứng tuyển một việc để HR trả lời trong 24 giờ.</p>
            <Link href="/worker/jobs" className="btn btn-primary pressable">Xem việc phù hợp</Link>
          </div>
        )}
      </div>
    </Screen>
  );
}

