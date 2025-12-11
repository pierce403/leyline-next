'use client';

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type MigrationActionState = {
  ok: boolean;
  message: string | null;
};

export type MigrationAction = (
  prevState: MigrationActionState,
  formData: FormData,
) => Promise<MigrationActionState>;

type Props = {
  action: MigrationAction;
  initialState: MigrationActionState;
};

export function RunMigrationsControl({ action, initialState }: Props) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2 text-[11px]">
      <RunButton />
      {state.message && (
        <pre
          className={`whitespace-pre-wrap rounded border px-2 py-1 text-[10px] ${state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
          {state.message}
        </pre>
      )}
    </form>
  );
}

function RunButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Running migrations…" : "Run Prisma migrations"}
    </button>
  );
}

export const runMigrationsInitialState: MigrationActionState = {
  ok: true,
  message: null,
};
