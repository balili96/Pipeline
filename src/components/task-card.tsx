"use client";

import { useState } from "react";
import { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  draggable?: boolean;
}

const tagStyles: Record<string, string> = {
  design: "bg-pink-50 text-pink-600 border-pink-200/50",
  devops: "bg-purple-50 text-purple-600 border-purple-200/50",
  frontend: "bg-blue-50 text-blue-600 border-blue-200/50",
  backend: "bg-indigo-50 text-indigo-600 border-indigo-200/50",
  security: "bg-red-50 text-red-600 border-red-200/50",
  testing: "bg-teal-50 text-teal-600 border-teal-200/50",
  performance: "bg-orange-50 text-orange-600 border-orange-200/50",
  seo: "bg-cyan-50 text-cyan-600 border-cyan-200/50",
  charts: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  feature: "bg-amber-50 text-amber-600 border-amber-200/50",
  docs: "bg-gray-50 text-gray-600 border-gray-200/50",
};

const priorityColors: Record<string, string> = {
  high: "bg-red",
  medium: "bg-amber",
  low: "bg-gray-300",
};

export default function TaskCard({ task, draggable = false }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${
        draggable ? "cursor-grab active:cursor-grabbing select-none" : ""
      } ${
        isDragging
          ? "opacity-40 scale-[0.97] shadow-sm border-accent/30 rotate-2"
          : "bg-white border-border hover:border-accent/25 hover:shadow-sm hover:-translate-y-0.5"
      }`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Top row: priority dot + tags */}
      <div className="flex items-start gap-2 px-3 pt-3">
        {/* Priority indicator — vertical bar on the left */}
        <div className={`w-1 h-8 rounded-full shrink-0 mt-0.5 ${priorityColors[task.priority] || "bg-gray-300"}`} />

        <div className="min-w-0 flex-1">
          {/* Tags row */}
          <div className="flex flex-wrap gap-1 mb-1.5">
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
                  tagStyles[tag] || "bg-gray-50 text-gray-600 border-gray-200/50"
                }`}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-[9px] text-muted/50 font-medium px-1">
                +{task.tags.length - 2}
              </span>
            )}
            {task.aiGenerated && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-accent/[0.08] to-accent/[0.03] text-accent border border-accent/15">
                AI
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-text leading-snug line-clamp-2">
            {task.title}
          </h4>
        </div>
      </div>

      {/* Progress bar */}
      {task.progress > 0 && (
        <div className="px-3 mt-2.5">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                task.status === "done"
                  ? "bg-gradient-to-r from-green to-emerald-400"
                  : task.status === "in_progress"
                  ? "bg-gradient-to-r from-accent to-blue-400"
                  : "bg-gray-300"
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta footer */}
      <div className="flex items-center justify-between px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {/* Assignee avatar dot */}
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-gray-100 border border-border flex items-center justify-center text-[8px] font-semibold text-muted">
              {task.assignee.charAt(0)}
            </span>
            <span>{task.assignee}</span>
          </span>
        </div>
        <span className="text-[10px] text-muted/60 tabular-nums">
          {task.dueDate}
        </span>
      </div>
    </div>
  );
}
