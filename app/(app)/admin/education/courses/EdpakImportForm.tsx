'use client';

import type { MouseEvent } from "react";
import { useRef, useState } from "react";

type Status = "idle" | "selecting" | "uploading";

export function EdpakImportForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleClickImport = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setStatus("selecting");
    console.log("[EdpakImport] Import button clicked");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = () => {
    const input = fileInputRef.current;
    if (!input || !input.files || input.files.length === 0) {
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

    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <form
      ref={formRef}
      action="/api/edpak/import"
      method="post"
      encType="multipart/form-data"
      className="flex flex-col gap-2"
    >
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
    </form>
  );
}

