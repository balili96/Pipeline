# Pipeline — System Architecture Blueprint

> *AI Project Manager for Freelancers & SMEs*
> *Version: v0.1 — Architecture Draft*

---

## 1. 🧱 System Overview

Pipeline is an AI-native platform that handles the entire software development lifecycle,
**governed by PMBOK® 8th Edition principles & performance domains.**

```
┌─────────────────────────────────────────────────────────────────┐
│                   PIPELINE SYSTEM                                 │
│                   ──────────────                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              PMBOK 8 GOVERNANCE LAYER                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ STAKEHOLDER  │  │   TEAM       │  │ DEVELOPMENT  │      │  │
│  │  │ Engagement   │  │ Development  │  │ Approach &   │      │  │
│  │  │              │  │              │  │ Life Cycle   │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │  PLANNING    │  │ PROJECT WORK │  │   DELIVERY   │      │  │
│  │  │              │  │              │  │              │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │  ┌──────────────┐  ┌──────────────┐                         │  │
│  │  │ MEASUREMENT  │  │ UNCERTAINTY  │                         │  │
│  │  │              │  │ (Risk Mgmt)  │                         │  │
│  │  └──────────────┘  └──────────────┘                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              AI EXECUTION LAYER                              │  │
│  │                                                             │  │
│  │  Plan ──→ Code ──→ Test ──→ Deploy ──→ Document            │  │
│  │    ↑        ↑        ↑         ↑          ↑                 │  │
│  │    └────────┴────────┴─────────┴──────────┘                 │  │
│  │               AI Agents (LLM-powered)                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14+ (React) | Dashboard UI, responsive, SSR |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development |
| **Backend API** | FastAPI (Python) | REST + WebSocket endpoints |
| **Database** | PostgreSQL | Primary data store |
| **Queue** | Redis + Celery | Async AI task processing |
| **AI/LLM** | OpenAI API / Claude API | LLM for planning, coding, docs |
| **Auth** | JWT + Supabase Auth | User authentication |
| **File Store** | Supabase Storage / S3 | File uploads, artifacts |
| **Git** | GitHub API | Repo operations, PRs, CI |
| **CI/CD** | GitHub Actions / Vercel | Deployment pipeline |
| **Hosting** | Vercel (frontend) + Railway (backend) | Cloud deployment |

### Why This Stack?

| Component | Why |
|-----------|-----|
| **FastAPI** | Async-native, Python (good for AI/LLM integration), auto-docs |
| **Next.js** | Full-stack capable, good DX, easy deployment |
| **PostgreSQL** | Reliable, JSON support for flexible AI outputs |
| **Redis + Celery** | Long-running AI tasks need queue — user doesn't wait for AI to finish coding |
| **Supabase** | Auth + DB + Storage in one — reduces infra complexity for solo founder |

---

## 3. 🗄️ Database Schema

### Core Tables

```
┌─────────────────────────────────────────────────────────┐
│  users                                                    │
│  ─────                                                    │
│  id              UUID  (PK)                               │
│  email           String  (unique)                         │
│  name            String                                   │
│  avatar_url      String?                                  │
│  auth_provider   Enum: email / github / google            │
│  created_at      Timestamp                                │
│  plan            Enum: solo / pro / team                  │
└──────────────────────┬────────────────────────────────────┘
                       │ 1
                       │
                       │ *
┌──────────────────────┴────────────────────────────────────┐
│  projects                                                 │
│  ────────                                                 │
│  id              UUID  (PK)                               │
│  user_id         UUID  (FK → users)                       │
│  name            String                                   │
│  description     Text?                                    │
│  github_repo     String?  (owner/repo)                    │
│  status          Enum: planning / active / archived        │
│  ai_enabled      Boolean  (default: true)                 │
│  created_at      Timestamp                                │
│  updated_at      Timestamp                                │
└──────────────────────┬────────────────────────────────────┘
                       │ 1
                       │
                       │ *
