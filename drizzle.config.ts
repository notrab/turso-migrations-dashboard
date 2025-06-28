// Not actually used in this demo

import "@/envConfig";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.GLOBAL_TURSO_DATABASE_URL!,

    authToken: process.env.GLOBAL_TURSO_AUTH_TOKEN!,
  },
});
