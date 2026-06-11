import { Project, Task, AIAgentSession, ActivityEvent, PipelineStage } from "./types";

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Marketing Website Redesign",
    description: "Complete overhaul of the company marketing site with modern design and improved performance.",
    status: "active",
    createdAt: "2026-05-15T08:00:00Z",
  },
  {
    id: "proj-2",
    name: "Mobile App API Integration",
    description: "Build and integrate REST APIs for the new mobile application launch.",
    status: "active",
    createdAt: "2026-05-20T10:30:00Z",
  },
  {
    id: "proj-3",
    name: "Internal Dashboard v2",
    description: "Upgrade the internal analytics dashboard with real-time data and new visualizations.",
    status: "completed",
    createdAt: "2026-04-01T09:00:00Z",
  },
];

export const tasks: Task[] = [
  // Project 1 - Marketing Website Redesign
  {
    id: "task-1",
    title: "Design hero section mockups",
    description: "Create 3 variations of the hero section for the homepage.",
    status: "planned",
    priority: "high",
    tags: ["design"],
    projectId: "proj-1",
    aiGenerated: false,
    progress: 0,
    assignee: "Alice",
    dueDate: "2026-06-10",
  },
  {
    id: "task-2",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated builds and deployments.",
    status: "planned",
    priority: "medium",
    tags: ["devops"],
    projectId: "proj-1",
    aiGenerated: true,
    progress: 0,
    assignee: "Bob",
    dueDate: "2026-06-12",
  },
  {
    id: "task-3",
    title: "Implement responsive navigation",
    description: "Build a mobile-first navigation bar with hamburger menu.",
    status: "in_progress",
    priority: "high",
    tags: ["frontend"],
    projectId: "proj-1",
    aiGenerated: false,
    progress: 65,
    assignee: "Charlie",
    dueDate: "2026-06-08",
  },
  {
    id: "task-4",
    title: "Optimize image loading",
    description: "Implement lazy loading and WebP conversion for all images.",
    status: "in_progress",
    priority: "medium",
    tags: ["performance"],
    projectId: "proj-1",
    aiGenerated: true,
    progress: 30,
    assignee: "Alice",
    dueDate: "2026-06-15",
  },
  {
    id: "task-5",
    title: "Create contact form component",
    description: "Build a validated contact form with email integration.",
    status: "done",
    priority: "medium",
    tags: ["frontend"],
    projectId: "proj-1",
    aiGenerated: false,
    progress: 100,
    assignee: "Charlie",
    dueDate: "2026-06-05",
  },
  {
    id: "task-6",
    title: "Write SEO meta tags",
    description: "Add proper meta descriptions, OG tags, and structured data.",
    status: "done",
    priority: "low",
    tags: ["seo"],
    projectId: "proj-1",
    aiGenerated: true,
    progress: 100,
    assignee: "Diana",
    dueDate: "2026-06-03",
  },

  // Project 2 - Mobile App API Integration
  {
    id: "task-7",
    title: "Define API endpoints specification",
    description: "Document all REST endpoints with request/response schemas.",
    status: "planned",
    priority: "high",
    tags: ["backend", "docs"],
    projectId: "proj-2",
    aiGenerated: false,
    progress: 0,
    assignee: "Bob",
    dueDate: "2026-06-11",
  },
  {
    id: "task-8",
    title: "Implement authentication middleware",
    description: "Build JWT-based auth middleware for API routes.",
    status: "in_progress",
    priority: "high",
    tags: ["backend", "security"],
    projectId: "proj-2",
    aiGenerated: true,
    progress: 50,
    assignee: "Bob",
    dueDate: "2026-06-09",
  },
  {
    id: "task-9",
    title: "Create user CRUD endpoints",
    description: "Implement full CRUD for user management.",
    status: "in_progress",
    priority: "medium",
    tags: ["backend"],
    projectId: "proj-2",
    aiGenerated: false,
    progress: 75,
    assignee: "Eve",
    dueDate: "2026-06-10",
  },
  {
    id: "task-10",
    title: "Write API integration tests",
    description: "Comprehensive test suite covering all endpoints.",
    status: "planned",
    priority: "medium",
    tags: ["testing"],
    projectId: "proj-2",
    aiGenerated: true,
    progress: 0,
    assignee: "Frank",
    dueDate: "2026-06-14",
  },
  {
    id: "task-11",
    title: "Set up rate limiting",
    description: "Add rate limiting to prevent API abuse.",
    status: "done",
    priority: "low",
    tags: ["backend", "security"],
    projectId: "proj-2",
    aiGenerated: false,
    progress: 100,
    assignee: "Bob",
    dueDate: "2026-06-02",
  },

  // Project 3 - Internal Dashboard v2 (completed)
  {
    id: "task-12",
    title: "Implement data visualization charts",
    description: "Add interactive chart components for key metrics.",
    status: "done",
    priority: "high",
    tags: ["frontend", "charts"],
    projectId: "proj-3",
    aiGenerated: false,
    progress: 100,
    assignee: "Charlie",
    dueDate: "2026-05-20",
  },
  {
    id: "task-13",
    title: "Build export to CSV feature",
    description: "Allow users to download dashboard data as CSV.",
    status: "done",
    priority: "medium",
    tags: ["feature"],
    projectId: "proj-3",
    aiGenerated: true,
    progress: 100,
    assignee: "Alice",
    dueDate: "2026-05-18",
  },
  {
    id: "task-14",
    title: "User permission system",
    description: "Role-based access control for dashboard features.",
    status: "done",
    priority: "high",
    tags: ["backend", "security"],
    projectId: "proj-3",
    aiGenerated: false,
    progress: 100,
    assignee: "Bob",
    dueDate: "2026-05-15",
  },
];