┌──────────────────────┴────────────────────────────────────┐
│  tasks                                                    │
│  ─────                                                    │
│  id              UUID  (PK)                               │
│  project_id      UUID  (FK → projects)                    │
│  parent_id       UUID?  (FK → tasks)  [subtasks]          │
│  title           String                                   │
│  description     Text?                                    │
│  status          Enum: todo / in_progress / review / done  │
│  priority        Enum: low / medium / high / critical      │
│  ai_generated    Boolean  (was this created by AI?)        │
│  ai_session_id   UUID?  (FK → ai_sessions)                │
│  created_by      Enum: user / ai                           │
│  created_at      Timestamp                                │
│  updated_at      Timestamp                                │
│  estimated_hours Float?                                   │
│  sort_order      Integer                                  │
└──────────────────────┬────────────────────────────────────┘
                       │ 1
                       │
                       │ *
┌──────────────────────┴────────────────────────────────────┐
│  ai_sessions                                              │
│  ───────────                                              │
│  id              UUID  (PK)                               │
│  project_id      UUID  (FK → projects)                    │
│  type            Enum: plan / code / test / deploy / docs  │
│  prompt          Text   (what user asked)                  │
│  status          Enum: queued / running / done / failed    │
│  result          JSONB?  (structured AI output)            │
│  pr_url          String?  (if code → GitHub PR)            │
│  started_at      Timestamp?                                │
│  completed_at    Timestamp?                                │
│  tokens_used     Integer?                                  │
│  cost            Float?   (API cost tracking)              │
│  created_at      Timestamp                                │
└──────────────────────┬────────────────────────────────────┘
                       │ 1
                       │
                       │ *
┌──────────────────────┴────────────────────────────────────┐
│  deployments                                              │
│  ───────────                                              │
│  id              UUID  (PK)                               │
│  project_id      UUID  (FK → projects)                    │
│  ai_session_id   UUID?  (FK → ai_sessions)                │
│  status          Enum: deploying / live / failed / rolled_back
│  url             String?  (deployed URL)                   │
│  platform        Enum: vercel / railway / custom            │
│  commit_sha      String?                                   │
│  created_at      Timestamp                                │
└──────────────────────┬────────────────────────────────────┘
                       │ 1
                       │
                       │ *
┌──────────────────────┴────────────────────────────────────┐
│  documents                                                │
│  ─────────                                                │
│  id              UUID  (PK)                               │
│  project_id      UUID  (FK → projects)                    │
│  ai_session_id   UUID?  (FK → ai_sessions)                │
│  type            Enum: api_ref / arch_diagram / readme / changelog
│  content         JSONB   (structured doc content)          │
│  sync_status     Enum: synced / outdated / regenerating    │
│  created_at      Timestamp                                │
│  updated_at      Timestamp                                │
└───────────────────────────────────────────────────────────┘
```

### Relationships Summary

```
users ──< projects ──< tasks
                      │
                      ├──< ai_sessions ──< deployments
                      │     └──< documents
                      │
                      └──< documents
```

---

## 4. 🔄 End-to-End Workflow

Here's how Pipeline works from the moment a user logs in to the moment their project ships.

### Overview Flow

```
USER LOGS IN
     │
     ▼
