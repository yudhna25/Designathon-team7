"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, Icon, InlineNote, Num, Sheet, toast } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { JOBS } from "@/lib/data";
import { yen } from "@/lib/pay";
import { useApp } from "@/lib/store";
import { gsap, useGSAP } from "@/lib/motion";

const FEE = 330; // flat transfer fee, not interest
const SHARE = 0.5; // max share of verified earned wages
const SHIFTS = ["T2 17/11", "T3 18/11", "T4 19/11", "T5 20/11", "T6 21/11", "T2 24/11"];

export default function Wallet() {
  const [preview, setPreview] = useState(false);
  const hasAccepted = useApp((s) => s.apps.some((a) => a.candidateId === "me" && a.accepted));

  if (!hasAccepted && !preview) return (
    <Screen>
      <TopBar title="Ví lương" />
      <div className="px-5 lg:px-0 pb-24 lg:pb-10 max-w-[640px] grid gap-4">
        <section className="card p-6" data-reveal>
          <span className="grid size-14 place-items-center rounded-full bg-subtle mb-5"><Icon name="wallet-02" size={26} /></span>
          <h1 className="t-h3">Ứng lương những ngày đã làm</h1>
          <p className="text-muted mt-2">Đổi việc thường mất ~2 tháng mới có lương đầu tiên. Ví lương cho bạn nhận trước một phần tiền của các ca đã làm, thay vì vay bạn bè hay quẹt thẻ tín dụng.</p>
          <ul className="mt-5 grid gap-3">
            <li className="flex gap-3"><Icon name="check" /><span>Chỉ tính trên ca đã được nhà máy xác nhận</span></li>
            <li className="flex gap-3"><Icon name="check" /><span>Tối đa 50%, phần còn lại để trả thuế và bảo hiểm</span></li>
            <li className="flex gap-3"><Icon name="check" /><span>Phí cố định {yen(FEE)}/lần. Không lãi, không phải khoản vay</span></li>
          </ul>
        </section>
        <div data-reveal><InlineNote icon="lock-01">Ví mở sau khi bạn được nhận và có ca làm được nhà máy xác nhận. Lời mời phỏng vấn chưa mở ví.</InlineNote></div>
        <div className="grid gap-2" data-reveal>
          <Link href="/worker/applications" className="btn btn-lg btn-primary pressable">Xem hồ sơ đã gửi</Link>
          <Button size="lg" variant="flat" onClick={() => setPreview(true)}>Xem thử với dữ liệu mẫu</Button>
        </div>
      </div>
    </Screen>
  );
  return <ActiveWallet isPreview={!hasAccepted} onExit={() => setPreview(false)} />;
}

