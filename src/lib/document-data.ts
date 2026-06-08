export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  type: "prd" | "changelog" | "meeting_notes" | "api_ref" | "architecture";
  content: string; // markdown-like text
  generatedAt: string;
  aiGenerated: boolean;
}

export const projectDocuments: ProjectDocument[] = [
  {
    id: "doc-1",
    projectId: "proj-1",
    title: "Product Requirements Document",
    type: "prd",
    aiGenerated: true,
    generatedAt: "2026-06-01T10:00:00Z",
    content:
      "# Marketing Website Redesign - PRD\n\n## Overview\nComplete overhaul of the company marketing site with modern design and improved performance.\n\n## Goals\n- Increase conversion rate by 25%\n- Improve page load speed by 40%\n- Modernize brand appearance\n\n## Scope\n- Hero section with animated gradients\n- Responsive navigation with mobile menu\n- Contact form with validation\n- Blog section with CMS integration\n\n## Success Metrics\n- LCP < 2.5s\n- Mobile usability score > 90\n- Form submission rate > 5%",
  },
  {
    id: "doc-2",
    projectId: "proj-1",
    title: "Changelog - v1.0.0",
    type: "changelog",
    aiGenerated: true,
    generatedAt: "2026-06-05T16:00:00Z",
    content:
      "# Changelog\n\n## [1.0.0] - 2026-06-05\n\n### Added\n- Hero section with gradient background and CTA\n- Responsive navigation with hamburger menu\n- Contact form with email validation\n- SEO meta tags and Open Graph support\n\n### Fixed\n- Mobile layout overflow on small screens\n- Image lazy loading for performance",
  },
  {
    id: "doc-3",
    projectId: "proj-1",
    title: "Sprint Planning - Week 1",
    type: "meeting_notes",
    aiGenerated: true,
    generatedAt: "2026-06-02T09:00:00Z",
    content:
      "# Sprint Planning - Week 1\n\n**Date:** June 2, 2026\n**Attendees:** Alice, Bob, Charlie (AI)\n\n## Sprint Goal\nComplete foundational UI components for the marketing site.\n\n## Tasks\n- Design hero section mockups (Alice)\n- Implement responsive navigation (Charlie)\n- Set up CI/CD pipeline (Bob)\n\n## Decisions\n- Using Next.js 16 for the frontend\n- Tailwind CSS for styling\n- Vercel for deployment",
  },
  {
    id: "doc-4",
    projectId: "proj-2",
    title: "API Integration PRD",
    type: "prd",
    aiGenerated: true,
    generatedAt: "2026-06-03T11:00:00Z",
    content:
      "# Mobile App API Integration - PRD\n\n## Overview\nBuild and integrate REST APIs for the new mobile application launch.\n\n## Endpoints\n- Auth API (register, login, refresh)\n- User API (profile CRUD)\n- Content API (blog/articles)",
  },
  {
    id: "doc-5",
    projectId: "proj-3",
    title: "Internal Dashboard v2 - Changelog",
    type: "changelog",
    aiGenerated: true,
    generatedAt: "2026-05-20T13:00:00Z",
    content:
      "# Changelog - v2.0.0\n\n### Added\n- Real-time dashboard with live data\n- Advanced filtering and search\n- Export to PDF and CSV\n- Role-based access control",
  },
];

export function getDocumentsByProjectId(projectId: string): ProjectDocument[] {
  return projectDocuments.filter((d) => d.projectId === projectId);
}
