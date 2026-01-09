"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { supabaseAuthService } from "@/services/supabaseAuthService";

export default function TestAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testDirectLogin = async () => {
    setLogs([]);
    setLoading(true);
    addLog("🔐 Starting direct Supabase login test...");

    try {
      addLog(`📤 Attempting login with email: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addLog(`❌ Supabase auth error: ${error.message}`);
        addLog(`   Error code: ${error.status || "unknown"}`);
        setLoading(false);
        return;
      }

      if (!data.user) {
        addLog("❌ No user returned from authentication");
        setLoading(false);
        return;
      }

      addLog(`✅ Authentication successful! User ID: ${data.user.id}`);
      addLog(`   Email: ${data.user.email}`);

      // Check session
      addLog("📥 Checking session...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
      } else if (sessionData.session) {
        addLog("✅ Session exists!");
        addLog(`   Access token: ${sessionData.session.access_token.substring(0, 20)}...`);
      } else {
        addLog("⚠️ No session found after login");
      }

      // Check profile
      addLog("📥 Fetching profile...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        addLog(`❌ Profile error: ${profileError.message}`);
        addLog(`   Error code: ${profileError.code || "unknown"}`);
      } else if (profile) {
        addLog(`✅ Profile found! Name: ${profile.full_name}, Role: ${profile.role}`);
      } else {
        addLog("⚠️ No profile found (this is okay, will be created)");
      }

      addLog("✅ Test complete!");
    } catch (error: any) {
      addLog(`❌ Exception: ${error.message}`);
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testServiceLogin = async () => {
    setLogs([]);
    setLoading(true);
    addLog("🔐 Starting service login test...");

    try {
      const response = await supabaseAuthService.login({ email, password });
      addLog(`Response: ${JSON.stringify(response, null, 2)}`);

      if (response.success) {
        addLog("✅ Service login successful!");
        addLog(`   User: ${response.user?.email}`);
      } else {
        addLog(`❌ Service login failed: ${response.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLogs([]);
    addLog("📥 Checking current session...");

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      addLog(`❌ Session error: ${error.message}`);
    } else if (data.session) {
      addLog("✅ Session exists!");
      addLog(`   User: ${data.session.user.email}`);
      addLog(`   Expires: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`);
    } else {
      addLog("⚠️ No session found");
    }
  };

  const signOut = async () => {
    setLogs([]);
    addLog("🚪 Signing out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      addLog(`❌ Sign out error: ${error.message}`);
    } else {
      addLog("✅ Signed out successfully");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="password"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={testDirectLogin}
              disabled={loading || !email || !password}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Test Direct Login
            </button>
            <button
              onClick={testServiceLogin}
              disabled={loading || !email || !password}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              Test Service Login
            </button>
            <button
              onClick={checkSession}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              Check Session
            </button>
            <button
              onClick={signOut}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run a test above.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

