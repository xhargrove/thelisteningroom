/**
 * Sanity-check the service role key before calling Supabase (avoids opaque "Invalid API key").
 * Server-only; uses Buffer (Node).
 */

function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    const json = Buffer.from(base64 + pad, "base64").toString("utf8");
    return JSON.parse(json) as { role?: string };
  } catch {
    return null;
  }
}

export type ServiceRoleJwtCheck = { ok: true } | { ok: false; message: string };

/** Call when creating the service-role client. */
export function assertValidServiceRoleKey(key: string): ServiceRoleJwtCheck {
  const trimmed = key.trim();
  if (!trimmed.startsWith("eyJ") || trimmed.split(".").length !== 3) {
    return {
      ok: false,
      message:
        "SUPABASE_SERVICE_ROLE_KEY must be the full JWT from Supabase (Project Settings → API → service_role). It should start with eyJ and contain two dots. Redeploy after fixing Vercel env.",
    };
  }

  const payload = decodeJwtPayload(trimmed);
  if (!payload) {
    return { ok: true };
  }

  if (payload.role === "anon") {
    return {
      ok: false,
      message:
        "SUPABASE_SERVICE_ROLE_KEY is set to the anon public key. Replace it with the service_role secret from Supabase Dashboard → Project Settings → API (same project as NEXT_PUBLIC_SUPABASE_URL), then redeploy.",
    };
  }

  if (payload.role && payload.role !== "service_role") {
    return {
      ok: false,
      message: `SUPABASE_SERVICE_ROLE_KEY JWT has role "${payload.role}"; use the service_role key from Supabase → Settings → API, then redeploy.`,
    };
  }

  return { ok: true };
}
