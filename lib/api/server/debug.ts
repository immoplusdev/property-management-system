import "server-only";
import { env } from "@/lib/config/env";

/**
 * DEBUG ONLY: Log environment variables for troubleshooting.
 * Remove in production.
 */
export function logEnvConfig() {
  console.log("🔍 Environment Configuration:");
  console.log(`  API_URL:      ${env.API_URL}`);
  console.log(`  AUTH_SOURCE:  ${env.AUTH_SOURCE}`);
  console.log(`  NODE_ENV:     ${process.env.NODE_ENV}`);
}
