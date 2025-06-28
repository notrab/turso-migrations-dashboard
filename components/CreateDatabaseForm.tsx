"use client";

import type React from "react";
import { useActionState } from "react";
import { createDatabaseAction, type CreateDatabaseState } from "@/app/actions";

interface DatabaseNameInputProps {
  defaultValue?: string;
}

function DatabaseNameInput({ defaultValue }: DatabaseNameInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="databaseName"
        className="block text-sm font-medium text-gray-700"
      >
        Database Name
      </label>
      <input
        id="databaseName"
        name="databaseName"
        type="text"
        placeholder="my-database"
        defaultValue={defaultValue}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        required
        pattern="[a-z0-9_-]+"
        title="Only lowercase letters, numbers, hyphens, and underscores are allowed"
      />
      <p className="text-xs text-gray-500">
        Only lowercase letters, numbers, hyphens, and underscores. Minimum 3
        characters.
      </p>
    </div>
  );
}

export function CreateDatabaseForm() {
  const [state, action, isPending] = useActionState<
    CreateDatabaseState,
    FormData
  >(createDatabaseAction, {});

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Create New Database
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Add a new database to your Turso group. Migrations will be
          automatically applied after creation.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <DatabaseNameInput defaultValue={state?.databaseName} />

        {state?.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {state?.success && (
          <div
            className={`rounded-md p-4 ${
              state.migrationStatus?.includes("failed")
                ? "bg-yellow-50"
                : "bg-green-50"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span
                  className={
                    state.migrationStatus?.includes("failed")
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                >
                  {state.migrationStatus?.includes("failed") ? "⚠️" : "✅"}
                </span>
              </div>
              <div className="ml-3">
                <div className="space-y-1">
                  <p
                    className={`text-sm ${
                      state.migrationStatus?.includes("failed")
                        ? "text-yellow-800"
                        : "text-green-800"
                    }`}
                  >
                    Database &quot;{state.databaseName}&quot; created
                    successfully!
                  </p>
                  {state.migrationStatus && (
                    <p
                      className={`text-xs ${
                        state.migrationStatus?.includes("failed")
                          ? "text-yellow-700"
                          : "text-green-700"
                      }`}
                    >
                      {state.migrationStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                Creating & Migrating...
              </>
            ) : (
              "New User Database"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
