/**
 * Shared error model — usable on both server and client.
 *
 * The backend wraps failures in a JSON envelope. We normalise every transport
 * or API failure into a single `ApiError` so callers never branch on fetch
 * internals, and we expose `toFormError` to translate it into something a form
 * can render (a top-level message + optional per-field messages).
 */

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  /** HTTP status (0 = network/transport failure, no response). */
  readonly status: number;
  /** Stable backend error code when provided (e.g. "EMAIL_ALREADY_USED"). */
  readonly code?: string;
  /** Per-field validation messages, when the backend returns them. */
  readonly fieldErrors?: FieldErrors;
  /** Raw parsed body, for logging/debugging. */
  readonly body?: unknown;

  constructor(args: {
    message: string;
    status: number;
    code?: string;
    fieldErrors?: FieldErrors;
    body?: unknown;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
    this.fieldErrors = args.fieldErrors;
    this.body = args.body;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/**
 * Build an ApiError from a non-OK Response, best-effort parsing the backend's
 * error envelope. NestJS commonly returns `{ message, error, statusCode }`,
 * where `message` may be a string or an array of validation strings.
 */
export async function apiErrorFromResponse(res: Response): Promise<ApiError> {
  let body: unknown;
  try {
    const text = await res.text();
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const rawMessage = b.message ?? b.error;

  let message: string;
  let fieldErrors: FieldErrors | undefined;

  if (Array.isArray(rawMessage)) {
    message = rawMessage[0] != null ? String(rawMessage[0]) : "Une erreur est survenue.";
  } else if (typeof rawMessage === "string" && rawMessage.length > 0) {
    message = rawMessage;
  } else {
    message = defaultMessageForStatus(res.status);
  }

  // Some backends return { errors: { field: "msg" } } for validation.
  if (b.errors && typeof b.errors === "object" && !Array.isArray(b.errors)) {
    fieldErrors = Object.fromEntries(
      Object.entries(b.errors as Record<string, unknown>).map(([k, v]) => [
        k,
        Array.isArray(v) ? String(v[0]) : String(v),
      ]),
    );
  }

  return new ApiError({
    message,
    status: res.status,
    code: typeof b.code === "string" ? b.code : undefined,
    fieldErrors,
    body,
  });
}

/** Wrap a thrown transport error (no HTTP response) as a network ApiError. */
export function apiErrorFromThrown(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  return new ApiError({
    message: "Impossible de joindre le serveur. Vérifiez votre connexion.",
    status: 0,
    body: err,
  });
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Requête invalide.";
    case 401:
      return "Identifiants invalides.";
    case 403:
      return "Accès refusé.";
    case 404:
      return "Ressource introuvable.";
    case 409:
      return "Conflit : cette ressource existe déjà.";
    case 422:
      return "Données invalides.";
    case 429:
      return "Trop de tentatives. Réessayez plus tard.";
    default:
      return status >= 500
        ? "Le serveur a rencontré une erreur. Réessayez plus tard."
        : "Une erreur est survenue.";
  }
}

/** Shape consumed by forms/UI. */
export interface FormError {
  message: string;
  fieldErrors?: FieldErrors;
}

export function toFormError(err: unknown): FormError {
  const e = apiErrorFromThrown(err);
  return { message: e.message, fieldErrors: e.fieldErrors };
}
