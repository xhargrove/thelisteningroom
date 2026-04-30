import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Keeps file tracing on this app when other lockfiles exist in parent folders.
  outputFileTracingRoot: projectRoot,
  experimental: {
    serverActions: {
      // Backstop for admin payloads; flyers upload via signed URLs, not the action body.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
