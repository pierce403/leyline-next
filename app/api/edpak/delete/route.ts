import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const pathname =
    body && typeof (body as { pathname?: unknown }).pathname === "string"
      ? ((body as { pathname: string }).pathname ?? "").trim()
      : "";

  if (!pathname) {
    return NextResponse.json(
      { error: "Missing pathname" },
      { status: 400 },
    );
  }

  try {
    await del(pathname);
    console.log("[EdpakDelete] Deleted blob pathname", pathname);
  } catch (error) {
    // If deletion fails (e.g., blob not found), log but do not treat as fatal.
    console.error("[EdpakDelete] Failed to delete blob", {
      pathname,
      error,
    });
  }

  return NextResponse.json(
    {
      ok: true,
    },
    { status: 200 },
  );
}

