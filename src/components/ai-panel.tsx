"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getAISessionByProjectId } from "@/lib/data";
import { AIAgentMessage, AgentType, AGENT_META, PipelineStage, ActivityEvent } from "@/lib/types";

interface AIPanelProps {
  projectId: string;
  onTasksGenerated?: (tasks: import("@/lib/types").Task[]) => void;
  onStageUpdate?: (stages: PipelineStage[]) => void;
  onActivityEvent?: (event: ActivityEvent) => void;
}

/* ─── Agent-specific response engines ─── */

interface ThinkingStage {
  stage: string;
  duration: number; // ms
}

function getThinkingStages(type: AgentType): ThinkingStage[] {
  switch (type) {
    case "plan":
      return [
        { stage: "Analyzing project requirements...", duration: 600 },
        { stage: "Identifying milestones...", duration: 500 },
        { stage: "Breaking down into tasks...", duration: 400 },
      ];
    case "code":
      return [
        { stage: "Reading specification...", duration: 500 },
        { stage: "Writing implementation...", duration: 800 },
        { stage: "Running linter...", duration: 400 },
      ];
    case "test":
      return [
        { stage: "Parsing source files...", duration: 500 },
        { stage: "Generating test cases...", duration: 600 },
        { stage: "Executing test suite...", duration: 500 },
      ];
    case "deploy":
      return [
        { stage: "Preparing build artifacts...", duration: 500 },
        { stage: "Running pre-deploy checks...", duration: 600 },
        { stage: "Deploying to environment...", duration: 500 },
      ];
    case "docs":
      return [
        { stage: "Scanning project structure...", duration: 500 },
        { stage: "Generating documentation...", duration: 600 },
        { stage: "Formatting output...", duration: 400 },
      ];
  }
}

function getPlanResponse(input: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("task") || lower.includes("create") || lower.includes("add")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "I've created the following tasks based on your request:\n\n" +
        "1. ✅ **Define user stories** — High priority, assigned to Product Owner\n" +
        "2. ✅ **Set up development environment** — Medium priority, assigned to Dev Lead\n" +
        "3. ✅ **Create wireframes** — High priority, assigned to Designer\n\n" +
        "All tasks are now in the Planned column. You can adjust priorities, assignees, and add due dates as needed.\n\n" +
        "Would you like me to schedule these in a sprint?",
      structuredData: { action: "tasks_created", count: 3 },
    };
  }
  if (lower.includes("sprint") || lower.includes("milestone") || lower.includes("timeline")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "Here's my recommended sprint plan:\n\n" +
        "**Sprint 1 — Foundation (2 weeks)**\n" +
        "- Hero section & navigation (8 story points)\n" +
        "- Core layout & styling (5 story points)\n\n" +
        "**Sprint 2 — Features (2 weeks)**\n" +
        "- Contact form & integrations (13 story points)\n" +
        "- Content sections (8 story points)\n\n" +
        "**Sprint 3 — Polish (1 week)**\n" +
        "- Performance optimization (5 story points)\n" +
        "- SEO & accessibility (3 story points)\n\n" +
        "Total estimated effort: **42 story points** across 3 sprints.\n\n" +
        "Would you like me to create the tasks for Sprint 1?",
      structuredData: { action: "sprint_plan", sprints: 3, totalPoints: 42 },
    };
  }
  return {
    id,
    role: "agent",
    timestamp: ts,
    content:
      "I've analyzed the project. Here's what I recommend:\n\n" +
      "1. **Current progress**: 4/6 tasks — good momentum\n" +
      "2. **Next priority**: Complete the responsive navigation (65% done)\n" +
      "3. **Risk**: Image optimization has a tight deadline (June 15)\n\n" +
      "Want me to generate a detailed sprint plan or create new tasks?",
    structuredData: { action: "analysis" },
  };
}