export const aiSessions: AIAgentSession[] = [
  {
    id: "session-1",
    projectId: "proj-1",
    type: "integration",
    status: "active",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Help me set up the project charter for the marketing website redesign.",
        timestamp: "2026-06-06T09:00:00Z",
      },
      {
        id: "msg-2",
        role: "agent",
        content:
          "Here's your Project Charter draft:\n\n**Project Title:** Marketing Website Redesign\n**Business Case:** Modernize company marketing presence\n**Objectives:**\n1. Complete overhaul of marketing site\n2. Improve performance & SEO\n3. Modern design system\n\nI recommend we proceed with stakeholder identification next.",
        timestamp: "2026-06-06T09:00:05Z",
      },
    ],
    startedAt: "2026-06-06T09:00:00Z",
  },
  {
    id: "session-2",
    projectId: "proj-1",
    type: "scope",
    status: "active",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "Help me define the scope for the hero section.",
        timestamp: "2026-06-06T10:00:00Z",
      },
      {
        id: "msg-6",
        role: "agent",
        content:
          "Scope defined for Hero Section:\n\n**In Scope:**\n- Responsive hero layout\n- CTA button component\n- Animated headline\n\n**Out of Scope:**\n- Video background\n- Interactive 3D elements\n\nWould you like me to create the WBS for this?",
        timestamp: "2026-06-06T10:00:08Z",
      },
    ],
    startedAt: "2026-06-06T10:00:00Z",
  },
  {
    id: "session-3",
    projectId: "proj-1",
    type: "quality",
    status: "completed",
    messages: [
      {
        id: "msg-7",
        role: "user",
        content: "Run quality checks on the navigation component.",
        timestamp: "2026-06-05T14:00:00Z",
      },
      {
        id: "msg-8",
        role: "agent",
        content:
          "Quality check results:\n\n- ✅ Accessibility: WCAG 2.1 AA compliant\n- ✅ Performance: LCP at 2.3s (threshold: 2.5s)\n- ✅ Code standards: All linting passes\n- ⚠️ Test coverage: 72% (target: 80%)\n\nRecommendation: Add unit tests for edge cases.",
        timestamp: "2026-06-05T14:02:30Z",
      },
    ],
    startedAt: "2026-06-05T14:00:00Z",
  },
  {
    id: "session-4",
    projectId: "proj-2",
    type: "risk",
    status: "active",
    messages: [
      {
        id: "msg-9",
        role: "user",
        content: "Identify risks for the API integration project.",
        timestamp: "2026-06-04T11:00:00Z",
      },
      {
        id: "msg-10",
        role: "agent",
        content:
          "Risk assessment for Mobile App API Integration:\n\n1. **🔴 API Availability** — Third-party API downtime (High impact)\n2. **🟡 Data Sync** — Real-time sync complexity (Medium)\n3. **🟢 Auth Flow** — JWT implementation straightforward (Low)\n\nRecommended mitigation: API retry logic + fallback cache.",
        timestamp: "2026-06-04T11:00:06Z",
      },
    ],
    startedAt: "2026-06-04T11:00:00Z",
  },
  {
    id: "session-5",
    projectId: "proj-2",
    type: "schedule",
    status: "completed",
    messages: [
      {
        id: "msg-11",
        role: "user",
        content: "Build the schedule for API implementation.",
        timestamp: "2026-06-03T15:00:00Z",
      },
      {
        id: "msg-12",
        role: "agent",
        content:
          "Schedule Plan:\n\n- Week 1: Auth API endpoints\n- Week 2: User CRUD + integration tests\n- Week 3: Rate limiting + deployment\n\nCritical Path: Auth → User CRUD → Tests → Deploy\nTotal: 3 weeks with 3-day buffer.",
        timestamp: "2026-06-03T15:12:00Z",
      },
    ],
    startedAt: "2026-06-03T15:00:00Z",
  },
  {
    id: "session-6",
    projectId: "proj-3",
    type: "communications",
    status: "completed",
    messages: [
      {
        id: "msg-13",
        role: "user",
        content: "Generate the communications plan for the dashboard project.",
        timestamp: "2026-05-20T13:00:00Z",
      },
      {
        id: "msg-14",
        role: "agent",
        content:
          "Communications Plan generated:\n\n- 📄 **Status Reports** — Weekly to stakeholders\n- 📄 **Team Updates** — Daily standup\n- 📄 **Executive Summary** — Monthly dashboard\n- 📄 **Release Notes** — Per deployment\n\nAll communications published and scheduled.",
        timestamp: "2026-05-20T13:05:00Z",
      },
    ],
    startedAt: "2026-05-20T13:00:00Z",
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getTasksByProjectId(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId);
}

