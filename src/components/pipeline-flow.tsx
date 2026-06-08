"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AgentType, AGENT_META, PipelineStage, PipelineStageStatus } from "@/lib/types";

interface PipelineFlowProps {
  stages: PipelineStage[];
  onStageClick?: (type: AgentType) => void;
  onRunPipeline?: () => void;
  onRetryStage?: (type: AgentType) => void;
  running?: boolean;
}

const stageOrder: AgentType[] = ["plan", "code", "test", "deploy", "docs"];

/* ─── Stage Detail Panel ─── */

function StageDetailPanel({
  stage,
  onClose,
  onRetry,
}: {
  stage: PipelineStage;
  onClose: () => void;
  onRetry?: () => void;
}) {
  const meta = AGENT_META[stage.type];

  const statusConfig = {
    idle: { label: "Pending", dot: "bg-gray-300", bg: "bg-gray-50" },
    active: { label: "Running", dot: "bg-accent animate-pulse", bg: "bg-accent/5" },
    completed: { label: "Completed", dot: "bg-green", bg: "bg-green/5" },
    failed: { label: "Failed", dot: "bg-red", bg: "bg-red/5" },
    skipped: { label: "Skipped", dot: "bg-gray-300", bg: "bg-gray-50" },
  }[stage.status];

  const elapsed =
    stage.status === "active" && stage.startedAt
      ? Math.floor((Date.now() - new Date(stage.startedAt).getTime()) / 1000)
      : 0;
  const duration =
    stage.status === "completed" && stage.startedAt && stage.completedAt
      ? Math.floor((new Date(stage.completedAt).getTime() - new Date(stage.startedAt).getTime()) / 1000)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-border w-full max-w-md p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${meta.accentColor}15` }}
          >
            {meta.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">{meta.label}</h3>
            <p className="text-xs text-muted">{meta.description}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${statusConfig.bg} mb-4`}>
          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
          {statusConfig.label}
        </div>

        {/* Timing info */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Started</span>
            <span className="text-text font-medium tabular-nums">
              {stage.startedAt
                ? new Date(stage.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : "—"}
            </span>
          </div>
          {duration !== null ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Duration</span>
              <span className="text-text font-medium tabular-nums">{duration}s</span>
            </div>
          ) : stage.status === "active" ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Elapsed</span>
              <span className="text-accent font-semibold tabular-nums animate-pulse">{elapsed}s</span>
            </div>
          ) : null}
          {stage.completedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Completed</span>
              <span className="text-text font-medium tabular-nums">
                {new Date(stage.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          )}
        </div>

        {/* Summary */}
        {stage.summary && (
          <div className="bg-bg rounded-xl p-3 mb-5">
            <p className="text-xs font-medium text-muted mb-1">Summary</p>
            <p className="text-sm text-text">{stage.summary}</p>
          </div>
        )}

        {/* Retry button for failed stages */}
        {stage.status === "failed" && onRetry && (
          <button
            onClick={() => { onRetry(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 8L4 5L7 8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 5C4 2.24 6.24 0 9 0C11.76 0 14 2.24 14 5C14 7.76 11.76 10 9 10H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retry Stage
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */

function ProgressBar({ stages }: { stages: PipelineStage[] }) {
  const total = stages.length;
  const done = stages.filter((s) => s.status === "completed").length;
  const active = stages.filter((s) => s.status === "active").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "linear-gradient(90deg, #22D3A0, #34D399)"
                : "linear-gradient(90deg, #4F7CFF, #6B96FF)",
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted tabular-nums shrink-0">
        <span className={`font-semibold ${pct === 100 ? "text-green" : "text-accent"}`}>
          {pct}%
        </span>
        <span className="text-muted/60">
          ({done}/{total})
        </span>
        {active > 0 && (
          <span className="flex items-center gap-1 text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {active} active
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Stage Card ─── */

function StageCard({
  stage,
  isLast,
  elapsed,
  onClick,
}: {
  stage: PipelineStage;
  isLast: boolean;
  elapsed: number;
  onClick?: () => void;
}) {
  const meta = AGENT_META[stage.type];
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  const borderColor = {
    idle: "border-border bg-white",
    active: "border-accent bg-accent/[0.03] shadow-[0_0_0_1px_rgba(79,124,255,0.25)]",
    completed: "border-green bg-green/[0.03]",
    failed: "border-red bg-red/[0.03]",
    skipped: "border-gray-200 bg-gray-50 opacity-60",
  }[stage.status];

  const statusDot = {
    idle: "bg-gray-300",
    active: "bg-accent animate-pulse",
    completed: "bg-green",
    failed: "bg-red",
    skipped: "bg-gray-300",
  }[stage.status];

  const statusLabel = {
    idle: "Pending",
    active: "Running",
    completed: "Done",
    failed: "Failed",
    skipped: "Skipped",
  }[stage.status];

  return (
    <div className="flex items-center gap-0 flex-1 min-w-0">
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl border transition-all duration-500 flex-1 min-w-0 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${borderColor} ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* Icon row */}
        <div className="flex items-center gap-2 w-full">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-all duration-500"
            style={{
              backgroundColor: `${meta.accentColor}15`,
              transform: stage.status === "active" ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
            }}
          >
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-xs font-semibold text-text truncate">
              {meta.label}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot} transition-all duration-500`} />
              <span className="text-[10px] text-muted font-medium">{statusLabel}</span>
            </div>
          </div>

          {/* Timer for active stage */}
          {stage.status === "active" && elapsed > 0 && (
            <span className="text-[10px] text-accent font-semibold tabular-nums shrink-0 animate-pulse">
              {elapsed}s
            </span>
          )}

          {/* Retry icon for failed */}
          {stage.status === "failed" && (
            <svg className="w-4 h-4 text-red shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5V8L10 10" strokeLinecap="round" />
            </svg>
          )}

          {/* Checkmark for done */}
          {stage.status === "completed" && (
            <svg className="w-4 h-4 text-green shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 8L7 11L12 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Summary */}
        {stage.summary && (
          <div className="w-full text-[10px] text-muted/70 leading-tight line-clamp-2 text-left mt-0.5">
            {stage.summary}
          </div>
        )}
      </button>

      {/* Connector arrow */}
      {!isLast && (
        <div className="flex items-center shrink-0 mx-0.5">
          <svg
            className={`w-5 h-5 transition-all duration-500 ${
              stage.status === "completed"
                ? "text-green"
                : stage.status === "active"
                ? "text-accent animate-pulse"
                : "text-border"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function PipelineFlow({ stages, onStageClick, onRunPipeline, onRetryStage, running }: PipelineFlowProps) {
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});

  // Timer: update elapsed seconds for active stages
  useEffect(() => {
    const activeStages = stages.filter((s) => s.status === "active");
    if (activeStages.length === 0) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = { ...prev };
        for (const s of activeStages) {
          if (s.startedAt) {
            next[s.type] = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stages]);

  // Reset elapsed when stages change (new run)
  useEffect(() => {
    setElapsed({});
  }, [stages.length, stages.map((s) => `${s.type}:${s.status}`).join(",")]);

  const ordered = stageOrder.map((type) => {
    const existing = stages.find((s) => s.type === type);
    return existing || { type, status: "idle" as PipelineStageStatus };
  });

  const activeCount = ordered.filter((s) => s.status === "active" || s.status === "completed").length;
  const totalCount = ordered.length;

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 transition-all duration-300">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 8L4 5L7 8L12 3L15 6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3H15V6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-sm font-semibold text-text">Pipeline Flow</h3>
          </div>
          <div className="flex items-center gap-2">
            {onRunPipeline && (
              <button
                onClick={onRunPipeline}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {running ? (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Running…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 2L14 8L4 14V2Z" />
                    </svg>
                    Run Pipeline
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <ProgressBar stages={ordered} />
        </div>

        {/* Flow stages */}
        <div className="flex items-center gap-0">
          {ordered.map((stage, i) => (
            <StageCard
              key={stage.type}
              stage={stage}
              isLast={i === ordered.length - 1}
              elapsed={elapsed[stage.type] || 0}
              onClick={() => {
                setSelectedStage(stage);
                onStageClick?.(stage.type);
              }}
            />
          ))}
        </div>
      </div>

      {/* Stage Detail Modal */}
      {selectedStage && (
        <StageDetailPanel
          stage={selectedStage}
          onClose={() => setSelectedStage(null)}
          onRetry={
            selectedStage.status === "failed" && onRetryStage
              ? () => onRetryStage(selectedStage.type)
              : undefined
          }
        />
      )}
    </>
  );
}