function getCodeResponse(input: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("hero") || lower.includes("header") || lower.includes("navigation")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "Implementation complete. Here's the hero section component:\n\n" +
        "**Changes made:**\n" +
        "- Created responsive hero layout with gradient background\n" +
        "- Added CTA button with hover/focus states\n" +
        "- Implemented staggered text reveal animation\n" +
        "- Added mobile-responsive breakpoints\n\n" +
        "**Files modified:**\n" +
        "- `components/hero-section.tsx` (new)\n" +
        "- `styles/hero-animations.css` (new)",
      codeBlock:
        "export default function HeroSection() {\n" +
        '  return (\n    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">\n' +
        '      <div className="container mx-auto px-4 sm:px-6 lg:px-8">\n' +
        '        <div className="max-w-3xl animate-stagger">\n' +
        '          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">\n' +
        "            Build Products That\n" +
        '            <span className="text-yellow-300"> Matter</span>\n' +
        "          </h1>\n" +
        '          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl">\n' +
        "            From idea to launch — Pipeline handles the heavy lifting\n" +
        "          </p>\n" +
        '          <div className="mt-8 flex flex-wrap gap-4">\n' +
        '            <button className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:shadow-xl transition-all">\n' +
        "              Get Started\n" +
        "            </button>\n" +
        '            <button className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all">\n' +
        "              Learn More\n" +
        "            </button>\n" +
        "          </div>\n" +
        "        </div>\n" +
        "      </div>\n" +
        "    </section>\n" +
        "  );\n" +
        "}",
      structuredData: { action: "code_written", files: 2 },
    };
  }
  if (lower.includes("api") || lower.includes("endpoint") || lower.includes("route")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "API endpoint implementation complete:\n\n" +
        "- `POST /api/auth/login` — JWT-based authentication\n" +
        "- `POST /api/auth/register` — User registration with validation\n" +
        "- `GET /api/auth/me` — Current user profile\n\n" +
        "PR #42 is ready for review.",
      codeBlock:
        "from fastapi import APIRouter, HTTPException, Depends\n" +
        "from pydantic import BaseModel, EmailStr\n" +
        "from jose import jwt\n" +
        "from datetime import datetime, timedelta\n\n" +
        "router = APIRouter(prefix='/auth', tags=['auth'])\n\n" +
        'class LoginRequest(BaseModel):\n    email: EmailStr\n    password: str\n\n' +
        "@router.post('/login')\n" +
        "async def login(req: LoginRequest):\n" +
        '    # Validate credentials\n' +
        "    user = await authenticate_user(req.email, req.password)\n" +
        "    if not user:\n" +
        "        raise HTTPException(status_code=401, detail='Invalid credentials')\n" +
        "    token = create_access_token(\n" +
        "        data={'sub': user.id},\n" +
        "        expires_delta=timedelta(hours=24)\n" +
        "    )\n" +
        "    return {'access_token': token, 'token_type': 'bearer'}",
      structuredData: { action: "code_written", endpoints: 3 },
    };
  }
  return {
    id,
    role: "agent",
    timestamp: ts,
    content:
      "I'm ready to help with the implementation. Here's what I can do:\n\n" +
      "1. Write new components or API endpoints\n" +
      "2. Refactor existing code\n" +
      "3. Add tests for current features\n\n" +
      "What would you like me to build?",
    structuredData: { action: "ready" },
  };
}

function getTestResponse(input: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("run") || lower.includes("execute") || lower.includes("all")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "**Test Suite Results**\n\n" +
        "| Suite | Status | Passed | Failed | Duration |\n" +
        "|-------|--------|--------|--------|----------|\n" +
        "| Unit Tests | ✅ | 42/42 | 0 | 1.2s |\n" +
        "| Integration | ✅ | 18/18 | 0 | 3.4s |\n" +
        "| E2E | ⚠️ | 9/10 | 1 | 8.7s |\n" +
        "| Accessibility | ✅ | WCAG 2.1 AA | — | — |\n\n" +
        "**Summary:** 69/70 tests passing (98.6%)\n" +
        "⚠️ 1 flaky E2E test detected (timeout on slow network)\n\n" +
        "Code coverage: 87% lines, 82% branches",
      structuredData: { action: "test_results", passed: 69, failed: 1, coverage: 87 },
    };
  }
  if (lower.includes("coverage") || lower.includes("report")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "**Coverage Report**\n\n" +
        "- Lines: 87% (target: 80%) ✅\n" +
        "- Branches: 82% (target: 75%) ✅\n" +
        "- Functions: 91% (target: 85%) ✅\n" +
        "- Statements: 88% (target: 80%) ✅\n\n" +
        "**Files needing attention:**\n" +
        "- `src/utils/api.ts` — 62% coverage\n" +
        "- `src/hooks/useAuth.ts` — 71% coverage\n\n" +
        "Shall I generate additional tests for these files?",
      structuredData: { action: "coverage_report" },
    };
  }
  return {
    id,
    role: "agent",
    timestamp: ts,
    content:
      "I'm ready to run quality checks on the project. I can:\n\n" +
      "1. Run the full test suite\n" +
      "2. Check code coverage\n" +
      "3. Run accessibility audit\n" +
      "4. Analyze performance metrics\n\n" +
      "What would you like me to check?",
    structuredData: { action: "ready" },
  };
}

