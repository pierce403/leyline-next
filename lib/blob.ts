import { put, type PutBlobResult } from "@vercel/blob";

export type CourseMediaFolder = "course-images" | "course-videos";

export type CourseMediaUploadResult = PutBlobResult;

type CourseMediaBody = Parameters<typeof put>[1];

/**
 * Minimal helper for uploading course media to Vercel Blob storage.
 *
 * Note: In production, you must configure a BLOB_READ_WRITE_TOKEN
 * in the Vercel project settings for writes to succeed.
 */
export async function uploadCourseMedia(
  file: CourseMediaBody,
  folder: CourseMediaFolder,
  filename: string,
): Promise<CourseMediaUploadResult> {
  const key = `${folder}/${filename}`;
  const result = await put(key, file, {
    access: "public",
  });

  return result;
}
