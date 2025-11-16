import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { importEdpakCourse, importEdpakCourseFromBlobUrl } from "@/lib/edpak";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  // Preferred path: import from a Blob URL, so large files never hit the
  // function body size limit.
  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      console.error("[EdpakImport] Failed to parse JSON body in /api/edpak/import");
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const blobUrl =
      body && typeof (body as { blobUrl?: unknown }).blobUrl === "string"
        ? (body as { blobUrl: string }).blobUrl
        : null;

    if (!blobUrl) {
      console.error("[EdpakImport] Missing blobUrl in JSON body", body);
      return NextResponse.json(
        { error: "Missing blobUrl in request body" },
        { status: 400 },
      );
    }

    try {
      console.log("[EdpakImport] Starting import from blobUrl", { blobUrl });
      await importEdpakCourseFromBlobUrl(blobUrl);
      console.log("[EdpakImport] Completed import from blobUrl", { blobUrl });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown import error";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.redirect(new URL("/admin/education/courses", req.url));
  }

  // Fallback for small local tests: accept a direct file upload.
  const formData = await req.formData();
  const file = formData.get("edpak");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing edpak file" },
      { status: 400 },
    );
  }

  const fileName = file.name ?? "";
  const lowerName = fileName.toLowerCase();

  if (!lowerName.endsWith(".edpak") && !lowerName.endsWith(".zip")) {
    return NextResponse.json(
      {
        error:
          "File must have a .edpak or .zip extension",
      },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    return NextResponse.json(
      { error: "Uploaded edpak file is empty" },
      { status: 400 },
    );
  }

  try {
    await JSZip.loadAsync(arrayBuffer);
  } catch {
    return NextResponse.json(
      { error: "Uploaded file is not a valid ZIP/edpak archive" },
      { status: 400 },
    );
  }

  try {
    await importEdpakCourse(file);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown import error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/admin/education/courses", req.url));
}
