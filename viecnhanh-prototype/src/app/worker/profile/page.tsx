"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Icon, Segmented, toast } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { AppCard, useMyApps } from "@/components/worker/Applications";
import { CERTS, JLPT, SKILLS, VISAS, type SkillId } from "@/lib/data";
import { cityName, useLang, useT, type WLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export default function Profile() {
  const router = useRouter();
  const { profile: p, auth, safetyDone, config, setConfig, logout, scanned } = useApp();
  const lang = useLang();
  const t = useT();
  if (!p) return null;

  const startText = p.availableInDays === 0
    ? t("Ngay · trong tuần này", "すぐ · 今週中", "Immediately · this week")
    : p.availableInDays === 14
      ? t("2 tuần · sau khi báo nghỉ", "2週間後 · 退職届後", "2 weeks · after notice")
      : p.availableInDays === 30
        ? t("1 tháng · báo nghỉ 30 ngày", "1ヶ月後 · 30日前通知", "1 month · 30-day notice")
        : p.availableInDays === 60
          ? t("2 tháng+ · chưa gấp", "2ヶ月以上 · 急がない", "2+ months · flexible")
          : `${p.availableInDays} ${t("ngày", "日", "days")}`;

  const authLabel = auth?.method === "line" ? "LINE" : auth?.method === "phone" ? t("số điện thoại", "電話番号", "phone") : "Zalo";
  const expiry = p.cardExpiry ? p.cardExpiry.split("-").reverse().join("/") : "—";

  return (
    <Screen>
      <TopBar title={t("Hồ sơ của tôi", "マイページ", "My profile")} />
      {/* Desktop: 2 cột — trái là thông tin cá nhân (sticky), phải là dashboard ứng tuyển. Mobile xếp chồng. */}
      <div className="px-5 lg:px-0 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-4 max-w-[640px] lg:sticky lg:top-[136px]">
        <section className="card p-6 flex items-center gap-4" data-reveal>
          <Avatar name={p.name} size={64} />
          <div className="min-w-0">
            <h1 className="t-h4 truncate">{p.name}</h1>
            <p className="t-sm text-muted">
              {lang === "ja" ? `${authLabel}でログイン中` : lang === "en" ? `Signed in with ${authLabel}` : `Đăng nhập bằng ${authLabel}`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Verify label={t("Visa", "在留資格", "Visa")} state={scanned ? "ok" : "none"} />
              <Verify label={t("Thẻ cư trú", "在留カード", "Residence card")} state={scanned ? "ok" : "none"} />
              <Verify label={t("Chứng chỉ", "資格", "Certificates")} state={p.certs.length ? "pending" : "none"} />
              {safetyDone && <span className="badge"><Icon name="award-01" size={14} />{t("An toàn: hoàn thành", "安全教育：完了", "Safety: done")}</span>}
            </div>
          </div>
        </section>

        <section className="card p-6" data-reveal aria-labelledby="pf-h">
          <div className="flex items-center justify-between mb-4">
            <h2 id="pf-h" className="t-sub">{t("Hồ sơ AI dùng để chấm điểm", "AIが照合に使うプロフィール", "Profile used for AI matching")}</h2>
          </div>
          <dl className="grid gap-4">
            <Group title={t("Visa, thời gian & địa điểm", "在留資格・開始日・勤務地", "Visa, availability & location")} step={0}>
              <Row k={t("Tư cách lưu trú", "在留資格", "Residence status")} v={`${VISAS[p.visa][lang]} · ${t("hạn", "期限", "exp.")} ${expiry}`} />
              <Row k={t("Bắt đầu", "開始時期", "Availability")} v={startText} />
              <Row k={t("Nơi ở", "居住地", "Location")} v={`${cityName(p.city, lang)}${p.relocate ? t(" · sẵn sàng ở ký túc xá", " · 寮への転居可", " · open to dorms") : ""}`} />
            </Group>
            <Group title={t("Kỹ năng & chứng chỉ", "スキル・資格", "Skills & certificates")} step={1}>
              <Row
                k={t("Kỹ năng", "スキル", "Skills")}
                v={(Object.keys(p.skills) as SkillId[]).map((s) => {
                  const y = p.skills[s] ?? 0;
                  const yrs = y === 0 ? t("< 1 năm", "1年未満", "< 1 yr") : `${y} ${t("năm", "年", y === 1 ? "yr" : "yrs")}`;
                  return `${SKILLS[s][lang]} · ${yrs}`;
                }).join("\n")}
              />
              <Row k={t("Chứng chỉ", "資格", "Certificates")} v={p.certs.length ? p.certs.map((c) => CERTS[c][lang]).join("\n") : t("Chưa có", "なし", "None yet")} />
              {(p.otherSkills?.trim() || p.otherCerts?.trim()) && <Row k={t("Tự ghi thêm", "自由記入", "Added notes")} v={[p.otherSkills?.trim(), p.otherCerts?.trim()].filter(Boolean).join("\n")} />}
              <Row k={t("Tiếng Nhật", "日本語", "Japanese")} v={p.jlpt === 0 ? t("Chưa có", "なし", "None") : JLPT[p.jlpt]} />
            </Group>
          </dl>
        </section>

        <section className="card p-6 grid gap-4" data-reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium">{t("Ngôn ngữ", "言語", "Language")}</span>
            <div className="w-full sm:w-[240px]">
              <Segmented
                size="sm"
                label={t("Ngôn ngữ", "言語", "Language")}
                value={config.workerLang}
                onChange={(v) => setConfig({ workerLang: v as WLang })}
                options={[{ value: "vi", label: "VI" }, { value: "en", label: "EN" }, { value: "ja", label: "日本語" }]}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium">{t("Giao diện", "表示", "Appearance")}</span>
            <div className="w-full sm:w-[240px]">
              <Segmented
                size="sm"
                label={t("Giao diện", "表示", "Appearance")}
                value={config.theme}
                onChange={(v) => setConfig({ theme: v })}
                options={[{ value: "system", label: t("Tự động", "自動", "Auto") }, { value: "light", label: t("Sáng", "ライト", "Light") }, { value: "dark", label: t("Tối", "ダーク", "Dark") }]}
              />
            </div>
          </div>
          <button onClick={() => toast(t("Bản demo: nút này mở Zalo OA hỗ trợ tiếng Việt", "デモ：サポート用のZalo OAを開きます", "Demo: opens Zalo OA support chat"), "message-chat-circle")} className="flex items-center gap-3 py-1 text-left">
            <Icon name="message-chat-circle" />
            <span className="flex-1">
              <b className="block">{t("Hỗ trợ tiếng Việt", "スタッフに相談", "Support chat")}</b>
              <span className="t-sm text-muted">{t("Nhắn Zalo OA · 7h–22h mỗi ngày", "Zalo OA · 毎日 7:00–22:00", "Zalo OA · 7:00–22:00 daily")}</span>
            </span>
            <Icon name="chevron-right-01" className="text-faint" />
          </button>
        </section>

        <div data-reveal>
          <Button block variant="flat" icon="log-out-01" onClick={() => { logout(); router.push("/worker"); }}>{t("Đăng xuất", "ログアウト", "Sign out")}</Button>
        </div>
      </div>
      <ApplicationsDashboard />
      </div>
    </Screen>
  );
}

/** Cột phải: tổng quan tiến độ ứng tuyển + danh sách hồ sơ đã gửi (trước đây là tab riêng trên header). */
function ApplicationsDashboard() {
  const t = useT();
  const { now, mine, invites, open, closed } = useMyApps();
  const total = mine.length;
  const stats = [
    { k: t("Đã gửi", "応募済み", "Submitted"), v: total, icon: "send-01" },
    { k: t("Đang chờ HR", "返答待ち", "Waiting HR"), v: open.length, icon: "hourglass" },
    { k: t("Mời phỏng vấn", "面接招待", "Interviews"), v: invites.length, icon: "calendar-check" },
    { k: t("Đã đóng", "終了", "Closed"), v: closed.length, icon: "x-circle" },
  ] as const;
  const seg = [
    { n: invites.length, cls: "bg-solid", label: t("Mời phỏng vấn", "面接招待", "Invited") },
    { n: open.length, cls: "bg-fg/55", label: t("Đang chờ", "返答待ち", "Pending") },
    { n: closed.length, cls: "bg-fg/20", label: t("Đã đóng", "終了", "Closed") },
  ];
  const groups = [
    { key: "inv", title: t("Lời mời phỏng vấn", "面接招待", "Interview invitations"), list: invites },
    { key: "open", title: t("Đang chờ HR trả lời", "HRの返答待ち", "Waiting for HR"), list: open },
    { key: "closed", title: t("Kết quả khác", "その他の結果", "Other results"), list: closed },
  ].filter((g) => g.list.length);

  return (
    <div id="ung-tuyen" className="grid gap-4 min-w-0 scroll-mt-[140px]">
      <section className="card p-6" data-reveal aria-labelledby="dash-h">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 id="dash-h" className="t-h4">{t("Tiến độ ứng tuyển", "応募の進捗", "Application progress")}</h2>
          <Link href="/worker/jobs" className="btn btn-sm btn-secondary pressable"><Icon name="search-md" size={16} />{t("Tìm thêm việc", "求人を探す", "Find more jobs")}</Link>
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
          <p className="t-sub">{t("Chưa có hồ sơ nào", "応募はまだありません", "No applications yet")}</p>
          <Link href="/worker/jobs" className="btn btn-primary pressable mt-4">{t("Xem việc phù hợp", "合う求人を見る", "Browse matching jobs")}</Link>
        </div>
      )}
    </div>
  );
}

