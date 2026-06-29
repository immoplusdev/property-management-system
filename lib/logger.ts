/**
 * Terminal request/response logger — server-side only.
 * Affiche méthode, path, status, timing, body envoyé et réponse reçue.
 *
 * Format :
 *   →  SRV  POST    /users/send-otp
 *      ↳ body   { "email": "..." }
 *   ✓  SRV  200     POST    /users/send-otp  (143ms)
 *      ↳ resp   { "data": { "success": true, "token": "..." } }
 */

const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  cyan:   "\x1b[36m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  blue:   "\x1b[34m",
  gray:   "\x1b[90m",
  white:  "\x1b[37m",
};

const MAX_BODY_LEN = 2000;

function statusColor(status: number): string {
  if (status < 300) return c.green;
  if (status < 500) return c.yellow;
  return c.red;
}

function pad(method: string): string {
  return method.toUpperCase().padEnd(7);
}

function formatBody(body: unknown): string {
  if (body === undefined || body === null) return "";
  try {
    const s = typeof body === "string" ? body : JSON.stringify(body, null, 2);
    return s.length > MAX_BODY_LEN ? s.slice(0, MAX_BODY_LEN) + `\n${c.gray}… (tronqué)${c.reset}` : s;
  } catch {
    return String(body);
  }
}

function printBody(label: string, body: unknown, labelColor: string): void {
  const formatted = formatBody(body);
  if (!formatted) return;
  // indent each line with 3 spaces
  const indented = formatted
    .split("\n")
    .map((line) => `   ${c.gray}│${c.reset}  ${line}`)
    .join("\n");
  process.stdout.write(
    `   ${labelColor}↳ ${label.padEnd(5)}${c.reset}${c.dim}  ${c.reset}${indented.trimStart()}\n`
  );
}

export interface RequestLog {
  source: "SRV" | "BFF";
  method: string;
  path: string;
  body?: unknown;
}

export function logRequest(
  { source, method, path, body }: RequestLog
): (status?: number, responseBody?: unknown, error?: string) => void {
  const start = Date.now();
  const tag    = source === "SRV"
    ? `${c.blue}${c.bold}SRV${c.reset}`
    : `${c.cyan}${c.bold}BFF${c.reset}`;

  process.stdout.write(
    `\n${c.dim}→${c.reset}  ${tag}  ${c.dim}${pad(method)}${c.reset} ${c.bold}${path}${c.reset}\n`
  );
  if (body !== undefined) printBody("body", body, c.dim);

  return function logResponse(status?: number, responseBody?: unknown, error?: string) {
    const ms      = Date.now() - start;
    const elapsed = `${c.gray}(${ms}ms)${c.reset}`;

    if (status !== undefined) {
      const sc   = statusColor(status);
      const icon = status < 400 ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
      process.stdout.write(
        `${icon}  ${tag}  ${sc}${c.bold}${String(status).padEnd(4)}${c.reset}${c.dim}${pad(method)}${c.reset} ${c.bold}${path}${c.reset}  ${elapsed}\n`
      );
      if (responseBody !== undefined) {
        const bodyColor = status < 400 ? c.green : c.yellow;
        printBody("resp", responseBody, bodyColor);
      }
    } else {
      process.stdout.write(
        `${c.red}✗${c.reset}  ${tag}  ${c.red}${c.bold}ERR ${c.reset}${c.dim}${pad(method)}${c.reset} ${c.bold}${path}${c.reset}  ${elapsed}  ${c.red}${error ?? "network error"}${c.reset}\n`
      );
    }
    process.stdout.write("\n");
  };
}
