"use client";

import Link from "next/link";
import { Project } from "@/lib/types";
import { getTasksByProjectId } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
}

const statusStyles: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "bg-green/10", text: "text-green" },
  completed: { label: "Completed", bg: "bg-accent/10", text: "text-accent" },
  archived: { label: "Archived", bg: "bg-gray-100", text: "text-muted" },
};

const avatars = [
  { initials: "AL", color: "bg-blue-100 text-blue-700" },
  { initials: "BO", color: "bg-amber-100 text-amber-700" },
  { initials: "CH", color: "bg-purple-100 text-purple-700" },
  { initials: "DI", color: "bg-green-100 text-green-700" },
];

function Avatar({ initials, className }: { initials: string; className?: string }) {
  const avatar = avatars.find((a) => a.initials === initials) || avatars[0];
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-white -ml-2 first:ml-0 ${avatar.color} ${className || ""}`}
      title={initials}
    >
      {initials}
    </div>
  );
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const projectTasks = getTasksByProjectId(project.id);
  const totalTasks = projectTasks.length;
  const doneTasks = projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = projectTasks.filter((t) => t.status === "in_progress").length;
  const plannedTasks = projectTasks.filter((t) => t.status === "planned").length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statusInfo = statusStyles[project.status] || statusStyles.active;

  // Derive team members and dates from tasks
  const assignees = [...new Set(projectTasks.map((t) => t.assignee))].slice(0, 4);
  const dueDates = projectTasks.map((t) => t.dueDate).filter(Boolean) as string[];
  const nearestDue = dueDates.length > 0 ? dueDates.sort()[0] : null;

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
        {/* Top row: Icon + Name + Badge + Menu */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-lg shrink-0">
              {project.status === "active" ? "🚀" : "✅"}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text text-[15px] group-hover:text-accent transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Created {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted mt-3 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Task stats row */}
        <div className="flex items-center gap-4 text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="text-muted">{plannedTasks}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted">{inProgressTasks}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green" />
            <span className="text-muted">{doneTasks}</span>
          </div>
          <span className="text-muted ml-auto text-[11px]">
            {doneTasks}/{totalTasks}
          </span>
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="mb-4">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background:
                    progressPct === 100
                      ? "linear-gradient(90deg, #22D3A0, #34D399)"
                      : "linear-gradient(90deg, #4F7CFF, #6B96FF)",
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom: Avatars + Due date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {assignees.map((name, i) => (
              <Avatar key={name} initials={name.slice(0, 2).toUpperCase()} />
            ))}
            {assignees.length < 1 && (
              <span className="text-[11px] text-muted italic">No members</span>
            )}
          </div>
          {nearestDue && (
            <div className="flex items-center gap-1 text-[11px] text-muted">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 4.5V8L10.5 10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {new Date(nearestDue).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
