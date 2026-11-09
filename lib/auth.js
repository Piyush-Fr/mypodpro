import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

const hasNeonDb = Boolean(
  process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.startsWith("postgres://") || process.env.DATABASE_URL.startsWith("postgresql://"))
);

// Resilient auth secret resolution
const authSecret = 
  process.env.BETTER_AUTH_SECRET || 
  process.env.AUTH_SECRET || 
  "mypod_production_fallback_secret_key_32_characters_minimum";

// Auto-detect environment base URL:
// 1. If running on Railway, auto-adopt Railway's public domain
// 2. If running on Vercel, auto-adopt Vercel's preview or production domain
// 3. Fall back to BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL, or localhost
const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
  : (process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : null);

const vercelUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : null;

const baseURL = 
  railwayUrl || 
  process.env.BETTER_AUTH_URL || 
  vercelUrl || 
  process.env.NEXT_PUBLIC_APP_URL || 
  "http://localhost:3000";

export const auth = betterAuth({
  database: hasNeonDb
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : undefined,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 6
  },
  // Disable strict in-memory rate limiting behind reverse proxies (Railway / Vercel)
  // to prevent shared-bucket false-positive lockouts
  rateLimit: {
    enabled: false
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"]
    }
  },
  secret: authSecret,
  baseURL: baseURL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://*.vercel.app",
    "https://*.up.railway.app",
    "https://*.railway.app",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    railwayUrl,
    vercelUrl
  ].filter(Boolean)
});
