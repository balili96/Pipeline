"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ProjectDocument, getDocumentsByProjectId } from "@/lib/document-data";

interface DocumentModuleProps {
  projectId: string;
}

type DocType = ProjectDocument["type"];

const typeIcons: Record<DocType, string> = {
  prd: "📋",
  changelog: "📝",
  meeting_notes: "📅",
  api_ref: "📚",
  architecture: "🏗",
};

const typeLabels: Record<DocType, string> = {
  prd: "PRD",
  changelog: "Changelog",
  meeting_notes: "Meeting Notes",
  api_ref: "API Ref",
  architecture: "Architecture",
};

const typeColors: Record<DocType, string> = {
  prd: "bg-blue-100 text-blue-700",
  changelog: "bg-green-100 text-green-700",
  meeting_notes: "bg-amber-100 text-amber-700",
  api_ref: "bg-purple-100 text-purple-700",
  architecture: "bg-rose-100 text-rose-700",
};

const generateableTypes: DocType[] = ["prd", "changelog", "meeting_notes"];

// Simple markdown renderer
function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={key} className="text-base font-semibold text-text mt-5 mb-2">
          {trimmed.replace("### ", "")}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={key} className="text-lg font-bold text-text mt-6 mb-3 pb-1 border-b border-border">
          {trimmed.replace("## ", "")}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={key} className="text-2xl font-bold text-text mt-2 mb-4">
          {trimmed.replace("# ", "")}
        </h1>
      );
    } else if (trimmed.startsWith("- ")) {
      elements.push(
        <li key={key} className="text-sm text-text ml-5 list-disc mb-1">
          {renderInline(trimmed.slice(2))}
        </li>
      );
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(
        <p key={key} className="text-sm font-semibold text-text mt-3 mb-1">
          {trimmed.replace(/\*\*(.*?)\*\*/g, "$1")}
        </p>
      );
    } else if (trimmed === "") {
      elements.push(<div key={key} className="h-2" />);
    } else {
      elements.push(
        <p key={key} className="text-sm text-text leading-relaxed mb-1">
          {renderInline(trimmed)}
        </p>
      );
    }
    key++;
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** text
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function generateMockContent(type: DocType, projectName: string): string {
  const now = new Date().toISOString().split("T")[0];
  switch (type) {
    case "prd":
      return `# ${projectName} - PRD\n\n## Overview\nAI-generated product requirements document for ${projectName}.\n\n## Goals\n- Improve user engagement by 30%\n- Reduce time-to-complete by 20%\n- Enhance accessibility compliance\n\n## Scope\n- Core feature implementation\n- API integration layer\n- User interface redesign\n- Testing and QA\n\n## Success Metrics\n- User satisfaction score > 85%\n- Page load time < 2s\n- Error rate < 0.5%`;
    case "changelog":
      return `# Changelog\n\n## [1.1.0] - ${now}\n\n### Added\n- New dashboard widgets for real-time monitoring\n- Dark mode support across all pages\n- Batch operations for task management\n\n### Fixed\n- Form validation edge cases\n- Mobile navigation jank on iOS\n- Memory leak in real-time updates\n\n### Changed\n- Updated dependency versions\n- Improved error messages for API failures`;
    case "meeting_notes":
      return `# Sprint Planning\n\n**Date:** ${now}\n**Attendees:** Project Team, AI Assistant\n\n## Sprint Goal\nDeliver key milestones for ${projectName} with high quality.\n\n## Tasks\n- Review and prioritize backlog items\n- Assign owners for each task\n- Set sprint capacity and velocity targets\n\n## Decisions\n- Using agile methodology with 2-week sprints\n- Daily stand-ups at 9:30 AM\n- Retrospective at end of each sprint\n\n## Action Items\n- [ ] Update task board with new priorities\n- [ ] Schedule onboarding for new team members\n- [ ] Set up monitoring and alerting`;
    default:
      return `# Document\n\nGenerated for ${projectName} on ${now}.`;
  }
}

