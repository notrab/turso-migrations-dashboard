import { createClient } from "@libsql/client";

export const db = (hostname: string) => {
  const client = createClient({
    url: `libsql://${hostname}`,
    authToken: process.env.TURSO_GROUP_TOKEN as string,
  });

  return client;
};

// You might want to return the `drizzle` client here for the typed UI
// This demo just shows running migrations, not actually using drizzle yet
