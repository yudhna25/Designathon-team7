"use client";
import Link from "next/link";
import { useState } from "react";
import { SenpaiSheet } from "./SenpaiSheet";
import { useRouter } from "next/navigation";
import { loginThenReturn } from "@/lib/store";
import { PEERS, type Job, type Profile } from "@/lib/data";
import { SHOWCASE } from "@/lib/showcase";
import { suggestImprovements, type Chip, type Fit } from "@/lib/scoring";
import { deadlineOf, fmtLeft, isClosed, useApp, useNow, type Application } from "@/lib/store";
import { Avatar, Icon, MatchChips, ScoreRing } from "../ui";
import { useLang, useT, type WLang } from "@/lib/i18n";

const PEER_QUOTES: Record<string, { en: string; ja: string }> = {
  pe1: { en: "Overtime matches the post, and the dorm is clean.", ja: "残業は募集通りで、寮もきれいです。" },
  pe2: { en: "Friendly Japanese team lead who teaches patiently.", ja: "日本人の班長が優しく丁寧に教えてくれます。" },
  pe3: { en: "Night shifts are a bit tiring, but the allowance is great.", ja: "夜勤は少し疲れますが、手当が良いです。" },
  pe4: { en: "Steady work, slightly less overtime than advertised.", ja: "仕事は安定していて、残業は表記より少なめです。" },
};
const quoteText = (id: string, viQuote: string, lang: WLang) => (lang === "vi" ? viQuote : (PEER_QUOTES[id]?.[lang] ?? viQuote));

/** "Người Việt ở đây": social proof + the door to an anonymous hometown senpai. */
export function PeersTile({ jobId, className = "", onSeePeers }: { jobId: string; className?: string; onSeePeers?: () => void }) {
  const t = useT();
  const lang = useLang();
  const data = PEERS[jobId];
  const [ask, setAsk] = useState(false);
  const router = useRouter();
  const authed = useApp((s) => !!s.auth && !!s.profile);
  if (!data) {
    return (
      <section className={`card-flat p-4 ${className}`} aria-label={t("Người Việt ở đây", "この職場のベトナム人")}>
        <p className="t-sm font-semibold text-muted">{t("Người Việt ở đây", "この職場のベトナム人")}</p>
        <p className="mt-1">{t("Chưa có người Việt nào làm ở đây. Bạn có thể là người đầu tiên.", "まだベトナム人はいません。あなたが最初の一人になれます。")}</p>
        {onSeePeers ? (
          <button type="button" onClick={onSeePeers} className="t-sm font-semibold text-brand mt-2 inline-flex items-center gap-1 underline underline-offset-4">{t("Xem việc có người Việt", "ベトナム人がいる求人を見る")}</button>
        ) : (
          <Link href="/worker/jobs/mikawa-cnc" className="t-sm font-semibold text-brand mt-2 inline-flex items-center gap-1 underline underline-offset-4">{t("Xem việc có người Việt", "ベトナム人がいる求人を見る")}</Link>
        )}
      </section>
    );
  }
  const lead = data.peers[0];
  const canAsk = data.peers.some((x) => x.askable && x.attendanceVerified);
  return (
    <section className={`card-flat p-4 ${className}`} aria-label={t("Người Việt ở đây", "この職場のベトナム人")}>
      <div className="flex items-start gap-3">
        <span className="flex mt-0.5">{data.peers.slice(0, 3).map((x, i) => <span key={x.id} className={i ? "-ml-2" : ""}><Avatar name={x.name} size={32} src={SHOWCASE.avatars[x.id]} /></span>)}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t(`${data.count} người Việt đang làm ở đây`, `ベトナム人${data.count}名が在籍`)}</p>
          <p className="t-sm text-muted line-clamp-2">“{quoteText(lead.id, lead.quote, lang)}” · {lead.name.split(" ").pop()}</p>
        </div>
        <span className="ml-auto text-[18px] font-bold text-brand tnum shrink-0">{lang === "vi" ? lead.rating.toFixed(1).replace(".", ",") : lead.rating.toFixed(1)}★</span>
      </div>
      {canAsk && (
        <button className="btn btn-secondary btn-sm pressable mt-3 w-full" onClick={() => (authed ? setAsk(true) : router.push(loginThenReturn(location.pathname)))}>
          <Icon name="message-chat-circle" size={16} />{t("Hỏi Senpai · ẩn danh", "先輩に匿名で質問")}
        </button>
      )}
      {authed && <SenpaiSheet jobId={jobId} open={ask} onClose={() => setAsk(false)} />}
    </section>
  );
}

