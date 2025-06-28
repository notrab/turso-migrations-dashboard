"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  runMigrationsAction,
  type RunMigrationsState,
} from "@/app/actions/database";

interface MigrationButtonProps {
  hostname: string;
  disabled?: boolean;
  pendingCount?: number;
}

function SubmitButton({ pendingCount }: { pendingCount?: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md
        transition-colors duration-200
        ${
          pending
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        }
      `}
    >
      {pending ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Running...
        </>
      ) : (
        <>
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {pendingCount ? `Run ${pendingCount} Migrations` : "Run Migrations"}
        </>
      )}
    </button>
  );
}

export function MigrationButton({
  hostname,
  disabled = false,
  pendingCount,
}: MigrationButtonProps) {
  const initialState: RunMigrationsState = { success: false };
  const [state, formAction] = useFormState(runMigrationsAction, initialState);

  if (disabled) {
    return (
      <button
        disabled
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {disabled
          ? "Run Migrations"
          : pendingCount
            ? `Run ${pendingCount} Migrations`
            : "Run Migrations"}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="hostname" value={hostname} />
        <SubmitButton pendingCount={pendingCount} />
      </form>

      {state.error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {state.error}
        </div>
      )}

      {state.success && state.message && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          {state.message}
        </div>
      )}
    </div>
  );
}
