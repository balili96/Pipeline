"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { getTasksByProjectId } from "@/lib/data";
import TaskCard from "@/components/task-card";

interface KanbanBoardProps {
  projectId: string;
  tasks?: Task[];
  onTasksChange?: React.Dispatch<React.SetStateAction<Task[]>>;
}

const columns = [
  { key: "planned" as const, label: "Planned", icon: "📝", color: "bg-amber" },
  { key: "in_progress" as const, label: "In Progress", icon: "⚡", color: "bg-accent" },
  { key: "done" as const, label: "Done", icon: "✅", color: "bg-green" },
];

export default function KanbanBoard({
  projectId,
  tasks: externalTasks,
  onTasksChange,
}: KanbanBoardProps) {
  const [internalTasks, setInternalTasks] = useState<Task[]>(
    () => getTasksByProjectId(projectId)
  );

  const tasks = externalTasks ?? internalTasks;
  const setTasks = onTasksChange ?? setInternalTasks;
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (colKey: string) => setDragOverColumn(colKey);

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    try {
      const draggedTask: Task = JSON.parse(raw);
      if (draggedTask.status === targetStatus) return;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === draggedTask.id
            ? {
                ...t,
                status: targetStatus as Task["status"],
                progress:
                  targetStatus === "done"
                    ? 100
                    : targetStatus === "in_progress"
                    ? Math.max(t.progress, 10)
                    : t.progress,
              }
            : t
        )
      );
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 lg:grid lg:grid-cols-3 lg:gap-5 h-full">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        const isOver = dragOverColumn === col.key;

        return (
          <div
            key={col.key}
            className={`bg-white rounded-xl border flex flex-col transition-all duration-200 sm:min-w-[270px] lg:min-w-0 ${
              isOver
                ? "border-accent border-dashed shadow-[inset_0_0_0_1px_rgba(79,124,255,0.12)] bg-accent/[0.02]"
                : "border-border shadow-sm"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{col.icon}</span>
                <h3 className="text-sm font-semibold text-text">{col.label}</h3>
              </div>
              <span
                className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                  col.key === "done"
                    ? "bg-green/10 text-green"
                    : col.key === "in_progress"
                    ? "bg-accent/10 text-accent"
                    : "bg-amber/10 text-amber"
                }`}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Task list */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[180px]">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} draggable />
              ))}
              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-border flex items-center justify-center mb-2.5 text-sm text-muted/40">
                    {col.icon}
                  </div>
                  <p className="text-xs text-muted/50 font-medium">No tasks yet</p>
                  <p className="text-[10px] text-muted/30 mt-0.5">
                    {col.key === "planned"
                      ? "Create or drop tasks here"
                      : col.key === "in_progress"
                      ? "Drag tasks from Planned"
                      : "Complete tasks move here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
