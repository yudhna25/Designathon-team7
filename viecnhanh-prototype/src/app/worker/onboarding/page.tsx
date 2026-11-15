"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Button, Icon, InlineNote, Picker, Toggle, toast } from "@/components/ui";
import { Scanner } from "@/components/worker/Scanner";
import { CERTS, CITIES, JLPT, JOBS, PREFECTURES, SKILLS, START_OPTIONS, VISAS, type CertId, type CityId, type Profile, type SkillId, type VisaId } from "@/lib/data";
import { cityName, useLang, useT } from "@/lib/i18n";
import { suggestImprovements, visaGate } from "@/lib/scoring";
import { useApp } from "@/lib/store";
import { enter, gsap, useGSAP } from "@/lib/motion";

// Draft lets JLPT and city start unanswered (mentor M3: no silent defaults).
type Draft = Omit<Profile, "jlpt" | "city"> & { jlpt: number | null; city: CityId | "" };
const EMPTY: Draft = { name: "", nationality: "VN", visa: "ssw1_mfg", cardExpiry: "", skills: {}, certs: [], jlpt: null, availableInDays: 30, city: "", relocate: true, province: "" };
// Largest real rescore gain a certificate gives on current jobs, so "optional" is not read as "unimportant".
const CERT_GAIN = (p: Profile) => Math.max(0, ...JOBS.flatMap((j) => suggestImprovements(p, j).filter((u) => u.id.startsWith("cert-")).map((u) => u.gain)));
const toProfile = (d: Draft): Profile => ({ ...d, jlpt: d.jlpt ?? 0, city: (d.city || "nagoya") as CityId });

export default function Page() {
  return <Suspense><Onboarding /></Suspense>;
}