function ActiveWallet({ isPreview, onExit }: { isPreview: boolean; onExit: () => void }) {
  const { withdrawals, withdraw, setConfig } = useApp();
  const ewaDown = useApp((s) => s.config.ewaDown);
  const job = JOBS[0];
  const earned = SHIFTS.length * 8 * job.hourly;
  const taken = withdrawals.reduce((t, w) => t + w.amount, 0);
  const available = Math.max(0, Math.floor((earned * SHARE - taken) / 1000) * 1000);
  const [amount, setAmount] = useState(Math.min(10000, available));
  const [sheet, setSheet] = useState<"confirm" | "done" | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const amt = Math.min(amount, available);

  useGSAP(() => { gsap.fromTo(".seg-fill", { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.12, ease: "expo.out", transformOrigin: "left" }); }, { scope: bar, dependencies: [taken] });

  const pct = (n: number) => `${(n / earned) * 100}%`;
  return (
    <Screen>
      <TopBar title={isPreview ? "Ví lương mẫu" : "Ví lương"} sub={isPreview ? `${job.company} · dữ liệu mẫu` : `${job.company} · kỳ lương tháng này`} />
      <div className="px-5 lg:px-0 pb-24 lg:pb-10 max-w-[640px] grid gap-4">
        {isPreview && <div data-reveal><InlineNote icon="info-circle">Bạn đang xem ví mẫu. Ca làm, số dư và lệnh chuyển đều là mô phỏng.</InlineNote></div>}
        {ewaDown && (
          <div role="alert" className="grid gap-2">
            <InlineNote icon="alert-triangle" tone="warn">
              <b>Đối tác ứng lương đang tạm lỗi.</b> Lương tháng của bạn vẫn trả đủ, đúng ngày 25. Ngày công đã ghi nhận không mất. Thử lại sau.
            </InlineNote>
            <div>
              <Button size="sm" variant="secondary" onClick={() => setConfig({ ewaDown: false })}>Thử kết nối lại</Button>
            </div>
          </div>
        )}
        <section className="ink rounded-[28px] p-6" data-reveal>
          <p className="t-sm muted-ink">Lương đã làm tháng này · {SHIFTS.length} ca đã xác nhận</p>
          <p className="text-[44px] leading-none font-semibold tracking-[-0.045em] mt-2"><Num value={earned} format={yen} /></p>
          <div ref={bar} className="mt-6 flex h-3 gap-1 rounded-full overflow-hidden" aria-hidden>
            <span className="seg-fill ewa-seg-taken bg-[var(--color-bg-inverse-solid)] opacity-40" style={{ "--ewa-taken": pct(taken) } as React.CSSProperties} />
            <span className="seg-fill ewa-seg-avail bg-[var(--color-bg-inverse-solid)]" style={{ "--ewa-avail": pct(available) } as React.CSSProperties} />
            <span className="seg-fill flex-1 bg-[repeating-linear-gradient(135deg,var(--color-bg-inverse-subtle-pressed)_0_4px,transparent_4px_8px)] ring-1 ring-inset ring-[color:var(--color-border-overlay-subtle-pressed)] rounded-r-full" />
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 t-sm">
            <div><dt className="muted-ink">Đã ứng</dt><dd className="font-semibold tnum">{yen(taken)}</dd></div>
            <div><dt className="muted-ink">Có thể ứng</dt><dd className="font-semibold tnum"><Num value={available} format={yen} /></dd></div>
            <div><dt className="muted-ink">Giữ cho thuế, BH</dt><dd className="font-semibold tnum">{yen(earned - earned * SHARE)}</dd></div>
          </dl>
        </section>

        <section className="card p-6" data-reveal aria-labelledby="amt-h">
          <h2 id="amt-h" className="t-h4">Bạn muốn nhận bao nhiêu?</h2>
          <p className="text-[36px] leading-none font-semibold tracking-[-0.04em] mt-4 tnum" aria-live="polite"><Num value={amt} format={yen} spring duration={0.35} /></p>
          <input type="range" min={available >= 1000 ? 1000 : 0} max={available} step={1000} value={amt} onChange={(e) => setAmount(+e.target.value)} aria-label="Số tiền muốn ứng" className="w-full mt-4 accent-[var(--color-bg-neutral-solid)]" disabled={available < 1000} />
          <div className="flex flex-wrap gap-2 mt-3">
            {[5000, 10000, 20000].filter((v) => v <= available).map((v) => <button key={v} className="chip pressable !h-9 t-sm" aria-pressed={amt === v} onClick={() => setAmount(v)}>{yen(v)}</button>)}
            {available > 0 && <button className="chip pressable !h-9 t-sm" aria-pressed={amt === available} onClick={() => setAmount(available)}>Tối đa</button>}
          </div>
          <dl className="mt-5 grid gap-2 t-base">
            <div className="flex justify-between"><dt className="text-muted">Phí chuyển cố định</dt><dd className="tnum">{yen(FEE)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Về tài khoản Yucho ••4821</dt><dd className="tnum"><Num value={Math.max(0, amt - FEE)} format={yen} spring duration={0.35} /></dd></div>
          </dl>
          <Button size="lg" block className="mt-5" disabled={ewaDown || amt < 1000} onClick={() => setSheet("confirm")}>{ewaDown ? "Tạm dừng ứng lương · thử lại sau" : `Thử nhận ${yen(Math.max(0, amt - FEE))}`}</Button>
        </section>

        <div data-reveal><InlineNote icon="shield-tick"><b>Đây là lương bạn đã làm, không phải khoản vay.</b> Không lãi suất. Số đã ứng được trừ vào kỳ lương ngày 25, sau khi nhà máy trừ thuế và bảo hiểm.</InlineNote></div>

        <section className="card p-5" data-reveal aria-labelledby="sh-h">
          <h2 id="sh-h" className="t-sub mb-3">Ca đã xác nhận</h2>
          <ul className="grid gap-2 t-base">
            {SHIFTS.map((d) => (
              <li key={d} className="flex items-center justify-between gap-3 hair-b pb-2 last:border-0">
                <span className="flex items-center gap-2"><Icon name="check-verified" size={18} solid />{d} · 8 giờ</span>
                <span className="tnum text-muted">{yen(8 * job.hourly)}</span>
              </li>
            ))}
          </ul>
          {withdrawals.length > 0 && (
            <>
              <h3 className="t-sub mt-6 mb-3">Lịch sử ứng</h3>
              <ul className="grid gap-2">{withdrawals.map((w) => <li key={w.id} className="flex justify-between"><span>{new Date(w.at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span><span className="tnum font-medium">−{yen(w.amount)}</span></li>)}</ul>
            </>
          )}
        </section>
        {isPreview && <Button size="lg" variant="flat" onClick={onExit}>Thoát ví mẫu</Button>}
      </div>

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} title={sheet === "confirm" ? "Mô phỏng ứng lương" : "Đã mô phỏng ứng lương"}
        footer={sheet === "confirm" ? (
          <Button size="lg" block onClick={() => { withdraw(amt, FEE); setSheet("done"); toast(`Đã mô phỏng chuyển ${yen(amt - FEE)}`, "bank"); }}>Xác nhận mô phỏng</Button>
        ) : (
          <Button size="lg" block onClick={() => setSheet(null)}>Xong</Button>
        )}>
        {sheet === "confirm" ? (
          <dl className="grid gap-3 t-base">
            <p className="t-sm text-muted">Ví mẫu · giao dịch mô phỏng</p>
            <div className="flex justify-between"><dt className="text-muted">Số tiền ứng</dt><dd className="tnum font-semibold">{yen(amt)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Phí cố định</dt><dd className="tnum">−{yen(FEE)}</dd></div>
            <div className="flex justify-between hair-t pt-3 t-sub"><dt>Bạn nhận</dt><dd className="tnum">{yen(amt - FEE)}</dd></div>
            <p className="t-sm text-muted">Ví dụ: tài khoản nhận {yen(amt - FEE)}, kỳ lương sau trừ {yen(amt)}. Bản demo không chuyển tiền.</p>
          </dl>
        ) : (
          <div className="text-center py-6">
            <span className="mx-auto grid size-16 place-items-center rounded-full ink animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]"><Icon name="check" size={32} /></span>
            <p className="t-h3 mt-4">Đã thử ứng lương</p>
            <p className="text-muted mt-1">Ví mẫu đã cập nhật. Không có tiền được chuyển tới Yucho ••4821.</p>
          </div>
        )}
      </Sheet>
    </Screen>
  );
}
