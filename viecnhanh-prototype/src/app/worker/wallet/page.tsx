"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, Icon, InlineNote, Num, Sheet, toast } from "@/components/ui";
import { Screen, TopBar } from "@/components/worker/Shell";
import { JOBS } from "@/lib/data";
import { useLang, useT } from "@/lib/i18n";
import { yen } from "@/lib/pay";
import { useApp } from "@/lib/store";
import { gsap, useGSAP } from "@/lib/motion";

const FEE = 330; // flat transfer fee, not interest
const SHARE = 0.5; // max share of verified earned wages
const SHIFTS_BY_LANG = {
  vi: ["T2 17/11", "T3 18/11", "T4 19/11", "T5 20/11", "T6 21/11", "T2 24/11"],
  en: ["Mon 17 Nov", "Tue 18 Nov", "Wed 19 Nov", "Thu 20 Nov", "Fri 21 Nov", "Mon 24 Nov"],
  ja: ["11/17(月)", "11/18(火)", "11/19(水)", "11/20(木)", "11/21(金)", "11/24(月)"],
} as const;

export default function Wallet() {
  const [preview, setPreview] = useState(false);
  const t = useT();
  const hasAccepted = useApp((s) => s.apps.some((a) => a.candidateId === "me" && a.accepted));

  if (!hasAccepted && !preview) return (
    <Screen>
      <TopBar title={t("Ví lương", "給与ウォレット", "Pay wallet")} />
      <div className="px-5 lg:px-0 pb-24 lg:pb-10 max-w-[640px] grid gap-4">
        <section className="card p-6" data-reveal>
          <span className="grid size-14 place-items-center rounded-full bg-subtle mb-5"><Icon name="wallet-02" size={26} /></span>
          <h1 className="t-h3">{t("Ứng lương những ngày đã làm", "勤務済み給与の即時受け取り", "Access wages you already earned")}</h1>
          <p className="text-muted mt-2">{t("Đổi việc thường mất ~2 tháng mới có lương đầu tiên. Ví lương cho bạn nhận trước một phần tiền của các ca đã làm, thay vì vay bạn bè hay quẹt thẻ tín dụng.", "転職後の初回給与まで約2ヶ月かかります。このウォレットで勤務済みシフトの一部を先に受け取れ、借入やカード分割に頼らずに済みます。", "Switching jobs often means waiting ~2 months for the first paycheck. Draw part of your verified completed shifts early instead of borrowing or using credit.")}</p>
          <ul className="mt-5 grid gap-3">
            <li className="flex gap-3"><Icon name="check" /><span>{t("Chỉ tính trên ca đã được nhà máy xác nhận", "工場が確認済みのシフト分のみ利用可能", "Only based on shifts confirmed by the factory")}</span></li>
            <li className="flex gap-3"><Icon name="check" /><span>{t("Tối đa 50%, phần còn lại để trả thuế và bảo hiểm", "上限50%、残りは税金・社会保険控除のため確保", "Up to 50%; the rest covers taxes and insurance")}</span></li>
            <li className="flex gap-3"><Icon name="check" /><span>{t(`Phí cố định ${yen(FEE)}/lần. Không lãi, không phải khoản vay`, `定額手数料 ${yen(FEE)}/回・利息なし・ローンではありません`, `Flat ${yen(FEE)} transfer fee. Zero interest, not a loan`)}</span></li>
          </ul>
        </section>
        <div data-reveal><InlineNote icon="lock-01">{t("Ví mở sau khi bạn được nhận và có ca làm được nhà máy xác nhận. Lời mời phỏng vấn chưa mở ví.", "採用決定後に工場がシフトを承認すると利用できます（面接招待の段階では未開放）。", "Unlocks after hire when the factory confirms worked shifts. Interview invitations do not unlock it.")}</InlineNote></div>
        <div className="grid gap-2" data-reveal>
          <Link href="/worker/applications" className="btn btn-lg btn-primary pressable">{t("Xem hồ sơ đã gửi", "応募履歴を見る", "View applications")}</Link>
          <Button size="lg" variant="flat" onClick={() => setPreview(true)}>{t("Xem thử với dữ liệu mẫu", "サンプルデータで試す", "Preview with sample data")}</Button>
        </div>
      </div>
    </Screen>
  );
  return <ActiveWallet isPreview={!hasAccepted} onExit={() => setPreview(false)} />;
}

