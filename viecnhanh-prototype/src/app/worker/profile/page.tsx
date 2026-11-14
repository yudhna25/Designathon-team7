"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Icon, Segmented, toast } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { CERTS, CITIES, JLPT, SKILLS, START_OPTIONS, VISAS, type SkillId } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function Profile() {
  const router = useRouter();
  const { profile: p, auth, safetyDone, config, setConfig, logout } = useApp();
  if (!p) return null;
  const start = START_OPTIONS.find((o) => o.days === p.availableInDays);
  return (
    <Screen>
      <TopBar title="Tôi" />
      <div className="px-5 lg:px-0 max-w-[640px] grid gap-4">
        <section className="card p-6 flex items-center gap-4" data-reveal>
          <Avatar name={p.name} size={64} />
          <div className="min-w-0">
            <h1 className="t-h4 truncate">{p.name}</h1>
            <p className="t-sm text-muted">Đăng nhập bằng {auth?.method === "line" ? "LINE" : auth?.method === "phone" ? "số điện thoại" : "Zalo"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="badge badge-solid"><Icon name="shield-tick" size={14} />Visa đã kiểm tra</span>
              {safetyDone && <span className="badge"><Icon name="award-01" size={14} />An toàn: hoàn thành</span>}
            </div>
          </div>
        </section>

        <section className="card p-6" data-reveal aria-labelledby="pf-h">
          <div className="flex items-center justify-between mb-4">
            <h2 id="pf-h" className="t-sub">Hồ sơ AI dùng để chấm điểm</h2>
            <Link href="/worker/onboarding?edit=1" className="btn btn-xs btn-secondary pressable"><Icon name="edit-02" size={16} />Sửa</Link>
          </div>
          <dl className="grid gap-4">
            <Row k="Tư cách lưu trú" v={`${VISAS[p.visa].vi} · hạn ${p.cardExpiry.split("-").reverse().join("/")}`} />
            <Row k="Kỹ năng" v={(Object.keys(p.skills) as SkillId[]).map((s) => `${SKILLS[s].vi} · ${p.skills[s]} năm`).join("\n")} />
            <Row k="Chứng chỉ" v={p.certs.length ? p.certs.map((c) => CERTS[c].vi).join("\n") : "Chưa có"} />
            {(p.otherSkills?.trim() || p.otherCerts?.trim()) && <Row k="Tự ghi thêm" v={[p.otherSkills?.trim(), p.otherCerts?.trim()].filter(Boolean).join("\n")} />}
            <Row k="Tiếng Nhật" v={JLPT[p.jlpt]} />
            <Row k="Bắt đầu" v={start ? `${start.vi} · ${start.sub}` : `${p.availableInDays} ngày`} />
            <Row k="Nơi ở" v={`${CITIES[p.city].vi}${p.relocate ? " · sẵn sàng ở ký túc xá" : ""}`} />
          </dl>
        </section>

        <section className="card p-6 grid gap-4" data-reveal>
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">Giao diện</span>
            <div className="w-[240px]"><Segmented size="sm" label="Giao diện" value={config.theme} onChange={(v) => setConfig({ theme: v })} options={[{ value: "system", label: "Tự động" }, { value: "light", label: "Sáng" }, { value: "dark", label: "Tối" }]} /></div>
          </div>
          <button onClick={() => toast("Bản demo: nút này mở Zalo OA hỗ trợ tiếng Việt", "message-chat-circle")} className="flex items-center gap-3 py-1 text-left"><Icon name="message-chat-circle" /><span className="flex-1"><b className="block">Hỗ trợ tiếng Việt</b><span className="t-sm text-muted">Nhắn Zalo OA · 7h–22h mỗi ngày</span></span><Icon name="chevron-right-01" className="text-faint" /></button>
        </section>

        <div data-reveal>
          <Button block variant="flat" icon="log-out-01" onClick={() => { logout(); router.push("/worker"); }}>Đăng xuất</Button>
        </div>
      </div>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="grid grid-cols-[120px_1fr] gap-4"><dt className="text-muted">{k}</dt><dd className="font-medium whitespace-pre-line">{v}</dd></div>;
}
