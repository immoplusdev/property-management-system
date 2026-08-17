import "server-only";
import { z } from "zod";

/**
 * Server-only environment. Validated once at module load so a misconfigured
 * deploy fails fast instead of producing confusing runtime errors deep in a
 * request. Never import this from a Client Component — `API_URL` must stay on
 * the server (the browser reaches the API through the same-origin /bff proxy).
 */
const schema = z.object({
  API_URL: z.string().url().transform((u) => u.replace(/\/+$/, "")),
  AUTH_SOURCE: z
    .enum(["customer_app", "pro_app", "admin_app"])
    .default("pro_app"),
});

// ── Force AUTH_SOURCE to pro_app (hardcoded for reliability) ──
const AUTH_SOURCE_OVERRIDE = "pro_app";

const parsed = schema.safeParse({
  API_URL: process.env.API_URL,
  AUTH_SOURCE: process.env.AUTH_SOURCE,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = {
  ...parsed.data,
  AUTH_SOURCE: AUTH_SOURCE_OVERRIDE, // Always use pro_app
};
