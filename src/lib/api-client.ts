const API_BASE = "https://pipeline-1-7l9o.onrender.com/api";

/* ─── Generic fetch helper ─── */
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  // Handle binary responses
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("octet-stream") || ct.includes("wordprocessingml")) {
    return res.blob() as any;
  }
  return res.json();
}

/* ─── Types ─── */
export interface ApiProject {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string[];
  assignee: string;
  due_date: string;
  progress: number;
  ai_generated: boolean;
  created_at: string;
}

export interface ApiDocument {
  id: string;
  project_id: string;
  doc_type: string;
  title: string;
  filename: string;
  original_filename: string;
  created_at: string;
}

/* ─── Projects ─── */
export async function fetchProjects(): Promise<ApiProject[]> {
  const data = await api<{ projects: ApiProject[]; total: number }>("/projects");
  return data.projects;
}

export async function createProject(name: string, description = ""): Promise<ApiProject> {
  return api("/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function updateProject(id: string, data: Partial<ApiProject>): Promise<ApiProject> {
  return api(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await api(`/projects/${id}`, { method: "DELETE" });
}

/* ─── Tasks ─── */
export async function fetchTasks(projectId: string): Promise<ApiTask[]> {
  return api(`/projects/${projectId}/tasks`);
}

export async function createTask(projectId: string, data: Partial<ApiTask>): Promise<ApiTask> {
  return api(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(projectId: string, taskId: string, data: Partial<ApiTask>): Promise<ApiTask> {
  return api(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  await api(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
}

/* ─── Documents ─── */
export async function fetchDocuments(projectId: string): Promise<ApiDocument[]> {
  return api(`/projects/${projectId}/documents`);
}

export async function generateDocument(projectId: string, docType: string, title?: string): Promise<Blob> {
  return api(`/projects/${projectId}/documents/generate`, {
    method: "POST",
    body: JSON.stringify({ doc_type: docType, title }),
  });
}

export async function uploadDocument(projectId: string, file: File, docType: string): Promise<ApiDocument> {
  const form = new FormData();
  form.append("file", file);
  form.append("doc_type", docType);
  const res = await fetch(`${API_BASE}/projects/${projectId}/documents/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}
