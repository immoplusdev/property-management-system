import { env } from "@/lib/config/env";

export default function DebugPage() {
  return (
    <div className="p-8 font-mono text-sm bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug — Environment Config</h1>

      <div className="bg-white p-6 rounded border border-gray-300 space-y-4">
        <div>
          <strong>API_URL:</strong>
          <pre className="bg-gray-50 p-3 rounded mt-1 overflow-auto">{env.API_URL}</pre>
        </div>

        <div>
          <strong>AUTH_SOURCE:</strong>
          <pre className="bg-gray-50 p-3 rounded mt-1">{env.AUTH_SOURCE}</pre>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded">
          <p className="text-blue-900">
            ✅ Si c'est <code>https://api-v2.immoplus.ci</code> → PROD env vars OK<br/>
            ❌ Si c'est <code>https://api-dev.immoplus.ci</code> → PROD env vars MANQUANTES ou mal configurées
          </p>
        </div>
      </div>
    </div>
  );
}
