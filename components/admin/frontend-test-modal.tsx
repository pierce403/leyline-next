'use client';

import { useState } from "react";

export function FrontendTestModal() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    console.log("[FrontendHealth] Test modal opened", {
      time: new Date().toISOString(),
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="space-y-1 text-[11px]">
      <button
        type="button"
        onClick={handleOpen}
        className="rounded border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-50"
      >
        Open frontend test modal
      </button>
      <p className="text-[10px] text-gray-500">
        Use this to confirm client-side interactivity and overlays are working
        in your current deployment.
      </p>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="max-w-sm rounded bg-white p-4 text-[11px] text-gray-800 shadow-lg">
            <div className="mb-2 text-xs font-semibold text-gray-900">
              Frontend Test Modal
            </div>
            <p className="mb-2">
              If you can see this modal and dismiss it, client-side React
              interactivity, hydration, and basic overlay styling are working in
              this environment.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
