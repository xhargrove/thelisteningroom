/**
 * Server-only Mux REST helpers (Basic auth).
 * https://docs.mux.com/api-reference
 */

const MUX_API_BASE = "https://api.mux.com/video/v1";

export function hasMuxCredentials(): boolean {
  return Boolean(process.env.MUX_TOKEN_ID?.trim() && process.env.MUX_TOKEN_SECRET?.trim());
}

function authHeader(): string {
  const id = process.env.MUX_TOKEN_ID?.trim();
  const secret = process.env.MUX_TOKEN_SECRET?.trim();
  if (!id || !secret) {
    throw new Error("Mux is not configured (MUX_TOKEN_ID / MUX_TOKEN_SECRET).");
  }
  const token = Buffer.from(`${id}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

export async function muxPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${MUX_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Mux API ${res.status}`);
  }
  return JSON.parse(text) as T;
}

export async function muxGet<T>(path: string): Promise<T> {
  const res = await fetch(`${MUX_API_BASE}${path}`, {
    headers: { Authorization: authHeader() },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Mux API ${res.status}`);
  }
  return JSON.parse(text) as T;
}

export type MuxDirectUploadCreated = {
  data: {
    id: string;
    url: string;
    timeout: number;
    status: string;
    new_asset_settings?: { playback_policies?: string[] };
  };
};

export type MuxUploadStatus = {
  data: {
    id: string;
    status: string;
    asset_id?: string;
    error?: { type?: string; messages?: string[] };
  };
};

export type MuxAsset = {
  data: {
    id: string;
    status: string;
    playback_ids?: Array<{ id: string; policy: string }>;
    errors?: { type?: string; messages?: string[] };
  };
};
