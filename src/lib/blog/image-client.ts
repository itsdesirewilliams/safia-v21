"use client";

import { createBlogMediaRecordAction } from "@/app/admin/(dashboard)/posts/actions";
import { getSupabaseEnv } from "@/lib/config";
import { buildStoragePath, validateUpload } from "@/lib/media/upload";
import type { Media } from "@/lib/media/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { BLOG_IMAGE_MIME_TYPES } from "@/lib/blog/upload-path";

export const ACCEPTED_IMAGE_TYPES = BLOG_IMAGE_MIME_TYPES;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const OPTIMISE_THRESHOLD_BYTES = 1.5 * 1024 * 1024;
const MAX_DIMENSION = 2400;
const BUCKET = "blog-images";

/** A user-facing validation message, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Use a JPG, PNG, WebP or AVIF image.";
  }
  if (file.size <= 0) {
    return "That image is empty.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "The image is too large. Maximum size is 10 MB.";
  }
  return null;
}

/**
 * Downscale very large images in the browser before upload. If the browser
 * cannot decode or re-encode the file, the original is uploaded unchanged and
 * the server validation remains the authority.
 */
export async function optimiseImage(file: File): Promise<File> {
  try {
    if (typeof document === "undefined" || typeof createImageBitmap !== "function") {
      return file;
    }

    const bitmap = await createImageBitmap(file);
    const largest = Math.max(bitmap.width, bitmap.height);
    const needsResize = largest > MAX_DIMENSION;
    const needsCompression = file.size > OPTIMISE_THRESHOLD_BYTES;

    if (!needsResize && !needsCompression) {
      bitmap.close();
      return file;
    }

    const scale = needsResize ? MAX_DIMENSION / largest : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.85);
    });

    if (!blob || blob.size === 0 || blob.size >= file.size) {
      return file;
    }

    const stem = file.name.replace(/\.[a-z0-9]+$/i, "") || "image";
    return new File([blob], `${stem}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export type UploadImageOptions = {
  alt?: string | null;
  caption?: string | null;
  onProgress?: (percent: number) => void;
};

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function uploadBytes(
  url: string,
  anonKey: string,
  accessToken: string,
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `${url.replace(/\/$/, "")}/storage/v1/object/${BUCKET}/${encodePath(path)}`,
    );
    request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    request.setRequestHeader("apikey", anonKey);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.setRequestHeader("x-upsert", "false");

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onerror = () => reject(new Error("The upload failed. Check your connection."));
    request.onabort = () => reject(new Error("The upload was cancelled."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      let message = "";
      try {
        const payload = JSON.parse(request.responseText) as {
          message?: string;
          error?: string;
        };
        message = payload.message ?? payload.error ?? "";
      } catch {
        message = "";
      }

      if (request.status === 413) {
        reject(new Error("The server rejected the image size."));
        return;
      }
      if (request.status === 401 || request.status === 403) {
        reject(new Error("Your session expired. Sign in again."));
        return;
      }
      reject(new Error(message || "The upload failed."));
    };

    request.send(file);
  });
}

/**
 * Upload directly to Supabase Storage (the project's large-file pattern), then
 * create the Media record through a server action. This bypasses the Node
 * request-body limit and keeps the upload visible in the Media library.
 */
export async function uploadImage(
  file: File,
  options: UploadImageOptions = {},
): Promise<Media> {
  const validation = validateUpload({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });
  if (!validation.ok) {
    throw new Error(validation.error);
  }
  if (
    validation.type !== "image" ||
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error("Use a JPG, PNG, WebP or AVIF image.");
  }

  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Your session expired. Sign in again.");
  }

  const { url, anonKey } = getSupabaseEnv();
  const path = buildStoragePath({
    safeName: validation.safeName,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    scope: "blog",
  });

  await uploadBytes(
    url,
    anonKey,
    session.access_token,
    path,
    file,
    options.onProgress,
  );

  const result = await createBlogMediaRecordAction({
    path,
    mimeType: file.type,
    sizeBytes: file.size,
    alt: options.alt,
    caption: options.caption,
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.media;
}