┌──────────────────────────────────────────────────┐
│  DASHBOARD: "Start New Project"                   │
│  ────────────────────────────────                 │
│                                                   │
│  User types: "Build a booking system for          │
│  my freelance clients"                            │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  PHASE 1: PMBOK GOVERNANCE  (2–5 min)            │
│  ─────────────────────────────                    │
│                                                   │
│  ① Requirements Agent (Stakeholder)               │
│     → "What features? Payment? Calendar?          │
│       Who are your clients?"                      │
│     → User answers → scope document                │
│                                                   │
│  ② Strategy Agent (Life Cycle)                    │
│     → "Small project, solo → Agile, 1-week       │
│       sprints"                                    │
│                                                   │
│  ③ Risk Agent (Uncertainty)                       │
│     → "Risks: payment integration failure,        │
│       scope creep, API downtime"                  │
│     → Risk register created                       │
│                                                   │
│  ④ Orchestrator (Team)                            │
│     → "Approved. Assigning to Plan Agent..."      │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  PHASE 2: EXECUTION  (5–30 min per task)          │
│  ────────────────────────                          │
│                                                   │
│  ⑤ Plan Agent (Planning)                          │
│     → Creates WBS: 15 tasks, 3 milestones         │
│     → Gantt timeline with estimates               │
│     → User reviews & approves                      │
│                                                   │
│  ⑥ Code Agent (Project Work)                      │
│     → Connects to user's GitHub repo              │
│     → Writes code, creates PR                     │
│     → "PR #12 ready for review"                    │
│                                                   │
│  ⑦ QA & Metrics Agent (Measurement)               │
│     → Runs unit tests, integration tests          │
│     → Burndown chart updated                      │
│     → Velocity report generated                    │
│                                                   │
│  ═══ REAL-TIME DASHBOARD UPDATES  ═══             │
│  • Kanban board shows task progress               │
│  • AI Agent status: "Writing payment module..."   │
│  • WebSocket pushes updates live                   │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  PHASE 3: CLOSURE  (1–2 min)                      │
│  ─────────────────────                             │
│                                                   │
│  ⑧ Deploy Agent (Delivery)                        │
│     → Auto-deploys to Vercel/Railway              │
│     → "Deployed: booking.fadzly.dev"              │
│                                                   │
│  ⑨ Risk Agent reviews                             │
│     → Updates risk register                       │
│     → "2 risks mitigated, 1 remaining"             │
│                                                   │
│  ⑩ Documents auto-generated                       │
│     → API reference, architecture diagram         │
│     → Changelog, README updated                   │
│                                                   │
│  ⑪ Final report to dashboard                      │
│     → PR URL, Deploy URL, Docs URL                │
│     → KPI summary: time saved, code quality       │
└──────────────────────────────────────────────────┘
```

### User's View (Dashboard Timeline)

```
┌─────────────────────────────────────────────────────────┐
│  Project: Booking System                    Status: Live │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ⏰ Timeline                                               │
│  ─────────                                                 │
│  09:00  ❓ Requirements: "What features?"                 │
│  09:02  💬 You replied: "Calendar sync + Stripe"          │
│  09:03  📋 Scope document generated                       │
│  09:05  ⚠️ Risk agent: "3 risks identified"               │
│  09:07  📊 Plan: 15 tasks, 3 sprints (you approved)      │
│  09:10  🤖 Code agent: Writing authentication module...   │
│  09:15  🤖 Code agent: Writing booking API...              │
│  09:22  🤖 Code agent: PR #12 created                     │
│  09:22  🧪 QA: Running tests... 32/32 passed              │
│  09:23  🧪 QA: Coverage 87% — above threshold             │
│  09:24  🚀 Deploy: Deploying to production...             │
│  09:25  🚀 Live: booking.fadzly.dev                       │
│  09:25  📄 Docs: API reference generated                  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  📊 KPI Snapshot (vs manual PM)                          │
│  ─────────────                                            │
│  • Time saved: ~3 days (from 5 days → 2 hours)          │
│  • Tasks completed: 15/15                                │
│  • Tests passed: 32/32                                   │
│  • Code quality: 87% coverage                            │
│  • Risks mitigated: 2/3                                  │
└─────────────────────────────────────────────────────────┘
```

### Real-Time Interaction

The user doesn't just wait — they can **intervene at any point**:

```
                        ┌─────────────────────┐
                        │  USER CAN:           │
                        │                      │
                        │  • Edit plan         │
                        │  • Leave comments    │
                        │  • Request changes   │
                        │  • Cancel & restart  │
                        │  • Take over coding  │
                        └─────────────────────┘
                               ↑
