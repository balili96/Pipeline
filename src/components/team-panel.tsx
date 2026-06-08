"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  TeamMember,
  getTeamMembersByProjectId,
} from "@/lib/team-data";

interface TeamPanelProps {
  projectId: string;
}

type InviteRole = "admin" | "member" | "viewer";

const roleColors: Record<string, string> = {
  owner: "bg-accent/10 text-accent",
  admin: "bg-green-100 text-green-700",
  member: "bg-gray-100 text-gray-600",
  viewer: "bg-gray-50 text-gray-400",
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export default function TeamPanel({ projectId }: TeamPanelProps) {
  const [members, setMembers] = useState<TeamMember[]>(() =>
    getTeamMembersByProjectId(projectId)
  );
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("member");
  const [isSending, setIsSending] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendInvite = useCallback(() => {
    if (!inviteEmail.trim()) return;
    setIsSending(true);

    // Mock 1s delay
    setTimeout(() => {
      const newMember: TeamMember = {
        id: `tm-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        avatar: inviteEmail.charAt(0).toUpperCase(),
        avatarColor: "bg-blue-100 text-blue-700",
        projectId,
        joinedAt: new Date().toISOString(),
      };
      setMembers((prev) => [...prev, newMember]);
      setIsSending(false);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
      alert(
        `✅ Invitation sent to ${inviteEmail} as ${roleLabels[inviteRole]}`
      );
    }, 1000);
  }, [inviteEmail, inviteRole, projectId]);

  const handleRemoveMember = useCallback(
    (memberId: string, memberName: string) => {
      if (
        window.confirm(
          `Are you sure you want to remove ${memberName} from this project?`
        )
      ) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setOpenMenuId(null);
      }
    },
    []
  );

  const ownerCount = members.filter((m) => m.role === "owner").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-text">Team</h2>
          <p className="text-xs text-muted mt-0.5">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3V13M3 8H13" strokeLinecap="round" />
          </svg>
          Invite Member
        </button>
      </div>

      {/* Empty state */}
      {members.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-xl">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm text-muted mb-1">
            Invite your first team member
          </p>
          <p className="text-xs text-muted">
            Click &quot;Invite Member&quot; to get started
          </p>
        </div>
      ) : (
        /* Member list */
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-3.5 hover:shadow-sm transition-shadow"
            >
              {/* Left: avatar + info */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${member.avatarColor}`}
                >
                  {member.avatar}
                </div>

                {/* Name + Email */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-text truncate">
                      {member.name}
                    </span>
                    {member.role === "owner" && (
                      <span className="text-sm" title="Project Owner">
                        👑
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate">
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Right: role badge + menu */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${roleColors[member.role]}`}
                >
                  {roleLabels[member.role]}
                </span>

                {/* Three-dot menu for non-owner members */}
                {member.role !== "owner" && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === member.id ? null : member.id
                        )
                      }
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-muted hover:text-text"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <circle cx="8" cy="3" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="8" cy="13" r="1.5" />
                      </svg>
                    </button>

                    {openMenuId === member.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-xl z-10 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            handleRemoveMember(member.id, member.name)
                          }
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M2 4H14M5 4V2.5C5 2.2 5.2 2 5.5 2H10.5C10.8 2 11 2.2 11 2.5V4M12 4V13.5C12 13.8 11.8 14 11.5 14H4.5C4.2 14 4 13.8 4 13.5V4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Remove from project
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl border border-border mx-auto max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">
                {isSending ? "✉️" : "👥"}
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                {isSending
                  ? "Sending invitation..."
                  : "Invite a Team Member"}
              </h3>
              <p className="text-sm text-muted mb-6">
                {isSending
                  ? "Please wait while we send the invitation..."
                  : "Enter the email address and choose a role for the new member."}
              </p>

              {isSending && (
                <div className="flex justify-center mb-4">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {!isSending && (
              <>
                {/* Email input */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-muted mb-1.5 text-left">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-text placeholder:text-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendInvite();
                    }}
                  />
                </div>

                {/* Role dropdown */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-muted mb-1.5 text-left">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(e.target.value as InviteRole)
                      }
                      className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-text appearance-none bg-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <svg
                      className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Role descriptions */}
                  <div className="mt-2 space-y-1 text-xs text-muted">
                    <p>
                      <span className="font-medium text-text">Admin</span> —
                      Full access to manage project settings and members
                    </p>
                    <p>
                      <span className="font-medium text-text">Member</span> —
                      Can view, create, and edit tasks and documents
                    </p>
                    <p>
                      <span className="font-medium text-text">Viewer</span> —
                      Read-only access to the project
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail("");
                      setInviteRole("member");
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail.trim()}
                    className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all shadow-sm ${
                      inviteEmail.trim()
                        ? "bg-accent text-white hover:opacity-90"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Send Invite
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
