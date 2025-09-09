"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";

export default function ConfigError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">
            Configuration Required
          </h1>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            The application needs to be configured with Supabase credentials to
            enable authentication.
          </p>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Setup Steps:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>
                Copy{" "}
                <code className="bg-gray-200 px-1 rounded">env.example</code> to{" "}
                <code className="bg-gray-200 px-1 rounded">.env.local</code>
              </li>
              <li>
                Get your Supabase project credentials from{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  supabase.com <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                Update the environment variables in{" "}
                <code className="bg-gray-200 px-1 rounded">.env.local</code>
              </li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Required Environment Variables:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <code>NEXT_PUBLIC_SUPABASE_URL</code>
              </li>
              <li>
                • <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Once configured, you'll be able to create accounts and sign in to
            the application.
          </p>
        </div>
      </div>
    </div>
  );
}
