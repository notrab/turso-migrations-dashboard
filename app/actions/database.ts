"use server";

import { turso } from "@/turso";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";

export type CreateDatabaseState = {
  error?: string;
  success?: boolean;
  databaseName?: string;
  migrationStatus?: string;
};

export async function createDatabaseAction(
  prevState: CreateDatabaseState,
  formData: FormData,
): Promise<CreateDatabaseState> {
  const databaseName = formData.get("databaseName") as string;

  if (!databaseName) {
    return { success: false, error: "Database name is required" };
  }

  // Sanitize database name (lowercase, alphanumeric, hyphens, underscores only)
  const sanitizedName = databaseName.toLowerCase().replace(/[^a-z0-9-_]/g, "");

  if (sanitizedName !== databaseName.toLowerCase()) {
    return {
      databaseName,
      success: false,
      error:
        "Database name can only contain lowercase letters, numbers, hyphens, and underscores.",
    };
  }

  if (sanitizedName.length < 3) {
    return {
      databaseName,
      success: false,
      error: "Database name must be at least 3 characters long.",
    };
  }

  try {
    // Check if database already exists
    const existingDatabases = await turso.databases.list({
      group: process.env.TURSO_GROUP as string,
    });

    const exists = existingDatabases.some((db) => db.name === sanitizedName);

    if (exists) {
      return {
        databaseName,
        success: false,
        error: "A database with this name already exists.",
      };
    }

    // Create the database
    await turso.databases.create(sanitizedName, {
      group: process.env.TURSO_GROUP as string,
    });

    // Get the database details to obtain the hostname
    const databaseDetails = await turso.databases.get(sanitizedName);
    const hostname = databaseDetails.hostname;

    // Run migrations on the newly created database
    // Send this to a background worker
    // inngest/create-database
    let migrationStatus = "✅ Migrations applied successfully";
    try {
      const client = db(hostname);
      const drizzleDb = drizzle(client);

      // Run migrations
      await migrate(drizzleDb, { migrationsFolder: "./migrations" });
      console.log(
        `Migrations completed successfully for database: ${sanitizedName}`,
      );
    } catch (migrationError) {
      console.warn("Failed to run migrations on new database:", migrationError);
      migrationStatus = `⚠️ Database created but migrations failed: ${
        migrationError instanceof Error
          ? migrationError.message
          : "Unknown error"
      }. You can run migrations manually using the button.`;
    }

    // Revalidate the page to show the new database
    // Improve this with optimistic ui
    revalidatePath("/");

    return {
      success: true,
      databaseName: sanitizedName,
      migrationStatus,
    };
  } catch (error) {
    console.error("Failed to create database:", error);

    return {
      databaseName,
      success: false,
      error:
        error instanceof Error
          ? `Failed to create database: ${error.message}`
          : "An unexpected error occurred while creating the database.",
    };
  }
}

export type RunMigrationsState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function runMigrationsAction(
  prevState: RunMigrationsState,
  formData: FormData,
): Promise<RunMigrationsState> {
  const hostname = formData.get("hostname") as string;

  if (!hostname) {
    return { success: false, error: "Database hostname is required" };
  }

  try {
    // Create database client
    const client = db(hostname);
    const drizzleDb = drizzle(client);

    // Run migrations
    // Put in background job
    await migrate(drizzleDb, { migrationsFolder: "./migrations" });

    // Revalidate the page to update migration status
    revalidatePath("/");

    return {
      success: true,
      message: "Migrations completed successfully",
    };
  } catch (error) {
    console.error("Failed to run migrations:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? `Failed to run migrations: ${error.message}`
          : "An unexpected error occurred while running migrations.",
    };
  }
}
