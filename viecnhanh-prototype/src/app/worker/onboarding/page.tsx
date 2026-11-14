"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Button, Icon, InlineNote, Picker, Segmented, Toggle, toast } from "@/components/ui";
import { Scanner } from "@/components/worker/Scanner";
import { CERTS, CITIES, JLPT, JOBS, SKILLS, START_OPTIONS, VISAS, type CertId, type CityId, type Profile, type SkillId, type VisaId } from "@/lib/data";
import { suggestImprovements, visaGate } from "@/lib/scoring";
import { useApp } from "@/lib/store";
import { enter, gsap, useGSAP } from "@/lib/motion";

// Draft lets JLPT and city start unanswered (mentor M3: no silent defaults).
type Draft = Omit<Profile, "jlpt" | "city"> & { jlpt: number | null; city: CityId | "" };
const EMPTY: Draft = { name: "", nationality: "VN", visa: "ssw1_mfg", cardExpiry: "", skills: {}, certs: [], jlpt: null, availableInDays: 30, city: "", relocate: true, province: "" };
const PROVINCES = ["An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hoá", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"];
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
  // A scan survives reloads (persisted flag), so re-seed what it read.
  const [p, setP] = useState<Draft>(() => (profile ? { ...profile, province: profile.province ?? "" } : null) ?? { ...EMPTY, name: auth?.name || (scanned ? "Nguyễn Tuấn Anh" : ""), ...(scanned ? { visa: "ssw1_mfg", cardExpiry: "2028-03-31" } : {}) });
  const [step, setStep] = useState(edit ? startStep : 0);
  const [manual, setManual] = useState(edit || scanned);
  const stage = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const set = (patch: Partial<Draft>) => setP((x) => ({ ...x, ...patch }));
  const [upload, setUpload] = useState<{ state: "idle" | "busy" | "ok" | "error"; name?: string }>({ state: "idle" });

  useGSAP(() => { enter("[data-step] > *", { x: 28 * dir.current }, { stagger: 0.05, duration: 0.7 }); }, { scope: stage, dependencies: [step] });

  const go = (n: number) => { dir.current = n > step ? 1 : -1; setStep(n); window.scrollTo({ top: 0 }); };
  const visaOk = !!p.visa && !!p.cardExpiry && !!p.name.trim() && !!p.province;
  const whereOk = !!p.city;
  const certGain = CERT_GAIN(toProfile(p));
  const skillCount = Object.keys(p.skills).length + (p.otherSkills?.trim() ? 1 : 0);
  const legalJobs = JOBS.filter((j) => visaGate(toProfile(p), j).pass).length;
  // Concrete reason (e.g. 28h/week cap) instead of a generic "contact support".
  const gateWhy = (() => { const g = visaGate(toProfile(p), JOBS[0]); return g.pass ? "" : g.reason; })();
  const titles = ["Tư cách lưu trú của bạn?", "Bạn làm được việc gì?", "Bạn đi làm được từ ngày nào, ở thành phố nào?"];
  const subs = [
    "Quét thẻ cư trú để AI chỉ gợi ý việc bạn được phép làm.",
    "Chọn kỹ năng, số năm kinh nghiệm và chứng chỉ bạn có.",
    "Để AI tính khoảng cách và chọn nhà máy cần người đúng lúc.",
  ];

  const finish = () => {
    setProfile(toProfile(p));
    if (edit) toast("Đã lưu · AI đã chấm lại các việc", "stars-01");
    router.push(edit ? "/worker/profile" : "/worker/analyzing");
  };

  return (
    <div className="min-h-dvh flex flex-col mx-auto w-full max-w-[640px]">
      <header className="sticky top-0 z-20 bg-[color-mix(in_oklab,var(--color-bg-canvas)_88%,transparent)] backdrop-blur-xl px-2 md:px-0">
        <div className="h-14 flex items-center gap-2">
          <button className="icon-btn pressable" aria-label={step ? "Câu trước" : "Thoát"} onClick={() => (step > 0 ? go(step - 1) : router.push(edit ? "/worker/profile" : "/worker"))}>
            <Icon name={step ? "arrow-left" : "x-medium"} />
          </button>
          <div className="flex-1 grid grid-cols-3 gap-1.5 px-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label={`Câu ${step + 1} trên 3`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 rounded-full bg-subtle overflow-hidden"><span className="block h-full bg-solid origin-left transition-transform duration-[var(--motion-slower)] [transition-timing-function:var(--ease-emphasized)]" style={{ transform: `scaleX(${i <= step ? 1 : 0})` }} /></span>
            ))}
          </div>
          <span className="t-sm tnum text-muted w-12 text-right pr-2">{step + 1}/3</span>
        </div>
      </header>

      <div ref={stage} className="flex-1 px-5 md:px-0 pt-4 pb-36">
        <div key={step} data-step>
          <p className="t-eyebrow mb-3">Câu {step + 1}</p>
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
              {!edit && <p className="t-sm text-muted -mt-2">Không bắt buộc lúc này. Bạn có thể chụp sau, khi ứng tuyển.</p>}
              {!manual ? (
                <button className="t-base underline underline-offset-4 justify-self-start" onClick={() => setManual(true)}>Không có thẻ bên cạnh? Nhập tay</button>
              ) : (
                <div className="card p-5 grid gap-4">
                  {scanned && <p className="t-sm font-semibold flex items-center gap-2"><Icon name="stars-01" solid size={16} />AI đã điền từ thẻ. Bạn kiểm tra lại giúp nhé.</p>}
                  <div className="field">
                    <label htmlFor="nm">Họ tên</label>
                    <input id="nm" className="input" autoComplete="name" value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="field">
                    <label htmlFor="vs">Tư cách lưu trú (在留資格)</label>
                    <Picker id="vs" label="Tư cách lưu trú" searchable value={p.visa} onChange={(v) => set({ visa: v })}
                      options={(Object.keys(VISAS) as VisaId[]).map((v) => ({ value: v, label: VISAS[v].vi, sub: VISAS[v].ja }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="ex">Hạn thẻ cư trú</label>
                    <input id="ex" type="date" className="input tnum" value={p.cardExpiry} onChange={(e) => set({ cardExpiry: e.target.value })} />
                  </div>
                  <div className="field">
                    <label htmlFor="pv">Quê bạn ở tỉnh nào?</label>
                    <Picker id="pv" label="Tỉnh quê" searchable value={p.province} onChange={(v) => set({ province: v })} placeholder="Chọn tỉnh…"
                      options={PROVINCES.map((x) => ({ value: x, label: x }))} />
                    <p className="t-sm text-muted mt-1">Để ghép bạn với Senpai cùng quê ở nhà máy mới.</p>
                  </div>
                  <div className="field">
                    <label htmlFor="cc">Đang làm ở công ty nào? <span className="text-muted font-normal">· không bắt buộc</span></label>
                    <input id="cc" className="input" value={p.currentCompany ?? ""} onChange={(e) => set({ currentCompany: e.target.value || undefined })} placeholder="Ví dụ: Kariya Parts" />
                    <p className="t-sm text-muted mt-1">Chỉ để không ghép bạn với người cùng công ty. Không ai thấy thông tin này.</p>
                  </div>
                  {visaOk && (
                    <InlineNote icon={legalJobs ? "shield-tick" : "alert-triangle"} tone={legalJobs ? "neutral" : "warn"}>
                      {legalJobs ? (
                        <><b>Visa cho phép làm {legalJobs}/{JOBS.length} việc đang tuyển.</b> Việc sai ngành visa sẽ được ẩn để bạn không mất công apply.</>
                      ) : (
                        <>
                          <b>Visa này chưa làm được các việc toàn thời gian đang tuyển.</b>
                          <span className="block mt-1">{gateWhy}</span>
                          <span className="block mt-1">{p.visa === "student" ? "ViệcNhanh sẽ báo bạn qua Zalo khi có việc làm thêm dưới 28 giờ/tuần." : "Nhân viên tiếng Việt có thể hướng dẫn bạn đổi sang Kỹ năng đặc định (thi kỹ năng + tiếng Nhật)."}</span>
                          <span className="mt-3 flex flex-wrap gap-2">
                            <button type="button" className="btn btn-sm btn-primary pressable" onClick={() => toast("Đã gửi yêu cầu · nhân viên tiếng Việt nhắn bạn qua Zalo trong ngày", "message-chat-circle")}>
                              <Icon name="message-chat-circle" size={18} />Nhận tư vấn qua Zalo
                            </button>
                            <button type="button" className="btn btn-sm btn-secondary pressable" onClick={() => { const pick = document.getElementById("vs"); pick?.focus(); pick?.click(); }}>Chọn lại visa</button>
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
                <legend className="label mb-3">Kỹ năng · chọn tất cả việc bạn đã làm</legend>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SKILLS) as SkillId[]).map((s) => {
                    const on = p.skills[s] !== undefined;
                    return (
                      <button key={s} type="button" className="chip pressable" aria-pressed={on} onClick={() => {
                        const next = { ...p.skills };
                        if (on) delete next[s]; else next[s] = 1;
                        set({ skills: next });
                      }}>
                        {on && <Icon name="check" size={16} />}{SKILLS[s].vi}
                      </button>
                    );
                  })}
                  <button type="button" className="chip pressable" aria-pressed={p.otherSkills !== undefined} onClick={() => set({ otherSkills: p.otherSkills === undefined ? "" : undefined })}>
                    <Icon name={p.otherSkills !== undefined ? "check" : "plus"} size={16} />Khác
                  </button>
                </div>
                {p.otherSkills !== undefined && (
                  <input autoFocus className="input mt-3" aria-label="Kỹ năng khác" placeholder="Ví dụ: Vận hành máy dập, lái cẩu trục…" value={p.otherSkills} onChange={(e) => set({ otherSkills: e.target.value })} />
                )}
              </fieldset>

              {skillCount > 0 && (
                <div className="card p-2">
                  <p className="label px-3 pt-2 pb-1">Số năm kinh nghiệm</p>
                  {(Object.keys(p.skills) as SkillId[]).map((s) => (
                    <div key={s} className="flex items-center justify-between gap-3 px-3 py-2 hair-b last:border-0">
                      <span className="font-medium">{SKILLS[s].vi} <span className="t-sm text-muted">{SKILLS[s].ja}</span></span>
                      <Stepper value={p.skills[s] ?? 1} onChange={(v) => set({ skills: { ...p.skills, [s]: v } })} label={`Số năm ${SKILLS[s].vi}`} />
                    </div>
                  ))}
                </div>
              )}

              <fieldset>
                <legend className="label mb-1">Chứng chỉ · không bắt buộc</legend>
                <p className="t-sm text-muted mb-3">{certGain > 0 ? `Có chứng chỉ phù hợp, mức phù hợp tăng đến +${certGain}% ở một số việc.` : "Chứng chỉ giúp nhà máy tin tay nghề của bạn hơn."}</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(CERTS) as CertId[]).map((c) => {
                    const on = p.certs.includes(c);
                    return (
                      <button key={c} type="button" className="chip pressable" aria-pressed={on} onClick={() => set({ certs: on ? p.certs.filter((x) => x !== c) : [...p.certs, c] })}>
                        {on ? <Icon name="check" size={16} /> : <Icon name="certificate" size={16} />}{CERTS[c].vi}
                      </button>
                    );
                  })}
                  <button type="button" className="chip pressable" aria-pressed={p.otherCerts !== undefined} onClick={() => set({ otherCerts: p.otherCerts === undefined ? "" : undefined })}>
                    <Icon name={p.otherCerts !== undefined ? "check" : "plus"} size={16} />Chứng chỉ khác
                  </button>
                </div>
                {p.otherCerts !== undefined && (
                  <input autoFocus className="input mt-3" aria-label="Chứng chỉ khác" placeholder="Ví dụ: Chứng chỉ điện, an toàn hoá chất…" value={p.otherCerts} onChange={(e) => set({ otherCerts: e.target.value })} />
                )}
                <label className={`mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed p-4 cursor-pointer pressable ${upload.state === "error" ? "border-[var(--color-border-negative-solid,var(--color-content-negative-base))]" : upload.state === "ok" ? "border-[var(--color-border-accent-solid)]" : "border-line"}`}>
                  <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUpload({ state: "busy", name: f.name });
                    // Demo: files over 8 MB fail so the error state is reachable.
                    setTimeout(() => setUpload({ state: f.size > 8e6 ? "error" : "ok", name: f.name }), 900);
                  }} />
                  <Icon name={upload.state === "ok" ? "check-circle" : upload.state === "error" ? "alert-triangle" : "image-plus"} size={24} />
                  <span className="flex-1 min-w-0" aria-live="polite">
                    <b className="block">{upload.state === "busy" ? "Đang tải lên…" : upload.state === "ok" ? "Đã thêm · AI chấm lại khi bạn lưu" : upload.state === "error" ? "Tải lên chưa được · ảnh quá 8 MB" : "Chụp hoặc chọn ảnh chứng chỉ"}</b>
                    <span className="t-sm text-muted truncate block">{upload.name ?? "Ảnh rõ 4 góc · JPG, PNG hoặc PDF"}</span>
                  </span>
                  {upload.state === "error" && <span className="t-sm font-semibold underline">Thử lại</span>}
                  {upload.state === "busy" && <Icon name="stars-01" className="animate-[zen-spin_1s_linear_infinite]" />}
                </label>
              </fieldset>

              <div>
                <p className="label mb-3">Tiếng Nhật (JLPT / JFT)</p>
                <Segmented label="Trình độ tiếng Nhật" value={p.jlpt ?? -1} onChange={(v) => set({ jlpt: v })} options={JLPT.map((l, i) => ({ value: i, label: l === "Chưa có" ? "Chưa" : l }))} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-7">
              <fieldset>
                <legend className="label mb-3">Bạn bắt đầu làm được từ</legend>
                <div className="grid grid-cols-2 gap-2">
                  {START_OPTIONS.map((o) => (
                    <button key={o.days} type="button" aria-pressed={p.availableInDays === o.days} onClick={() => set({ availableInDays: o.days })}
                      className="pressable text-left rounded-2xl border p-4 border-line aria-pressed:border-line-strong aria-pressed:ring-1 aria-pressed:ring-[var(--color-border-neutral-solid)] aria-pressed:bg-surface">
                      <span className="t-sub block">{o.vi}</span>
                      <span className="t-sm text-muted">{o.sub}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="ct">Bạn đang sống ở · tỉnh Aichi (愛知県)</label>
                <Picker id="ct" label="Thành phố ở Aichi" searchable placeholder="Chọn thành phố…" value={p.city} onChange={(v) => set({ city: v })}
                  options={(Object.keys(CITIES) as CityId[]).map((c) => ({ value: c, label: CITIES[c].vi, sub: `Aichi · ${CITIES[c].ja}` }))} />
              </div>
              <div className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Sẵn sàng ở ký túc xá nếu việc ở xa</p>
                  <p className="t-sm text-muted">AI sẽ gợi ý cả việc xa hơn có chỗ ở.</p>
                </div>
                <Toggle checked={p.relocate} onChange={(v) => set({ relocate: v })} label="Sẵn sàng ở ký túc xá" />
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
                ? "Quét thẻ hoặc chọn nhập tay để tiếp tục"
                : !p.name.trim()
                  ? "Nhập họ tên để tiếp tục"
                  : !p.cardExpiry
                    ? "Chọn hạn thẻ cư trú để tiếp tục"
                    : !p.province
                      ? "Chọn tỉnh quê của bạn để tiếp tục"
                      : legalJobs
                        ? "Tiếp tục"
                        : "Vẫn tạo hồ sơ để nhận báo việc"}
            </Button>
          )}
          {step === 1 && <Button size="lg" block disabled={!skillCount || p.jlpt === null} onClick={() => go(2)} iconRight="arrow-right">{!skillCount ? "Chọn ít nhất 1 kỹ năng" : p.jlpt === null ? "Chọn trình độ tiếng Nhật" : "Tiếp tục"}</Button>}
          {step === 2 && <Button size="lg" block icon="stars-01" disabled={!whereOk} onClick={finish}>{!whereOk ? "Chọn thành phố bạn đang sống" : edit ? "Lưu hồ sơ" : "Để AI tìm việc cho tôi"}</Button>}
        </div>
      </div>
    </div>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const num = useRef<HTMLSpanElement>(null);
  const bump = (v: number) => {
    onChange(v);
    gsap.fromTo(num.current, { scale: 1.3 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
  };
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button className="icon-btn sm pressable bg-subtle" aria-label="Bớt 1 năm" disabled={value <= 0} onClick={() => bump(Math.max(0, value - 1))}><Icon name="minus" size={18} /></button>
      <span ref={num} className="w-16 text-center tnum font-semibold" aria-live="polite">{value === 0 ? "< 1 năm" : `${value} năm`}</span>
      <button className="icon-btn sm pressable bg-subtle" aria-label="Thêm 1 năm" disabled={value >= 10} onClick={() => bump(Math.min(10, value + 1))}><Icon name="plus" size={18} /></button>
    </div>
  );
}
