import { db } from "@/db/client";
import { readdir } from "fs/promises";
import { join } from "path";
import { MigrationButton } from "./MigrationButton";

type MigrationStatusType = "up-to-date" | "pending" | "error" | "unknown";

interface StatusInfo {
  status: MigrationStatusType;
  lastMigration?: string;
  error?: string;
  pendingCount?: number;
}

const getStatusColor = (status: MigrationStatusType) => {
  switch (status) {
    case "up-to-date":
      return "text-green-600 bg-green-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    case "error":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

const getStatusIcon = (status: MigrationStatusType) => {
  switch (status) {
    case "up-to-date":
      return "✅";
    case "pending":
      return "⏳";
    case "error":
      return "❌";
    default:
      return "❓";
  }
};

const getStatusLabel = (status: MigrationStatusType, pendingCount?: number) => {
  switch (status) {
    case "up-to-date":
      return "Up to date";
    case "pending":
      return pendingCount ? `${pendingCount} pending` : "Pending migrations";
    case "error":
      return "Migration error";
    default:
      return "Unknown status";
  }
};

async function getMigrationStatus(hostname: string): Promise<StatusInfo> {
  try {
    const libsql = db(hostname);

    // Get all migration files
    let migrationFiles: string[] = [];
    try {
      const migrationsDir = join(process.cwd(), "migrations");
      const files = await readdir(migrationsDir);
      migrationFiles = files.filter((file) => file.endsWith(".sql")).sort();
    } catch (error) {
      console.warn("Could not read migrations directory:", error);
    }

    // Check if migrations table exists
    const tableExists = await libsql.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='__drizzle_migrations'
    `);

    if (tableExists.rows.length === 0) {
      return {
        status: "pending",
        pendingCount: migrationFiles.length,
      };
    }

    // Get all applied migrations
    const appliedMigrations = await libsql.execute(`
      SELECT hash FROM __drizzle_migrations
      ORDER BY created_at ASC
    `);

    const appliedCount = appliedMigrations.rows.length;
    const totalMigrations = migrationFiles.length;
    const pendingCount = Math.max(0, totalMigrations - appliedCount);

    // Get the latest migration info
    const latestMigration = await libsql.execute(`
      SELECT * FROM __drizzle_migrations
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (pendingCount > 0) {
      return {
        status: "pending",
        pendingCount,
        lastMigration:
          latestMigration.rows.length > 0
            ? (latestMigration.rows[0].created_at as string)
            : undefined,
      };
    }

    return {
      status: "up-to-date",
      lastMigration:
        latestMigration.rows.length > 0
          ? (latestMigration.rows[0].created_at as string)
          : undefined,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function MigrationControls({ hostname }: { hostname: string }) {
  const statusInfo = await getMigrationStatus(hostname);
  const { status, lastMigration, error, pendingCount } = statusInfo;

  const shouldDisableButton = status === "up-to-date" || status === "error";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
        >
          <span className="mr-1">{getStatusIcon(status)}</span>
          {getStatusLabel(status, pendingCount)}
        </span>
        {lastMigration && (
          <span className="text-xs text-gray-500">
            Last: {new Date(lastMigration).toLocaleDateString()}
          </span>
        )}
        {error && (
          <span className="text-xs text-red-500" title={error}>
            Error occurred
          </span>
        )}
      </div>

      <MigrationButton
        hostname={hostname}
        disabled={shouldDisableButton}
        pendingCount={pendingCount}
      />
    </div>
  );
}