function getDeployResponse(input: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("production") || lower.includes("prod") || lower.includes("live")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "**Production Deployment Complete** 🚀\n\n" +
        "| Step | Status | Duration |\n" +
        "|------|--------|----------|\n" +
        "| Build | ✅ Passed | 45s |\n" +
        "| Tests | ✅ Passed | 12s |\n" +
        "| Lint | ✅ Passed | 8s |\n" +
        "| Deploy | ✅ Live | 23s |\n\n" +
        "**Deployment URL:** https://pipeline-app.vercel.app\n" +
        "**Commit:** a3f2b1d — \"feat: hero section with animations\"\n" +
        "**Rollback command:** `vercel rollback --prod`",
      structuredData: { action: "deployed" },
    };
  }
  if (lower.includes("preview") || lower.includes("staging") || lower.includes("review")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "**Preview Deployment Ready** 🔄\n\n" +
        "- Environment: Staging\n" +
        "- URL: https://preview-pipeline.vercel.app\n" +
        "- Branch: `feature/hero-section`\n" +
        "- Auto-deploy on push: Enabled ✅\n\n" +
        "Promote to production when ready.",
      structuredData: { action: "preview_deployed" },
    };
  }
  return {
    id,
    role: "agent",
    timestamp: ts,
    content:
      "I can manage deployments for you. Current options:\n\n" +
      "1. Deploy to **production** — push latest build live\n" +
      "2. Create **preview** deployment — test branch\n" +
      "3. **Rollback** — revert to previous version\n" +
      "4. Check **deployment status**\n\n" +
      "Which environment?",
    structuredData: { action: "ready" },
  };
}

function getDocsResponse(input: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("api") || lower.includes("endpoint") || lower.includes("reference")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "**API Reference Generated** 📄\n\n" +
        "| Endpoint | Method | Description | Auth |\n" +
        "|----------|--------|-------------|------|\n" +
        "| `/api/auth/login` | POST | User login | No |\n" +
        "| `/api/auth/register` | POST | User registration | No |\n" +
        "| `/api/auth/me` | GET | Current user | JWT |\n" +
        "| `/api/projects` | GET | List projects | JWT |\n" +
        "| `/api/projects/:id` | GET | Project details | JWT |\n\n" +
        "Published to project wiki. Synced with OpenAPI spec.",
      structuredData: { action: "api_docs_generated" },
    };
  }
  if (lower.includes("readme") || lower.includes("guide") || lower.includes("setup")) {
    return {
      id,
      role: "agent",
      timestamp: ts,
      content:
        "**Setup Guide Generated** 📖\n\n" +
        "```bash\n" +
        "# Prerequisites\n" +
        "node >= 18, npm >= 9, PostgreSQL >= 15\n\n" +
        "# Clone & install\n" +
        "git clone https://github.com/balili96/pipeline.git\n" +
        "cd pipeline && npm install\n\n" +
        "# Environment\n" +
        "cp .env.example .env\n" +
        '# Edit DATABASE_URL, JWT_SECRET, OPENAI_API_KEY\n\n' +
        "# Run development\n" +
        "npm run dev\n" +
        "# → http://localhost:3000\n" +
        "```",
      structuredData: { action: "setup_guide" },
    };
  }
  return {
    id,
    role: "agent",
    timestamp: ts,
    content:
      "I can generate documentation for:\n\n" +
      "1. **API Reference** — all endpoints with schemas\n" +
      "2. **Architecture Overview** — system design & data flow\n" +
      "3. **Setup Guide** — local dev environment\n" +
      "4. **Changelog** — version history\n" +
      "5. **README** — project overview\n\n" +
      "What documentation do you need?",
    structuredData: { action: "ready" },
  };
}

function getAgentResponse(type: AgentType, input: string): AIAgentMessage {
  switch (type) {
    case "plan":
      return getPlanResponse(input);
    case "code":
      return getCodeResponse(input);
    case "test":
      return getTestResponse(input);
    case "deploy":
      return getDeployResponse(input);
    case "docs":
      return getDocsResponse(input);
  }
}

/* ─── Typing indicator with stage text ─── */