export function getTasksByStatus(
  projectId: string,
  status: Task["status"]
): Task[] {
  return tasks.filter((t) => t.projectId === projectId && t.status === status);
}

export function getAISessionByProjectId(projectId: string): AIAgentSession | undefined {
  return aiSessions.find((s) => s.projectId === projectId);
}

export function getAISessionsByProjectId(projectId: string): AIAgentSession[] {
  return aiSessions.filter((s) => s.projectId === projectId);
}

export function getProjectName(projectId: string): string {
  const project = projects.find((p) => p.id === projectId);
  return project?.name || "Unknown Project";
}

export function getProjectAnalytics(projectId: string) {
  const tasks = getTasksByProjectId(projectId);
  return {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    planned: tasks.filter(t => t.status === 'planned').length,
    avgProgress: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0,
  };
}

/* ─── Activity Trail Mock Data ─── */

export const activityEvents: ActivityEvent[] = [
  {
    id: "act-1",
    projectId: "proj-1",
    agentType: "integration",
    action: "Created Project Charter",
    detail: "Project Charter drafted for Marketing Website Redesign",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    duration: "2.3s",
  },
  {
    id: "act-2",
    projectId: "proj-1",
    agentType: "scope",
    action: "Defined scope & WBS",
    detail: "Requirements documented with WBS breakdown",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    duration: "4.1s",
  },
  {
    id: "act-3",
    projectId: "proj-1",
    agentType: "quality",
    action: "Ran quality audit",
    detail: "42/42 checks passed, 87% quality score",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    duration: "1.8s",
  },
];

export function getActivityEventsByProject(projectId: string): ActivityEvent[] {
  return activityEvents.filter((e) => e.projectId === projectId);
}

export function getInitialPipelineStages(projectId: string): PipelineStage[] {
  if (projectId === "proj-1") {
    return [
      { type: "integration", status: "completed", summary: "Project Charter created" },
      { type: "scope", status: "completed", summary: "WBS & requirements defined" },
      { type: "schedule", status: "active", summary: "Timeline in progress…" },
      { type: "cost", status: "idle" },
      { type: "quality", status: "idle" },
      { type: "resource", status: "idle" },
      { type: "communications", status: "idle" },
      { type: "risk", status: "idle" },
      { type: "procurement", status: "idle" },
      { type: "stakeholder", status: "idle" },
    ];
  }
  if (projectId === "proj-2") {
    return [
      { type: "integration", status: "completed", summary: "Integration plan ready" },
      { type: "scope", status: "completed", summary: "API scope defined" },
      { type: "schedule", status: "completed", summary: "3-week schedule" },
      { type: "cost", status: "completed", summary: "Budget estimated" },
      { type: "quality", status: "active", summary: "Quality review running…" },
      { type: "resource", status: "idle" },
      { type: "communications", status: "idle" },
      { type: "risk", status: "idle" },
      { type: "procurement", status: "idle" },
      { type: "stakeholder", status: "idle" },
    ];
  }
  return [
    { type: "integration", status: "idle" },
    { type: "scope", status: "idle" },
    { type: "schedule", status: "idle" },
    { type: "cost", status: "idle" },
    { type: "quality", status: "idle" },
    { type: "resource", status: "idle" },
    { type: "communications", status: "idle" },
    { type: "risk", status: "idle" },
    { type: "procurement", status: "idle" },
    { type: "stakeholder", status: "idle" },
  ];
}
