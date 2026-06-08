"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  notifications as initialNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  type Notification,
} from "@/lib/notifications-data";

const typeIcons: Record<string, string> = {
  deadline: "📅",
  task_update: "🔄",
  ai_complete: "🤖",
  deploy: "🚀",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMarkAllRead() {
    markAllAsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleNotificationClick(n: Notification) {
    markAsRead(n.id);
    setNotifs((prev) =>
      prev.map((n2) => (n2.id === n.id ? { ...n2, read: true } : n2))
    );
    setOpen(false);
    router.push(`/dashboard/projects/${n.projectId}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 text-muted group-hover:text-text transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-red text-white text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] px-1 animate-scale-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute right-0 sm:right-0 mt-0 sm:mt-2 w-full sm:w-80 bg-white border border-border rounded-none sm:rounded-xl shadow-xl z-50 max-h-[480px] flex flex-col sm:inset-auto sm:top-auto left-0 sm:left-auto top-0 sm:top-auto bottom-0 sm:bottom-auto animate-scale-in origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <h3 className="font-semibold text-sm text-text flex items-center gap-2">
              <span>🔔</span> Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-accent hover:underline transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="overflow-y-auto flex-1">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-2xl mb-2">🔔</span>
                <p className="text-sm text-muted font-medium">All caught up!</p>
                <p className="text-xs text-muted/60 mt-0.5">No new notifications</p>
              </div>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-border/50 last:border-b-0 ${
                    !n.read ? "bg-accent/[0.02]" : ""
                  }`}
                >
                  {/* Icon */}
                  <span className="text-base shrink-0 mt-0.5">
                    {typeIcons[n.type] || "🔔"}
                  </span>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm leading-snug ${
                        !n.read ? "font-semibold text-text" : "text-muted"
                      }`}
                    >
                      {n.message}
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                      {timeAgo(n.timestamp)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
