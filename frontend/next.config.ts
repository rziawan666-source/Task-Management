import type { NextConfig } from "next";

/**
 * Proxies /api/* to Laravel so the session cookie is first-party on the Next
 * origin (fixes reload losing auth when the SPA and API use different ports).
 */
const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    const origin = backend.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${origin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
