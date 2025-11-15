import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center px-4">
        <div className="mb-6 text-center">
          <div className="heading-leyline text-xs tracking-[0.25em] text-leyline-blue">
            LEYLINE
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

