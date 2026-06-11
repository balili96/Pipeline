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

interface ThinkingStage { stage: string; duration: number }

const STAGE_DURATIONS: Record<AgentType, number> = {
  integration: 800, scope: 600, schedule: 700, cost: 600, quality: 500,
  resource: 600, communications: 500, risk: 700, procurement: 600, stakeholder: 500,
};

const STAGE_TEXTS: Record<AgentType, string[]> = {
  integration: ["Synthesizing project data...", "Aligning cross-domain inputs...", "Generating integrated plan..."],
  scope: ["Analyzing requirements...", "Decomposing deliverables...", "Validating boundaries..."],
  schedule: ["Mapping dependencies...", "Calculating critical path...", "Optimizing timeline..."],
  cost: ["Estimating resources...", "Running cost models...", "Analyzing variance..."],
  quality: ["Reviewing standards...", "Auditing processes...", "Generating metrics..."],
  resource: ["Assessing team capacity...", "Mapping skill gaps...", "Optimizing allocation..."],
  communications: ["Identifying audiences...", "Crafting messaging...", "Structuring cadence..."],
  risk: ["Scanning for threats...", "Analyzing probability...", "Developing responses..."],
  procurement: ["Evaluating vendors...", "Drafting contracts...", "Reviewing terms..."],
  stakeholder: ["Mapping influence...", "Assessing engagement...", "Planning approach..."],
};

/* ─── Response generators ─── */

function getIntegrationResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("charter") || lower.includes("kickoff")) {
    return { id, role: "agent", timestamp: ts, content: `Here's a draft Project Charter for **${projectName}**:

**Project Title:** ${projectName}
**Business Case:** Strategic initiative to deliver measurable business value
**Objectives:**
1. Deliver core functionality within approved timeline
2. Maintain quality standards throughout
3. Ensure stakeholder alignment

**High-Level Risks:**
- Resource availability
- Timeline constraints
- Scope creep

**Key Milestones:**
- Planning complete: Week 2
- Execution: Weeks 3-8
- Close: Week 10

Would you like me to elaborate on any section or create a detailed PMP based on this charter?

> *"— Integration Agent — keeping everything connected"*` };
  }
  if (lower.includes("change") || lower.includes("status")) {
    return { id, role: "agent", timestamp: ts, content: `**Project Status Snapshot**

Here's my integrated view of how things are tracking:

| Area | Status | Notes |
|------|--------|-------|
| Scope | ✅ On track | No change requests pending |
| Schedule | ⚠️ Watch | One milestone at risk |
| Cost | ✅ On budget | Variance < 5% |
| Quality | ✅ Good | All metrics within thresholds |
| Risk | ⚠️ Monitor | 2 active risks being tracked |

**Recommendation:** Proceed with current plan. I recommend a change control review for the schedule variance.

> *"— Integration Agent — the big picture matters"*` };
  }
  if (lower.includes("lessons") || lower.includes("learned")) {
    return { id, role: "agent", timestamp: ts, content: `**Lessons Learned Session**

Based on the project lifecycle so far:

**What Went Well ✅**
- Stakeholder communication has been effective
- Requirements clarity at project start

**What Could Improve 🔄**
- Earlier risk identification
- More frequent status updates

**Action Items:**
1. Schedule monthly lessons learned reviews
2. Document risks as they emerge, not just at milestones

> *"— Integration Agent — every project teaches us something"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Integration Agent** — I keep the whole project humming. Here's what I can help with:

- 📄 **Project Charter** — Kick off your project properly
- 🔄 **Change Management** — Process and track changes
- 📊 **Status Reporting** — Integrated project snapshot
- 📖 **Lessons Learned** — Capture knowledge for next time

What would you like me to work on for **${projectName}**?

> *"— Let's build something great together"*` };
}

function getScopeResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("requirement") || lower.includes("wbs")) {
    return { id, role: "agent", timestamp: ts, content: `**Requirements Breakdown**

Here's the high-level WBS for **${projectName}**:

```
1.0 ${projectName}
├── 1.1 Planning Phase
│   ├── 1.1.1 Requirements Gathering
│   └── 1.1.2 Stakeholder Analysis
├── 1.2 Execution Phase
│   ├── 1.2.1 Core Development
│   ├── 1.2.2 Testing & QA
│   └── 1.2.3 Documentation
└── 1.3 Closure Phase
    ├── 1.3.1 Deployment
    └── 1.3.2 Handover
```

**Next Steps:**
1. Validate this WBS with stakeholders
2. Break down work packages into tasks
3. Assign owners to each leaf node

> *"— Scope Agent — clarity is our foundation"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Scope Agent** — I make sure we build the right thing. Here's what I can do:

- 📋 **Requirements Document** — Capture and organize what's needed
- 🏗️ **WBS** (Work Breakdown Structure) — Break the project into manageable pieces
- 📐 **Scope Statement** — Define exactly what's in (and out)
- 🔄 **Scope Change Requests** — Evaluate and track changes

What are we building? Give me the high-level, and I'll break it down.

> *"— Clear scope = successful delivery"*` };
}

function getScheduleResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("gantt") || lower.includes("timeline") || lower.includes("milestone")) {
    return { id, role: "agent", timestamp: ts, content: `**Schedule Overview — ${projectName}**

| Phase | Duration | Key Milestone | Dependencies |
|-------|----------|--------------|-------------|
| Planning | 2 weeks | ✅ Requirements Approved | — |
| Design | 2 weeks | 🎯 Design Sign-off | Planning |
| Development | 4 weeks | 🎯 Feature Complete | Design |
| Testing | 2 weeks | 🎯 QA Pass | Development |
| Deployment | 1 week | 🚀 Go Live | Testing |

**Critical Path:** Planning → Design → Development → Testing → Deployment
**Total Duration:** ~11 weeks
**Buffer:** 1 week contingency

> *"— Schedule Agent — every second counts"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Schedule Agent** — time is my domain. Here's what I can build for you:

- 📅 **Gantt Chart** — Visual timeline with dependencies
- 🎯 **Milestone Plan** — Key dates and deliverables
- 🔗 **Critical Path Analysis** — What drives your timeline
- ⏱️ **Resource Calendar** — Who's doing what when

Tell me your deadline, and I'll work backwards to build the plan.

> *"— Let's make time work for you, not against you"*` };
}

function getCostResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("budget") || lower.includes("estimate")) {
    return { id, role: "agent", timestamp: ts, content: `**Cost Estimate — ${projectName}**

| Category | Estimated | % of Total |
|----------|-----------|-----------|
| Personnel | $XX,XXX | 60% |
| Infrastructure | $X,XXX | 15% |
| Tools & Licenses | $X,XXX | 10% |
| Contingency | $X,XXX | 10% |
| Misc | $X,XXX | 5% |
| **Total** | **$XX,XXX** | **100%** |

**EVM Metrics (when tracking):**
- PV (Planned Value): —
- EV (Earned Value): —
- AC (Actual Cost): —
- CPI: —
- SPI: —

> *"— Cost Agent — every dollar has a plan"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Cost Agent** — I make the numbers work. Here's what I can help with:

- 💰 **Cost Estimation** — Bottom-up or parametric estimates
- 📊 **Budget Planning** — Allocate resources efficiently
- 📈 **Earned Value Management** — Track performance objectively
- 🔍 **ROI Analysis** — Justify the investment

Tell me your project scope, and I'll build your budget.

> *"— Numbers tell a story — let me help you read it"*` };
}

function getQualityResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("metrics") || lower.includes("audit") || lower.includes("standard")) {
    return { id, role: "agent", timestamp: ts, content: `**Quality Plan — ${projectName}**

| Quality Area | Standard | Measurement | Frequency |
|-------------|----------|------------|-----------|
| Code Quality | Linting rules | Pass rate | Per commit |
| Performance | Load < 2s | Lighthouse score | Per deployment |
| Accessibility | WCAG 2.1 AA | Audit score | Per release |
| Security | OWASP Top 10 | Scan results | Weekly |

**Quality Gates:**
1. ✅ Code review required for all PRs
2. ✅ Test coverage ≥ 80%
3. ✅ Security scan before deployment
4. ✅ Stakeholder sign-off before release

> *"— Quality Agent — good enough isn't good enough"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Quality Agent** — excellence is the standard. Here's how I can help:

- ✅ **Quality Metrics** — Define and track what matters
- 🔍 **Audits** — Review processes and outputs
- 📈 **Continuous Improvement** — Iterate and elevate
- 📋 **Acceptance Criteria** — Clear pass/fail for deliverables

What quality standards matter most for your project?

> *"— Quality isn't a phase — it's a mindset"*` };
}

function getResourceResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("team") || lower.includes("raci")) {
    return { id, role: "agent", timestamp: ts, content: `**Resource Plan — ${projectName}**

| Role | Person | RACI | Allocation |
|------|--------|------|-----------|
| Project Manager | TBD | R | 100% |
| Tech Lead | TBD | A | 100% |
| Developer | TBD | R | 50% |
| Designer | TBD | R | 25% |
| QA | TBD | R | 25% |

**RACI Key:** R=Responsible, A=Accountable, C=Consulted, I=Informed

**Team Norms:**
- Daily standup: 15 min
- Weekly sprint review: 1 hour
- Retrospective: bi-weekly

> *"— Resource Agent — great teams build great products"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Resource Agent** — people first, projects second. Here's what I can do:

- 👥 **Team Charter** — Define roles, norms, expectations
- 📊 **RACI Matrix** — Who does what
- 📋 **Resource Allocation** — Right people, right time
- 🌱 **Team Development** — Skills, growth, morale

Tell me about your team, and I'll help organize them.

> *"— The right people in the right roles change everything"*` };
}

function getCommResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("plan") || lower.includes("report") || lower.includes("meeting")) {
    return { id, role: "agent", timestamp: ts, content: `**Communications Plan — ${projectName}**

| Audience | Message | Channel | Frequency |
|----------|---------|---------|-----------|
| Team | Daily updates | Standup | Daily |
| Stakeholders | Status report | Email | Weekly |
| Executives | Dashboard | Slides | Monthly |
| Client | Progress | Meeting | Bi-weekly |

**Key Principles:**
1. Right information, right people, right time
2. No surprises — proactive communication
3. Document decisions, share them broadly

> *"— Comm. Agent — information flows, projects grow"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Communications Agent** — I keep everyone on the same page. Here's what I can help with:

- 📢 **Communications Plan** — Who needs to know what, when
- 📊 **Status Reports** — Clear, concise project updates
- 📅 **Meeting Cadence** — Effective, focused gatherings
- 📝 **Stakeholder Updates** — Tailored messaging

How does your team prefer to communicate?

> *"— Communication is the real project manager"*` };
}

function getRiskResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("register") || lower.includes("mitigation")) {
    return { id, role: "agent", timestamp: ts, content: `**Risk Register — ${projectName}**

| Risk | Probability | Impact | Score | Response |
|------|-----------|--------|-------|---------|
| Resource turnover | Medium | High | 🔴 15 | Mitigate: cross-training |
| Timeline delay | Medium | Medium | 🟡 9 | Accept: buffer |
| Scope creep | High | High | 🔴 16 | Avoid: strict change control |
| Tech debt | Low | Medium | 🟢 4 | Monitor |

**Top Priority:** Scope creep — implementing stricter change control procedures.

**Contingency Budget:** 10% of total project budget allocated.

> *"— Risk Agent — hope is not a strategy"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Risk Agent** — I see what could go wrong (and right). Here's how I can help:

- ⚠️ **Risk Register** — Identify, assess, prioritize
- 🛡️ **Mitigation Planning** — Reduce probability and impact
- 📋 **Issue Tracker** — Track problems that materialize
- 🔄 **SWOT Analysis** — Strengths, Weaknesses, Opportunities, Threats

What keeps you up at night about this project?

> *"— Preparedness isn't pessimism — it's professionalism"*` };
}

function getProcurementResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("vendor") || lower.includes("contract") || lower.includes("sow")) {
    return { id, role: "agent", timestamp: ts, content: `**Procurement Plan — ${projectName}**

| Item | Type | Vendor | Status | Budget |
|------|------|--------|--------|--------|
| Cloud Infrastructure | SaaS | TBD | Sourcing | $X,XXX |
| Design Services | Agency | TBD | RFP sent | $X,XXX |
| Software Licenses | Perpetual | TBD | Evaluating | $X,XXX |

**Selection Criteria:**
1. Technical capability (40%)
2. Cost competitiveness (30%)
3. Track record (20%)
4. Support quality (10%)

> *"— Procurement Agent — the right partners make the difference"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Procurement Agent** — I handle the business side. Here's what I can do:

- 📦 **Vendor Selection** — Find and evaluate partners
- 📝 **SOW Writing** — Clear scope of work
- ⚖️ **Contract Management** — Fair terms for both sides
- 📋 **Procurement Documents** — RFPs, RFQs, RFIs

Need to source something for your project?

> *"— Good contracts build good relationships"*` };
}

