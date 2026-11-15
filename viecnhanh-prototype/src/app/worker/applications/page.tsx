"use client";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { BellLink, Screen, TopBar } from "@/components/worker/Shell";
import { AppCard, useMyApps } from "@/components/worker/Applications";
import { useLang, useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export default function Applications() {
  const s = useApp();
  const lang = useLang();
  const t = useT();
  const { now, mine, invites, open, closed } = useMyApps();
  const first = s.profile?.name.split(" ").slice(-2).join(" ") ?? "";
  const greeting = lang === "ja" ? `${first}さん、こんにちは` : lang === "en" ? `Hi ${first}` : `Chào ${first}`;
  const summary = invites.length
    ? t(`Bạn có ${invites.length} lời mời phỏng vấn.`, `面接招待が${invites.length}件あります。`, `You have ${invites.length} interview ${invites.length === 1 ? "invitation" : "invitations"}.`)
    : open.length
      ? t(`${open.length} hồ sơ đang chờ HR trả lời.`, `${open.length}件がHRの返答待ちです。`, `${open.length} ${open.length === 1 ? "application" : "applications"} waiting for HR.`)
      : closed.length
        ? t("Bạn đã có kết quả. Xem bên dưới.", "結果が出ています。下をご確認ください。", "You have results. See below.")
        : t("Bạn chưa gửi hồ sơ nào.", "まだ応募していません。", "You haven't applied to any jobs yet.");
  const groups = [
    { key: "inv", title: t("Lời mời phỏng vấn", "面接招待", "Interview invitations"), list: invites },
    { key: "open", title: t("Đang chờ HR trả lời", "HRの返答待ち", "Waiting for HR"), list: open },
    { key: "closed", title: t("Kết quả khác", "その他の結果", "Other results"), list: closed },
  ].filter((g) => g.list.length);

  return (
    <Screen deps={[invites.length, open.length, closed.length]}>
      <TopBar title={t("Hồ sơ đã gửi", "応募履歴", "Applications")} right={<BellLink />} />
      <div className="px-5 lg:px-0 max-w-[760px]">
        <div className="mb-5" data-reveal>
          <h1 className="t-h2">{greeting}</h1>
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
            <p className="t-sub">{t("Chưa có hồ sơ nào", "応募はまだありません", "No applications yet")}</p>
            <p className="text-muted mt-1 mb-5">{t("Ứng tuyển một việc để HR trả lời trong 24 giờ.", "応募するとHRから24時間以内に返答があります。", "Apply to a job and HR replies within 24 hours.")}</p>
            <Link href="/worker/jobs" className="btn btn-primary pressable">{t("Xem việc phù hợp", "合う求人を見る", "Browse matching jobs")}</Link>
          </div>
        )}
      </div>
    </Screen>
  );
}