export default function DocumentModule({ projectId }: DocumentModuleProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>(() =>
    getDocumentsByProjectId(projectId)
  );
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);
  const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingType, setGeneratingType] = useState<DocType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowGenerateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectType = useCallback((type: DocType) => {
    setShowGenerateDropdown(false);
    setGeneratingType(type);
    setShowGenerateModal(true);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!generatingType) return;
    setIsGenerating(true);

    // Simulate AI generation delay
    setTimeout(() => {
      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        projectId,
        title: `${typeLabels[generatingType]} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        type: generatingType,
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
        content: generateMockContent(generatingType, "Project"),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setIsGenerating(false);
      setShowGenerateModal(false);
      setGeneratingType(null);
      setSelectedDoc(newDoc);
    }, 1500);
  }, [generatingType, projectId]);

  const handleExport = useCallback(() => {
    if (!selectedDoc) return;
    const content = selectedDoc.content;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDoc.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`📄 Exported "${selectedDoc.title}" as Markdown file.`);
  }, [selectedDoc]);

  const handleGenerateAgain = useCallback(() => {
    if (!selectedDoc) return;
    setIsGenerating(true);
    setShowGenerateModal(true);
    setGeneratingType(selectedDoc.type);
  }, [selectedDoc]);

  // Detail view
  if (selectedDoc) {
    const doc = selectedDoc;
    return (
      <div className="bg-white border border-border rounded-xl p-4 md:p-6 transition-all duration-200">
        {/* Back button */}
        <button
          onClick={() => setSelectedDoc(null)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-5"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to documents
        </button>

        {/* Document header */}
        <div className="flex items-start justify-between mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{typeIcons[doc.type]}</span>
              <h2 className="text-lg font-bold text-text truncate">{doc.title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${typeColors[doc.type]}`}
              >
                {typeLabels[doc.type]}
              </span>
              {doc.aiGenerated && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
                  AI Generated
                </span>
              )}
              <span className="text-xs text-muted">
                {new Date(doc.generatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleGenerateAgain}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:opacity-90 transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 8C1 3.5 3.5 1 8 1C11.5 1 14 3.5 14 8C14 11.5 11.5 14 8 14C5 14 3 12 2 10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 8H4.5M8 12V16" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 8H11.5M8 4V1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 5L8 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Generate Again
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white text-text border border-border rounded-lg hover:border-accent hover:text-accent transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 1V11M4 7L8 11L12 7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13V14H14V13" strokeLinecap="round" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Document content */}
        <div className="bg-bg rounded-xl p-4 md:p-5 border border-border min-h-[200px] md:min-h-[300px] overflow-x-auto">
          <div className="prose prose-sm max-w-none min-w-[280px] md:min-w-0">{renderMarkdown(doc.content)}</div>
        </div>

        {/* Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border mx-4">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {isGenerating ? "🤖" : typeIcons[generatingType || "prd"]}
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">
                  {isGenerating ? "AI is generating..." : `Generate ${typeLabels[generatingType || "prd"]}`}
                </h3>
                <p className="text-sm text-muted mb-6">
                  {isGenerating
                    ? "The AI agent is analyzing your project and creating documentation..."
                    : "The AI will analyze your project data and create a comprehensive document."}
                </p>
                {isGenerating && (
                  <div className="flex justify-center mb-4">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className="flex items-center justify-center gap-3">
                  {!isGenerating && (
                    <>
                      <button
                        onClick={() => {
                          setShowGenerateModal(false);
                          setGeneratingType(null);
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
                      >
                        Generate
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-text">Documents</h2>
          <p className="text-xs text-muted mt-0.5">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowGenerateDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3V13M3 8H13" strokeLinecap="round" />
            </svg>
            Generate New
          </button>
          {showGenerateDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-xl z-10 overflow-hidden">
              {generateableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelectType(type)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-gray-50 transition-colors text-left"
                >
                  <span>{typeIcons[type]}</span>
                  <span>{typeLabels[type]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document grid */}
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-xl transition-all duration-200">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-sm text-muted mb-1">No documents yet</p>
          <p className="text-xs text-muted">
            Click &quot;Generate New&quot; to create your first document
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white border border-border rounded-xl p-5 text-left hover:shadow-lg hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Icon */}
              <div className="text-2xl mb-3">{typeIcons[doc.type]}</div>

              {/* Title */}
              <h3 className="font-semibold text-text text-sm group-hover:text-accent transition-colors mb-2 line-clamp-2">
                {doc.title}
              </h3>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[doc.type]}`}
                >
                  {typeLabels[doc.type]}
                </span>
                {doc.aiGenerated && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    AI
                  </span>
                )}
              </div>

              {/* Date */}
              <p className="text-[11px] text-muted">
                {new Date(doc.generatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">
                {isGenerating ? "🤖" : typeIcons[generatingType || "prd"]}
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                {isGenerating
                  ? "AI is generating..."
                  : `Generate ${typeLabels[generatingType || "prd"]}`}
              </h3>
              <p className="text-sm text-muted mb-6">
                {isGenerating
                  ? "The AI agent is analyzing your project and creating documentation..."
                  : "The AI will analyze your project data and create a comprehensive document."}
              </p>
              {isGenerating && (
                <div className="flex justify-center mb-4">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                {!isGenerating && (
                  <>
                    <button
                      onClick={() => {
                        setShowGenerateModal(false);
                        setGeneratingType(null);
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
                    >
                      Generate
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