function getStakeholderResponse(input: string, projectName: string): AIAgentMessage {
  const lower = input.toLowerCase();
  const ts = new Date().toISOString();
  const id = `msg-${Date.now()}-ai`;

  if (lower.includes("register") || lower.includes("engagement") || lower.includes("map")) {
    return { id, role: "agent", timestamp: ts, content: `**Stakeholder Register — ${projectName}**

| Stakeholder | Interest | Influence | Strategy |
|------------|----------|-----------|----------|
| Executive Sponsor | High | High | 🤝 Manage Closely |
| Project Team | High | Medium | 👥 Keep Informed |
| End Users | Medium | Low | 📢 Consult Regularly |
| IT Operations | Low | Medium | ℹ️ Keep Informed |

**Engagement Plan:**
1. Weekly sponsor updates (15-min standup)
2. Monthly team development session
3. User feedback sessions at milestones
4. Ops handover planning in final phase

> *"— Stakeholder Agent — projects succeed when people feel heard"*` };
  }
  return { id, role: "agent", timestamp: ts, content: `I'm your **Stakeholder Agent** — I build bridges, not walls. Here's how I can help:

- 🤝 **Stakeholder Register** — Who matters and why
- 📋 **Engagement Plan** — Tailored approach for each stakeholder
- 🎯 **Expectation Management** — Align on what's realistic
- 🗺️ **Influence Mapping** — Understand the dynamics

Who are the key people we need to bring on board?

> *"— Stakeholder buy-in is the difference between a project and a paperweight"*` };
}

/* ─── Response Router ─── */

function getAgentResponse(type: AgentType, input: string, projectName: string): AIAgentMessage {
  switch (type) {
    case "integration": return getIntegrationResponse(input, projectName);
    case "scope": return getScopeResponse(input, projectName);
    case "schedule": return getScheduleResponse(input, projectName);
    case "cost": return getCostResponse(input, projectName);
    case "quality": return getQualityResponse(input, projectName);
    case "resource": return getResourceResponse(input, projectName);
    case "communications": return getCommResponse(input, projectName);
    case "risk": return getRiskResponse(input, projectName);
    case "procurement": return getProcurementResponse(input, projectName);
    case "stakeholder": return getStakeholderResponse(input, projectName);
  }
}

function getThinkingStages(type: AgentType): ThinkingStage[] {
  const texts = STAGE_TEXTS[type] || ["Processing...", "Analyzing...", "Generating..."];
  const base = STAGE_DURATIONS[type] || 600;
  return [
    { stage: texts[0], duration: base },
    { stage: texts[1], duration: base },
    { stage: texts[2], duration: base },
  ];
}

/* ─── Typing indicator ─── */