function Onboarding() {
  const router = useRouter();
  const params = useSearchParams();
  const edit = params.get("edit") === "1";
  const startStep = Math.min(2, Math.max(0, Number(params.get("step")) || 0));
  const { profile, auth, scanned, setScanned, setProfile } = useApp();
  const lang = useLang();
  const t = useT();
  // A scan survives reloads (persisted flag), so re-seed what it read.
  const [p, setP] = useState<Draft>(() => (profile ? { ...profile, province: profile.province ?? "" } : null) ?? { ...EMPTY, name: auth?.name || (scanned ? "Nguyễn Tuấn Anh" : ""), ...(scanned ? { visa: "ssw1_mfg", cardExpiry: "2028-03-31" } : {}) });
  const [step, setStep] = useState(edit ? startStep : 0);
  const [manual, setManual] = useState(edit || scanned);
  const stage = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const set = (patch: Partial<Draft>) => setP((x) => ({ ...x, ...patch }));
  const [upload, setUpload] = useState<{ state: "idle" | "busy" | "ok" | "error"; name?: string }>({ state: "idle" });
  // Chọn chip chứng chỉ → mở luôn hộp chọn file ảnh/PDF của chứng chỉ đó.
  const certFile = useRef<HTMLInputElement>(null);

  useGSAP(() => { enter("[data-step] > *", { x: 28 * dir.current }, { stagger: 0.05, duration: 0.7 }); }, { scope: stage, dependencies: [step] });

  const go = (n: number) => { dir.current = n > step ? 1 : -1; setStep(n); window.scrollTo({ top: 0 }); };
  const visaOk = !!p.visa && !!p.cardExpiry && !!p.name.trim();
  const whereOk = !!p.city;
  const certGain = CERT_GAIN(toProfile(p));
  const skillCount = Object.keys(p.skills).length + (p.otherSkills?.trim() ? 1 : 0);
  const legalJobs = JOBS.filter((j) => visaGate(toProfile(p), j).pass).length;
  // Concrete reason (e.g. 28h/week cap) instead of a generic "contact support".
  const gateWhy = (() => { const g = visaGate(toProfile(p), JOBS[0]); return g.pass ? "" : g.reason; })();
  const titles = [
    t("Tư cách lưu trú của bạn?", "在留資格は？", "What is your visa status?"),
    t("Bạn làm được việc gì?", "できる作業は？", "What factory skills do you have?"),
    t("Bạn đi làm được từ ngày nào, ở thành phố nào?", "いつから・どこで働けますか？", "When can you start and where do you live?"),
  ];
  const subs = [
    t("Quét thẻ cư trú để AI chỉ gợi ý việc bạn được phép làm.", "在留カードを読み取り、就労可能な求人だけを表示します。", "Scan your residence card so AI only recommends jobs your visa allows."),
    t("Chọn kỹ năng, số năm kinh nghiệm và chứng chỉ bạn có.", "経験のある作業・年数・資格を選んでください。", "Pick your skills, years of experience, and any certificates."),
    t("Để AI tính khoảng cách và chọn nhà máy cần người đúng lúc.", "通勤距離と募集タイミングから合う工場を選びます。", "So AI calculates commute distance and matches factories hiring on your timeline."),
  ];

  const finish = () => {
    setProfile(toProfile(p));
    if (edit) toast(t("Đã lưu · AI đã chấm lại các việc", "保存しました · AIが再判定しました", "Saved · AI rescored matching jobs"), "stars-01");
    router.push(edit ? "/worker/profile" : "/worker/analyzing");
  };

  const startOptText = (days: number, vi: string, sub: string) => {
    if (days === 0) return { label: t(vi, "すぐ", "Immediately"), sub: t(sub, "今週中", "this week") };
    if (days === 14) return { label: t(vi, "2週間後", "2 weeks"), sub: t(sub, "退職届後", "after notice") };
    if (days === 30) return { label: t(vi, "1ヶ月後", "1 month"), sub: t(sub, "30日前通知", "30-day notice") };
    return { label: t(vi, "2ヶ月以上", "2+ months"), sub: t(sub, "急がない", "flexible") };
  };

  return (
    <div className="min-h-dvh flex flex-col mx-auto w-full max-w-[640px]">
      <header className="sticky top-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_88%,transparent)] backdrop-blur-xl px-2 md:px-0">
        <div className="h-14 flex items-center gap-2">
          <button className="icon-btn pressable" aria-label={step ? t("Câu trước", "前へ", "Previous step") : t("Thoát", "閉じる", "Exit")} onClick={() => (step > 0 ? go(step - 1) : router.push(edit ? "/worker/profile" : "/worker"))}>
            <Icon name={step ? "arrow-left" : "x-medium"} />
          </button>
          <div className="flex-1 grid grid-cols-3 gap-1.5 px-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label={t(`Câu ${step + 1} trên 3`, `ステップ ${step + 1} / 3`, `Step ${step + 1} of 3`)}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 rounded-full bg-subtle overflow-hidden"><span className="block h-full bg-solid origin-left transition-transform duration-[var(--motion-slower)] [transition-timing-function:var(--ease-emphasized)]" style={{ transform: `scaleX(${i <= step ? 1 : 0})` }} /></span>
            ))}
          </div>
          <span className="t-sm tnum text-muted w-12 text-right pr-2">{step + 1}/3</span>
        </div>
      </header>

      <div ref={stage} className="flex-1 px-5 md:px-0 pt-4 pb-36">
        <div key={step} data-step>
          <p className="t-eyebrow mb-3">{t(`Câu ${step + 1}`, `質問 ${step + 1}`, `Step ${step + 1}`)}</p>
          <h1 className="t-h2">{titles[step]}</h1>
          <p className="t-lg text-muted mt-2 mb-6">{subs[step]}</p>

          {step === 0 && (
            <div className="grid gap-5">
              {!edit && (
                <Scanner
                  done={scanned}
                  onResult={(r) => {
                    setScanned(true);
                    setManual(true);
                    set({ name: p.name || "Nguyễn Tuấn Anh", visa: r.visa, cardExpiry: r.cardExpiry });
                  }}
                />
              )}
              {!edit && <p className="t-sm text-muted -mt-2">{t("Không bắt buộc lúc này. Bạn có thể chụp sau, khi ứng tuyển.", "今は必須ではありません。応募時に撮影することもできます。", "Optional right now. You can scan later when you apply.")}</p>}
              {!manual ? (
                <button className="t-base underline underline-offset-4 justify-self-start" onClick={() => setManual(true)}>{t("Không có thẻ bên cạnh? Nhập tay", "カードが手元にない場合：手入力", "No card nearby? Enter manually")}</button>
              ) : (
                <div className="card p-5 grid gap-4">
                  {scanned && <p className="t-sm font-semibold flex items-center gap-2"><Icon name="stars-01" solid size={16} />{t("AI đã điền từ thẻ. Bạn kiểm tra lại giúp nhé.", "AIがカードから読み取りました。内容をご確認ください。", "AI filled details from your card. Please review.")}</p>}
                  <div className="field">
                    <label htmlFor="nm">{t("Họ tên", "氏名", "Full name")}</label>
                    <input id="nm" className="input" autoComplete="name" value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="field">
                    <label htmlFor="vs">{t("Tư cách lưu trú (在留資格)", "在留資格", "Residence status (在留資格)")}</label>
                    <Picker id="vs" label={t("Tư cách lưu trú", "在留資格", "Residence status")} searchable value={p.visa} onChange={(v) => set({ visa: v })}
                      options={(Object.keys(VISAS) as VisaId[]).map((v) => ({ value: v, label: VISAS[v][lang], sub: lang === "ja" ? VISAS[v].en : VISAS[v].ja }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="ex">{t("Hạn thẻ cư trú", "在留期限", "Residence card expiry")}</label>
                    <input id="ex" type="date" className="input tnum" value={p.cardExpiry} onChange={(e) => set({ cardExpiry: e.target.value })} />
                  </div>
                  <div className="field">
                    <label htmlFor="pf">{t("Đang sống ở tỉnh nào của Nhật?", "現在お住まいの都道府県", "Current prefecture in Japan")}</label>
                    <Picker id="pf" label={t("Tỉnh đang sống ở Nhật", "都道府県", "Prefecture in Japan")} searchable value={p.prefecture ?? ""} onChange={(v) => set({ prefecture: v })} placeholder={t("Chọn tỉnh (都道府県)…", "都道府県を選択…", "Select prefecture…")}
                      options={PREFECTURES.map((x) => ({ value: x.id, label: x.id, sub: x.ja }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="cc">{t("Đang làm ở công ty nào?", "現在の勤務先", "Current employer")} <span className="text-muted font-normal">{t("· không bắt buộc", "· 任意", "· optional")}</span></label>
                    <input id="cc" className="input" value={p.currentCompany ?? ""} onChange={(e) => set({ currentCompany: e.target.value || undefined })} placeholder={t("Ví dụ: Kariya Parts", "例：Kariya Parts", "e.g. Kariya Parts")} />
                    <p className="t-sm text-muted mt-1">{t("Chỉ để không ghép bạn với người cùng công ty. Không ai thấy thông tin này.", "同じ会社の先輩と繋がらないようにするためのみに使用します。他者には非公開です。", "Only used so we don't pair you with peers at the same company. Never shown.")}</p>
                  </div>
                  {visaOk && (
                    <InlineNote icon={legalJobs ? "shield-tick" : "alert-triangle"} tone={legalJobs ? "neutral" : "warn"}>
                      {legalJobs ? (
                        <><b>{t(`Visa cho phép làm ${legalJobs}/${JOBS.length} việc đang tuyển.`, `この在留資格で${legalJobs}/${JOBS.length}件に応募できます。`, `Your visa qualifies for ${legalJobs}/${JOBS.length} open jobs.`)}</b> {t("Việc sai ngành visa sẽ được ẩn để bạn không mất công apply.", "就労不可の求人は非表示になるため安心です。", "Roles outside your visa category stay hidden.")}</>
                      ) : (
                        <>
                          <b>{t("Visa này chưa làm được các việc toàn thời gian đang tuyển.", "この在留資格では掲載中の正社員求人に就労できません。", "This visa does not permit the full-time jobs currently listed.")}</b>
                          <span className="block mt-1">{gateWhy}</span>
                          <span className="block mt-1">
                            {p.visa === "student"
                              ? t("KINTRA sẽ báo bạn qua Zalo khi có việc làm thêm dưới 28 giờ/tuần.", "週28時間以内のアルバイト求人が出たらZaloでお知らせします。", "KINTRA will message you on Zalo when under-28h/week part-time roles open.")
                              : t("Nhân viên tiếng Việt có thể hướng dẫn bạn đổi sang Kỹ năng đặc định (thi kỹ năng + tiếng Nhật).", "特定技能への切り替え（技能・日本語試験）についてスタッフが案内できます。", "Our staff can guide you on switching to SSW (skills + Japanese exam).")}
                          </span>
                          <span className="mt-3 flex flex-wrap gap-2">
                            <button type="button" className="btn btn-sm btn-primary pressable" onClick={() => toast(t("Đã gửi yêu cầu · nhân viên tiếng Việt nhắn bạn qua Zalo trong ngày", "相談を送信しました · 本日中にZaloでご連絡します", "Request sent · staff will message you on Zalo today"), "message-chat-circle")}>
                              <Icon name="message-chat-circle" size={18} />{t("Nhận tư vấn qua Zalo", "Zaloで相談する", "Get help on Zalo")}
                            </button>
                            <button type="button" className="btn btn-sm btn-secondary pressable" onClick={() => { const pick = document.getElementById("vs"); pick?.focus(); pick?.click(); }}>{t("Chọn lại visa", "在留資格を変更", "Change visa")}</button>
                          </span>
                        </>
                      )}
                    </InlineNote>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-7">
              <fieldset>
                <legend className="label mb-3">{t("Kỹ năng · chọn tất cả việc bạn đã làm", "スキル · 経験した作業をすべて選択", "Skills · select all work you have done")}</legend>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SKILLS) as SkillId[]).map((s) => {
                    const on = p.skills[s] !== undefined;
                    return (
                      <button key={s} type="button" className="chip pressable" aria-pressed={on} onClick={() => {
                        const next = { ...p.skills };
                        if (on) delete next[s]; else next[s] = 1;
                        set({ skills: next });
                      }}>
                        {on && <Icon name="check" size={16} />}{SKILLS[s][lang]}
                      </button>
                    );
                  })}
                  <button type="button" className="chip pressable" aria-pressed={p.otherSkills !== undefined} onClick={() => set({ otherSkills: p.otherSkills === undefined ? "" : undefined })}>
                    <Icon name={p.otherSkills !== undefined ? "check" : "plus"} size={16} />{t("Khác", "その他", "Other")}
                  </button>
                </div>
                {p.otherSkills !== undefined && (
                  <input autoFocus className="input mt-3" aria-label={t("Kỹ năng khác", "その他のスキル", "Other skills")} placeholder={t("Ví dụ: Vận hành máy dập, lái cẩu trục…", "例：プレス機操作、天井クレーン…", "e.g. Stamping press, overhead crane…")} value={p.otherSkills} onChange={(e) => set({ otherSkills: e.target.value })} />
                )}
              </fieldset>

              {skillCount > 0 && (
                <div className="card p-2">
                  <p className="label px-3 pt-2 pb-1">{t("Số năm kinh nghiệm", "経験年数", "Years of experience")}</p>
                  {(Object.keys(p.skills) as SkillId[]).map((s) => (
                    <div key={s} className="flex items-center justify-between gap-3 px-3 py-2 hair-b last:border-0">
                      <span className="font-medium">{SKILLS[s][lang]} {lang !== "ja" && <span className="t-sm text-muted">{SKILLS[s].ja}</span>}</span>
                      <Stepper value={p.skills[s] ?? 1} onChange={(v) => set({ skills: { ...p.skills, [s]: v } })} label={t(`Số năm ${SKILLS[s][lang]}`, `${SKILLS[s].ja}の経験年数`, `Years of ${SKILLS[s].en}`)} />
                    </div>
                  ))}
                </div>
              )}

              <fieldset>
                <legend className="label mb-1">{t("Chứng chỉ · không bắt buộc", "資格 · 任意", "Certificates · optional")}</legend>
                <p className="t-sm text-muted mb-3">
                  {certGain > 0
                    ? t(`Có chứng chỉ phù hợp, mức phù hợp tăng đến +${certGain}% ở một số việc.`, `資格があると一部の求人でマッチ度が最大+${certGain}%上がります。`, `Matching certificates boost your fit score by up to +${certGain}% on some jobs.`)
                    : t("Chứng chỉ giúp nhà máy tin tay nghề của bạn hơn.", "資格があると工場側がスキルを評価しやすくなります。", "Certificates give factories stronger proof of your skills.")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(CERTS) as CertId[]).map((c) => {
                    const on = p.certs.includes(c);
                    return (
                      <button key={c} type="button" className="chip pressable" aria-pressed={on} onClick={() => { set({ certs: on ? p.certs.filter((x) => x !== c) : [...p.certs, c] }); if (!on) certFile.current?.click(); }}>
                        {on ? <Icon name="check" size={16} /> : <Icon name="certificate" size={16} />}{CERTS[c][lang]}
                      </button>
                    );
                  })}
                  <button type="button" className="chip pressable" aria-pressed={p.otherCerts !== undefined} onClick={() => set({ otherCerts: p.otherCerts === undefined ? "" : undefined })}>
                    <Icon name={p.otherCerts !== undefined ? "check" : "plus"} size={16} />{t("Chứng chỉ khác", "その他の資格", "Other certificate")}
                  </button>
                </div>
                {p.otherCerts !== undefined && (
                  <input autoFocus className="input mt-3" aria-label={t("Chứng chỉ khác", "その他の資格", "Other certificate")} placeholder={t("Ví dụ: Chứng chỉ điện, an toàn hoá chất…", "例：電気工事士、有機溶剤作業主任者…", "e.g. Electrical license, chemical safety…")} value={p.otherCerts} onChange={(e) => set({ otherCerts: e.target.value })} />
                )}
                <label className={`mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed p-4 cursor-pointer pressable ${upload.state === "error" ? "border-[var(--color-border-negative-solid,var(--color-content-negative-base))]" : upload.state === "ok" ? "border-[var(--color-border-accent-solid)]" : "border-line"}`}>
                  <input ref={certFile} type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUpload({ state: "busy", name: f.name });
                    // Demo: files over 8 MB fail so the error state is reachable.
                    setTimeout(() => setUpload({ state: f.size > 8e6 ? "error" : "ok", name: f.name }), 900);
                  }} />
                  <Icon name={upload.state === "ok" ? "check-circle" : upload.state === "error" ? "alert-triangle" : "image-plus"} size={24} />
                  <span className="flex-1 min-w-0" aria-live="polite">
                    <b className="block">
                      {upload.state === "busy"
                        ? t("Đang tải lên…", "アップロード中…", "Uploading…")
                        : upload.state === "ok"
                          ? t("Đã thêm · AI chấm lại khi bạn lưu", "追加済み · 保存時にAIが再判定します", "Added · AI rescores when saved")
                          : upload.state === "error"
                            ? t("Tải lên chưa được · ảnh quá 8 MB", "アップロード失敗 · 8MB超", "Upload failed · file over 8 MB")
                            : t("Chụp hoặc chọn ảnh chứng chỉ", "資格証を撮影または選択", "Take or upload certificate photo")}
                    </b>
                    <span className="t-sm text-muted truncate block">{upload.name ?? t("Ảnh rõ 4 góc · JPG, PNG hoặc PDF", "四隅が写った写真 · JPG, PNG, PDF", "All 4 corners clear · JPG, PNG or PDF")}</span>
                  </span>
                  {upload.state === "error" && <span className="t-sm font-semibold underline">{t("Thử lại", "再試行", "Retry")}</span>}
                  {upload.state === "busy" && <Icon name="stars-01" className="animate-[zen-spin_1s_linear_infinite]" />}
                </label>
              </fieldset>

              <div className="field">
                <label htmlFor="jl">{t("Tiếng Nhật (JLPT / JFT)", "日本語レベル (JLPT / JFT)", "Japanese level (JLPT / JFT)")}</label>
                <Picker id="jl" label={t("Trình độ tiếng Nhật", "日本語レベル", "Japanese level")} value={p.jlpt === null ? "" : String(p.jlpt)} onChange={(v) => set({ jlpt: Number(v) })} placeholder={t("Chọn trình độ…", "レベルを選択…", "Select level…")}
                  options={JLPT.map((l, i) => ({ value: String(i), label: i === 0 ? t("Chưa có", "なし", "None") : l, sub: i === 0 ? t("Chưa thi JLPT / JFT", "未受験", "Haven't taken JLPT / JFT") : undefined }))} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-7">
              <fieldset>
                <legend className="label mb-3">{t("Bạn bắt đầu làm được từ", "いつから勤務できますか", "When can you start?")}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {START_OPTIONS.map((o) => {
                    const txt = startOptText(o.days, o.vi, o.sub);
                    return (
                      <button key={o.days} type="button" aria-pressed={p.availableInDays === o.days} onClick={() => set({ availableInDays: o.days })}
                        className="pressable text-left rounded-2xl border p-4 border-line aria-pressed:border-line-strong aria-pressed:ring-1 aria-pressed:ring-[var(--color-border-neutral-solid)] aria-pressed:bg-surface">
                        <span className="t-sub block">{txt.label}</span>
                        <span className="t-sm text-muted">{txt.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="ct">{t("Bạn đang sống ở · tỉnh Aichi (愛知県)", "お住まいの市区町村 · 愛知県", "Your city in Aichi Prefecture")}</label>
                <Picker id="ct" label={t("Thành phố ở Aichi", "愛知県の市区町村", "City in Aichi")} searchable placeholder={t("Chọn thành phố…", "市区町村を選択…", "Select city…")} value={p.city} onChange={(v) => set({ city: v })}
                  options={(Object.keys(CITIES) as CityId[]).map((c) => ({ value: c, label: cityName(c, lang), sub: lang === "ja" ? CITIES[c].vi : `Aichi · ${CITIES[c].ja}` }))} />
              </div>
              <div className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{t("Sẵn sàng ở ký túc xá nếu việc ở xa", "遠方の場合は社員寮に入居可能", "Open to factory dorms for farther jobs")}</p>
                  <p className="t-sm text-muted">{t("AI sẽ gợi ý cả việc xa hơn có chỗ ở.", "寮付きの遠方求人も提案に含めます。", "AI will include farther jobs that offer housing.")}</p>
                </div>
                <Toggle checked={p.relocate} onChange={(v) => set({ relocate: v })} label={t("Sẵn sàng ở ký túc xá", "入寮可", "Open to dorms")} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_90%,transparent)] backdrop-blur-xl border-t border-hair">
        <div className="mx-auto max-w-[640px] px-5 md:px-0 pt-3 safe-b">
          {step === 0 && (
            <Button size="lg" block variant={visaOk && !legalJobs ? "tertiary" : "primary"} disabled={!visaOk} onClick={() => go(1)} iconRight="arrow-right">
              {!manual
                ? t("Quét thẻ hoặc chọn nhập tay để tiếp tục", "読み取りまたは手入力で次へ", "Scan card or enter manually to continue")
                : !p.name.trim()
                  ? t("Nhập họ tên để tiếp tục", "氏名を入力してください", "Enter your full name to continue")
                  : !p.cardExpiry
                    ? t("Chọn hạn thẻ cư trú để tiếp tục", "在留期限を選択してください", "Select residence card expiry")
                    : legalJobs
                        ? t("Tiếp tục", "次へ", "Continue")
                        : t("Vẫn tạo hồ sơ để nhận báo việc", "通知を受けるためプロフィールを作成", "Create profile for job alerts")}
            </Button>
          )}
          {step === 1 && (
            <Button size="lg" block disabled={!skillCount || p.jlpt === null} onClick={() => go(2)} iconRight="arrow-right">
              {!skillCount ? t("Chọn ít nhất 1 kỹ năng", "スキルを1つ以上選択", "Pick at least 1 skill") : p.jlpt === null ? t("Chọn trình độ tiếng Nhật", "日本語レベルを選択", "Select Japanese level") : t("Tiếp tục", "次へ", "Continue")}
            </Button>
          )}
          {step === 2 && (
            <Button size="lg" block icon="stars-01" disabled={!whereOk} onClick={finish}>
              {!whereOk ? t("Chọn thành phố bạn đang sống", "お住まいの市区町村を選択", "Select your current city") : edit ? t("Lưu hồ sơ", "保存する", "Save profile") : t("Để AI tìm việc cho tôi", "AIに求人を探してもらう", "Let AI find matching jobs")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const lang = useLang();
  const t = useT();
  const num = useRef<HTMLSpanElement>(null);
  const bump = (v: number) => {
    onChange(v);
    gsap.fromTo(num.current, { scale: 1.3 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
  };
  const yrText = value === 0 ? t("< 1 năm", "1年未満", "< 1 yr") : lang === "ja" ? `${value}年` : lang === "en" ? `${value} ${value === 1 ? "yr" : "yrs"}` : `${value} năm`;
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button className="icon-btn sm pressable bg-subtle" aria-label={t("Bớt 1 năm", "1年減らす", "Decrease 1 year")} disabled={value <= 0} onClick={() => bump(Math.max(0, value - 1))}><Icon name="minus" size={18} /></button>
      <span ref={num} className="w-16 text-center tnum font-semibold" aria-live="polite">{yrText}</span>
      <button className="icon-btn sm pressable bg-subtle" aria-label={t("Thêm 1 năm", "1年増やす", "Increase 1 year")} disabled={value >= 10} onClick={() => bump(Math.min(10, value + 1))}><Icon name="plus" size={18} /></button>
    </div>
  );
}
