"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  projects,
  getInitialPipelineStages,
  getActivityEventsByProject,
} from "@/lib/data";
import { PipelineStage, ActivityEvent, PipelineRun, WorkflowTemplate } from "@/lib/types";
import PipelineFlow from "@/components/pipeline-flow";
import ActivityTrail from "@/components/activity-trail";
import PipelineInsights from "@/components/pipeline-insights";

/* ─── Constants ─── */

const STAGE_DURATIONS: Record<string, number> = {
  plan: 2500,
  code: 3500,
  test: 2000,
  deploy: 2500,
  docs: 1500,
};

const stageOrder: Array<"plan" | "code" | "test" | "deploy" | "docs"> = [
  "plan", "code", "test", "deploy", "docs",
];

type SectionId = "flow" | "trail" | "insights";

const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: "flow", label: "Pipeline", icon: "🔷" },
  { id: "trail", label: "Activity", icon: "📋" },
  { id: "insights", label: "Insights", icon: "📊" },
];

/* ─── Toast Component ─── */

function Toast({
  message,
  sub,
  visible,
  icon,
}: {
  message: string;
  sub?: string;
  visible: boolean;
  icon?: string;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white rounded-xl shadow-2xl border border-white/10 px-4 py-3 transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <div>
        <p className="text-sm font-semibold">{message}</p>
        {sub && <p className="text-xs text-white/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Collapsible Section Wrapper ─── */

function Section({
  id,
  label,
  icon,
  isOpen,
  onToggle,
  children,
  badge,
}: {
  id: string;
  label: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string | number;
}) {
  return (
    <div className="mb-5" id={`section-${id}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-accent/30 transition-all group mb-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="text-sm font-semibold text-text">{label}</span>
          {badge !== undefined && (
            <span className="text-[10px] text-muted bg-gray-100 rounded-full px-1.5 py-0.5 tabular-nums font-medium">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Page Component ─── */

export default function WorkflowPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("proj-1");
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(
    () => getInitialPipelineStages("proj-1")
  );
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(
    () => getActivityEventsByProject("proj-1")
  );
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    flow: true,
    trail: true,
    insights: true,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ message: "", sub: "", icon: "✅" });
  const trailRef = useRef<HTMLDivElement | null>(null);
  const runningRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  /* ─── Toast helper ─── */
  const fireToast = useCallback((message: string, sub: string, icon: string) => {
    setToastData({ message, sub, icon });
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 4000);
  }, []);

  /* ─── Keyboard shortcut: R to run ─── */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "r" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        handleRunPipeline();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  /* ─── Cleanup toast timer ─── */
  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const handleProjectChange = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setPipelineStages(getInitialPipelineStages(projectId));
    setActivityEvents(getActivityEventsByProject(projectId));
    setPipelineRunning(false);
    setOpenSections({ flow: true, trail: true, insights: true });
    runningRef.current = false;
  }, []);

  const handleClearActivity = useCallback(() => {
    setActivityEvents([]);
  }, []);

  const toggleSection = useCallback((id: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* ─── Run Pipeline ─── */
  const handleRunPipeline = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setPipelineRunning(true);
    setPipelineStages([]);
    setOpenSections((prev) => ({ ...prev, flow: true, trail: true }));

    let cumulativeDelay = 300;

    stageOrder.forEach((type, idx) => {
      const startedAt = new Date(Date.now() + cumulativeDelay).toISOString();

      // Activate
      setTimeout(() => {
        if (!runningRef.current) return;
        setPipelineStages((prev) => {
          const next = prev.filter((s) => s.type !== type);
          return [...next, { type, status: "active" as const, startedAt, summary: `Processing ${type} phase…` }];
        });
        setActivityEvents((prev) => [
          { id: `act-${Date.now()}-${type}-start`, projectId: selectedProjectId, agentType: type, action: `Started ${type} phase`, detail: `Processing ${type} in the pipeline…`, status: "running", timestamp: new Date().toISOString() },
          ...prev,
        ]);
      }, cumulativeDelay);

      // Complete
      const completeDelay = cumulativeDelay + STAGE_DURATIONS[type];
      setTimeout(() => {
        if (!runningRef.current) return;
        setPipelineStages((prev) => {
          const next = prev.filter((s) => s.type !== type);
          return [...next, { type, status: "completed" as const, startedAt, completedAt: new Date(Date.now()).toISOString(), summary: `${type} completed successfully` }];
        });
        const duration = STAGE_DURATIONS[type];
        setActivityEvents((prev) => [
          { id: `act-${Date.now()}-${type}-done`, projectId: selectedProjectId, agentType: type, action: `Completed ${type} phase`, detail: `${type} finished in ${(duration / 1000).toFixed(1)}s`, status: "success", timestamp: new Date().toISOString(), duration: `${(duration / 1000).toFixed(1)}s` },
          ...prev,
        ]);

        if (idx === stageOrder.length - 1) {
          runningRef.current = false;
          setPipelineRunning(false);
          const runDuration = cumulativeDelay + STAGE_DURATIONS[type];
          setPipelineRuns((prev) => [
            { id: `run-${Date.now()}`, projectId: selectedProjectId, startedAt: new Date(Date.now()).toISOString(), completedAt: new Date(Date.now() + runDuration).toISOString(), duration: Math.round(runDuration / 1000), stages: stageOrder.map((t) => ({ type: t, status: "completed" as const, duration: Math.round(STAGE_DURATIONS[t] / 1000) })), status: "completed" },
            ...prev,
          ]);
          fireToast("Pipeline complete!", `${stageOrder.length} stages • ${Math.round(runDuration / 1000)}s`, "✅");
        }
      }, completeDelay);

      cumulativeDelay += STAGE_DURATIONS[type] + 500;
    });
  }, [selectedProjectId, fireToast]);

  /* ─── Retry ─── */
  const handleRetryStage = useCallback((type: string) => {
    if (runningRef.current) return;
    setPipelineStages((prev) => {
      const next = prev.filter((s) => s.type !== type);
      return [...next, { type: type as PipelineStage["type"], status: "active" as const, startedAt: new Date().toISOString(), summary: `Retrying ${type}…` }];
    });
    setActivityEvents((prev) => [
      { id: `act-${Date.now()}-retry`, projectId: selectedProjectId, agentType: type as PipelineStage["type"], action: `Retrying ${type} phase`, detail: `Manual retry triggered`, status: "running", timestamp: new Date().toISOString() },
      ...prev,
    ]);
    const duration = STAGE_DURATIONS[type] || 2000;
    setTimeout(() => {
      setPipelineStages((prev) => {
        const next = prev.filter((s) => s.type !== type);
        return [...next, { type: type as PipelineStage["type"], status: "completed" as const, startedAt: new Date(Date.now() - duration).toISOString(), completedAt: new Date().toISOString(), summary: `${type} completed on retry` }];
      });
      setActivityEvents((prev) => [
        { id: `act-${Date.now()}-retry-done`, projectId: selectedProjectId, agentType: type as PipelineStage["type"], action: `Retry succeeded`, detail: `${type} completed on retry attempt`, status: "success", timestamp: new Date().toISOString(), duration: `${(duration / 1000).toFixed(1)}s` },
        ...prev,
      ]);
      fireToast("Stage recovered!", `${type} retry succeeded in ${(duration / 1000).toFixed(1)}s`, "🔄");
    }, duration);
  }, [selectedProjectId, fireToast]);

  /* ─── Template ─── */
  const handleSelectTemplate = useCallback(
    (_template: WorkflowTemplate) => {
      handleRunPipeline();
    },
    [handleRunPipeline]
  );

  const activityBadge = `${activityEvents.filter((e) => e.status === "success").length}/${activityEvents.length}`;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Workflow</h1>
            <p className="text-sm text-muted mt-1">
              Visualize and track your AI agent pipeline
            </p>
          </div>
          {/* Keyboard shortcut hint */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-border rounded-lg text-[10px] text-muted tabular-nums font-medium">
            <kbd className="px-1 py-0.5 bg-white border border-border rounded text-[9px] font-bold">R</kbd>
            <span>Run</span>
          </span>
        </div>

        {/* Project selector */}
        <div className="relative w-full sm:w-56">
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full appearance-none bg-card border border-border rounded-xl px-3.5 py-2.5 pr-9 text-sm text-text font-medium focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Quick-nav mini bar */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto">
        {SECTIONS.map((s) => {
          const isOpen = openSections[s.id];
          return (
            <button
              key={s.id}
              onClick={() => {
                if (!isOpen) toggleSection(s.id);
                document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-card border border-border hover:border-accent/30 hover:bg-accent/5 transition-all whitespace-nowrap"
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green" : "bg-gray-300"}`} />
            </button>
          );
        })}
      </div>

      {/* ─── Section: Pipeline Flow ─── */}
      <Section
        id="flow"
        label="Pipeline Flow"
        icon="🔷"
        isOpen={openSections.flow}
        onToggle={() => toggleSection("flow")}
        badge={pipelineRunning ? "Running" : `${pipelineStages.filter((s) => s.status === "completed").length}/5`}
      >
        <PipelineFlow
          stages={pipelineStages}
          onRunPipeline={handleRunPipeline}
          onRetryStage={handleRetryStage}
          running={pipelineRunning}
        />
      </Section>

      {/* ─── Section: Activity Trail ─── */}
      <div ref={trailRef}>
        <Section
          id="trail"
          label="Activity Trail"
          icon="📋"
          isOpen={openSections.trail}
          onToggle={() => toggleSection("trail")}
          badge={activityBadge}
        >
          <ActivityTrail events={activityEvents} onClear={handleClearActivity} />
        </Section>
      </div>

      {/* ─── Section: Insights ─── */}
      <Section
        id="insights"
        label="Insights"
        icon="📊"
        isOpen={openSections.insights}
        onToggle={() => toggleSection("insights")}
        badge={pipelineRuns.length > 0 ? `${pipelineRuns.length} run${pipelineRuns.length > 1 ? "s" : ""}` : undefined}
      >
        <PipelineInsights
          runs={pipelineRuns}
          projectId={selectedProjectId}
          onSelectTemplate={handleSelectTemplate}
        />
      </Section>

      {/* Toast notification */}
      <Toast
        message={toastData.message}
        sub={toastData.sub}
        icon={toastData.icon}
        visible={showToast}
      />
    </div>
  );
}
