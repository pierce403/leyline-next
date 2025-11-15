'use client';

import type { ChangeEvent, MouseEvent } from "react";
import { useRef, useState } from "react";

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
      const formData = new FormData();
      formData.append("edpak", file);

      const response = await fetch("/api/edpak/import", {
        method: "POST",
        body: formData,
      });

      console.log(
        "[EdpakImport] Upload response",
        response.status,
        response.statusText,
      );

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        console.error("[EdpakImport] Import failed", data);
      } else {
        console.error("[EdpakImport] Import failed with non-JSON response");
      }
    } catch (error) {
      console.error("[EdpakImport] Unexpected error during upload", error);
    } finally {
      setStatus("idle");
      // Clear the file input so the same file can be selected again if needed.
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