function ActiveWallet({ isPreview, onExit }: { isPreview: boolean; onExit: () => void }) {
  const { withdrawals, withdraw, setConfig } = useApp();
  const ewaDown = useApp((s) => s.config.ewaDown);
  const lang = useLang();
  const t = useT();
  const shifts = SHIFTS_BY_LANG[lang];
  const job = JOBS[0];
  const earned = shifts.length * 8 * job.hourly;
  const taken = withdrawals.reduce((tot, w) => tot + w.amount, 0);
  const available = Math.max(0, Math.floor((earned * SHARE - taken) / 1000) * 1000);
  const [amount, setAmount] = useState(Math.min(10000, available));
  const [sheet, setSheet] = useState<"confirm" | "done" | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const amt = Math.min(amount, available);

  useGSAP(() => { gsap.fromTo(".seg-fill", { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.12, ease: "expo.out", transformOrigin: "left" }); }, { scope: bar, dependencies: [taken] });

  const pct = (n: number) => `${(n / earned) * 100}%`;
  const locale = lang === "ja" ? "ja-JP" : lang === "en" ? "en-US" : "vi-VN";
  return (
    <Screen>
      <TopBar
        title={isPreview ? t("Ví lương mẫu", "サンプルウォレット", "Sample pay wallet") : t("Ví lương", "給与ウォレット", "Pay wallet")}
        sub={isPreview ? t(`${job.company} · dữ liệu mẫu`, `${job.company} · サンプルデータ`, `${job.company} · sample data`) : t(`${job.company} · kỳ lương tháng này`, `${job.company} · 今月の給与期間`, `${job.company} · this pay period`)}
      />
      <div className="px-5 lg:px-0 pb-24 lg:pb-10 max-w-[640px] grid gap-4">
        {isPreview && <div data-reveal><InlineNote icon="info-circle">{t("Bạn đang xem ví mẫu. Ca làm, số dư và lệnh chuyển đều là mô phỏng.", "サンプル画面です。シフト・残高・振込はシミュレーションです。", "Viewing sample wallet. Shifts, balance, and transfers are simulated.")}</InlineNote></div>}
        {ewaDown && (
          <div role="alert" className="grid gap-2">
            <InlineNote icon="alert-triangle" tone="warn">
              <b>{t("Đối tác ứng lương đang tạm lỗi.", "決済パートナー側で一時的な障害が発生しています。", "Payout partner is temporarily unavailable.")}</b> {t("Lương tháng của bạn vẫn trả đủ, đúng ngày 25. Ngày công đã ghi nhận không mất. Thử lại sau.", "25日の通常給与は全額予定通り支払われ、勤務記録も失われません。後ほどお試しください。", "Your regular payday on the 25th is unaffected and worked hours are safe. Try again later.")}
            </InlineNote>
            <div>
              <Button size="sm" variant="secondary" onClick={() => setConfig({ ewaDown: false })}>{t("Thử kết nối lại", "再接続を試す", "Retry connection")}</Button>
            </div>
          </div>
        )}
        <section className="ink rounded-[28px] p-6" data-reveal>
          <p className="t-sm muted-ink">{t(`Lương đã làm tháng này · ${shifts.length} ca đã xác nhận`, `今月の確定済み給与 · ${shifts.length}シフト確認済み`, `Earned this month · ${shifts.length} confirmed shifts`)}</p>
          <p className="text-[44px] leading-none font-semibold tracking-[-0.045em] mt-2"><Num value={earned} format={yen} /></p>
          <div ref={bar} className="mt-6 flex h-3 gap-1 rounded-full overflow-hidden" aria-hidden>
            <span className="seg-fill ewa-seg-taken bg-[var(--color-bg-inverse-solid)] opacity-40" style={{ "--ewa-taken": pct(taken) } as React.CSSProperties} />
            <span className="seg-fill ewa-seg-avail bg-[var(--color-bg-inverse-solid)]" style={{ "--ewa-avail": pct(available) } as React.CSSProperties} />
            <span className="seg-fill flex-1 bg-[repeating-linear-gradient(135deg,var(--color-bg-inverse-subtle-pressed)_0_4px,transparent_4px_8px)] ring-1 ring-inset ring-[color:var(--color-border-overlay-subtle-pressed)] rounded-r-full" />
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 t-sm">
            <div><dt className="muted-ink">{t("Đã ứng", "受取済み", "Drawn")}</dt><dd className="font-semibold tnum">{yen(taken)}</dd></div>
            <div><dt className="muted-ink">{t("Có thể ứng", "受取可能", "Available")}</dt><dd className="font-semibold tnum"><Num value={available} format={yen} /></dd></div>
            <div><dt className="muted-ink">{t("Giữ cho thuế, BH", "税・保険控除枠", "Tax & ins. hold")}</dt><dd className="font-semibold tnum">{yen(earned - earned * SHARE)}</dd></div>
          </dl>
        </section>

        <section className="card p-6" data-reveal aria-labelledby="amt-h">
          <h2 id="amt-h" className="t-h4">{t("Bạn muốn nhận bao nhiêu?", "いくら受け取りますか？", "How much do you want to withdraw?")}</h2>
          <p className="text-[36px] leading-none font-semibold tracking-[-0.04em] mt-4 tnum" aria-live="polite"><Num value={amt} format={yen} spring duration={0.35} /></p>
          <input type="range" min={available >= 1000 ? 1000 : 0} max={available} step={1000} value={amt} onChange={(e) => setAmount(+e.target.value)} aria-label={t("Số tiền muốn ứng", "受取金額", "Withdrawal amount")} className="w-full mt-4 accent-[var(--color-bg-neutral-solid)]" disabled={available < 1000} />
          <div className="flex flex-wrap gap-2 mt-3">
            {[5000, 10000, 20000].filter((v) => v <= available).map((v) => <button key={v} className="chip pressable !h-9 t-sm" aria-pressed={amt === v} onClick={() => setAmount(v)}>{yen(v)}</button>)}
            {available > 0 && <button className="chip pressable !h-9 t-sm" aria-pressed={amt === available} onClick={() => setAmount(available)}>{t("Tối đa", "上限", "Max")}</button>}
          </div>
          <dl className="mt-5 grid gap-2 t-base">
            <div className="flex justify-between"><dt className="text-muted">{t("Phí chuyển cố định", "定額振込手数料", "Flat transfer fee")}</dt><dd className="tnum">{yen(FEE)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>{t("Về tài khoản Yucho ••4821", "ゆうちょ口座 ••4821 へ", "To Yucho ••4821")}</dt><dd className="tnum"><Num value={Math.max(0, amt - FEE)} format={yen} spring duration={0.35} /></dd></div>
          </dl>
          <Button size="lg" block className="mt-5" disabled={ewaDown || amt < 1000} onClick={() => setSheet("confirm")}>
            {ewaDown ? t("Tạm dừng ứng lương · thử lại sau", "一時停止中 · 後ほどお試しください", "Payouts paused · try again later") : t(`Thử nhận ${yen(Math.max(0, amt - FEE))}`, `${yen(Math.max(0, amt - FEE))} の受取を試す`, `Preview receiving ${yen(Math.max(0, amt - FEE))}`)}
          </Button>
        </section>

        <div data-reveal><InlineNote icon="shield-tick"><b>{t("Đây là lương bạn đã làm, không phải khoản vay.", "これは勤務済み給与の受け取りであり、借入ではありません。", "These are wages you already earned, not a loan.")}</b> {t("Không lãi suất. Số đã ứng được trừ vào kỳ lương ngày 25, sau khi nhà máy trừ thuế và bảo hiểm.", "利息ゼロ。受け取った分は25日の給与から控除されます。", "Zero interest. Withdrawn amounts are deducted on the 25th payday after taxes and insurance.")}</InlineNote></div>

        <section className="card p-5" data-reveal aria-labelledby="sh-h">
          <h2 id="sh-h" className="t-sub mb-3">{t("Ca đã xác nhận", "承認済みシフト", "Confirmed shifts")}</h2>
          <ul className="grid gap-2 t-base">
            {shifts.map((d) => (
              <li key={d} className="flex items-center justify-between gap-3 hair-b pb-2 last:border-0">
                <span className="flex items-center gap-2"><Icon name="check-verified" size={18} solid />{d} · {t("8 giờ", "8時間", "8 hrs")}</span>
                <span className="tnum text-muted">{yen(8 * job.hourly)}</span>
              </li>
            ))}
          </ul>
          {withdrawals.length > 0 && (
            <>
              <h3 className="t-sub mt-6 mb-3">{t("Lịch sử ứng", "受取履歴", "Withdrawal history")}</h3>
              <ul className="grid gap-2">{withdrawals.map((w) => <li key={w.id} className="flex justify-between"><span>{new Date(w.at).toLocaleString(locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span><span className="tnum font-medium">−{yen(w.amount)}</span></li>)}</ul>
            </>
          )}
        </section>
        {isPreview && <Button size="lg" variant="flat" onClick={onExit}>{t("Thoát ví mẫu", "サンプルを終了", "Exit preview")}</Button>}
      </div>

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} title={sheet === "confirm" ? t("Mô phỏng ứng lương", "受取シミュレーション", "Preview payout") : t("Đã mô phỏng ứng lương", "シミュレーション完了", "Preview completed")}
        footer={sheet === "confirm" ? (
          <Button size="lg" block onClick={() => { withdraw(amt, FEE); setSheet("done"); toast(t(`Đã mô phỏng chuyển ${yen(amt - FEE)}`, `${yen(amt - FEE)} の振込をシミュレート`, `Simulated transfer of ${yen(amt - FEE)}`), "bank"); }}>{t("Xác nhận mô phỏng", "シミュレーションを実行", "Confirm preview")}</Button>
        ) : (
          <Button size="lg" block onClick={() => setSheet(null)}>{t("Xong", "完了", "Done")}</Button>
        )}>
        {sheet === "confirm" ? (
          <dl className="grid gap-3 t-base">
            <p className="t-sm text-muted">{t("Ví mẫu · giao dịch mô phỏng", "サンプルウォレット · 模擬取引", "Sample wallet · simulated transfer")}</p>
            <div className="flex justify-between"><dt className="text-muted">{t("Số tiền ứng", "申請金額", "Requested amount")}</dt><dd className="tnum font-semibold">{yen(amt)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("Phí cố định", "定額手数料", "Flat fee")}</dt><dd className="tnum">−{yen(FEE)}</dd></div>
            <div className="flex justify-between hair-t pt-3 t-sub"><dt>{t("Bạn nhận", "受取額", "You receive")}</dt><dd className="tnum">{yen(amt - FEE)}</dd></div>
            <p className="t-sm text-muted">{t(`Ví dụ: tài khoản nhận ${yen(amt - FEE)}, kỳ lương sau trừ ${yen(amt)}. Bản demo không chuyển tiền.`, `例：口座に ${yen(amt - FEE)} が入金され、次回給与から ${yen(amt)} が差し引かれます（デモのため実振込なし）。`, `Example: ${yen(amt - FEE)} arrives now, ${yen(amt)} is deducted next payday. Demo does not move real funds.`)}</p>
          </dl>
        ) : (
          <div className="text-center py-6">
            <span className="mx-auto grid size-16 place-items-center rounded-full ink animate-[zen-pop_var(--motion-slow)_var(--ease-bounce)]"><Icon name="check" size={32} /></span>
            <p className="t-h3 mt-4">{t("Đã thử ứng lương", "シミュレーション完了", "Payout previewed")}</p>
            <p className="text-muted mt-1">{t("Ví mẫu đã cập nhật. Không có tiền được chuyển tới Yucho ••4821.", "サンプル残高を更新しました。ゆうちょ ••4821 への実送金はありません。", "Sample balance updated. No real money was sent to Yucho ••4821.")}</p>
          </div>
        )}
      </Sheet>
    </Screen>
  );
}
