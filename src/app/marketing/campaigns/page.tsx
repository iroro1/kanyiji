"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, Loader2, Plus } from "lucide-react";
import { fetchJson } from "../_lib/fetchJson";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  recipients_count: number;
};

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/marketing/campaigns", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await fetchJson<{ campaigns?: Campaign[] }>(res);
        setCampaigns(data?.campaigns || []);
      } catch {
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-amber-100 text-amber-800",
      sent: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${map[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-7 h-7 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Campaign History</h1>
        </div>
        <Link
          href="/marketing/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          New campaign
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No campaigns yet.{" "}
            <Link href="/marketing/campaigns/new" className="text-emerald-600 font-medium hover:underline">
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.recipients_count}</td>
                    <td className="px-6 py-4">{statusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(c.sent_at)}</td>
                    <td className="px-6 py-4">
                      {c.status === "draft" && (
                        <Link
                          href={`/marketing/campaigns/new?edit=${c.id}`}
                          className="text-emerald-600 hover:underline text-sm"
                        >
                          Edit & send
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
