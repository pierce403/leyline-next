import "server-only";

import JSZip from "jszip";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ManifestModule = {
  id: string;
  title: string;
  content: string;
  order?: number;
};

type ManifestLesson = {
  id: string;
  moduleId?: string;
  title?: string;
  type?: string;
  order?: number;
  description?: string;
  content?: string;
  fileId?: string;
  filePath?: string;
};

type ManifestFile = {
  id: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  path?: string;
};

type EdpakManifest = {
  title: string;
  version: string;
  author: string;
  description?: string;
  language?: string;
  modules: ManifestModule[];
  lessons?: ManifestLesson[];
  files?: ManifestFile[];
  missingFiles?: string[];
   coverImage?: {
     fileId: string;
     fileName: string;
     contentType: string;
     filePath: string;
     description?: string;
   };
   coverDescription?: string;
  // Additional metadata keys from the spec are preserved in manifestJson.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

async function importEdpakCourseFromArrayBuffer(
  arrayBuffer: ArrayBuffer,
): Promise<string> {
  const buffer = Buffer.from(arrayBuffer);

  const zip = await JSZip.loadAsync(buffer);

  const manifestEntry = zip.file("manifest.json");
  if (!manifestEntry) {
    throw new Error("manifest.json not found in edpak archive");
  }

  const manifestText = await manifestEntry.async("string");
  let manifest: EdpakManifest;
  try {
    manifest = JSON.parse(manifestText) as EdpakManifest;
  } catch {
    throw new Error("manifest.json is not valid JSON");
  }

  console.log("[EdpakImport] Parsed manifest", {
    title: manifest.title,
    version: manifest.version,
    author: manifest.author,
    modules: Array.isArray(manifest.modules) ? manifest.modules.length : 0,
    lessons: Array.isArray(manifest.lessons) ? manifest.lessons.length : 0,
    files: Array.isArray(manifest.files) ? manifest.files.length : 0,
  });

  if (!manifest.title || !manifest.version || !manifest.author) {
    throw new Error(
      "manifest.json is missing required fields (title, version, author)",
    );
  }
  if (!Array.isArray(manifest.modules) || manifest.modules.length === 0) {
    throw new Error("manifest.json must include a non-empty modules array");
  }

  const courseDescription =
    typeof manifest.coverDescription === "string" &&
    manifest.coverDescription.trim().length > 0
      ? manifest.coverDescription.trim()
      : manifest.description ?? null;

  const course = await prisma.educationCourse.create({
    data: {
      name: manifest.title,
      description: courseDescription,
      status: "DEVELOPMENT",
      coverImageUrl: null,
      requiredLevel: "FREE",
    },
  });

  const sortedModules = [...manifest.modules].sort((a, b) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    return ao - bo;
  });

  const lessonsByModuleId = new Map<string, ManifestLesson[]>();
  if (Array.isArray(manifest.lessons)) {
    for (const lesson of manifest.lessons) {
      if (!lesson.moduleId) continue;
      const existing = lessonsByModuleId.get(lesson.moduleId) ?? [];
      existing.push(lesson);
      lessonsByModuleId.set(lesson.moduleId, existing);
    }
  }

  let totalLessonsCreated = 0;

  for (let index = 0; index < sortedModules.length; index += 1) {
    const mod = sortedModules[index];

    const contentEntry = zip.file(mod.content);
    const moduleHtml =
      contentEntry != null
        ? await contentEntry.async("string")
        : `Content file "${mod.content}" not found in edpak archive.`;

    const createdModule = await prisma.educationModule.create({
      data: {
        name: mod.title,
        description: null,
        status: "ACTIVE",
        coverImageUrl: null,
      },
    });

    await prisma.courseModule.create({
      data: {
        courseId: course.id,
        moduleId: createdModule.id,
        sortOrder: index,
      },
    });

    const manifestLessonsForModule = lessonsByModuleId.get(mod.id) ?? [];

    if (manifestLessonsForModule.length > 0) {
      const sortedLessons = [...manifestLessonsForModule].sort((a, b) => {
        const ao = a.order ?? 0;
        const bo = b.order ?? 0;
        return ao - bo;
      });

      for (let lessonIndex = 0; lessonIndex < sortedLessons.length; lessonIndex += 1) {
        const manifestLesson = sortedLessons[lessonIndex];

        const type = (manifestLesson.type ?? "").toLowerCase();
        let contentType: "HTML" | "TEXT" | "MULTIPLE_CHOICE" | "IMAGE" | "VIDEO" | "NONE" =
          "HTML";

        if (type === "text") {
          contentType = "TEXT";
        } else if (type === "multiplechoice" || type === "multiple_choice") {
          contentType = "MULTIPLE_CHOICE";
        } else if (type === "image") {
          contentType = "IMAGE";
        } else if (type === "video") {
          contentType = "VIDEO";
        } else if (!type) {
          contentType = "NONE";
        }

        const lessonName =
          manifestLesson.title && manifestLesson.title.trim().length > 0
            ? manifestLesson.title.trim()
            : `${mod.title} ${lessonIndex + 1}`;

        const lessonDescription =
          manifestLesson.description && manifestLesson.description.trim().length > 0
            ? manifestLesson.description.trim()
            : null;

        const lessonContent =
          manifestLesson.content && manifestLesson.content.length > 0
            ? manifestLesson.content
            : moduleHtml;

        const lesson = await prisma.educationLesson.create({
          data: {
            name: lessonName,
            description: lessonDescription,
            status: "ACTIVE",
            contentType,
            content: lessonContent,
            course: {
              connect: { id: course.id },
            },
          },
        });

        await prisma.moduleLesson.create({
          data: {
            moduleId: createdModule.id,
            lessonId: lesson.id,
            sortOrder: lessonIndex,
          },
        });

        totalLessonsCreated += 1;
      }
    } else {
      const lesson = await prisma.educationLesson.create({
        data: {
          name: mod.title,
          description: null,
          status: "ACTIVE",
          contentType: "HTML",
          content: moduleHtml,
          course: {
            connect: { id: course.id },
          },
        },
      });

      await prisma.moduleLesson.create({
        data: {
          moduleId: createdModule.id,
          lessonId: lesson.id,
          sortOrder: 0,
        },
      });

      totalLessonsCreated += 1;
    }
  }

  const lessonCount = Array.isArray(manifest.lessons)
    ? manifest.lessons.length
    : sortedModules.length;
  const quizCount = Array.isArray(manifest.lessons)
    ? manifest.lessons.filter((lesson) => {
        const type = lesson.type?.toLowerCase() ?? "";
        return type === "multiplechoice" || type === "multiple_choice";
      }).length
    : 0;
  const fileCount = Array.isArray(manifest.files) ? manifest.files.length : 0;
  const imageCount = Array.isArray(manifest.files)
    ? manifest.files.filter((file) =>
        (file.contentType ?? "").toLowerCase().startsWith("image/"),
      ).length
    : 0;
  const videoCount = Array.isArray(manifest.files)
    ? manifest.files.filter((file) =>
        (file.contentType ?? "").toLowerCase().startsWith("video/"),
      ).length
    : 0;
  const missingFileCount = Array.isArray(manifest.missingFiles)
    ? manifest.missingFiles.length
    : 0;

  const coverImageFilePath = manifest.coverImage?.filePath ?? null;
  let coverImageImported = false;
  let coverImageUrl: string | null = null;

  if (coverImageFilePath) {
    const coverEntry = zip.file(coverImageFilePath);
    if (coverEntry) {
      try {
        const coverBuffer = await coverEntry.async("nodebuffer");
        const { uploadCourseMedia } = await import("@/lib/blob");
        const filename =
          manifest.coverImage?.fileName ??
          `${manifest.coverImage?.fileId ?? course.id}.jpg`;

        const uploaded = await uploadCourseMedia(
          coverBuffer,
          "course-images",
          `${course.id}-${filename}`,
        );

        coverImageImported = true;
        coverImageUrl = uploaded.url;

        await prisma.educationCourse.update({
          where: { id: course.id },
          data: {
            coverImageUrl,
          },
        });
      } catch (error) {
        console.error(
          "Failed to upload or persist course cover image from edpak",
          error,
        );
      }
    }
  }

  const summaryParts = [
    `Imported course "${manifest.title}"`,
    `modules=${sortedModules.length}`,
    `lessons=${lessonCount}`,
    `quizzes=${quizCount}`,
    `files=${fileCount}`,
    `images=${imageCount}`,
    `videos=${videoCount}`,
  ];

  if (missingFileCount > 0) {
    summaryParts.push(`missingFiles=${missingFileCount}`);
  }

  if (coverImageFilePath) {
    summaryParts.push(
      `coverImage=${coverImageImported ? "imported" : "missing"}`,
    );
  }

  const summary = summaryParts.join(", ");

  const detailsObject = {
    title: manifest.title,
    version: manifest.version,
    author: manifest.author,
    description: manifest.description ?? null,
    language: manifest.language ?? null,
    modules: sortedModules.length,
    lessons: lessonCount,
    quizzes: quizCount,
    files: fileCount,
    images: imageCount,
    videos: videoCount,
    missingFiles: missingFileCount,
    coverImageFilePath,
    coverImageImported,
    coverImageUrl,
  };

  console.log("[EdpakImport] Created course records", {
    courseId: course.id,
    modulesCreated: sortedModules.length,
    lessonsCreated: totalLessonsCreated,
  });

  try {
    await prisma.educationImportLog.create({
      data: {
        courseId: course.id,
        summary,
        details: JSON.stringify(detailsObject, null, 2),
        manifestJson: manifestText,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      console.warn(
        "[EdpakImport] EducationImportLog table missing; run latest migrations to enable import audit logs.",
      );
    } else {
      console.error("Failed to write EducationImportLog entry", error);
    }
  }

  return course.id;
}

export async function importEdpakCourse(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return importEdpakCourseFromArrayBuffer(arrayBuffer);
}

export async function importEdpakCourseFromBlobUrl(
  blobUrl: string,
): Promise<string> {
  // SSRF mitigation: only allow blob URLs to the trusted Vercel blob storage host.
  // Adjust as needed for your storage solution.
  const ALLOWED_BLOB_HOST = "blob.vercel-storage.com";
  const ALLOWED_BLOB_SUFFIX = ".blob.vercel-storage.com";
  let parsed;
  try {
    parsed = new URL(blobUrl);
  } catch {
    throw new Error(`Invalid blobUrl (not a valid URL): ${blobUrl}`);
  }
  // Strictly compare hostname and protocol
  const normalizedHost = parsed.hostname.toLowerCase();
  const hostAllowed =
    normalizedHost === ALLOWED_BLOB_HOST ||
    normalizedHost.endsWith(ALLOWED_BLOB_SUFFIX);

  if (
    parsed.protocol !== "https:" ||
    !hostAllowed ||
    parsed.port !== "" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error(
      `blobUrl must refer to the trusted host (${ALLOWED_BLOB_HOST} or *.blob.vercel-storage.com), got ${parsed.hostname} (invalid protocol/host/port/credentials)`,
    );
  }

  const maxAttempts = 8;
  const delayMs = 1000;

  let arrayBuffer: ArrayBuffer | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(blobUrl);

    if (response.ok) {
      arrayBuffer = await response.arrayBuffer();
      break;
    }

    const shouldRetry = attempt < maxAttempts;
    console.warn("[EdpakImport] Failed to fetch edpak blob", {
      blobUrl,
      status: response.status,
      statusText: response.statusText,
      attempt,
      maxAttempts,
      willRetry: shouldRetry,
    });

    if (shouldRetry) {
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
      continue;
    }

    throw new Error(
      `Failed to fetch edpak from blob URL: ${response.status} ${response.statusText}`,
    );
  }

  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error(
      "Downloaded edpak from blob URL is empty or still not available after retries",
    );
  }

  const courseId = await importEdpakCourseFromArrayBuffer(arrayBuffer);

  try {
    const { del } = await import("@vercel/blob");
    await del(blobUrl);
    console.log("[EdpakImport] Deleted source edpak blob after import", {
      blobUrl,
    });
  } catch (error) {
    console.error(
      "[EdpakImport] Failed to delete source edpak blob after import",
      {
        blobUrl,
        error,
      },
    );
  }

  return courseId;
}
