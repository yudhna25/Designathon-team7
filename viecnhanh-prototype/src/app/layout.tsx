import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "vietnamese"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "vietnamese"], display: "swap" });

export const metadata: Metadata = {
  title: "ViệcNhanh Aichi · Prototype",
  description: "AI chấm điểm phù hợp JD ↔ hồ sơ: việc đúng visa, đúng tay nghề, HR trả lời trong 24 giờ. Team 7 · Designathon 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

// Sets theme + motion before first paint from the persisted demo config (no flash).
const boot = `try{var s=JSON.parse(localStorage.getItem("viecnhanh-demo-v2")||"{}").state||{};var c=s.config||{};var t=c.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";document.documentElement.dataset.motion=c.motion||"normal";}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-emphasis="brand" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className={`${inter.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
