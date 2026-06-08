"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ActivityEvent, AGENT_META, AgentType } from "@/lib/types";

interface ActivityTrailProps {
  events: ActivityEvent[];
  onClear?: () => void;
}

/* ─── Helpers ─── */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return "Just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return "<1s";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

const statusStyles: Record<string, { dot: string; bg: string; border: string }> = {
  running: { dot: "bg-accent animate-pulse", bg: "bg-accent/5", border: "border-accent/20" },
  success: { dot: "bg-green", bg: "bg-green/5", border: "border-green/20" },
  failed: { dot: "bg-red", bg: "bg-red/5", border: "border-red/20" },
  pending: { dot: "bg-gray-300", bg: "bg-gray-50", border: "border-gray-200" },
};

const allAgentTypes: AgentType[] = ["plan", "code", "test", "deploy", "docs"];

/* ─── Duration Metrics Bar ─── */

function MetricsBar({ events }: { events: ActivityEvent[] }) {
  const completed = events.filter((e) => e.status === "success");
  const durations = completed
    .map((e) => {
      if (!e.duration) return null;
      const match = e.duration.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : null;
    })
    .filter((d): d is number => d !== null);

  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  // Per-agent metrics
  const byAgent = allAgentTypes.map((type) => {
    const agentEvents = completed.filter((e) => e.agentType === type);
    return {
      type,
      count: agentEvents.length,
      icon: AGENT_META[type].icon,
    };
  }).filter((a) => a.count > 0);

  if (completed.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-bg border-b border-border">
      {/* Total events */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted">
        <span className="font-semibold text-text tabular-nums">{completed.length}</span>
        <span>completed</span>
      </div>

      {/* Avg duration */}
      {avgDuration > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4.5V8L10.5 10" strokeLinecap="round" />
          </svg>
          <span className="tabular-nums">{formatDuration(Math.round(avgDuration))}</span>
          <span>avg</span>
        </div>
      )}

      {/* Total duration */}
      {totalDuration > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="tabular-nums font-medium text-text">{formatDuration(Math.round(totalDuration))}</span>
          <span>total</span>
        </div>
      )}

      {/* Agent breakdown */}
      <div className="flex items-center gap-1.5 ml-auto">
        {byAgent.map((a) => (
          <span key={a.type} className="flex items-center gap-1 text-[10px] text-muted bg-white border border-border rounded-full px-2 py-0.5">
            <span>{a.icon}</span>
            <span className="tabular-nums font-medium">{a.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Single Event Row (Timeline Style) ─── */

function EventRow({
  event,
  isLatest,
  showConnector,
}: {
  event: ActivityEvent;
  isLatest: boolean;
  showConnector: boolean;
}) {
  const st = statusStyles[event.status] || statusStyles.pending;
  const meta = AGENT_META[event.agentType];

  return (
    <div className="flex gap-4 px-4 py-3 group hover:bg-gray-50/50 transition-colors">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-all duration-300 ${
            event.status === "running"
              ? "border-accent bg-accent/10"
              : event.status === "success"
              ? "border-green bg-green/10"
              : event.status === "failed"
              ? "border-red bg-red/10"
              : "border-gray-200 bg-gray-50"
          } ${isLatest ? "animate-scale-in" : ""}`}
        >
          <span>{meta?.icon || "🤖"}</span>
        </div>
        {showConnector && (
          <div className={`w-0.5 flex-1 min-h-[16px] transition-colors duration-500 ${
            event.status === "success" ? "bg-green/30" : "bg-border"
          }`} />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-text">
            {meta?.label || "Agent"}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {event.duration && (
            <span className="text-[10px] text-muted/60 tabular-nums bg-gray-100 rounded px-1.5 py-0.5">
              {event.duration}
            </span>
          )}
        </div>
        <p className="text-xs text-text mt-0.5 leading-snug">
          <span className="font-medium">{event.action}</span>
          {event.detail && (
            <span className="text-muted"> — {event.detail}</span>
          )}
        </p>
        <span className="text-[10px] text-muted/60 tabular-nums mt-1 block">
          {timeAgo(event.timestamp)}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function ActivityTrail({ events, onClear }: ActivityTrailProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<AgentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-scroll to latest
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    let result = events;
    if (activeFilter !== "all") {
      result = result.filter((e) => e.agentType === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          (e.detail && e.detail.toLowerCase().includes(q))
      );
    }
    return result;
  }, [events, activeFilter, searchQuery]);

  // Duration stats for display
  const completedCount = events.filter((e) => e.status === "success").length;
  const runningCount = events.filter((e) => e.status === "running").length;
  const failedCount = events.filter((e) => e.status === "failed").length;

  return (
    <div className="bg-card border border-border rounded-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4H14M2 8H14M2 12H10" strokeLinecap="round" />
          </svg>
          <h3 className="text-sm font-semibold text-text">Activity Trail</h3>
          <div className="flex items-center gap-1.5 ml-1">
            {completedCount > 0 && (
              <span className="text-[10px] text-green font-medium tabular-nums bg-green/10 rounded-full px-1.5 py-0.5">
                {completedCount} done
              </span>
            )}
            {runningCount > 0 && (
              <span className="text-[10px] text-accent font-medium tabular-nums bg-accent/10 rounded-full px-1.5 py-0.5 animate-pulse">
                {runningCount} active
              </span>
            )}
            {failedCount > 0 && (
              <span className="text-[10px] text-red font-medium tabular-nums bg-red/10 rounded-full px-1.5 py-0.5">
                {failedCount} failed
              </span>
            )}
          </div>
        </div>
        {events.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-[11px] text-muted hover:text-text transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Metrics bar */}
      <MetricsBar events={events} />

      {/* Filter + Search bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-4 py-2.5 border-b border-border">
        {/* Agent filter pills */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all ${
              activeFilter === "all"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-text bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {allAgentTypes.map((type) => {
            const meta = AGENT_META[type];
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all ${
                  activeFilter === type
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-text bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label.replace(" Agent", "")}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-[200px] w-full">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trail…"
            className="w-full pl-7 pr-2 py-1.5 bg-bg border border-border rounded-lg text-[11px] text-text placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text"
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Export */}
        {events.length > 0 && (
          <button
            onClick={() => {
              const headers = ["Time", "Agent", "Action", "Detail", "Status", "Duration"];
              const rows = events.map((e) => [
                new Date(e.timestamp).toISOString(),
                AGENT_META[e.agentType]?.label || e.agentType,
                e.action,
                e.detail || "",
                e.status,
                e.duration || "",
              ]);
              const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `activity-trail-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-muted hover:text-text bg-gray-100 hover:bg-gray-200 rounded-lg transition-all shrink-0"
            title="Export as CSV"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 3V11M8 11L5 8M8 11L11 8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12V13.5C2 14.33 2.67 15 3.5 15H12.5C13.33 15 14 14.33 14 13.5V12" strokeLinecap="round" />
            </svg>
            Export
          </button>
        )}
      </div>

      {/* Events feed */}
      <div ref={listRef} className="overflow-y-auto max-h-[400px]">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-3 text-2xl">
              📋
            </div>
            <p className="text-sm text-muted font-medium">No activity yet</p>
            <p className="text-xs text-muted/60 mt-1 max-w-[200px]">
              Run the pipeline or prompt the AI agent — actions will appear here
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2 text-lg">
              🔍
            </div>
            <p className="text-sm text-muted font-medium">No matching events</p>
            <p className="text-xs text-muted/60 mt-0.5">
              Try a different filter or search term
            </p>
            <button
              onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}
              className="mt-3 text-xs text-accent font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            {filteredEvents.map((event, idx) => (
              <EventRow
                key={event.id}
                event={event}
                isLatest={idx === 0}
                showConnector={idx < filteredEvents.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
