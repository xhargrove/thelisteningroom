import { createClient } from "@supabase/supabase-js";
import * as tus from "tus-js-client";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

/** Single-request fallback only — large sets should succeed via TUS. */
const SIGNED_PUT_FALLBACK_MAX_BYTES = 512 * 1024 * 1024;

/**
 * TUS “sign” endpoint on the same origin that minted `createSignedUploadUrl` (see API response `signedUrl`).
 */
export function resumableSignEndpointFromSignedUploadUrl(signedUploadUrl: string): string {
  const u = new URL(signedUploadUrl);
  return `${u.origin}/storage/v1/upload/resumable/sign`;
}

/**
 * Optional second route: direct Storage hostname (docs performance path). Same token should validate if gateway differs.
 */
export function resumableSignEndpointDirectStorage(apiSupabaseUrl: string): string | null {
  try {
    const u = new URL(apiSupabaseUrl.trim().replace(/\/$/, ""));
    const match = /^([^.]+)\.supabase\.co$/i.exec(u.hostname);
    if (!match) return null;
    return `https://${match[1]}.storage.supabase.co/storage/v1/upload/resumable/sign`;
  } catch {
    return null;
  }
}

export type VideoSignedSlotUploadParams = {
  /** Response from `createSignedUploadUrl` — drives correct TUS origin. */
  signedUploadUrl: string;
  bucket: string;
  path: string;
  token: string;
  file: File;
  contentType: string;
  onProgress?: (pct: number, bytesUploaded: number, bytesTotal: number) => void;
};

/**
 * Upload via TUS (tries API origin, then direct `*.storage.supabase.co`), then signed multipart PUT for smaller files.
 */
export async function uploadVideoToSignedSlot(params: VideoSignedSlotUploadParams): Promise<void> {
  const { signedUploadUrl, bucket, path, token, file, contentType, onProgress } = params;
  const { url: supabaseApiUrl, anonKey } = getSupabasePublicConfig();

  const attempts: string[] = [
    resumableSignEndpointFromSignedUploadUrl(signedUploadUrl),
  ];
  const direct = resumableSignEndpointDirectStorage(supabaseApiUrl);
  if (direct && !attempts.includes(direct)) attempts.push(direct);

  let lastError: unknown;
  for (const endpoint of attempts) {
    try {
      await uploadTusPresigned({
        endpoint,
        bucket,
        path,
        token,
        file,
        contentType,
        anonKey,
        onProgress,
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  if (file.size <= SIGNED_PUT_FALLBACK_MAX_BYTES) {
    const supabase = createClient(supabaseApiUrl.replace(/\/$/, ""), anonKey);
    const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, {
      contentType: contentType || "application/octet-stream",
      cacheControl: "3600",
    });
    if (!error) {
      onProgress?.(100, file.size, file.size);
      return;
    }
    lastError = error;
  }

  const msg =
    lastError instanceof Error
      ? lastError.message
      : typeof lastError === "object" &&
          lastError !== null &&
          "message" in lastError &&
          typeof (lastError as { message: unknown }).message === "string"
        ? (lastError as { message: string }).message
        : String(lastError);
  throw new Error(
    msg ? `Upload failed after TUS and fallback: ${msg}` : "Video upload failed.",
  );
}

async function uploadTusPresigned(params: {
  endpoint: string;
  bucket: string;
  path: string;
  token: string;
  file: File;
  contentType: string;
  anonKey: string;
  onProgress?: (pct: number, bytesUploaded: number, bytesTotal: number) => void;
}): Promise<void> {
  const { endpoint, bucket, path, token, file, contentType, anonKey, onProgress } = params;

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        "x-signature": token,
        apikey: anonKey,
      },
      metadata: {
        bucketName: bucket,
        objectName: path,
        contentType: contentType || "application/octet-stream",
        cacheControl: "3600",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      storeFingerprintForResuming: false,
      fingerprint: async () => `signed:${token.slice(0, 48)}:${file.name}:${file.size}`,
      onProgress(bytesUploaded, bytesTotal) {
        const pct = bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0;
        onProgress?.(pct, bytesUploaded, bytesTotal);
      },
      onSuccess() {
        resolve();
      },
      onError(error) {
        reject(error);
      },
    });

    upload.start();
  });
}
