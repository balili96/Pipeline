"use client";

import Sidebar from "@/components/sidebar";
import NotificationBell from "@/components/notification-bell";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isProjectPage = pathname.startsWith("/dashboard/projects/");
  const aiHidden = searchParams.get("ai") === "0";

  function toggleAIPanel() {
    if (!isProjectPage) return;
    const params = new URLSearchParams(searchParams.toString());
    if (aiHidden) {
      params.delete("ai");
    } else {
      params.set("ai", "0");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-muted hover:text-text hover:bg-gray-100 transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-sm text-muted truncate">
          <Link href="/dashboard" className="hover:text-text transition-colors">
            Dashboard
          </Link>
        </span>
      </div>
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {isProjectPage && (
          <button
            onClick={toggleAIPanel}
            className={`p-2 rounded-lg transition-all duration-200 group ${
              aiHidden
                ? "text-muted hover:bg-gray-100 hover:text-text"
                : "text-accent bg-accent/10"
            }`}
            title={aiHidden ? "Show AI Agent" : "Hide AI Agent"}
          >
            <svg className={`w-5 h-5 transition-transform duration-200 ${aiHidden ? "" : "group-hover:scale-110"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </button>
        )}
        <NotificationBell />
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={
          <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Dashboard</span>
            </div>
            <div className="flex items-center gap-2" />
          </header>
        }>
          <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        </Suspense>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
