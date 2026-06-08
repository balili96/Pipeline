export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  connected: boolean;
  lastSync: string | null;
}

export const githubRepos: GitHubRepo[] = [
  {
    id: "repo-1",
    name: "marketing-site",
    fullName: "balili96/marketing-site",
    url: "https://github.com/balili96/marketing-site",
    defaultBranch: "main",
    connected: true,
    lastSync: "2026-06-06T08:00:00Z",
  },
  {
    id: "repo-2",
    name: "mobile-api",
    fullName: "balili96/mobile-api",
    url: "https://github.com/balili96/mobile-api",
    defaultBranch: "main",
    connected: false,
    lastSync: null,
  },
];

export interface GitHubIssue {
  id: string;
  repoId: string;
  number: number;
  title: string;
  state: "open" | "closed";
  assignee: string | null;
}

export const githubIssues: GitHubIssue[] = [
  {
    id: "gi-1",
    repoId: "repo-1",
    number: 12,
    title: "Fix hero section responsiveness",
    state: "open",
    assignee: "Alice",
  },
  {
    id: "gi-2",
    repoId: "repo-1",
    number: 13,
    title: "Add contact form validation",
    state: "open",
    assignee: "Bob",
  },
  {
    id: "gi-3",
    repoId: "repo-1",
    number: 10,
    title: "Update footer links",
    state: "closed",
    assignee: "Charlie",
  },
];

export function getIssuesByRepoId(repoId: string): GitHubIssue[] {
  return githubIssues.filter((i) => i.repoId === repoId);
}

export function getOpenIssuesByRepoId(repoId: string): GitHubIssue[] {
  return githubIssues.filter(
    (i) => i.repoId === repoId && i.state === "open"
  );
}