function Group({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  const t = useT();
  const editWord = t("Sửa", "編集", "Edit");
  return (
    <div className="grid gap-3 pb-4 hair-b last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{title}</p>
        <Link href={`/worker/onboarding?edit=1&step=${step}`} className="btn btn-xs btn-secondary pressable" aria-label={`${editWord} ${title}`}><Icon name="edit-02" size={16} />{editWord}</Link>
      </div>
      {children}
    </div>
  );
}

function Verify({ label, state }: { label: string; state: "ok" | "pending" | "none" }) {
  const t = useT();
  const text = state === "ok" ? t("Đã xác minh", "確認済み", "Verified") : state === "pending" ? t("Đang xác minh", "確認中", "Pending") : t("Chưa có", "未提出", "None");
  return (
    <span className={`badge ${state === "ok" ? "bg-[var(--color-bg-positive-subtle)] text-[var(--color-content-positive-base)]" : state === "pending" ? "bg-brand-soft text-brand" : "badge-dash"}`}>
      <Icon name={state === "ok" ? "shield-tick" : state === "pending" ? "hourglass" : "info-circle"} size={14} />{label}: {text}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="grid grid-cols-[120px_1fr] gap-4"><dt className="text-muted">{k}</dt><dd className="font-medium whitespace-pre-line">{v}</dd></div>;
}
