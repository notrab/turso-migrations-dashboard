import { turso } from "@/turso";
import { DatabaseListItem } from "./DatabaseListItem";
import { CreateDatabaseForm } from "./CreateDatabaseForm";

export async function Databases() {
  try {
    const databases = await turso.databases.list({
      group: process.env.TURSO_GROUP as string,
    });

    if (databases.length === 0) {
      return (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Databases</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor your database migrations
            </p>
          </div>

          <CreateDatabaseForm />

          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🗄️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No databases found
            </h2>
            <p className="text-gray-600">
              Create your first database above to get started with migrations.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Databases</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your database migrations
          </p>
          <div className="mt-2 text-sm text-gray-500">
            {databases.length} database{databases.length !== 1 ? "s" : ""} found
          </div>
        </div>

        <CreateDatabaseForm />

        <div className="grid gap-4">
          {databases.map((database) => (
            <DatabaseListItem key={database.id} database={database} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Databases</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your database migrations
          </p>
        </div>

        <CreateDatabaseForm />

        <div className="text-center py-12">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load databases
          </h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
          <p className="text-sm text-gray-500">
            Please refresh the page to try again.
          </p>
        </div>
      </div>
    );
  }
}
