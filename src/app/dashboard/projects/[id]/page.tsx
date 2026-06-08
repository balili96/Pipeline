"use client";

import { useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getProjectById, getTasksByProjectId } from "@/lib/data";
import { Task } from "@/lib/types";
import KanbanBoard from "@/components/kanban-board";
import AIPanel from "@/components/ai-panel";
import SprintGenerator from "@/components/sprint-generator";
import ProgressAnalytics from "@/components/progress-analytics";
import DocumentModule from "@/components/document-module";
import TeamPanel from "@/components/team-panel";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = getProjectById(projectId);
  const searchParams = useSearchParams();
  const showAIPanel = searchParams.get("ai") !== "0";

  const [tasks, setTasks] = useState<Task[]>(() =>
    getTasksByProjectId(projectId)
  );
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  const handleTasksGenerated = useCallback(
    (newTasks: Task[]) => {
      setTasks((prev) => [...prev, ...newTasks]);
    },
    []
  );

  if (!project) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold text-text mb-2">
          Project not found
        </h2>
        <p className="text-sm text-muted mb-4">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-accent hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 md:px-8 py-4 md:py-5 border-b border-border bg-white">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted mb-2 min-w-0">
            <Link
              href="/dashboard"
              className="hover:text-text transition-colors shrink-0"
            >
              Projects
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-text font-medium truncate">{project.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-text truncate">{project.name}</h1>
              <p className="text-sm text-muted mt-1 line-clamp-2">
                {project.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mr-2">
                <button
                  onClick={() => {
                    setShowDocuments(false);
                    setShowTeam(false);
                    setShowAnalytics((prev) => !prev);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    showAnalytics
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => {
                    setShowAnalytics(false);
                    setShowTeam(false);
                    setShowDocuments((prev) => !prev);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    showDocuments
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  📄 Documents
                </button>
                <button
                  onClick={() => {
                    setShowAnalytics(false);
                    setShowDocuments(false);
                    setShowTeam((prev) => !prev);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    showTeam
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  👥 Team
                </button>
              </div>
              <SprintGenerator
                projectId={projectId}
                onTasksGenerated={handleTasksGenerated}
              />
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  project.status === "active"
                    ? "bg-green/10 text-green border border-green/20"
                    : project.status === "completed"
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "bg-gray-100 text-muted border border-gray-200"
                }`}
              >
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Team section */}
        {showTeam ? (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in">
            <TeamPanel projectId={projectId} />
          </div>
        ) : showDocuments ? (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in">
            <DocumentModule projectId={projectId} />
          </div>
        ) : (
          <>
            {showAnalytics && (
              <div className="px-4 md:px-8 py-4 border-b border-border bg-white animate-fade-in">
                <ProgressAnalytics projectId={projectId} />
              </div>
            )}

            {/* Kanban board */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <KanbanBoard
                projectId={projectId}
                tasks={tasks}
                onTasksChange={setTasks}
              />
            </div>
          </>
        )}
      </div>

      {/* AI Agent Panel */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showAIPanel ? "w-[384px] opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        <AIPanel projectId={projectId} onTasksGenerated={handleTasksGenerated} />
      </div>
    </div>
  );
}
