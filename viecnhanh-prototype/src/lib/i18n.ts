"use client";
import { useApp } from "./store";

/** Ngôn ngữ app người lao động. Tiếng Việt là mặc định; tiếng Nhật dùng cho buổi trình bày với nhà máy / ban giám khảo. */
export type WLang = "vi" | "ja";

export const useLang = (): WLang => useApp((s) => s.config.workerLang ?? "vi");

/** t("tiếng Việt", "日本語") theo ngôn ngữ đang chọn. */
export function useT() {
  const lang = useLang();
  return (vi: string, ja: string) => (lang === "ja" ? ja : vi);
}

/** Dùng ngoài component (toast, hàm tiện ích). */
export const tNow = (vi: string, ja: string) => ((useApp.getState().config.workerLang ?? "vi") === "ja" ? ja : vi);