┌──────────────────────────────┴──────────────────────────┐
│  AI AGENTS WORK IN BACKGROUND                           │
│  ────────────────────────────                            │
│  • User sees real-time status updates                    │
│  • WebSocket pushes live agent activity                  │
│  • User can open chat and say "Change this"              │
│  • Agents adapt without losing progress                  │
└─────────────────────────────────────────────────────────┘
```

### Key Workflow Principles

| Principle | How It Works |
|-----------|-------------|
| **PMBOK-first** | Every project starts with governance agents (requirements, strategy, risk) before any code is written |
| **Human-in-the-loop** | User reviews and approves at key gates (scope → plan → PR → deploy) |
| **Async by default** | AI works in background via queue — user doesn't wait |
| **Real-time visibility** | WebSocket pushes every agent action to dashboard |
| **PMBOK artifacts** | Every project produces: scope doc, WBS, risk register, test report, changelog |
| **Continuous adaptation** | User can interrupt at any point; agents adapt without losing progress |

---

## 5. 🤖 AI Agent Architecture (PMBOK 8-Aligned)

Pipeline's AI agents are not just coding bots — each agent maps to a **PMBOK 8 Performance Domain**, ensuring the entire project is managed by proper project management standards, not just automated coding.

### PMBOK 8 → AI Agent Mapping

| PMBOK 8 Performance Domain | Pipeline AI Agent | What It Does |
|---------------------------|-------------------|--------------|
| **Stakeholders** | **Requirements Agent** | Elicits user needs, clarifies scope, manages expectations |
| **Team** | **Orchestrator Agent** | Assigns work, coordinates agents, handles handoffs |
| **Development Approach & Life Cycle** | **Strategy Agent** | Chooses agile/waterfall/hybrid, defines sprint cadence |
| **Planning** | **Plan Agent** | WBS, roadmap, milestones, effort estimation, scheduling |
| **Project Work** | **Code Agent** | Writes code, creates PRs, manages technical execution |
| **Delivery** | **Deploy Agent** | CI/CD, release management, production rollout |
| **Measurement** | **QA & Metrics Agent** | Testing, burndown charts, velocity tracking, KPI reporting |
| **Uncertainty** | **Risk Agent** | Identifies risks, suggests mitigations, technical debt tracking |

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PMBOK 8 AI AGENT PIPELINE                         │
│                                                                     │
│  User Input: "Build a booking system for my freelance clients"      │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  PMBOK 8 GOVERNANCE AGENTS (run on every project cycle)      │    │
│  │                                                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │    │
│  │  │ REQUIREMENTS │  │  STRATEGY    │  │     RISK     │      │    │
│  │  │ (Stakeholder)│  │ (Life Cycle) │  │ (Uncertainty)│      │    │
│  │  │              │  │              │  │              │      │    │
│  │  │ "What exactly │  │ "Agile,      │  │ "Risks: API   │      │    │
│  │  │  do you need?"│  │  2-week      │  │  downtime,    │      │    │
│  │  │              │  │  sprints"    │  │  scope creep" │      │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │    │
│  └─────────┼──────────────────┼──────────────────┼────────────┘    │
│            │                  │                  │                 │
│            └──────────────────┼──────────────────┘                 │
│                               ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ORCHESTRATOR AGENT (Team Domain)                            │    │
│  │  ───────────────────────────                                │    │
│  │  • Decomposes request into PMBOK-compliant work packages    │    │
│  │  • Assigns to execution agents                              │    │
│  │  • Tracks progress, handles handoffs                        │    │
│  └──────────────────────┬──────────────────────────────────────┘    │
│                         │                                           │
│                    ┌────┴───────────────────┐                       │
│                    │                        │                       │
│                    ▼                        ▼                       │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │  EXECUTION AGENTS        │  │  VERIFICATION AGENTS    │          │
│  │  ─────────────────       │  │  ──────────────────    │          │
│  │                         │  │                         │          │
│  │  Plan Agent  (Planning) │  │  QA & Metrics Agent     │          │
│  │  Code Agent  (Work)     │  │  (Measurement Domain)   │          │
│  │  Deploy Agent (Delivery)│  │  • Unit/integration     │          │
│  │                         │  │  • Burndown tracking    │          │
│  └─────────────────────────┘  │  • KPI dashboard        │          │
│                               └─────────────────────────┘          │
│                                                                     │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  OUTPUT                                                    │    │
│  │  ──────                                                    │    │
│  │  • PMBOK-compliant project artifacts                        │    │
│  │  • GitHub PR with tested code                              │    │
│  │  • Risk register + mitigation plan                         │    │
│  │  • Auto-generated documentation (API ref, changelog)       │    │
│  │  • Deployment URL                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Breakdown (Detailed)

| Agent | PMBOK Domain | Prompt Context | Tools Access | Artifact Output |
|-------|-------------|---------------|-------------|-----------------|
| **Requirements Agent** | Stakeholders | User interview, project brief | Chat UI | Stakeholder register, scope statement, MoSCoW prioritisation |
| **Strategy Agent** | Dev Approach & Life Cycle | Project type, team size, complexity | Project config | Development methodology recommendation, sprint cadence |
| **Plan Agent** | Planning | Requirements doc, scope | Task DB, calendar | WBS, Gantt timeline, milestone plan, effort estimation |
| **Orchestrator Agent** | Team | All agent outputs, project status | Task DB, agent registry | Task assignments, dependency graph, progress dashboard |
| **Code Agent** | Project Work | User stories, technical spec | GitHub API, file system | Code changes, PR with description, commit messages |
| **QA & Metrics Agent** | Measurement | Code changes, test results | Test runner, DB | Test suite, burndown chart, velocity report, KPI dashboard |
| **Deploy Agent** | Delivery | Build artifacts, env config | Vercel/Railway API | Deployment URL, release notes, rollback plan |
| **Risk Agent** | Uncertainty | Project scope, dependencies, timeline | Risk DB | Risk register, mitigation strategies, technical debt log |

### How PMBOK 8 Principles Guide Each Agent

| PMBOK 8 Principle | How Pipeline AI Applies It |
|------------------|---------------------------|
| **Be a diligent steward** | AI logs all decisions, provides audit trail, suggests ethical considerations |
| **Create a collaborative team environment** | Orchestrator assigns clear ownership, manages handoffs, encourages review cycles |
| **Engage stakeholders** | Requirements Agent proactively asks clarifying questions before building |
| **Focus on value** | MoSCoW prioritisation — AI always builds highest-value features first |
| **Recognise system interactions** | Risk Agent maps dependency chains (library A → feature B → deployment C) |
| **Demonstrate leadership** | Orchestrator makes decisions when ambiguous, escalates only when necessary |
| **Tailor based on context** | Strategy Agent picks agile/waterfall/hybrid based on project type |
| **Build quality in** | QA Agent runs tests at every stage, not just at the end |
| **Navigate complexity** | Plan Agent breaks complex features into manageable work packages |
| **Optimise risk responses** | Risk Agent suggests mitigation (add redundancy, add tests, add monitoring) |
| **Embrace adaptability** | When requirements change, agents re-plan without losing progress |
| **Enable change** | Generates changelogs, migration guides, and stakeholder update summaries |

### AI Task Queue Flow (Async)

```
User Request
    │
    ▼
