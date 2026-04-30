import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Extra origins allowed for Server Action POSTs when `Origin` and `Host` / `x-forwarded-host`
 * disagree (custom domain vs *.vercel.app, www vs apex, proxies). Without this, Save buttons on
 * /admin can silently fail in production with CSRF validation errors.
 */
function serverActionAllowedOrigins(): string[] {
  const origins = new Set<string>([
    "thelisteningroomatl.com",
    "www.thelisteningroomatl.com",
    "*.vercel.app",
  ]);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    try {
      origins.add(new URL(site).hostname.toLowerCase());
    } catch {
      // ignore invalid URL
    }
  }
  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    origins.add(vercelHost.toLowerCase());
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  // Keeps file tracing on this app when other lockfiles exist in parent folders.
  outputFileTracingRoot: projectRoot,
  experimental: {
    serverActions: {
      // Backstop for admin payloads; flyers upload via signed URLs, not the action body.
      bodySizeLimit: "12mb",
      allowedOrigins: serverActionAllowedOrigins(),
    },
  },
};

export default nextConfig;
