import "server-only";

import JSZip from "jszip";
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

  if (!manifest.title || !manifest.version || !manifest.author) {
    throw new Error(
      "manifest.json is missing required fields (title, version, author)",
    );
  }
  if (!Array.isArray(manifest.modules) || manifest.modules.length === 0) {
    throw new Error("manifest.json must include a non-empty modules array");
  }

  const course = await prisma.educationCourse.create({
    data: {
      name: manifest.title,
      description: manifest.description ?? null,
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

  for (let index = 0; index < sortedModules.length; index += 1) {
    const mod = sortedModules[index];

    const contentEntry = zip.file(mod.content);
    const content =
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

    const lesson = await prisma.educationLesson.create({
      data: {
        name: mod.title,
        description: null,
        status: "ACTIVE",
        contentType: "HTML",
        content,
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
  };

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
    // If the import log table does not exist yet (e.g., migration not applied),
    // do not fail the entire import; just log the issue for later inspection.
    console.error("Failed to write EducationImportLog entry", error);
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
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch edpak from blob URL: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("Downloaded edpak from blob URL is empty");
  }

  return importEdpakCourseFromArrayBuffer(arrayBuffer);
}
