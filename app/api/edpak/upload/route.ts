import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const options = {
    // The helper will ensure that only small JSON payloads hit this route;
    // the actual file data is sent directly from the browser to Vercel Blob.
    request: req as unknown as Request,
    body,
    // For now we accept any client that can hit this route; this is only
    // used from the admin UI for edpak imports.
    onBeforeGenerateToken: async () => {
      return {
        // Optional: could restrict allowed content types or add metadata.
      };
    },
    // We don't need to do anything on upload completion yet; the client
    // will receive the blob URL and call the importer separately.
    onUploadCompleted: async ({
      blob,
      clientPayload,
    }: {
      blob: { url?: string } | null;
      clientPayload?: unknown;
    }) => {
      console.log("Edpak Blob upload completed", {
        url: blob?.url,
        clientPayload,
      });
    },
  };

  const result = await handleUpload(options);

  return NextResponse.json(result);
}
