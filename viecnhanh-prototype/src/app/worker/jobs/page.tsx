"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { PeersTile } from "@/components/worker/Bento";
import { CompanyLogo } from "@/components/worker/JobRow";
import { CITIES, JLPT, JOBS, PEERS, SKILLS, START_OPTIONS, VISAS, type SkillId } from "@/lib/data";
import { scoreMatch } from "@/lib/scoring";
import { useApp, useViewer } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

/** Desktop right rail on the jobs home: AI summary, the assistant, and workplaces with Vietnamese workers. */
export default function JobsIndex() {
  const t = useT();
  const ja = useLang() === "ja";
  const { p, guest } = useViewer();
  const weights = useApp((s) => s.config.weights);
  const start = START_OPTIONS.find((o) => o.days === p.availableInDays);
  // Việc hợp visa có người Việt đang làm, đông người trước.
  const peerJobs = JOBS.filter((j) => PEERS[j.id] && scoreMatch(p, j, weights).gate.pass).sort((a, b) => PEERS[b.id].count - PEERS[a.id].count);
  return (
    <div className="grid gap-4 lg:sticky lg:top-6">
      {guest ? (
        <section className="card p-5">
          <p className="t-eyebrow mb-3 flex items-center gap-2"><Icon name="stars-01" solid size={16} />{t("AI tóm tắt về bạn", "AIによるあなたの要約")}</p>
          <h2 className="t-sub">{t("Chưa đăng nhập", "未ログイン")}</h2>
          <p className="t-sm text-muted mt-1">{t("Đăng nhập bằng Zalo, trả lời 3 câu để AI chấm mức phù hợp cho từng việc.", "Zaloでログインし3つの質問に答えると、AIが各求人の適合度を評価します。")}</p>
          <Link href="/worker" className="btn btn-primary btn-sm pressable mt-4 w-full">{t("Đăng nhập", "ログイン")}</Link>
        </section>
      ) : (
      <section className="card p-5">
        <p className="t-eyebrow mb-3 flex items-center gap-2"><Icon name="stars-01" solid size={16} />{t("AI tóm tắt về bạn", "AIによるあなたの要約")}</p>
        <div className="flex items-center justify-between gap-2">
          <h2 className="t-sub min-w-0 truncate">{p.name}</h2>
          <Link href="/worker/profile" className="icon-btn sm pressable shrink-0 -mr-2 text-muted hover:text-fg" aria-label={t("Sửa hồ sơ", "プロフィールを編集")} title={t("Sửa hồ sơ", "プロフィールを編集")}><Icon name="edit-02" size={18} /></Link>
        </div>
        <p className="t-sm text-muted">{ja ? `現住所：${CITIES[p.city].ja}` : `Đang ở ${CITIES[p.city].vi}`}</p>
        <dl className="mt-4 grid gap-2.5 t-sm">
          <Row k={t("Tay nghề", "スキル")} v={(Object.keys(p.skills) as SkillId[]).map((s) => (ja ? `${SKILLS[s].ja} · ${p.skills[s]}年` : `${SKILLS[s].vi} · ${p.skills[s]} năm`)).join(ja ? "、" : ", ")} />
          <Row k={t("Tiếng Nhật", "日本語")} v={ja && p.jlpt === 0 ? "なし" : JLPT[p.jlpt]} />
          <Row k={t("Visa", "在留資格")} v={ja ? VISAS[p.visa].ja : VISAS[p.visa].vi} />
          <Row k={t("Sẵn sàng", "開始可能")} v={ja ? `${p.availableInDays === 0 ? "すぐに" : `${p.availableInDays}日後`}` : start ? `${start.vi} · ${start.sub}` : `${p.availableInDays} ngày`} />
        </dl>
      </section>
      )}

      <Link href="/worker/ask" className="card-flat p-5 pressable block bg-brand-soft">
        <p className="font-semibold flex items-center gap-2"><Icon name="stars-01" solid size={18} />{t("Trợ lý AI của bạn", "あなたのAIアシスタント")}</p>
        <p className="t-sm text-muted mt-1">{t("Hỏi về lương, ký túc xá hay ngày bắt đầu, bằng tiếng Việt.", "給与・寮・開始日についてベトナム語で質問できます。")}</p>
        <span className="mt-3 block rounded-full bg-surface border border-hair px-4 py-2.5 t-sm font-medium">{t("“Việc nào lương thực nhận trên ¥200k?”", "「手取り¥20万以上の求人は？」")}</span>
      </Link>

      {peerJobs.length > 0 && (
        <section className="card p-5" aria-labelledby="peers-h">
          <h2 id="peers-h" className="t-sub mb-3">{t("Có người Việt đang làm", "ベトナム人が働いている職場")}</h2>
          <PeersTile jobId={peerJobs[0].id} className="!p-0 !bg-transparent" />
          <ul className="mt-4 grid gap-1 border-t border-hair pt-3">
            {peerJobs.map((j) => (
              <li key={j.id}>
                <Link href={`/worker/jobs/${j.id}`} className="pressable -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-pale">
                  <CompanyLogo job={j} size={36} />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate t-sm">{j.title}</b>
                    <span className="block truncate t-sm text-muted">{j.company} · {t(`${PEERS[j.id].count} người Việt`, `ベトナム人${PEERS[j.id].count}名`)}</span>
                  </span>
                  <Icon name="chevron-right-01" size={16} className="text-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="grid grid-cols-[88px_1fr] gap-3"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
