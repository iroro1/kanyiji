"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { fetchJson } from "../../_lib/fetchJson";

type Group = { id: string; name: string; members_count: number };

export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [senderName, setSenderName] = useState("Kanyiji");
  const [senderEmail, setSenderEmail] = useState("hello@kanyiji.ng");
  const [target, setTarget] = useState<"all" | "selected" | "group">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("marketing_selected_user_ids");
        if (stored) setSelectedUserIds(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/api/marketing/groups", { credentials: "include" });
        if (res.ok) {
          const data = await fetchJson<{ groups?: Group[] }>(res);
          setGroups(data?.groups || []);
        }
      } catch {
        // ignore
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!editId) return;
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/marketing/campaigns/${editId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load");
        const data = await fetchJson<{ campaign?: Record<string, unknown> }>(res);
        const c = data?.campaign;
        setName((c?.name as string) || "");
        setSubject((c?.subject as string) || "");
        setContent((c?.content as string) || "");
        setSenderName((c?.sender_name as string) || "Kanyiji");
        setSenderEmail((c?.sender_email as string) || "hello@kanyiji.ng");
      } catch {
        setError("Failed to load campaign");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [editId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !subject.trim()) {
      setError("Name and subject are required");
      return;
    }

    setSending(true);
    try {
      let campaignId = editId;
      if (!campaignId) {
        const createRes = await fetch("/api/marketing/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            subject: subject.trim(),
            content: content.trim(),
            sender_name: senderName.trim(),
            sender_email: senderEmail.trim(),
          }),
        });
        const createData = await fetchJson<{ error?: string; campaign?: { id?: string } }>(createRes);
        if (!createRes.ok) throw new Error(createData?.error || "Failed to create campaign");
        campaignId = createData?.campaign?.id ?? null;
      } else {
        const patchRes = await fetch(`/api/marketing/campaigns/${campaignId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            subject: subject.trim(),
            content: content.trim(),
            sender_name: senderName.trim(),
            sender_email: senderEmail.trim(),
          }),
        });
        if (!patchRes.ok) {
          const patchData = await fetchJson<{ error?: string }>(patchRes);
          throw new Error(patchData?.error || "Failed to update campaign");
        }
      }

      if (!campaignId) throw new Error("Campaign ID is missing");
      const sendRes = await fetch(`/api/marketing/campaigns/${campaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          target,
          user_ids: target === "selected" ? selectedUserIds : undefined,
          group_id: target === "group" ? groupId : undefined,
        }),
      });
      const sendData = await fetchJson<{ error?: string; sent?: number; failed?: number }>(sendRes);
      if (!sendRes.ok) throw new Error(sendData?.error || "Failed to send");
      alert(`Campaign sent. ${sendData?.sent ?? 0} delivered, ${sendData?.failed ?? 0} failed.`);
      router.push("/marketing/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/marketing/campaigns"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to campaigns
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {editId ? "Edit & send campaign" : "New campaign"}
      </h1>

      <form onSubmit={handleSend} className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign name (internal)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="e.g. Summer 2025 newsletter"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Email subject"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender email</label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target audience</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="target"
                checked={target === "all"}
                onChange={() => setTarget("all")}
              />
              All users
            </label>
            {/* Selected users – commented out
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="target"
                checked={target === "selected"}
                onChange={() => setTarget("selected")}
              />
              Selected users ({selectedUserIds.length} selected from Users page)
            </label>
            */}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="target"
                checked={target === "group"}
                onChange={() => setTarget("group")}
              />
              Group
            </label>
            {target === "group" && (
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="ml-6 border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select a group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.members_count})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email content (HTML)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
            rows={12}
            placeholder="<p>Hello!</p><p>Your message here. You can use simple HTML.</p>"
          />
          <p className="text-xs text-gray-500 mt-1">Basic HTML is supported (e.g. &lt;p&gt;, &lt;a&gt;, &lt;strong&gt;).</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send now
              </>
            )}
          </button>
          <Link
            href="/marketing/campaigns"
            className="px-6 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
