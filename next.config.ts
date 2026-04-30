import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Keeps file tracing on this app when other lockfiles exist in parent folders.
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
