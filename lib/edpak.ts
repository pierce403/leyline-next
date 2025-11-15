import "server-only";

import JSZip from "jszip";
import { prisma } from "@/lib/prisma";

type ManifestModule = {
  id: string;
  title: string;
  content: string;
  order?: number;
};

type EdpakManifest = {
  title: string;
  version: string;
  author: string;
  description?: string;
  language?: string;
  modules: ManifestModule[];
};

export async function importEdpakCourse(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
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

  return course.id;
}
