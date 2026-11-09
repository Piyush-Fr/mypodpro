import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

const hasNeonDb = Boolean(
  process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.startsWith("postgres://") || process.env.DATABASE_URL.startsWith("postgresql://"))
);

// Require BETTER_AUTH_SECRET in production to protect session tokens against forgery
const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL SECURITY ERROR: BETTER_AUTH_SECRET environment variable is missing in production.");
}

export const auth = betterAuth({
  database: hasNeonDb
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true
  },
  secret: authSecret || "mypod_local_development_secret_key_change_in_production_min32chars",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
});
