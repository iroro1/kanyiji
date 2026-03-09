"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  UserPlus,
} from "lucide-react";
import { fetchJson } from "../_lib/fetchJson";

type Group = { id: string; name: string; members_count: number };

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  total_orders: number;
  user_type: string;
  last_active: string | null;
};

export default function MarketingUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToGroupId = searchParams.get("addToGroup");
  const [groups, setGroups] = useState<Group[]>([]);
  const [addToGroupOpen, setAddToGroupOpen] = useState(false);
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    role: "",
    date_from: "",
    date_to: "",
    has_orders: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filters.role) params.set("role", filters.role);
      if (filters.date_from) params.set("date_from", filters.date_from);
      if (filters.date_to) params.set("date_to", filters.date_to);
      if (filters.has_orders) params.set("has_orders", filters.has_orders);
      const res = await fetch(`/api/marketing/users?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await fetchJson<{ users?: UserRow[]; pagination?: { totalPages?: number; total?: number } }>(res);
      setUsers(data?.users || []);
      setTotalPages(data?.pagination?.totalPages ?? 1);
      setTotal(data?.pagination?.total ?? 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    if (selectedIds.size > 0 || addToGroupId) {
      fetch("/api/marketing/groups", { credentials: "include" })
        .then((r) => fetchJson<{ groups?: Group[] }>(r))
        .then((d) => setGroups(d?.groups || []))
        .catch(() => setGroups([]));
    }
  }, [selectedIds.size, addToGroupId]);

  const applyFilters = () => {
    setPage(1);
    fetchUsers();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const addSelectedToGroup = async (groupId: string) => {
    if (selectedIds.size === 0) return;
    setAddingToGroupId(groupId);
    try {
      const res = await fetch(`/api/marketing/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_ids: Array.from(selectedIds) }),
      });
      if (!res.ok) {
        const data = await fetchJson<{ error?: string }>(res);
        throw new Error(data?.error || "Failed to add");
      }
      setAddToGroupOpen(false);
      setSelectedIds(new Set());
      if (addToGroupId) router.replace("/marketing/users");
      alert(`Added ${selectedIds.size} user(s) to the group.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add to group");
    } finally {
      setAddingToGroupId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <UsersIcon className="w-7 h-7 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      {addToGroupId && groups.length > 0 && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex flex-wrap items-center justify-between gap-2">
          <span>
            Select users below, then use <strong>Add to group</strong> to add them to{" "}
            <strong>{groups.find((g) => g.id === addToGroupId)?.name ?? "the selected group"}</strong>.
          </span>
          {selectedIds.size > 0 && (
            <button
              type="button"
              disabled={addingToGroupId !== null}
              onClick={() => addSelectedToGroup(addToGroupId)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {addingToGroupId === addToGroupId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Add {selectedIds.size} to {groups.find((g) => g.id === addToGroupId)?.name}
            </button>
          )}
        </div>
      )}

      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Filters</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">User type</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="buyer">Buyer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Registration from</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Registration to</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Purchase activity</label>
            <select
              value={filters.has_orders}
              onChange={(e) => setFilters((f) => ({ ...f, has_orders: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="none">No purchases</option>
              <option value="any">1+ purchases</option>
              <option value="high">High (3+ orders)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.size === users.length}
                    onChange={selectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {u.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm">{u.user_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">{u.total_orders}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(u.last_active)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">
              {selectedIds.size > 0 && (
                <span className="font-medium">{selectedIds.size} selected</span>
              )}
              {selectedIds.size > 0 && " · "}
              Total: {total} users
            </p>
            {selectedIds.size > 0 && (
              <>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setAddToGroupOpen((v) => !v)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-emerald-600 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add to group
                  </button>
                  {addToGroupOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        aria-hidden
                        onClick={() => setAddToGroupOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-1 z-20 py-1 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg">
                        {groups.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-gray-500">No groups yet.</p>
                        ) : (
                          groups.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              disabled={addingToGroupId !== null}
                              onClick={() => addSelectedToGroup(g.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center"
                            >
                              <span>{g.name}</span>
                              {addingToGroupId === g.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                              ) : (
                                <span className="text-gray-400 text-xs">{g.members_count} members</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem(
                      "marketing_selected_user_ids",
                      JSON.stringify(Array.from(selectedIds))
                    );
                    router.push("/marketing/campaigns/new");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
                >
                  <Send className="w-3.5 h-3.5" />
                  Email selected
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
