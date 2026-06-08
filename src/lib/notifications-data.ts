export interface Notification {
  id: string;
  type: "deadline" | "task_update" | "ai_complete" | "deploy";
  message: string;
  projectId: string;
  read: boolean;
  timestamp: string;
}

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "deadline",
    message:
      '"Implement responsive navigation" is due tomorrow',
    projectId: "proj-1",
    read: false,
    timestamp: "2026-06-07T10:00:00Z",
  },
  {
    id: "n2",
    type: "task_update",
    message:
      'AI moved "Set up CI/CD pipeline" to In Progress',
    projectId: "proj-1",
    read: false,
    timestamp: "2026-06-07T09:30:00Z",
  },
  {
    id: "n3",
    type: "ai_complete",
    message:
      'AI completed "Optimize image loading" task',
    projectId: "proj-1",
    read: true,
    timestamp: "2026-06-06T16:00:00Z",
  },
  {
    id: "n4",
    type: "deadline",
    message:
      '"Design hero section mockups" is overdue!',
    projectId: "proj-1",
    read: false,
    timestamp: "2026-06-06T14:00:00Z",
  },
  {
    id: "n5",
    type: "deploy",
    message:
      "Production deployment completed successfully",
    projectId: "proj-2",
    read: true,
    timestamp: "2026-06-05T11:00:00Z",
  },
  {
    id: "n6",
    type: "task_update",
    message:
      '3 new tasks added to "Mobile App API Integration"',
    projectId: "proj-2",
    read: false,
    timestamp: "2026-06-05T10:00:00Z",
  },
];

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

export function markAllAsRead(): void {
  notifications.forEach((n) => {
    n.read = true;
  });
}

export function markAsRead(id: string): void {
  const n = notifications.find((n) => n.id === id);
  if (n) n.read = true;
}
