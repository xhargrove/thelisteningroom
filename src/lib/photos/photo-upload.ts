import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export type PhotoSignedUploadParams = {
  bucket: string;
  path: string;
  token: string;
  file: File;
  contentType: string;
};

/** Upload a photo image (jpg/png/webp/gif/avif) using a signed upload token. */
export async function uploadPhotoToSignedUrl(params: PhotoSignedUploadParams): Promise<void> {
  const { bucket, path, token, file, contentType } = params;
  const { url, anonKey } = getSupabasePublicConfig();
  const supabase = createClient(url.replace(/\/$/, ""), anonKey);

  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, {
    contentType: contentType || "application/octet-stream",
  });
  if (error) {
    throw new Error(error.message);
  }
}
