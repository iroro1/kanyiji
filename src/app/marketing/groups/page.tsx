"use client";

import { useState, useEffect } from "react";
import {
  FolderHeart,
  Plus,
  Trash2,
  Loader2,
  Users,
  UserPlus,
  X,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchJson } from "../_lib/fetchJson";

type Group = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  members_count: number;
};

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  user_type: string;
};

type GroupDetailMember = { id: string; email: string | null; full_name: string | null };
type GroupDetail = {
  group: { id: string; name: string; description: string; created_at: string };
  members: GroupDetailMember[];
};

export default function MarketingGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [addUsersGroup, setAddUsersGroup] = useState<{ id: string; name: string } | null>(null);
  const [modalUsers, setModalUsers] = useState<UserRow[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalUsersLoading, setModalUsersLoading] = useState(false);
  const [modalSelectedIds, setModalSelectedIds] = useState<Set<string>>(new Set());
  const [addingToGroup, setAddingToGroup] = useState(false);
  const [addUsersError, setAddUsersError] = useState("");

  const [detailGroupId, setDetailGroupId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<GroupDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/groups", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await fetchJson<{ groups?: Group[] }>(res);
      setGroups(data?.groups || []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!detailGroupId) {
      setDetailData(null);
      return;
    }
    setDetailLoading(true);
    setDetailData(null);
    fetch(`/api/marketing/groups/${detailGroupId}`, { credentials: "include" })
      .then((r) => fetchJson<{ group?: GroupDetail["group"]; members?: GroupDetailMember[] }>(r))
      .then((d) => {
        if (d?.group) setDetailData({ group: d.group, members: d.members ?? [] });
      })
      .catch(() => setDetailData(null))
      .finally(() => setDetailLoading(false));
  }, [detailGroupId]);

  useEffect(() => {
    if (!addUsersGroup) return;
    setModalUsersLoading(true);
    setModalSelectedIds(new Set());
    setModalSearchQuery("");
    setAddUsersError("");
    fetch("/api/marketing/users?limit=100", { credentials: "include" })
      .then((r) => fetchJson<{ users?: UserRow[] }>(r))
      .then((d) => setModalUsers(d?.users ?? []))
      .catch(() => setModalUsers([]))
      .finally(() => setModalUsersLoading(false));
  }, [addUsersGroup]);

  const openDetailModal = (id: string) => {
    setDetailGroupId(id);
  };

  const closeDetailModal = () => {
    setDetailGroupId(null);
    setDetailData(null);
    setRemovingUserId(null);
  };

  const removeMemberFromGroup = async (userId: string) => {
    if (!detailGroupId || !detailData) return;
    setRemovingUserId(userId);
    try {
      const res = await fetch(
        `/api/marketing/groups/${detailGroupId}/members?user_id=${encodeURIComponent(userId)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const data = await fetchJson<{ error?: string }>(res);
        throw new Error(data?.error ?? "Failed to remove");
      }
      setDetailData((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.id !== userId) }
          : null
      );
      fetchGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemovingUserId(null);
    }
  };

  const openAddUsersModal = (e: React.MouseEvent, g: Group) => {
    e.stopPropagation();
    setAddUsersGroup({ id: g.id, name: g.name });
  };

  const closeAddUsersModal = () => {
    setAddUsersGroup(null);
    setModalUsers([]);
    setModalSearchQuery("");
    setModalSelectedIds(new Set());
    setAddUsersError("");
  };

  const q = modalSearchQuery.trim().toLowerCase();
  const filteredModalUsers = q
    ? modalUsers.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    : modalUsers;

  const toggleModalSelect = (id: string) => {
    setModalSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllModal = () => {
    const ids = filteredModalUsers.map((u) => u.id);
    const allSelected = ids.length > 0 && ids.every((id) => modalSelectedIds.has(id));
    if (allSelected) {
      setModalSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setModalSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleAddSelectedToGroup = async () => {
    if (!addUsersGroup || modalSelectedIds.size === 0) return;
    setAddingToGroup(true);
    setAddUsersError("");
    try {
      const res = await fetch(`/api/marketing/groups/${addUsersGroup.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_ids: Array.from(modalSelectedIds) }),
      });
      const data = await fetchJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data?.error ?? "Failed to add members");
      closeAddUsersModal();
      fetchGroups();
    } catch (err) {
      setAddUsersError(err instanceof Error ? err.message : "Failed to add members");
    } finally {
      setAddingToGroup(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newName.trim()) {
      setError("Name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/marketing/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      const data = await fetchJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete group "${name}"?`)) return;
    try {
      const res = await fetch(`/api/marketing/groups/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchGroups();
        return;
      }
      const data = await fetchJson<{ error?: string }>(res);
      throw new Error(data?.error || "Failed to delete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete group");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderHeart className="w-7 h-7 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Create group
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New group</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. Newsletter Subscribers"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={2}
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(""); }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No groups yet. Create one to segment your audience.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {groups.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => openDetailModal(g.id)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{g.name}</p>
                    {g.description && (
                      <p className="text-sm text-gray-500 truncate">{g.description}</p>
                    )}
                    <p className="text-xs text-gray-400">{g.members_count} members</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => openAddUsersModal(e, g)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add users
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(g.id, g.name);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {detailGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Group details</h2>
              <button
                type="button"
                onClick={closeDetailModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-4">
              {detailLoading ? (
                <div className="py-12 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : detailData ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 text-xl">{detailData.group.name}</p>
                    {detailData.group.description && (
                      <p className="text-sm text-gray-500 mt-1">{detailData.group.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {detailData.members.length} member{detailData.members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Members</h3>
                    {detailData.members.length === 0 ? (
                      <p className="text-sm text-gray-500">No members yet.</p>
                    ) : (
                      <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-auto">
                        {detailData.members.map((m) => (
                          <li
                            key={m.id}
                            className="px-4 py-2 flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0 flex-1 flex flex-col">
                              <span className="font-medium text-gray-900">
                                {m.full_name || "—"}
                              </span>
                              <span className="text-sm text-gray-500 truncate">{m.email ?? "—"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMemberFromGroup(m.id)}
                              disabled={removingUserId === m.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 disabled:opacity-50"
                              title="Remove from group"
                              aria-label={`Remove ${m.full_name || m.email} from group`}
                            >
                              {removingUserId === m.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">Could not load group.</p>
              )}
            </div>
            {detailData && (
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeDetailModal();
                    setAddUsersGroup({ id: detailData.group.id, name: detailData.group.name });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                >
                  <UserPlus className="w-4 h-4" />
                  Add users
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {addUsersGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Add users to {addUsersGroup.name}
              </h2>
              <button
                type="button"
                onClick={closeAddUsersModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {addUsersError && (
              <div className="mx-6 mt-2 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
                {addUsersError}
              </div>
            )}
            <div className="flex-1 overflow-auto px-6 py-4">
              {modalUsersLoading ? (
                <div className="py-12 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Loading users...
                </div>
              ) : modalUsers.length === 0 ? (
                <p className="py-8 text-center text-gray-500">No users found.</p>
              ) : (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="search"
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={selectAllModal}
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      {filteredModalUsers.length > 0 &&
                      filteredModalUsers.every((u) => modalSelectedIds.has(u.id))
                        ? "Deselect all"
                        : "Select all"}
                    </button>
                    <span className="text-sm text-gray-500">
                      {modalSelectedIds.size} selected
                      {q && ` (${filteredModalUsers.length} match)`}
                    </span>
                  </div>
                  <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-80 overflow-auto">
                    {filteredModalUsers.length === 0 ? (
                      <li className="px-4 py-8 text-center text-gray-500 text-sm">
                        {q ? "No users match your search." : "No users to show."}
                      </li>
                    ) : (
                      filteredModalUsers.map((u) => (
                        <li
                          key={u.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={modalSelectedIds.has(u.id)}
                            onChange={() => toggleModalSelect(u.id)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {u.full_name || "—"}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{u.email}</p>
                          </div>
                          <span className="text-xs text-gray-400">{u.user_type}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={closeAddUsersModal}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSelectedToGroup}
                disabled={modalSelectedIds.size === 0 || addingToGroup}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {addingToGroup ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Add {modalSelectedIds.size > 0 ? modalSelectedIds.size : ""} to group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