┌─────────────────────────────┐
│  API: POST /api/ai/execute  │  ◄── Returns session_id immediately
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Redis Queue (Celery)       │  ◄── Task queued
│  ─────────────────────      │
│  PMBOK Phase 1: Governance  │
│  [Requirements → Strategy   │
│   → Risk Analysis]          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  PMBOK Phase 2: Execution   │  ◄── AI works (30s–5min)
│  [Plan → Code → Test]      │
│  Progress via WebSocket     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  PMBOK Phase 3: Closure     │
│  [Deploy → Document →       │
│   Risk Review → Report]     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Output to Dashboard        │
│  • PR URL  • Deploy URL     │
│  • Docs    • Risk Register   │
│  • KPI Report               │
└─────────────────────────────┘
```

---

## 6. 🧩 Frontend / Dashboard Architecture

### Pages

```
/public
├── /          → Landing page (existing)
├── /dashboard → Main app (auth required)
│   ├── /projects          → Project list
│   ├── /projects/:id      → Project board (kanban)
│   │   ├── /plan          → AI-generated roadmap
│   │   ├── /code          → AI coding sessions
│   │   ├── /test          → Test results
│   │   ├── /deploy        → Deployment config
│   │   └── /docs          → Generated documentation
│   ├── /settings           → User settings
│   └── /billing            → Plan & payment
└── /api                    → Backend API routes
```

### Component Tree (Dashboard)

```
<AppLayout>
  <Sidebar>          ← Projects list, nav links
  <MainContent>
    <ProjectHeader>  ← Name, status, AI toggle
    <BoardView>      ← Kanban columns
      <Column>       ← todo / in_progress / review / done
        <TaskCard>   ← Title, labels, AI agent badge
    </BoardView>
    <AIAgentPanel>   ← Chat interface with Pipeline AI
      <MessageList>
      <PromptInput>
      <AgentStatus>  ← "Thinking..." / "Writing code..." / "Done"
    </AIAgentPanel>
    <ActivityFeed>   ← Real-time updates
  </MainContent>
