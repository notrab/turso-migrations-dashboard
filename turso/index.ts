import { createClient } from "@tursodatabase/api";

export const turso = createClient({
  org: process.env.TURSO_ORG as string,
  token: process.env.TURSO_API_KEY as string,
});