function TypingIndicator({ stage }: { stage: string }) {
  return (
    <div className="flex gap-2 justify-start">
      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
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

/* ─── Main Panel ─── */

export default function AIPanel({ projectId, onTasksGenerated, onStageUpdate, onActivityEvent }: AIPanelProps) {
  const session = getAISessionByProjectId(projectId);
  const [agentType, setAgentType] = useState<AgentType>("integration");
  const [messages, setMessages] = useState<AIAgentMessage[]>(session?.messages || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStage, setThinkingStage] = useState("");
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const meta = AGENT_META[agentType];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const simulateTyping = useCallback(
    (userText: string) => {
      const stages = getThinkingStages(agentType);
      let cumulativeDelay = 0;

      stages.forEach((s, i) => {
        cumulativeDelay += s.duration;
        setTimeout(() => {
          if (i === stages.length - 1) {
            setThinkingStage("");
            setIsTyping(false);

            const projectName = "Current Project"; // Could be passed from parent
            const aiReply = getAgentResponse(agentType, userText, projectName);
            setMessages((prev) => [...prev, aiReply]);

            if (onStageUpdate) {
              onStageUpdate([
                { type: agentType, status: "completed", summary: aiReply.content.split("\n")[0]?.replace(/[*#]/g, "").trim().slice(0, 40) || "Completed" },
              ]);
              const nextOrder: AgentType[] = ["integration", "scope", "schedule", "cost", "quality", "resource", "communications", "risk", "procurement", "stakeholder"];
              const currentIdx = nextOrder.indexOf(agentType);
              if (currentIdx >= 0 && currentIdx < nextOrder.length - 1) {
                const nextType = nextOrder[currentIdx + 1];
                setTimeout(() => {
                  onStageUpdate([
                    { type: agentType, status: "completed" },
                    { type: nextType, status: "active", summary: "Waiting for input…" },
                  ]);
                }, 2000);
              }
            }

            if (onActivityEvent) {
              onActivityEvent({
                id: `act-${Date.now()}`,
                projectId,
                agentType,
                action: `Generated ${meta.label} output`,
                detail: aiReply.content.slice(0, 80).replace(/\n/g, " ") + "…",
                status: "success",
                timestamp: new Date().toISOString(),
                duration: `${((cumulativeDelay + 200) / 1000).toFixed(1)}s`,
              });
            }
          } else {
            setThinkingStage(s.stage);
          }
        }, cumulativeDelay);
      });
    },
    [agentType, projectId, onStageUpdate, onActivityEvent]
  );

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    const newMessage: AIAgentMessage = { id: `msg-${Date.now()}`, role: "user", content: userText, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);
    setThinkingStage(getThinkingStages(agentType)[0].stage);
    simulateTyping(userText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const switchAgent = (type: AgentType) => {
    setAgentType(type);
    setShowAgentPicker(false);
    const switchMsg: AIAgentMessage = {
      id: `msg-${Date.now()}-switch`, role: "agent",
      content: `Switched to **${AGENT_META[type].label}**. ${AGENT_META[type].personality.split('.')[0]}.`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  const allAgentTypes: AgentType[] = ["integration", "scope", "schedule", "cost", "quality", "resource", "communications", "risk", "procurement", "stakeholder"];

  const statusColor = "bg-green";
  const statusLabel = "Agent Online";

  const panelContent = (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${meta.accentColor}15` }}>
            <span>{meta.icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{meta.shortLabel}</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              <span className="text-[11px] text-muted">{statusLabel}</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowAgentPicker((prev) => !prev)} className="text-xs text-muted hover:text-text px-2 py-1 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
            Switch
          </button>
          {showAgentPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAgentPicker(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white rounded-xl shadow-xl border border-border py-1 animate-fade-in max-h-[400px] overflow-y-auto">
                {allAgentTypes.map((type) => {
                  const a = AGENT_META[type];
                  return (
                    <button key={type} onClick={() => switchAgent(type)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${type === agentType ? "bg-gray-50 font-semibold" : ""}`}>
                      <span>{a.icon}</span>
                      <div className="text-left min-w-0">
                        <div className="text-text truncate">{a.label}</div>
                        <div className="text-[10px] text-muted truncate">{a.description}</div>
                      </div>
                      {type === agentType && <svg className="w-4 h-4 ml-auto text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
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
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-2xl" style={{ backgroundColor: `${meta.accentColor}15` }}>{meta.icon}</div>
            <p className="text-sm text-muted font-medium">{meta.label}</p>
            <p className="text-[11px] text-muted/70 mt-1 max-w-[200px]">{meta.description}</p>
            {meta.expertise && (
              <div className="flex flex-wrap gap-1 mt-3 justify-center">
                {meta.expertise.slice(0, 3).map((e) => (
                  <span key={e} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-muted">{e}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "agent" && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs" style={{ backgroundColor: `${meta.accentColor}15` }}>
                <span>{meta.icon}</span>
              </div>
            )}
            <div className={`max-w-[250px] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user" ? "bg-accent text-white rounded-tr-sm" : "bg-bg text-text border border-border rounded-tl-sm"
            }`}>
              <div>{msg.content}</div>
              <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/60" : "text-muted"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-medium text-gray-600">U</span>
              </div>
            )}
          </div>
        ))}
        {isTyping && <TypingIndicator stage={thinkingStage} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 bg-bg rounded-lg border border-border p-1.5">
          <input type="text" placeholder={`Ask ${meta.shortLabel}...`} value={input}
            onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} maxLength={500}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/50 outline-none px-2" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted/50 tabular-nums">{input.length}/500</span>
            <button onClick={handleSend} disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-md bg-accent flex items-center justify-center disabled:opacity-40 hover:bg-accent/90 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="hidden lg:flex h-full bg-white border-l border-border flex-col min-w-0 shrink">{panelContent}</div>
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => {}} />
        <div className="relative bg-white rounded-t-2xl shadow-2xl border border-border max-h-[70vh] flex flex-col animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${meta.accentColor}15` }}><span>{meta.icon}</span></div>
              <div><h3 className="text-sm font-semibold text-text">{meta.shortLabel}</h3></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-accent text-white rounded-tr-sm" : "bg-bg text-text border border-border rounded-tl-sm"}`}>{msg.content}</div>
              </div>
            ))}
            {isTyping && <TypingIndicator stage={thinkingStage} />}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 py-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2 bg-bg rounded-lg border border-border p-1.5">
              <input type="text" placeholder={`Ask ${meta.shortLabel}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} maxLength={500} className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/50 outline-none px-2" />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-8 h-8 rounded-md bg-accent flex items-center justify-center disabled:opacity-40 hover:bg-accent/90 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
