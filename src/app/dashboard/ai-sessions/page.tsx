"use client";

import { useState, useRef, useEffect } from "react";
import { aiSessions, getProjectName } from "@/lib/data";
import type { AIAgentSession, AIAgentMessage } from "@/lib/types";

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  integration: { label: "Integration", icon: "🧩", color: "bg-blue/10 text-blue" },
  scope: { label: "Scope", icon: "🎯", color: "bg-emerald/10 text-emerald" },
  schedule: { label: "Schedule", icon: "📅", color: "bg-amber/10 text-amber" },
  cost: { label: "Cost", icon: "💰", color: "bg-purple/10 text-purple" },
  quality: { label: "Quality", icon: "✅", color: "bg-teal/10 text-teal" },
  resource: { label: "Resource", icon: "👥", color: "bg-pink/10 text-pink" },
  communications: { label: "Comm.", icon: "📢", color: "bg-blue/10 text-blue" },
  risk: { label: "Risk", icon: "⚠️", color: "bg-red/10 text-red" },
  procurement: { label: "Procurement", icon: "📦", color: "bg-orange/10 text-orange" },
  stakeholder: { label: "Stakeholder", icon: "🤝", color: "bg-violet/10 text-violet" },
};

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-green" },
  completed: { label: "Completed", dot: "bg-muted" },
  failed: { label: "Failed", dot: "bg-red" },
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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function SessionDetail({
  session: initialSession,
  onBack,
}: {
  session: AIAgentSession;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState(initialSession.messages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const type = typeConfig[initialSession.type] || typeConfig.integration;
  const status = statusConfig[initialSession.status] || statusConfig.completed;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function getContextualResponse(userMsg: string): string {
    const lower = userMsg.toLowerCase();
    if (lower.includes("task") || lower.includes("create")) {
      return "I'll create the tasks for you. What priority should they be — low, medium, or high?";
    }
    if (lower.includes("bug") || lower.includes("issue") || lower.includes("fix")) {
      return "I've identified 2 potential issues. Let me run diagnostics on the affected components and report back with findings.";
    }
    if (lower.includes("deploy") || lower.includes("release")) {
      return "I'll prepare the deployment. Which environment are we targeting — staging or production?";
    }
    if (lower.includes("plan") || lower.includes("sprint")) {
      return "Here's my suggested sprint breakdown for the current milestone:\n\n1. **Week 1**: Core feature implementation\n2. **Week 2**: Integration & testing\n3. **Week 3**: Polish & documentation\n4. **Week 4**: Deployment & monitoring\n\nWould you like me to create detailed tasks for any of these?";
    }
    if (lower.includes("test") || lower.includes("qa")) {
      return "Running the full test suite now. I'll check unit tests, integration tests, and E2E coverage. Results should be ready in ~2 minutes.";
    }
    if (lower.includes("doc") || lower.includes("docs")) {
      return "I can generate:\n\n- 📄 API Reference (auto-generated from code)\n- 📄 Architecture Diagram\n- 📄 Setup Guide\n- 📄 Changelog\n\nWhich one would you like?";
    }
    return "I've analyzed the project context. Here are my recommendations:\n\n- The current sprint is on track\n- Priority should be on completing the remaining In Progress tasks\n- Would you like me to review the code or run tests?";
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: AIAgentMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response: AIAgentMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "agent",
        content: getContextualResponse(trimmed),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Back button - fixed top */}
      <div className="shrink-0 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.5 3.5L6 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sessions
        </button>
      </div>

      {/* Session header */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4 shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${type.color}`}>
              {type.icon}
            </div>
            <div>
              <h2 className="font-semibold text-text text-base">{getProjectName(initialSession.projectId)}</h2>
              <p className="text-xs text-muted">{type.label} session</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span className="text-xs text-muted font-medium">{status.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted mt-2">
          <span>Started {timeAgo(initialSession.startedAt)}</span>
          <span>·</span>
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg) => {
          const isAgent = msg.role === "agent";
          return (
            <div key={msg.id} className={`flex ${isAgent ? "" : "flex-col items-end"}`}>
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  isAgent
                    ? "bg-card border border-border"
                    : "bg-accent text-white"
                }`}
              >
                <div
                  className={`text-sm leading-relaxed whitespace-pre-line ${
                    isAgent ? "text-text" : "text-white/95"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => {
                    if (line.startsWith("- ✅") || line.startsWith("  - ✅")) {
                      return (
                        <div key={i} className="flex items-start gap-2 my-1">
                          <span className="text-green shrink-0 mt-0.5">✅</span>
                          <span>{line.replace(/^[\s-]*✅\s*/, "")}</span>
                        </div>
                      );
                    }
                    if (line.startsWith("- ⚠️")) {
                      return (
                        <div key={i} className="flex items-start gap-2 my-1">
                          <span className="text-amber shrink-0 mt-0.5">⚠️</span>
                          <span>{line.replace(/^[\s-]*⚠️\s*/, "")}</span>
                        </div>
                      );
                    }
                    if (line.match(/^\d+\.\s\*\*/)) {
                      return (
                        <div key={i} className="my-1.5">
                          <span className="font-medium">{line.replace(/^\d+\.\s\*\*/, "").replace(/\*\*$/, "")}</span>
                        </div>
                      );
                    }
                    if (line.startsWith("- 📄") || line.startsWith("  - 📄")) {
                      return (
                        <div key={i} className="flex items-start gap-2 my-1">
                          <span className="shrink-0 mt-0.5">📄</span>
                          <span>{line.replace(/^[\s-]*📄\s*/, "")}</span>
                        </div>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <div key={i} className="flex items-start gap-2 my-1 ml-2">
                          <span className="text-muted">•</span>
                          <span>{line.replace(/^- /, "")}</span>
                        </div>
                      );
                    }
                    if (line.trim() === "") return <br key={i} />;
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={i} className="font-semibold my-1">{line.replace(/^\*\*/, "").replace(/\*\*$/, "")}</p>;
                    }
                    return (
                      <p key={i} className="my-0.5">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
              <p className={`text-[11px] text-muted mt-1.5`}>
                {isAgent ? "AI Agent" : "You"} · {formatTime(msg.timestamp)}
              </p>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat input - fixed bottom */}
      <div className="shrink-0 bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the AI agent..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
            maxLength={500}
          />
          <span className="text-[11px] text-muted tabular-nums">{input.length}/500</span>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 8L14 2L8 14L6 10L2 8Z" strokeLinejoin="round" />
              <path d="M6 10L14 2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onClick,
}: {
  session: AIAgentSession;
  onClick: () => void;
}) {
  const type = typeConfig[session.type] || typeConfig.integration;
  const status = statusConfig[session.status] || statusConfig.completed;
  const lastMsg = session.messages[session.messages.length - 1];
  const lastContent = lastMsg?.content.slice(0, 100) + (lastMsg?.content.length > 100 ? "..." : "");

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${type.color}`}>
            {type.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-text text-[15px] group-hover:text-accent transition-colors truncate">
              {getProjectName(session.projectId)}
            </h3>
            <p className="text-xs text-muted mt-0.5">{type.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className="text-[11px] font-medium text-muted">{status.label}</span>
        </div>
      </div>

      {/* Last message preview */}
      <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">
        {lastContent}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span>💬 {session.messages.length}</span>
          <span>Started {timeAgo(session.startedAt)}</span>
        </div>
        <svg
          className="w-4 h-4 text-muted group-hover:text-accent transition-colors"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 3.5L10.5 8L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

export default function AISessionsPage() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const sessionList = aiSessions.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const currentSession = selectedSession
    ? aiSessions.find((s) => s.id === selectedSession)
    : null;

  // Stats
  const totalSessions = aiSessions.length;
  const activeSessions = aiSessions.filter((s) => s.status === "active").length;

  if (currentSession) {
    return (
      <div className="p-4 md:p-8 max-w-full md:max-w-3xl">
        <SessionDetail
          session={currentSession}
          onBack={() => setSelectedSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">AI Sessions</h1>
          <p className="text-sm text-muted mt-1">
            View all AI agent conversations across your projects
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 min-w-[130px] flex-1 sm:flex-none">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm">🤖</div>
          <div>
            <p className="font-semibold text-text">{totalSessions}</p>
            <p className="text-[11px] text-muted">Total sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 min-w-[130px] flex-1 sm:flex-none">
          <div className="w-8 h-8 rounded-lg bg-green/10 text-green flex items-center justify-center text-sm">⚡</div>
          <div>
            <p className="font-semibold text-text">{activeSessions}</p>
            <p className="text-[11px] text-muted">Active</p>
          </div>
        </div>
      </div>

      {/* Session grid */}
      {sessionList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🤖</p>
          <p className="text-muted text-sm">No AI sessions yet</p>
          <p className="text-muted/70 text-xs mt-1">
            Start a conversation with the AI agent from a project page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessionList.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => setSelectedSession(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
