import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./relations";

const globalForDb = globalThis as typeof globalThis & { alumniDbPool?: Pool };

const pool =
  globalForDb.alumniDbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.alumniDbPool = pool;

export const db = drizzle({
  client: pool,
  relations: {
    ...relations,
  },
});
