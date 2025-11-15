import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { importEdpakCourse } from "@/lib/edpak";

export async function POST(req: NextRequest) {
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

  // Allow both `.edpak` and plain `.zip` uploads for now.
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
    // Quick sanity check that this is a ZIP file before handing off.
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
