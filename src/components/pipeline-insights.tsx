"use client";

import { useState, useMemo, useCallback } from "react";
import { AgentType, AGENT_META, PipelineRun, PipelineStageStatus, WorkflowTemplate } from "@/lib/types";
import { projects as projectList } from "@/lib/data";

/* ─── Templates ─── */

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: "full-pipeline",
    name: "Full Pipeline",
    description: "End-to-end: plan, build, test, deploy & document",
    icon: "🚀",
    stages: ["plan", "code", "test", "deploy", "docs"],
    durations: { plan: 2000, code: 3000, test: 2000, deploy: 2500, docs: 1500 },
  },
  {
    id: "quick-build",
    name: "Quick Build",
    description: "Skip planning — straight to code, test & deploy",
    icon: "⚡",
    stages: ["code", "test", "deploy"],
    durations: { plan: 0, code: 3000, test: 1500, deploy: 2000, docs: 0 },
  },
  {
    id: "bug-fix",
    name: "Bug Fix",
    description: "Fast track: code fix → test → deploy",
    icon: "🐛",
    stages: ["code", "test", "deploy"],
    durations: { plan: 0, code: 2000, test: 2000, deploy: 1500, docs: 0 },
  },
  {
    id: "docs-only",
    name: "Docs Update",
    description: "Generate documentation & API reference only",
    icon: "📄",
    stages: ["docs"],
    durations: { plan: 0, code: 0, test: 0, deploy: 0, docs: 3000 },
  },
];

const stageOrder: AgentType[] = ["plan", "code", "test", "deploy", "docs"];

/* ─── Helpers ─── */

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDuration(s: number): string {
  if (s < 1) return "<1s";
  return `${s}s`;
}

/* ─── Tab: Run History ─── */

