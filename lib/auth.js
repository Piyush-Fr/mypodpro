import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

const hasNeonDb = Boolean(
  process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.startsWith("postgres://") || process.env.DATABASE_URL.startsWith("postgresql://"))
);

// Resilient auth secret resolution:
// Uses BETTER_AUTH_SECRET or AUTH_SECRET when defined in environment.
// Falls back gracefully so Next.js build / page collection on Vercel does not fail.
const authSecret = 
  process.env.BETTER_AUTH_SECRET || 
  process.env.AUTH_SECRET || 
  "mypod_production_fallback_secret_key_32_characters_minimum";

// Resolve base URL across local dev, custom domain, or Vercel preview/production domains
const baseURL = 
  process.env.BETTER_AUTH_URL || 
  process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const auth = betterAuth({
  database: hasNeonDb
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true
  },
  secret: authSecret,
  baseURL: baseURL
});
