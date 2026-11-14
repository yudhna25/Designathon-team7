"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useApp, useHydrated } from "@/lib/store";
import { BottomNav, SideNav, StatusNotifier } from "@/components/worker/Shell";

// Routes that run full-screen (no nav): auth, onboarding, AI analysis, focused task flows.
const BARE = ["/worker/onboarding", "/worker/analyzing"];
const NO_BOTTOM_NAV = ["/worker/jobs/", "/worker/improve", "/worker/safety"];

export default function WorkerLayout({ children }: { children: ReactNode }) {
  const ready = useHydrated();
  const path = usePathname();
  const router = useRouter();
  const auth = useApp((s) => s.auth);
  const profile = useApp((s) => s.profile);
  const bare = path === "/worker" || BARE.some((p) => path.startsWith(p));

  useEffect(() => {
    if (!ready) return;
    if (path === "/worker") return;
    if (!auth) router.replace("/worker");
    else if (!profile && !path.startsWith("/worker/onboarding")) router.replace("/worker/onboarding");
  }, [ready, auth, profile, path, router]);

  if (!ready) return <div className="min-h-dvh bg-canvas" data-type="base-16" />;
  const guarded = path !== "/worker" && (!auth || (!profile && !path.startsWith("/worker/onboarding")));

  return (
    <div data-type="base-16" data-density="comfortable" className="min-h-dvh bg-canvas text-fg">
      <StatusNotifier />
      {guarded ? null : bare ? (
        children
      ) : (
        <div className="lg:flex mx-auto max-w-[1440px]">
          <SideNav />
          <main className={`flex-1 min-w-0 ${NO_BOTTOM_NAV.some((p) => path.startsWith(p)) ? "pb-32" : "pb-28"} lg:pb-12`}>{children}</main>
        </div>
      )}
      {!bare && !guarded && !NO_BOTTOM_NAV.some((p) => path.startsWith(p)) && <BottomNav />}
    </div>
  );
}
