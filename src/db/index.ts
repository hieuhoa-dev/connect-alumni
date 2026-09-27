// db/index.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle({
  client: pool,
  relations: {
    ...relations,
  },
});
