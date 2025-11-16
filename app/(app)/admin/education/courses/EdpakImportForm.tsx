'use client';

import type { ChangeEvent, MouseEvent } from "react";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

type Status = "idle" | "selecting" | "uploading";

export function EdpakImportForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleClickImport = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setStatus("selecting");
    console.log("[EdpakImport] Import button clicked");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input = event.target;
    if (!input.files || input.files.length === 0) {
      console.log("[EdpakImport] No file selected");
      setStatus("idle");
      return;
    }

    const file = input.files[0];
    console.log(
      "[EdpakImport] Selected file",
      file.name,
      file.type,
      file.size,
    );

    setStatus("uploading");

    try {
      // Ensure any existing blob with this pathname is removed before upload.
      try {
        await fetch("/api/edpak/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pathname: file.name }),
        });
      } catch (deleteError) {
        console.warn(
          "[EdpakImport] Failed to delete existing blob before upload",
          deleteError,
        );
      }

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/edpak/upload",
        multipart: true,
        clientPayload: JSON.stringify({ kind: "edpak-course" }),
      });

      console.log("[EdpakImport] Blob uploaded", blob.url);

      const response = await fetch("/api/edpak/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blobUrl: blob.url }),
      });

      console.log(
        "[EdpakImport] Import response",
        response.status,
        response.statusText,
      );

      if (response.ok) {
        window.location.href = "/admin/education/courses";
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        console.error("[EdpakImport] Import failed", data);
        if (typeof window !== "undefined" && data?.error) {
          window.alert(`Import failed: ${data.error}`);
        }
      } else {
        console.error("[EdpakImport] Import failed with non-JSON response");
        if (typeof window !== "undefined") {
          window.alert("Import failed with a non-JSON response from the server.");
        }
      }
    } catch (error) {
      let message = "Unexpected error while uploading course package.";
      if (error instanceof Error) {
        if (error.message.includes("blob already exists")) {
          message =
            "A file with this name has already been uploaded. The existing upload will be used; if you need to replace it, please contact support.";
        } else {
          message = error.message;
        }
      }
      console.error("[EdpakImport] Upload error", { error, message });
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    } finally {
      setStatus("idle");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        name="edpak"
        accept=".edpak,application/zip"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleClickImport}
        className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
        disabled={status === "uploading"}
      >
        {status === "uploading" ? "Importing…" : "Import Course"}
      </button>
    </div>
  );
}