function TypingIndicator({ stage }: { stage: string }) {
  return (
    <div className="flex gap-2 justify-start">
      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
        <svg
          className="w-3.5 h-3.5 text-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      </div>
      <div className="max-w-[230px] rounded-xl px-3.5 py-3 bg-bg text-text border border-border rounded-tl-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:200ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:400ms]" />
          </div>
          <span className="text-[11px] text-muted/70 animate-pulse">{stage}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Code block display ─── */

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="mt-2 rounded-lg bg-gray-900 text-gray-100 text-xs leading-relaxed overflow-x-auto">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="w-2 h-2 rounded-full bg-yellow-500" />
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="ml-2 text-[10px] text-gray-400">output</span>
      </div>
      <pre className="p-3 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Main panel ─── */

export default function AIPanel({ projectId, onTasksGenerated, onStageUpdate, onActivityEvent }: AIPanelProps) {
  const session = getAISessionByProjectId(projectId);
  const [agentType, setAgentType] = useState<AgentType>(session?.type || "plan");
  const [messages, setMessages] = useState<AIAgentMessage[]>(
    session?.messages || []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStage, setThinkingStage] = useState("");
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const meta = AGENT_META[agentType];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const simulateTyping = useCallback(
    (userText: string) => {
      const stages = getThinkingStages(agentType);
      let cumulativeDelay = 0;

      // Run stages sequentially
      stages.forEach((s, i) => {
        cumulativeDelay += s.duration;
        setTimeout(() => {
          if (i === stages.length - 1) {
            // Last stage — clear and show response
            setThinkingStage("");
            setIsTyping(false);

            const aiReply = getAgentResponse(agentType, userText);
            setMessages((prev) => [...prev, aiReply]);

            // Update pipeline: mark current stage complete
            if (onStageUpdate) {
              onStageUpdate([
                { type: agentType, status: "completed", summary: aiReply.content.split("\n")[0]?.replace(/[*#]/g, "").trim().slice(0, 40) || "Completed" },
              ]);

              // Cascade to next stage after delay
              const nextOrder: AgentType[] = ["plan", "code", "test", "deploy", "docs"];
              const currentIdx = nextOrder.indexOf(agentType);
              if (currentIdx >= 0 && currentIdx < nextOrder.length - 1) {
                const nextType = nextOrder[currentIdx + 1];
                // Mark next as active after a pause
                setTimeout(() => {
                  onStageUpdate([
                    { type: agentType, status: "completed" },
                    { type: nextType, status: "active", summary: "Waiting for input…" },
                  ]);
                }, 2000);
              }
            }

            // Emit activity event
            if (onActivityEvent) {
              const actionText = aiReply.structuredData?.action === "tasks_created"
                ? "Created tasks"
                : aiReply.structuredData?.action === "code_written"
                ? "Generated code"
                : aiReply.structuredData?.action === "test_results"
                ? "Ran test suite"
                : aiReply.structuredData?.action === "deployed"
                ? "Deployed to production"
                : aiReply.structuredData?.action === "api_docs_generated"
                ? "Generated API docs"
                : `Processed request via ${AGENT_META[agentType].label}`;

              const detailText = aiReply.content.slice(0, 80).replace(/\n/g, " ") + (aiReply.content.length > 80 ? "…" : "");
              onActivityEvent({
                id: `act-${Date.now()}`,
                projectId,
                agentType,
                action: actionText,
                detail: detailText,
                status: "success",
                timestamp: new Date().toISOString(),
                duration: `${((cumulativeDelay + 200) / 1000).toFixed(1)}s`,
              });
            }

            // If tasks were created, notify parent
            if (
              aiReply.structuredData?.action === "tasks_created" &&
              onTasksGenerated
            ) {
              const count = (aiReply.structuredData.count as number) || 1;
              const newTasks: import("@/lib/types").Task[] = Array.from(
                { length: count },
                (_, i) => ({
                  id: `task-mock-${Date.now()}-${i}`,
                  title: `AI-generated task ${i + 1}`,
                  description: `Auto-generated by Plan Agent`,
                  status: "planned" as const,
                  priority: "medium" as const,
                  tags: ["ai-generated"],
                  projectId: projectId,
                  aiGenerated: true,
                  progress: 0,
                  assignee: "AI Agent",
                  dueDate: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                  ).toISOString().split("T")[0],
                })
              );
              onTasksGenerated(newTasks);
            }
          } else {
            setThinkingStage(s.stage);
          }
        }, cumulativeDelay);
      });
    },
    [agentType, projectId, onTasksGenerated, onStageUpdate, onActivityEvent]
  );

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const newMessage: AIAgentMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);
    setThinkingStage(getThinkingStages(agentType)[0].stage);

    simulateTyping(userText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const switchAgent = (type: AgentType) => {
    setAgentType(type);
    setShowAgentPicker(false);
    // Add a system-like message showing agent switch
    const switchMsg: AIAgentMessage = {
      id: `msg-${Date.now()}-switch`,
      role: "agent",
      content: `Switched to **${AGENT_META[type].label}**. ${AGENT_META[type].description}.`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  const statusColor = session?.status === "active" ? "bg-green" : "bg-muted";
  const statusLabel =
    session?.status === "active" ? "Agent Online" : "No Active Session";

  const panelContent = (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: `${meta.accentColor}15` }}
          >
            <span>{meta.icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{meta.label}</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              <span className="text-[11px] text-muted">{statusLabel}</span>
            </div>
          </div>
        </div>

        {/* Agent type selector */}
        <div className="relative">
          <button
            onClick={() => setShowAgentPicker((prev) => !prev)}
            className="text-xs text-muted hover:text-text px-2 py-1 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
            Switch
          </button>

          {showAgentPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAgentPicker(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-52 bg-white rounded-xl shadow-xl border border-border py-1 animate-fade-in">
                {(Object.keys(AGENT_META) as AgentType[]).map((type) => {
                  const a = AGENT_META[type];
                  return (
                    <button
                      key={type}
                      onClick={() => switchAgent(type)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        type === agentType ? "bg-gray-50 font-semibold" : ""
                      }`}
                    >
                      <span>{a.icon}</span>
                      <div className="text-left">
                        <div className="text-text">{a.label}</div>
                        <div className="text-[11px] text-muted">{a.description}</div>
                      </div>
                      {type === agentType && (
                        <svg className="w-4 h-4 ml-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-2xl"
              style={{ backgroundColor: `${meta.accentColor}15` }}
            >
              {meta.icon}
            </div>
            <p className="text-sm text-muted font-medium">{meta.label}</p>
            <p className="text-xs text-muted/70 mt-1 max-w-[200px]">
              {meta.description}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "agent" && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs"
                style={{ backgroundColor: `${meta.accentColor}15` }}
              >
                <span>{meta.icon}</span>
              </div>
            )}
            <div
              className={`max-w-[230px] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-tr-sm"
                  : "bg-bg text-text border border-border rounded-tl-sm"
              }`}
            >
              <div>{msg.content}</div>
              {msg.codeBlock && <CodeBlock code={msg.codeBlock} />}
              <div
                className={`text-[10px] mt-1 ${
                  msg.role === "user" ? "text-white/60" : "text-muted"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-medium text-gray-600">U</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator stage={thinkingStage} />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 bg-bg rounded-lg border border-border p-1.5">
          <input
            type="text"
            placeholder={`Ask the ${meta.label}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/50 outline-none px-2"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted/50 tabular-nums">
              {input.length}/500
            </span>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-md bg-accent flex items-center justify-center disabled:opacity-40 hover:bg-accent/90 transition-colors"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: sidebar panel */}
      <div className="hidden lg:flex h-full bg-white border-l border-border flex-col min-w-0 shrink">
        {panelContent}
      </div>

      {/* Mobile: bottom sheet */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => {
            // Close handled by URL param
          }}
        />
        <div className="relative bg-white rounded-t-2xl shadow-2xl border border-border max-h-[70vh] flex flex-col animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ backgroundColor: `${meta.accentColor}15` }}
              >
                <span>{meta.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">{meta.label}</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                  <span className="text-[11px] text-muted">{statusLabel}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <p className="text-sm text-muted font-medium">{meta.label}</p>
                <p className="text-xs text-muted/70 mt-1">{meta.description}</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-accent text-white rounded-tr-sm" : "bg-bg text-text border border-border rounded-tl-sm"}`}>
                  <div>{msg.content}</div>
                  {msg.codeBlock && <CodeBlock code={msg.codeBlock} />}
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator stage={thinkingStage} />}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 py-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2 bg-bg rounded-lg border border-border p-1.5">
              <input type="text" placeholder={`Ask the ${meta.label}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} maxLength={500} className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/50 outline-none px-2" />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-8 h-8 rounded-md bg-accent flex items-center justify-center disabled:opacity-40 hover:bg-accent/90 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