/** Bento under the pass. Tiles change with the pass in view. */
export function Bento({ job, p, chips, fit, app, onSeePeers }: { job: Job; p: Profile; chips: Chip[]; fit: Fit; app?: Application; onSeePeers?: () => void }) {
  const t = useT();
  const lang = useLang();
  const s = useApp();
  const now = useNow();
  const open = app && !isClosed(app, s);
  const steps = fit === "great" ? 0 : Math.max(1, suggestImprovements(p, job, s.config.weights).length);
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      <PeersTile key={job.id} jobId={job.id} className="col-span-2" onSeePeers={onSeePeers} />
      <section className="card-flat p-4" aria-label={t("Tiêu chí", "条件")}>
        <p className="t-sm font-semibold text-muted mb-2">{t("Tiêu chí", "条件")}</p>
        <MatchChips chips={chips} max={4} lang={lang} />
      </section>
      {open ? (
        <section className="card-flat p-4" aria-label={t("HR còn bao lâu", "HR返信までの時間")}>
          <p className="t-sm font-semibold text-muted">{t("HR trả lời trong", "HR返信まで")}</p>
          <div className="mt-2 flex items-center gap-2">
            <ScoreRing value={Math.round((Math.max(0, deadlineOf(app, s) - now) / (s.config.deadlineH * 36e5)) * 100)} size={52} stroke={5} label={t("Thời gian HR còn lại", "HR返信までの残り時間")}>
              <Icon name="hourglass" size={16} />
            </ScoreRing>
            <span className="mono t-sm font-semibold">{fmtLeft(deadlineOf(app, s) - now)}</span>
          </div>
        </section>
      ) : steps > 0 ? (
        <Link href={`/worker/improve?job=${job.id}`} className="card-flat p-4 pressable block">
          <p className="t-sm font-semibold text-muted">{t("Lộ trình tay nghề", "スキルアップの道筋")}</p>
          <p className="font-semibold mt-1">{t(`Còn ${steps} bước để rất phù hợp`, `高い適合まであと${steps}ステップ`)}</p>
          <p className="t-sm text-brand font-semibold mt-2 flex items-center gap-1">{t("Xem cách", "方法を見る")}<Icon name="arrow-right" size={14} /></p>
        </Link>
      ) : (
        <section className="card-flat p-4" aria-label={t("Sẵn sàng", "準備完了")}>
          <p className="t-sm font-semibold text-muted">{t("Sẵn sàng", "準備完了")}</p>
          <p className="font-semibold mt-1 flex items-center gap-1.5"><Icon name="check-verified" solid size={18} />{t("Đủ điều kiện ứng tuyển", "応募条件を満たしています")}</p>
        </section>
      )}
      <Link href="/worker/ask" className="col-span-2 card-flat p-4 pressable flex items-center gap-3">
        <Icon name="stars-01" solid />
        <span className="flex-1"><b className="block">{t("Hỏi trợ lý AI", "AIアシスタントに質問")}</b><span className="t-sm text-muted">{t("“Việc nào lương thực nhận trên ¥200k?”", "「手取り¥20万以上の求人は？」")}</span></span>
        <Icon name="chevron-right-01" />
      </Link>
    </div>
  );
}