</AppLayout>
```

---

## 7. 🔐 Security & Data Flow

```
                    ┌──────────┐
                    │  Browser │  ◄── HTTPS only
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Next.js  │  ◄── SSR, API routes
                    │  Frontend │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ FastAPI   │  ◄── JWT auth required
                    │ Backend   │
                    └────┬─────┘
                         │
               ┌─────────┼──────────┐
               ▼         ▼          ▼
          ┌────────┐ ┌──────┐ ┌────────┐
          │   DB   │ │Redis │ │GitHub  │
          │  (PG)  │ │Queue │ │  API   │
          └────────┘ └──────┘ └────────┘
                              │
                         ┌────▼────┐
                         │  LLM    │
                         │ (OpenAI │
                         │ /Claude)│
                         └─────────┘
```

### Key Security Points
- **JWT tokens** for all API requests (expiry: 24h, refresh tokens)
- **AI API keys** stored server-side only (never exposed to frontend)
- **GitHub OAuth** for repo access (granular scopes)
- **Rate limiting** on AI endpoints (prevent abuse)
- **Audit logs** for all AI actions

---

## 8. 📦 Project Structure (Recommended)

```
pipeline/
├── frontend/              ← Next.js app
│   ├── app/
│   │   ├── page.tsx       ← Landing page
│   │   ├── dashboard/     ← Dashboard pages
│   │   └── api/           ← Frontend API routes
│   ├── components/        ← Shared components
│   ├── lib/               ← Utilities, API client
│   └── styles/            ← Global styles
│
├── backend/               ← FastAPI app
│   ├── app/
│   │   ├── api/           ← Route handlers
│   │   ├── models/        ← SQLAlchemy models
│   │   ├── schemas/       ← Pydantic schemas
│   │   ├── services/      ← Business logic
│   │   └── agents/        ← AI agent logic
│   ├── worker/            ← Celery tasks
│   │   └── tasks.py       ← AI task definitions
│   ├── alembic/           ← DB migrations
│   └── main.py            ← Entry point
│
├── landing/               ← Existing landing page
│   └── pipeline-landing.html
│
└── README.md
```

---

## 9. 🚀 Development Roadmap

| Phase | What to Build | Duration (Solo) |
|-------|--------------|-----------------|
| **P0: Core Dashboard** | Auth, projects CRUD, kanban board (mock data) | 2–3 weeks |
| **P1: AI Plan Agent** | AI generates roadmap + tasks from prompt | 1–2 weeks |
| **P2: AI Code Agent** | GitHub integration, AI writes code → PR | 2–3 weeks |
| **P3: Test + Deploy** | Auto test generation, one-click deploy | 2 weeks |
| **P4: Docs + Polish** | Living documentation, billing, launch | 2 weeks |

**Total MVP: ~8–12 weeks** (solo founder, part-time)

---

## 10. 📊 Cost Estimation (Monthly)

| Service | Cost (RM) | Notes |
|---------|----------|-------|
| Vercel (frontend) | Free | Hobby tier sufficient |
| Railway (backend) | ~RM20 | Starter tier |
| PostgreSQL | ~RM20 | Included in Railway |
| Redis | ~RM10 | Upstash / Redis Cloud |
| OpenAI API | Usage | ~RM50–200/month depending on usage |
| Supabase | Free | Auth + Storage |
| Domain | ~RM40/year | .com domain |
| **Total** | **~RM100–250/month** | |

---

## Next Steps

1. ✅ Set up development environment
2. Build core dashboard UI (Next.js + Tailwind)
3. Set up backend API (FastAPI + PostgreSQL)
4. Implement AI agent pipeline
5. Connect everything

---

*This is a living document — will evolve as we build.*
