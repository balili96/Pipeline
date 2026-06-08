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
    type: "plan",
    status: "active",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Help me plan the sprint for the marketing website redesign.",
        timestamp: "2026-06-06T09:00:00Z",
      },
      {
        id: "msg-2",
        role: "agent",
        content:
          "I've analyzed the project requirements. Here's my suggested sprint breakdown:\n\n1. **Week 1**: Hero section & navigation (foundational UI)\n2. **Week 2**: Contact form & content sections\n3. **Week 3**: Performance optimization & SEO\n4. **Week 4**: Testing & deployment\n\nI recommend starting with the responsive navigation and hero section in parallel. Would you like me to create specific tasks for these?",
        timestamp: "2026-06-06T09:00:05Z",
      },
      {
        id: "msg-3",
        role: "user",
        content: "Yes, please create the tasks for week 1.",
        timestamp: "2026-06-06T09:01:00Z",
      },
      {
        id: "msg-4",
        role: "agent",
        content:
          "Done! I've created the following tasks for Week 1:\n\n- ✅ **Design hero section mockups** (assigned to Alice)\n- ✅ **Implement responsive navigation** (assigned to Charlie)\n\nBoth tasks are now in the Planned column. You can adjust priorities and assignees as needed.",
        timestamp: "2026-06-06T09:01:10Z",
      },
    ],
    startedAt: "2026-06-06T09:00:00Z",
  },
  {
    id: "session-2",
    projectId: "proj-1",
    type: "code",
    status: "active",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "Start coding the hero section based on the mockups.",
        timestamp: "2026-06-06T10:00:00Z",
      },
      {
        id: "msg-6",
        role: "agent",
        content:
          "I've started implementing the hero section. Here's what I'm building:\n\n- Responsive hero layout with gradient background\n- CTA button component with hover effects\n- Animated headline with staggered text reveal\n\nI'll create a PR once the initial implementation is done. ETA: ~15 minutes.",
        timestamp: "2026-06-06T10:00:08Z",
      },
    ],
    startedAt: "2026-06-06T10:00:00Z",
  },
  {
    id: "session-3",
    projectId: "proj-1",
    type: "test",
    status: "completed",
    messages: [
      {
        id: "msg-7",
        role: "user",
        content: "Run tests on the navigation component.",
        timestamp: "2026-06-05T14:00:00Z",
      },
      {
        id: "msg-8",
        role: "agent",
        content:
          "Test results for navigation component:\n\n- ✅ Unit tests: 12/12 passed\n- ✅ Integration tests: 8/8 passed\n- ✅ Accessibility: WCAG 2.1 AA compliant\n- ⚠️ Performance: LCP at 2.3s (threshold: 2.5s) — acceptable\n\nAll critical tests pass. Ready for review.",
        timestamp: "2026-06-05T14:02:30Z",
      },
    ],
    startedAt: "2026-06-05T14:00:00Z",
  },
  {
    id: "session-4",
    projectId: "proj-2",
    type: "plan",
    status: "active",
    messages: [
      {
        id: "msg-9",
        role: "user",
        content: "Plan the API integration endpoints for the mobile app.",
        timestamp: "2026-06-04T11:00:00Z",
      },
      {
        id: "msg-10",
        role: "agent",
        content:
          "Here's the API integration plan for the mobile app:\n\n1. **Auth API** — Login/Register with JWT\n2. **User API** — Profile CRUD\n3. **Content API** — Blog/articles endpoint\n4. **Notification API** — Push notification service\n5. **Analytics API** — Event tracking\n\nI recommend starting with Auth API first as it's a dependency for all other endpoints.",
        timestamp: "2026-06-04T11:00:06Z",
      },
    ],
    startedAt: "2026-06-04T11:00:00Z",
  },
  {
    id: "session-5",
    projectId: "proj-2",
    type: "code",
    status: "completed",
    messages: [
      {
        id: "msg-11",
        role: "user",
        content: "Build the authentication API endpoint.",
        timestamp: "2026-06-03T15:00:00Z",
      },
      {
        id: "msg-12",
        role: "agent",
        content:
          "Auth API implementation complete:\n\n- POST /api/auth/register — User registration with validation\n- POST /api/auth/login — Login with JWT token generation\n- POST /api/auth/refresh — Token refresh endpoint\n- GET /api/auth/me — Current user profile\n\nPR #23 is ready for review. Includes full test coverage.",
        timestamp: "2026-06-03T15:12:00Z",
      },
    ],
    startedAt: "2026-06-03T15:00:00Z",
  },
  {
    id: "session-6",
    projectId: "proj-3",
    type: "docs",
    status: "completed",
    messages: [
      {
        id: "msg-13",
        role: "user",
        content: "Generate documentation for the internal dashboard API.",
        timestamp: "2026-05-20T13:00:00Z",
      },
      {
        id: "msg-14",
        role: "agent",
        content:
          "Documentation generated:\n\n- 📄 **API Reference** — All endpoints with request/response schemas\n- 📄 **Architecture Overview** — System diagram and data flow\n- 📄 **Setup Guide** — Local development environment setup\n- 📄 **Changelog** — Version history with breaking changes\n\nAll docs are published and synced to the project wiki.",
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
    agentType: "plan",
    action: "Created sprint plan",
    detail: "3 milestones, 8 tasks generated for Marketing Website Redesign",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    duration: "2.3s",
  },
  {
    id: "act-2",
    projectId: "proj-1",
    agentType: "code",
    action: "Built hero section component",
    detail: "2 files modified, PR #42 opened",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    duration: "4.1s",
  },
  {
    id: "act-3",
    projectId: "proj-1",
    agentType: "test",
    action: "Ran test suite",
    detail: "42/42 passed, 87% coverage",
    status: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    duration: "1.8s",
  },
];

export function getActivityEventsByProject(projectId: string): ActivityEvent[] {
  return activityEvents.filter((e) => e.projectId === projectId);
}

export function getInitialPipelineStages(projectId: string): PipelineStage[] {
  // Return some completed stages based on project progress
  if (projectId === "proj-1") {
    return [
      { type: "plan", status: "completed", summary: "3 milestones, 8 tasks" },
      { type: "code", status: "active", summary: "Building hero section…" },
      { type: "test", status: "idle" },
      { type: "deploy", status: "idle" },
      { type: "docs", status: "idle" },
    ];
  }
  if (projectId === "proj-2") {
    return [
      { type: "plan", status: "completed", summary: "5 API endpoints planned" },
      { type: "code", status: "completed", summary: "Auth API implemented" },
      { type: "test", status: "active", summary: "Running integration tests…" },
      { type: "deploy", status: "idle" },
      { type: "docs", status: "idle" },
    ];
  }
  return [
    { type: "plan", status: "idle" },
    { type: "code", status: "idle" },
    { type: "test", status: "idle" },
    { type: "deploy", status: "idle" },
    { type: "docs", status: "idle" },
  ];
}
