"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { fetchJson } from "../_lib/fetchJson";

export default function MarketingSetupPage() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secret.trim() }),
      });
      const data = await fetchJson<{ message?: string; error?: string }>(res);
      if (res.ok) {
        setMessage({
          type: "success",
          text: data?.message || "Marketing user created. You can now log in.",
        });
        setSecret("");
      } else {
        setMessage({ type: "error", text: data?.error || "Setup failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link
          href="/marketing/login"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create marketing account</h1>
          <p className="text-sm text-gray-600 mt-1">
            One-time setup: creates kanyiji.dev@gmail.com in Supabase so you can log in.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-1">
                Setup secret
              </label>
              <input
                id="secret"
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={
                  process.env.NODE_ENV === "development"
                    ? "Use 'dev' in development"
                    : "Set MARKETING_SETUP_SECRET in .env"
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.type === "success" && <CheckCircle className="w-4 h-4 inline mr-1" />}
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create marketing user"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          After creation, log in at /marketing with kanyiji.dev@gmail.com and password #AmazingMkt
        </p>
      </div>
    </div>
  );
}
