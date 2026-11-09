import { Pool } from "@neondatabase/serverless";

let pool;

export function getDbPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return null;
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
