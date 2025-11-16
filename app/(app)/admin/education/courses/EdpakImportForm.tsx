'use client';

import type { ChangeEvent, MouseEvent } from "react";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";

type ImportPhase =
  | "idle"
  | "uploading"
  | "importing"
  | "verifying"
  | "success"
  | "error";

const progressByPhase: Record<ImportPhase, number> = {
  idle: 0,
  uploading: 30,
  importing: 70,
  verifying: 90,
  success: 100,
  error: 0,
};

const POLL_INTERVAL_MS = 1000;
const POLL_ATTEMPTS = 5;

export function EdpakImportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const isBusy =
    phase === "uploading" ||
    phase === "importing" ||
    phase === "verifying";

  const handleClickImport = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isBusy) {
      return;
    }

    console.log("[EdpakImport] Import button clicked");
    fileInputRef.current?.click();
  };

  const pollCourseList = async () => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      router.refresh();
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  };

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input = event.target;
    if (!input.files || input.files.length === 0) {
      console.log("[EdpakImport] No file selected");
      setPhase("idle");
      setStatusMessage("");
      setSelectedFileName(null);
      return;
    }

    const file = input.files[0];
    setSelectedFileName(file.name);
    console.log(
      "[EdpakImport] Selected file",
      file.name,
      file.type,
      file.size,
    );

    setPhase("uploading");
    setStatusMessage(
      `Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)…`,
    );
    setErrorMessage(null);

    try {
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
      setPhase("importing");
      setStatusMessage("Upload complete. Importing course data…");

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

      const isJson = (response.headers.get("content-type") ?? "").includes(
        "application/json",
      );
      const payload = isJson ? await response.json() : null;

      if (!response.ok) {
        const message =
          payload?.error ??
          "Import failed with a non-JSON response from the server.";
        setPhase("error");
        setErrorMessage(message);
        console.error("[EdpakImport] Import failed", message);
        return;
      }

      setPhase("verifying");
      setStatusMessage("Import complete. Syncing the course list…");

      await pollCourseList();

      setPhase("success");
      setStatusMessage("Course imported successfully.");
      setSelectedFileName(null);
      router.refresh();
    } catch (error) {
      let message = "Unexpected error while uploading course package.";
      if (error instanceof Error) {
        if (error.message.includes("blob already exists")) {
          message =
            "This file was uploaded recently. Please try again in a moment or rename the file.";
        } else {
          message = error.message;
        }
      }
      console.error("[EdpakImport] Upload error", { error, message });
      setPhase("error");
      setErrorMessage(message);
      setStatusMessage("");
    } finally {
      resetInput();
      setTimeout(() => {
        setPhase((prev) => {
          if (prev === "success" || prev === "error") {
            setStatusMessage("");
            setErrorMessage(null);
            return "idle";
          }
          return prev;
        });
      }, 4000);
    }
  };

  const progress = progressByPhase[phase];

  return (
    <div className="flex flex-col gap-3">
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
        className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy}
      >
        {isBusy ? "Import in Progress…" : "Import Course"}
      </button>
      {(phase !== "idle" || errorMessage) && (
        <div
          className={`rounded border px-3 py-2 text-xs ${
            phase === "error"
              ? "border-red-300 bg-red-50 text-red-800"
              : "border-gray-200 bg-gray-50 text-gray-700"
          }`}
        >
          {phase !== "error" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-leyline-primary" />
                <span>{statusMessage || "Working…"}</span>
              </div>
              <div className="h-1.5 w-full rounded bg-white/70">
                <div
                  className="h-full rounded bg-leyline-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {selectedFileName && (
                <div className="text-[11px] text-gray-500">
                  File: {selectedFileName}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="font-semibold">Import failed</p>
              <p className="mt-1 whitespace-pre-wrap">{errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
