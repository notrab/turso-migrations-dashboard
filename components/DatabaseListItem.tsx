import { type Database } from "@tursodatabase/api";
import { Suspense } from "react";
import { MigrationControls } from "./MigrationControls";

interface DatabaseListItemProps {
  database: Database;
}

export async function DatabaseListItem({ database }: DatabaseListItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {database.name}
            </h3>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {database.hostname}
              </code>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-4">
          <Suspense
            fallback={
              <div className="animate-pulse bg-gray-200 rounded-full px-3 py-1 text-xs">
                Checking...
              </div>
            }
          >
            <MigrationControls hostname={database.hostname} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
