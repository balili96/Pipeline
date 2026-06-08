export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  avatar: string;
  avatarColor: string;
  projectId: string;
  joinedAt: string;
}

export const teamMembers: TeamMember[] = [
  { id: "tm-1", name: "Fadzly", email: "fadzly@pipeline.dev", role: "owner", avatar: "F", avatarColor: "bg-accent/10 text-accent", projectId: "proj-1", joinedAt: "2026-05-15T08:00:00Z" },
  { id: "tm-2", name: "Alice", email: "alice@pipeline.dev", role: "admin", avatar: "A", avatarColor: "bg-blue-100 text-blue-700", projectId: "proj-1", joinedAt: "2026-05-16T09:00:00Z" },
  { id: "tm-3", name: "Bob", email: "bob@pipeline.dev", role: "member", avatar: "B", avatarColor: "bg-amber-100 text-amber-700", projectId: "proj-1", joinedAt: "2026-05-17T10:00:00Z" },
  { id: "tm-4", name: "Charlie", email: "charlie@pipeline.dev", role: "member", avatar: "C", avatarColor: "bg-purple-100 text-purple-700", projectId: "proj-1", joinedAt: "2026-05-18T11:00:00Z" },
  { id: "tm-5", name: "Fadzly", email: "fadzly@pipeline.dev", role: "owner", avatar: "F", avatarColor: "bg-accent/10 text-accent", projectId: "proj-2", joinedAt: "2026-05-20T08:00:00Z" },
  { id: "tm-6", name: "Eve", email: "eve@pipeline.dev", role: "member", avatar: "E", avatarColor: "bg-green-100 text-green-700", projectId: "proj-2", joinedAt: "2026-05-21T09:00:00Z" },
  { id: "tm-7", name: "Frank", email: "frank@pipeline.dev", role: "viewer", avatar: "Fr", avatarColor: "bg-pink-100 text-pink-700", projectId: "proj-2", joinedAt: "2026-05-22T10:00:00Z" },
  { id: "tm-8", name: "Fadzly", email: "fadzly@pipeline.dev", role: "owner", avatar: "F", avatarColor: "bg-accent/10 text-accent", projectId: "proj-3", joinedAt: "2026-04-01T08:00:00Z" },
];

export function getTeamMembersByProjectId(projectId: string): TeamMember[] {
  return teamMembers.filter((m) => m.projectId === projectId);
}

export function getMemberRole(projectId: string, memberId: string): string {
  const member = teamMembers.find(
    (m) => m.id === memberId && m.projectId === projectId
  );
  return member?.role || "viewer";
}
