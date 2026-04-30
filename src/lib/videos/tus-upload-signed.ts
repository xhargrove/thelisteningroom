import * as tus from "tus-js-client";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export type TusSignedUploadParams = {
  projectRef: string;
  bucket?: string;
  path: string;
  token: string;
  file: File;
  contentType: string;
  onProgress?: (pct: number, bytesUploaded: number, bytesTotal: number) => void;
  onError?: (err: unknown) => void;
};

/**
 * Resumable upload to Supabase Storage using TUS + presigned token from
 * `createSignedUploadUrl` (same token as `uploadToSignedUrl`).
 *
 * @see https://supabase.com/docs/guides/storage/uploads/resumable-uploads (Presigned uploads)
 */
export async function uploadVideoTusSigned(params: TusSignedUploadParams): Promise<void> {
  const {
    projectRef,
    bucket = "video-uploads",
    path,
    token,
    file,
    contentType,
    onProgress,
    onError,
  } = params;

  const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;
  const { anonKey } = getSupabasePublicConfig();

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
        contentType,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      onProgress(bytesUploaded, bytesTotal) {
        const pct = bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0;
        onProgress?.(pct, bytesUploaded, bytesTotal);
      },
      onSuccess() {
        resolve();
      },
      onError(error) {
        onError?.(error);
        reject(error);
      },
    });

    void upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });
  });
}