function RunHistory({ runs, projectId }: { runs: PipelineRun[]; projectId: string }) {
  const projectRuns = runs.filter((r) => r.projectId === projectId).slice(0, 20);

  if (projectRuns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2 text-lg">📊</div>
        <p className="text-xs text-muted font-medium">No pipeline runs yet</p>
        <p className="text-[10px] text-muted/60 mt-0.5">Click "Run Pipeline" to start your first run</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] text-muted font-medium border-b border-border">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Duration</th>
            <th className="px-3 py-2 font-medium">Stages</th>
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {projectRuns.map((run, idx) => {
            const total = run.stages.length;
            const done = run.stages.filter((s) => s.status === "completed").length;
            const failed = run.stages.filter((s) => s.status === "failed").length;
            return (
              <tr key={run.id} className="text-xs text-text hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 tabular-nums text-muted">{projectRuns.length - idx}</td>
                <td className="px-3 py-2.5">{formatDate(run.startedAt)}</td>
                <td className="px-3 py-2.5 text-muted tabular-nums">{formatTime(run.startedAt)}</td>
                <td className="px-3 py-2.5 tabular-nums font-medium">{fmtDuration(run.duration)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    {run.stages.map((s) => (
                      <span
                        key={s.type}
                        className={`text-xs ${
                          s.status === "completed"
                            ? "opacity-100"
                            : s.status === "failed"
                            ? "opacity-100"
                            : "opacity-30"
                        }`}
                        title={`${AGENT_META[s.type].label}: ${s.status}`}
                      >
                        {AGENT_META[s.type].icon}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted ml-1 tabular-nums">
                      {done}/{total}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      run.status === "completed"
                        ? "bg-green/10 text-green"
                        : "bg-red/10 text-red"
                    }`}
                  >
                    {run.status === "completed" ? "Passed" : "Failed"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Stage Performance ─── */

function StagePerformance({ runs, projectId }: { runs: PipelineRun[]; projectId: string }) {
  const projectRuns = runs.filter((r) => r.projectId === projectId);

  const stageStats = useMemo(() => {
    return stageOrder.map((type) => {
      const meta = AGENT_META[type];
      const stageRuns = projectRuns.flatMap((r) =>
        r.stages.filter((s) => s.type === type && s.status !== "skipped")
      );
      const total = stageRuns.length;
      const passed = stageRuns.filter((s) => s.status === "completed").length;
      const failed = stageRuns.filter((s) => s.status === "failed").length;
      const avgDur =
        stageRuns.length > 0
          ? Math.round(stageRuns.reduce((a, s) => a + s.duration, 0) / stageRuns.length)
          : 0;
      const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      return { type, label: meta.label, icon: meta.icon, accentColor: meta.accentColor, total, passed, failed, avgDur, successRate };
    });
  }, [projectRuns]);

  const hasData = stageStats.some((s) => s.total > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2 text-lg">📈</div>
        <p className="text-xs text-muted font-medium">No stage data yet</p>
        <p className="text-[10px] text-muted/60 mt-0.5">Run the pipeline to see per-stage performance</p>
      </div>
    );
  }

  const maxAvgDur = Math.max(...stageStats.map((s) => s.avgDur), 1);

  return (
    <div className="space-y-4 p-2">
      {stageStats.map((s) => {
        if (s.total === 0) return null;
        const barWidth = (s.avgDur / maxAvgDur) * 100;
        return (
          <div key={s.type}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs font-semibold text-text">{s.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  s.successRate >= 80 ? "bg-green/10 text-green" : s.successRate >= 50 ? "bg-amber/10 text-amber" : "bg-red/10 text-red"
                }`}>
                  {s.successRate}%
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted tabular-nums">
                <span>{s.passed}/{s.total} passed</span>
                <span>⏱️ {fmtDuration(s.avgDur)}</span>
              </div>
            </div>
            {/* Duration bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${barWidth}%`,
                  background: s.successRate >= 80
                    ? "linear-gradient(90deg, #22D3A0, #34D399)"
                    : "linear-gradient(90deg, #4F7CFF, #6B96FF)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Tab: Compare Projects ─── */

function CompareProjects({ runs }: { runs: PipelineRun[] }) {
  const [leftId, setLeftId] = useState(projectList[0]?.id || "");
  const [rightId, setRightId] = useState(projectList[1]?.id || "");

  const metrics = useMemo(() => {
    function calc(pid: string) {
      const projectRuns = runs.filter((r) => r.projectId === pid);
      const project = projectList.find((p) => p.id === pid);
      const totalRuns = projectRuns.length;
      const totalDuration = projectRuns.reduce((a, r) => a + r.duration, 0);
      const avgDuration = totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0;
      const allStages = projectRuns.flatMap((r) => r.stages);
      const completed = allStages.filter((s) => s.status === "completed").length;
      const failed = allStages.filter((s) => s.status === "failed").length;
      const successRate = allStages.length > 0 ? Math.round((completed / allStages.length) * 100) : 0;
      return { id: pid, name: project?.name || "Unknown", totalRuns, avgDuration, totalDuration, completed, failed, successRate };
    }
    return { left: leftId ? calc(leftId) : null, right: rightId ? calc(rightId) : null };
  }, [runs, leftId, rightId]);

  const MetricCard = ({ data, side }: { data: { id: string; name: string; totalRuns: number; avgDuration: number; totalDuration: number; completed: number; failed: number; successRate: number } | null; side: "left" | "right" }) => (
    <div className="flex-1 bg-bg rounded-xl border border-border p-4">
      {data ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${side === "left" ? "bg-accent" : "bg-green"}`} />
            <h4 className="text-sm font-semibold text-text">{data.name}</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted">Runs</p>
              <p className="text-lg font-bold text-text tabular-nums">{data.totalRuns}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Avg Duration</p>
              <p className="text-lg font-bold text-text tabular-nums">{fmtDuration(data.avgDuration)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Success Rate</p>
              <p className={`text-lg font-bold tabular-nums ${data.successRate >= 80 ? "text-green" : "text-amber"}`}>
                {data.successRate}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Total Time</p>
              <p className="text-lg font-bold text-text tabular-nums">{fmtDuration(data.totalDuration)}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-muted py-8">
          Select a project
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Selectors */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <select
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors"
          >
            {projectList.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <span className="text-muted text-xs font-medium">vs</span>
        <div className="flex-1">
          <select
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors"
          >
            {projectList.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric cards */}
      <div className="flex gap-3">
        <MetricCard data={metrics.left} side="left" />
        <MetricCard data={metrics.right} side="right" />
      </div>
    </div>
  );
}

/* ─── Tab: Workflow Templates ─── */

function WorkflowTemplates({ onSelect }: { onSelect: (template: WorkflowTemplate) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => onSelect(tpl)}
          className="flex items-start gap-3 bg-bg border border-border rounded-xl p-4 hover:border-accent/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
            {tpl.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-text">{tpl.name}</h4>
            <p className="text-xs text-muted mt-0.5">{tpl.description}</p>
            <div className="flex items-center gap-1 mt-2">
              {tpl.stages.map((s) => (
                <span key={s} className="text-xs" title={AGENT_META[s].label}>
                  {AGENT_META[s].icon}
                </span>
              ))}
              <span className="text-[10px] text-muted ml-1">
                ~{Math.round(tpl.stages.reduce((a, s) => a + tpl.durations[s], 0) / 1000)}s
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Tabs ─── */

type TabId = "history" | "performance" | "compare" | "templates";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "history", label: "Run History", icon: "📊" },
  { id: "performance", label: "Stage Performance", icon: "📈" },
  { id: "compare", label: "Compare Projects", icon: "⚖️" },
  { id: "templates", label: "Templates", icon: "📋" },
];

/* ─── Main Component ─── */

interface PipelineInsightsProps {
  runs: PipelineRun[];
  projectId: string;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export default function PipelineInsights({ runs, projectId, onSelectTemplate }: PipelineInsightsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("history");
  const [animKey, setAnimKey] = useState(0);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 8L4 5L7 8L12 3L15 6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 3H15V6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-sm font-semibold text-text">Insights</h3>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-text bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content with smooth transition */}
      <div className="p-4" key={animKey}>
        <div className="animate-fade-in">
          {activeTab === "history" && <RunHistory runs={runs} projectId={projectId} />}
          {activeTab === "performance" && <StagePerformance runs={runs} projectId={projectId} />}
          {activeTab === "compare" && <CompareProjects runs={runs} />}
          {activeTab === "templates" && <WorkflowTemplates onSelect={onSelectTemplate} />}
        </div>
      </div>
    </div>
  );
}

export { TEMPLATES };
export type { WorkflowTemplate };
