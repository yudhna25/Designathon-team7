"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Icon, Segmented, toast } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { AppCard, useMyApps } from "@/components/worker/Applications";
import { CERTS, CITIES, JLPT, SKILLS, START_OPTIONS, VISAS, type SkillId } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function Profile() {
  const router = useRouter();
  const { profile: p, auth, safetyDone, config, setConfig, logout, scanned } = useApp();
  if (!p) return null;
  const start = START_OPTIONS.find((o) => o.days === p.availableInDays);
  return (
    <Screen>
      <TopBar title="Hồ sơ của tôi" />
      {/* Desktop: 2 cột — trái là thông tin cá nhân (sticky), phải là dashboard ứng tuyển. Mobile xếp chồng. */}
      <div className="px-5 lg:px-0 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-4 max-w-[640px] lg:sticky lg:top-[136px]">
        <section className="card p-6 flex items-center gap-4" data-reveal>
          <Avatar name={p.name} size={64} />
          <div className="min-w-0">
            <h1 className="t-h4 truncate">{p.name}</h1>
            <p className="t-sm text-muted">Đăng nhập bằng {auth?.method === "line" ? "LINE" : auth?.method === "phone" ? "số điện thoại" : "Zalo"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Verify label="Visa" state={scanned ? "ok" : "none"} />
              <Verify label="Thẻ cư trú" state={scanned ? "ok" : "none"} />
              <Verify label="Chứng chỉ" state={p.certs.length ? "pending" : "none"} />
              {safetyDone && <span className="badge"><Icon name="award-01" size={14} />An toàn: hoàn thành</span>}
            </div>
          </div>
        </section>

        <section className="card p-6" data-reveal aria-labelledby="pf-h">
          <div className="flex items-center justify-between mb-4">
            <h2 id="pf-h" className="t-sub">Hồ sơ AI dùng để chấm điểm</h2>
          </div>
          <dl className="grid gap-4">
            <Group title="Visa, thời gian & địa điểm" step={0}>
              <Row k="Tư cách lưu trú" v={`${VISAS[p.visa].vi} · hạn ${p.cardExpiry.split("-").reverse().join("/")}`} />
              <Row k="Bắt đầu" v={start ? `${start.vi} · ${start.sub}` : `${p.availableInDays} ngày`} />
              <Row k="Nơi ở" v={`${CITIES[p.city].vi}${p.relocate ? " · sẵn sàng ở ký túc xá" : ""}`} />
            </Group>
            <Group title="Kỹ năng & chứng chỉ" step={1}>
              <Row k="Kỹ năng" v={(Object.keys(p.skills) as SkillId[]).map((s) => `${SKILLS[s].vi} · ${p.skills[s]} năm`).join("\n")} />
              <Row k="Chứng chỉ" v={p.certs.length ? p.certs.map((c) => CERTS[c].vi).join("\n") : "Chưa có"} />
              {(p.otherSkills?.trim() || p.otherCerts?.trim()) && <Row k="Tự ghi thêm" v={[p.otherSkills?.trim(), p.otherCerts?.trim()].filter(Boolean).join("\n")} />}
              <Row k="Tiếng Nhật" v={JLPT[p.jlpt]} />
            </Group>
          </dl>
        </section>

        <section className="card p-6 grid gap-4" data-reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium">Giao diện</span>
            <div className="w-full sm:w-[240px]"><Segmented size="sm" label="Giao diện" value={config.theme} onChange={(v) => setConfig({ theme: v })} options={[{ value: "system", label: "Tự động" }, { value: "light", label: "Sáng" }, { value: "dark", label: "Tối" }]} /></div>
          </div>
          <button onClick={() => toast("Bản demo: nút này mở Zalo OA hỗ trợ tiếng Việt", "message-chat-circle")} className="flex items-center gap-3 py-1 text-left"><Icon name="message-chat-circle" /><span className="flex-1"><b className="block">Hỗ trợ tiếng Việt</b><span className="t-sm text-muted">Nhắn Zalo OA · 7h–22h mỗi ngày</span></span><Icon name="chevron-right-01" className="text-faint" /></button>
        </section>

        <div data-reveal>
          <Button block variant="flat" icon="log-out-01" onClick={() => { logout(); router.push("/worker"); }}>Đăng xuất</Button>
        </div>
      </div>
      <ApplicationsDashboard />
      </div>
    </Screen>
  );
}

/** Cột phải: tổng quan tiến độ ứng tuyển + danh sách hồ sơ đã gửi (trước đây là tab riêng trên header). */
function ApplicationsDashboard() {
  const { now, mine, invites, open, closed } = useMyApps();
  const total = mine.length;
  const stats = [
    { k: "Đã gửi", v: total, icon: "send-01" },
    { k: "Đang chờ HR", v: open.length, icon: "hourglass" },
    { k: "Mời phỏng vấn", v: invites.length, icon: "calendar-check" },
    { k: "Đã đóng", v: closed.length, icon: "x-circle" },
  ] as const;
  const seg = [
    { n: invites.length, cls: "bg-solid", label: "Mời phỏng vấn" },
    { n: open.length, cls: "bg-fg/55", label: "Đang chờ" },
    { n: closed.length, cls: "bg-fg/20", label: "Đã đóng" },
  ];
  const groups = [
    { key: "inv", title: "Lời mời phỏng vấn", list: invites },
    { key: "open", title: "Đang chờ HR trả lời", list: open },
    { key: "closed", title: "Kết quả khác", list: closed },
  ].filter((g) => g.list.length);

  return (
    <div id="ung-tuyen" className="grid gap-4 min-w-0 scroll-mt-[140px]">
      <section className="card p-6" data-reveal aria-labelledby="dash-h">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 id="dash-h" className="t-h4">Tiến độ ứng tuyển</h2>
          <Link href="/worker/jobs" className="btn btn-sm btn-secondary pressable"><Icon name="search-md" size={16} />Tìm thêm việc</Link>
        </div>
        <dl className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {stats.map((x) => (
            <div key={x.k} className="well p-4">
              <dt className="flex items-center gap-2 t-sm text-muted"><Icon name={x.icon} size={16} />{x.k}</dt>
              <dd className="mt-2 t-h2 tnum">{x.v}</dd>
            </div>
          ))}
        </dl>
        {total > 0 && (
          <div className="mt-5">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-subtle" role="img" aria-label={seg.map((x) => `${x.label}: ${x.n}`).join(", ")}>
              {seg.filter((x) => x.n).map((x) => <span key={x.label} className={x.cls} style={{ width: `${(x.n / total) * 100}%` }} />)}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 t-sm text-muted">
              {seg.map((x) => <li key={x.label} className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${x.cls}`} />{x.label} · <span className="tnum">{x.n}</span></li>)}
            </ul>
          </div>
        )}
      </section>

      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`pg-${g.key}`}>
          <h3 id={`pg-${g.key}`} className="t-sub mb-3 flex items-center gap-2" data-reveal>{g.title}<span className="badge tnum">{g.list.length}</span></h3>
          <div className="grid gap-3">{g.list.map((a) => <div key={a.id} data-reveal><AppCard a={a} now={now} /></div>)}</div>
        </section>
      ))}
      {total === 0 && (
        <div className="card-flat p-8 text-center" data-reveal>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-subtle mb-4"><Icon name="file-check" size={24} /></span>
          <p className="t-sub">Chưa có hồ sơ nào</p>
          <Link href="/worker/jobs" className="btn btn-primary pressable mt-4">Xem việc phù hợp</Link>
        </div>
      )}
    </div>
  );
}

function Group({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 pb-4 hair-b last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{title}</p>
        <Link href={`/worker/onboarding?edit=1&step=${step}`} className="btn btn-xs btn-secondary pressable" aria-label={`Sửa ${title}`}><Icon name="edit-02" size={16} />Sửa</Link>
      </div>
      {children}
    </div>
  );
}

function Verify({ label, state }: { label: string; state: "ok" | "pending" | "none" }) {
  const text = state === "ok" ? "Đã xác minh" : state === "pending" ? "Đang xác minh" : "Chưa có";
  return (
    <span className={`badge ${state === "ok" ? "bg-[var(--color-bg-positive-subtle)] text-[var(--color-content-positive-base)]" : state === "pending" ? "bg-brand-soft text-brand" : "badge-dash"}`}>
      <Icon name={state === "ok" ? "shield-tick" : state === "pending" ? "hourglass" : "info-circle"} size={14} />{label}: {text}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="grid grid-cols-[120px_1fr] gap-4"><dt className="text-muted">{k}</dt><dd className="font-medium whitespace-pre-line">{v}</dd></div>;
}
