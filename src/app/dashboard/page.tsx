"use client";

import { useState, useEffect } from "react";
import { projects as mockProjects, getTasksByProjectId } from "@/lib/data";
import ProjectCard from "@/components/project-card";
import type { Project } from "@/lib/types";
import { fetchProjects, createProject as apiCreateProject, fetchTasks } from "@/lib/api-client";

const filterOptions = ["All", "Active", "Completed"] as const;

const projectIcons = ["🚀", "💻", "📱", "🎨", "⚙️", "🔧", "📊", "🛒", "📝", "🧠"];

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});

  // Fetch real projects from backend API
  useEffect(() => {
    setLoading(true);
    fetchProjects()
      .then(async (apiProjects) => {
        if (apiProjects.length > 0) {
          setProjects(apiProjects.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            status: p.status as "active" | "completed" | "archived",
            createdAt: p.created_at,
          })));

          // Fetch task counts for each project
          const counts: Record<string, number> = {};
          await Promise.all(apiProjects.map(async (p) => {
            try {
              const tasks = await fetchTasks(p.id);
              counts[p.id] = tasks.length;
            } catch {
              counts[p.id] = getTasksByProjectId(p.id).length;
            }
          }));
          setTaskCounts(counts);
        }
      })
      .catch(() => { /* fallback to mock data */ })
      .finally(() => setLoading(false));
  }, []);

  const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0) || projects.reduce((sum, p) => sum + getTasksByProjectId(p.id).length, 0);
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const doneTasks = projects.reduce(
    (sum, p) => sum + getTasksByProjectId(p.id).filter((t) => t.status === "done").length,
    0
  );

  // Filter + search
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Active" && p.status === "active") ||
      (activeFilter === "Completed" && p.status === "completed");
    return matchesSearch && matchesFilter;
  });

  function handleCreateProject() {
    const name = newProject.name.trim();
    const desc = newProject.description.trim();
    if (!name) return;

    apiCreateProject(name, desc)
      .then((newProj) => {
        const project: Project = {
          id: newProj.id,
          name: newProj.name,
          description: newProj.description || `${name} — AI-powered project`,
          status: "active",
          createdAt: newProj.created_at,
        };
        setProjects((prev) => [project, ...prev]);
        setNewProject({ name: "", description: "" });
        setShowModal(false);
      })
      .catch(() => {
        // Fallback: create locally
        const project: Project = {
          id: `proj-${Date.now()}`,
          name,
          description: desc || `${name} — AI-powered project`,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        setProjects((prev) => [project, ...prev]);
        setNewProject({ name: "", description: "" });
        setShowModal(false);
      });
  }

  return (
    <div className="p-4 md:p-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Projects</h1>
          <p className="text-sm text-muted mt-1">
            Manage and monitor all your AI-powered projects
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
          </svg>
          New Project
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-card border border-border rounded-xl px-4 py-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-200">📁</div>
            <div>
              <p className="text-xl font-bold text-text tabular-nums">{projects.length}</p>
              <p className="text-[11px] text-muted font-medium">Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber/20 to-amber/5 text-amber flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-200">📋</div>
            <div>
              <p className="text-xl font-bold text-text tabular-nums">{totalTasks}</p>
              <p className="text-[11px] text-muted font-medium">Tasks</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green/20 to-green/5 text-green flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-200">✅</div>
            <div>
              <p className="text-xl font-bold text-text tabular-nums">{doneTasks}</p>
              <p className="text-[11px] text-muted font-medium">Done</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-200">⚡</div>
            <div>
              <p className="text-xl font-bold text-text tabular-nums">{activeProjects}</p>
              <p className="text-[11px] text-muted font-medium">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-sm w-full">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {filterOptions.map((label) => (
            <button
              key={label}
              onClick={() => setActiveFilter(label)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                activeFilter === label
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Project grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-5 text-4xl">
            📂
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">No projects found</h3>
          <p className="text-sm text-muted mb-6 max-w-xs">
            {search ? "Try a different search term or clear the filter." : "Create your first project to get started with Pipeline."}
          </p>
          {!search ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
              </svg>
              Create Project
            </button>
          ) : (
            <button
              onClick={() => setSearch("")}
              className="text-accent text-sm font-medium hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-border animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-text">New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Project name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. E-commerce Platform"
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the project..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
                className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
