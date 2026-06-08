export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  tags: string[];
  projectId: string;
  aiGenerated: boolean;
  progress: number;
  assignee: string;
  dueDate: string;
}

export type AgentType = "plan" | "code" | "test" | "deploy" | "docs";

export type PipelineStageStatus = "idle" | "active" | "completed" | "failed" | "skipped";

export interface PipelineStage {
  type: AgentType;
  status: PipelineStageStatus;
  startedAt?: string;
  completedAt?: string;
  summary?: string;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  agentType: AgentType;
  action: string;
  detail: string;
  status: "running" | "success" | "failed" | "pending";
  timestamp: string;
  duration?: string;
}

export interface PipelineRun {
  id: string;
  projectId: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  stages: { type: AgentType; status: PipelineStageStatus; duration: number }[];
  status: "completed" | "failed";
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  durations: Record<AgentType, number>;
  stages: AgentType[];
}

export interface AIAgentMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  /** Optional: code block content displayed in a monospace panel */
  codeBlock?: string;
  /** Optional: structured result data (tasks created, test results, etc.) */
  structuredData?: Record<string, unknown>;
}

export interface AIAgentSession {
  id: string;
  projectId: string;
  type: AgentType;
  status: "active" | "completed" | "failed";
  messages: AIAgentMessage[];
  startedAt: string;
}

export const AGENT_META: Record<
  AgentType,
  {
    label: string;
    icon: string;
    accentColor: string;
    description: string;
  }
> = {
  plan: {
    label: "Plan Agent",
    icon: "🤔",
    accentColor: "#3B82F6",
    description: "Plan sprints, create tasks, generate roadmaps",
  },
  code: {
    label: "Code Agent",
    icon: "💻",
    accentColor: "#10B981",
    description: "Write code, create PRs, implement features",
  },
  test: {
    label: "Test Agent",
    icon: "🧪",
    accentColor: "#F59E0B",
    description: "Run tests, check quality, find bugs",
  },
  deploy: {
    label: "Deploy Agent",
    icon: "🚀",
    accentColor: "#8B5CF6",
    description: "Deploy builds, manage environments",
  },
  docs: {
    label: "Docs Agent",
    icon: "📄",
    accentColor: "#14B8A6",
    description: "Generate docs, API references, changelogs",
  },
};
