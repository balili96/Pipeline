"use client";

import { useState } from "react";
import { Task } from "@/lib/types";

interface SprintGeneratorProps {
  projectId: string;
  onTasksGenerated: (tasks: Task[]) => void;
}

const assignees = ["Alice", "Bob", "Charlie"];
const priorities: Array<"high" | "medium" | "low"> = ["high", "medium", "low"];

function generateTasks(input: string, projectId: string): Task[] {
  const lower = input.toLowerCase();
  let tasks: string[];

  if (lower.includes("booking") || lower.includes("reservation")) {
    tasks = [
      "Create booking API endpoint",
      "Design booking UI form",
      "Set up payment integration",
      "Write booking tests",
      "Deploy booking service",
    ];
  } else if (lower.includes("auth") || lower.includes("login") || lower.includes("authentication")) {
    tasks = [
      "Implement JWT authentication",
      "Build login/register UI",
      "Add password reset flow",
      "Set up OAuth integration",
      "Write auth middleware tests",
    ];
  } else if (lower.includes("api") || lower.includes("backend")) {
    tasks = [
      "Define API endpoint specifications",
      "Implement RESTful CRUD endpoints",
      "Add request validation middleware",
      "Set up API documentation",
      "Write integration tests",
    ];
  } else if (lower.includes("dashboard") || lower.includes("analytics")) {
    tasks = [
      "Design dashboard layout mockups",
      "Build chart visualization components",
      "Implement data fetching hooks",
      "Add export to CSV/PDF feature",
      "Set up real-time data updates",
    ];
  } else if (lower.includes("mobile") || lower.includes("app")) {
    tasks = [
      "Set up mobile-responsive layouts",
      "Build bottom navigation component",
      "Implement pull-to-refresh",
      "Add offline data caching",
      "Optimize mobile bundle size",
    ];
  } else if (lower.includes("ecommerce") || lower.includes("shop") || lower.includes("store")) {
    tasks = [
      "Build product listing page",
      "Implement shopping cart system",
      "Set up checkout flow",
      "Add product search & filters",
      "Integrate payment gateway",
    ];
  } else if (lower.includes("blog") || lower.includes("cms") || lower.includes("content")) {
    tasks = [
      "Create markdown editor component",
      "Build content management dashboard",
      "Implement content scheduling",
      "Add image upload & optimization",
      "Set up RSS feed generation",
    ];
  } else if (lower.includes("chat") || lower.includes("messaging") || lower.includes("realtime")) {
    tasks = [
      "Implement WebSocket connection",
      "Build chat message UI",
      "Add typing indicators",
      "Set up message persistence",
      "Implement push notifications",
    ];
  } else {
    // Generic tasks based on input length
    if (input.length < 20) {
      tasks = [
        "Design system architecture",
        "Implement core feature module",
        "Set up testing framework",
        "Write project documentation",
        "Configure deployment pipeline",
      ];
    } else {
      // Parse input for key terms to generate more contextual tasks
      const words = lower.split(/\s+/);
      const hasFrontend = words.some((w) =>
        ["ui", "frontend", "design", "page", "component", "interface"].includes(w)
      );
      const hasBackend = words.some((w) =>
        ["api", "backend", "server", "database", "endpoint"].includes(w)
      );
      const hasData = words.some((w) =>
        ["data", "analytics", "report", "metric", "dashboard"].includes(w)
      );

      tasks = [];
      if (hasFrontend) tasks.push("Build responsive UI components");
      if (hasBackend) tasks.push("Create backend API endpoints");
      if (hasData) tasks.push("Set up data pipeline and storage");
      tasks.push("Write comprehensive tests");
      tasks.push("Deploy to staging environment");
      if (tasks.length < 3) {
        tasks = [
          "Design and implement core functionality",
          "Set up continuous integration",
          "Write unit and integration tests",
          "Create user documentation",
          "Deploy to production",
        ];
      }
    }
  }

  // Generate staggered dates over 2 weeks
  const now = new Date();
  return tasks.map((title, i) => {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + Math.ceil((i + 1) * (14 / tasks.length)));

    return {
      id: `task-gen-${Date.now()}-${i}`,
      title,
      description: `AI-generated task based on: "${input.slice(0, 80)}${input.length > 80 ? "..." : ""}"`,
      status: "planned" as const,
      priority: priorities[i % priorities.length],
      tags: ["ai-generated"],
      projectId,
      aiGenerated: true,
      progress: 0,
      assignee: assignees[i % assignees.length],
      dueDate: dueDate.toISOString().split("T")[0],
    };
  });
}

export default function SprintGenerator({
  projectId,
  onTasksGenerated,
}: SprintGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[] | null>(null);

  function handleGenerate() {
    if (!input.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedTasks(null);

    // Simulate 2s AI typing delay
    setTimeout(() => {
      const tasks = generateTasks(input, projectId);
      setGeneratedTasks(tasks);
      setIsGenerating(false);
    }, 2000);
  }

  function handleAddToBoard() {
    if (generatedTasks) {
      onTasksGenerated(generatedTasks);
    }
    handleClose();
  }

  function handleClose() {
    setIsOpen(false);
    setInput("");
    setGeneratedTasks(null);
    setIsGenerating(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            strokeLinejoin="round"
          />
        </svg>
        Generate Sprint
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border w-full sm:max-w-lg mx-0 sm:mx-4 max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-slide-up sm:animate-none">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold text-text">
                AI Sprint Generator
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-muted hover:text-text transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Input area */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-text mb-2">
                  Describe what you want to build...
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. Build a booking system with payment integration"
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                  rows={4}
                  maxLength={300}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-muted">
                    AI will generate 3-5 tasks based on your description
                  </span>
                  <span className="text-[11px] text-muted tabular-nums">
                    {input.length}/300
                  </span>
                </div>
              </div>

              {!generatedTasks && !isGenerating && (
                <button
                  onClick={handleGenerate}
                  disabled={!input.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Generate
                </button>
              )}

              {/* Typing indicator */}
              {isGenerating && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <p className="text-sm text-muted">
                      AI is generating your sprint...
                    </p>
                  </div>
                </div>
              )}

              {/* Generated tasks */}
              {generatedTasks && !isGenerating && (
                <div>
                  <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                    <span>✨ Generated Sprint Tasks</span>
                    <span className="text-xs font-normal text-muted">
                      ({generatedTasks.length} tasks)
                    </span>
                  </h3>
                  <div className="space-y-2.5">
                    {generatedTasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3.5 bg-bg border border-border rounded-xl"
                      >
                        {/* Index badge */}
                        <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                            <span>👤 {task.assignee}</span>
                            <span>📅 {task.dueDate}</span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                task.priority === "high"
                                  ? "bg-red/10 text-red"
                                  : task.priority === "medium"
                                  ? "bg-amber/10 text-amber"
                                  : "bg-green/10 text-green"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add to board button */}
                  <button
                    onClick={handleAddToBoard}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
                    </svg>
                    Add {generatedTasks.length} tasks to board
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
