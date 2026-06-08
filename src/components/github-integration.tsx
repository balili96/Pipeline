"use client";

import { useState } from "react";
import {
  githubRepos as initialRepos,
  getOpenIssuesByRepoId,
  type GitHubRepo,
  type GitHubIssue,
} from "@/lib/github-data";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function GitHubIntegration() {
  const [repos, setRepos] = useState<GitHubRepo[]>(initialRepos);
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  function handleConnect(repoId: string) {
    setRepos((prev) =>
      prev.map((r) =>
        r.id === repoId
          ? {
              ...r,
              connected: true,
              lastSync: new Date().toISOString(),
            }
          : r
      )
    );
  }

  function handleSync(repoId: string) {
    setSyncing(repoId);
    setTimeout(() => {
      setRepos((prev) =>
        prev.map((r) =>
          r.id === repoId
            ? { ...r, lastSync: new Date().toISOString() }
            : r
        )
      );
      setSyncing(null);
    }, 1500);
  }

  function toggleExpand(repoId: string) {
    setExpandedRepo(expandedRepo === repoId ? null : repoId);
  }

  return (
    <div>
      <div className="space-y-3">
        {repos.map((repo) => {
          const issues = getOpenIssuesByRepoId(repo.id);
          const isExpanded = expandedRepo === repo.id;
          const isSyncing = syncing === repo.id;

          return (
            <div
              key={repo.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Repo header */}
              <div className="p-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => repo.connected && toggleExpand(repo.id)}
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-text"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-text truncate">
                        {repo.fullName}
                      </h4>
                      <span className="text-[10px] font-mono text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                        {repo.defaultBranch}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {repo.connected
                        ? `Last sync: ${timeAgo(repo.lastSync)}`
                        : "Not connected"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {repo.connected ? (
                    <>
                      <button
                        onClick={() => handleSync(repo.id)}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50 transition-colors"
                      >
                        <svg
                          className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M1 8a7 7 0 0114 0M15 8a7 7 0 01-14 0"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12.5 3.5L15 6L12.5 8.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.5 12.5L1 10L3.5 7.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {isSyncing ? "Syncing..." : "Sync now"}
                      </button>
                      <button
                        onClick={() => toggleExpand(repo.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-muted transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M4 6l4 4 4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(repo.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded issues */}
              {isExpanded && repo.connected && (
                <div className="border-t border-border bg-bg">
                  <div className="px-4 py-3">
                    <h5 className="text-xs font-semibold text-text mb-2 flex items-center gap-1.5">
                      <span>Open Issues</span>
                      <span className="text-[10px] font-medium text-muted bg-white border border-border rounded-full px-1.5 py-0.5">
                        {issues.length}
                      </span>
                    </h5>
                    {issues.length === 0 ? (
                      <p className="text-xs text-muted py-2">
                        No open issues for this repository.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {issues.map((issue) => (
                          <div
                            key={issue.id}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-border text-sm"
                          >
                            <span className="text-green text-xs">●</span>
                            <span className="flex-1 text-text text-xs">
                              #{issue.number} {issue.title}
                            </span>
                            {issue.assignee && (
                              <span className="text-[10px] text-muted bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {issue.assignee}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
