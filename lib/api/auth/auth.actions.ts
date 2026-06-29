"use server";

import { z } from "zod";
import { backendFetch } from "@/lib/api/server/http";
import {
  setSessionCookies,
  clearSessionCookies,
  getRefreshToken,
} from "@/lib/api/server/cookies";
import { env } from "@/lib/config/env";
import { toFormError, type FormError } from "@/lib/api/errors";
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
  type SendOtpInput,
  type VerifyOtpInput,
  type RegisterInput,
  type LoginInput,
} from "./auth.schemas";
import type { WrapperResponseLoginCommandResponseDto } from "@/lib/api/generated/model";
import type { UserDto } from "@/lib/api/generated/model";
import { LoginCommandSource } from "@/lib/api/generated/model";

/**
 * Auth Server Actions — the only place tokens are handled.
 *
 * Flux d'inscription :
 *   1. sendOtp({ email })           → /users/send-otp      → envoie le code par e-mail
 *   2. verifyOtp({ email, otp })    → /users/verify-otp    → retourne un token OTP
 *   3. registerCustomer({ ...form, token }) → /auth/register-customer → session + cookies
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: FormError };

function fromZod(error: z.ZodError): { ok: false; error: FormError } {
  const flat = z.flattenError(error);
  const rawFieldErrors = flat.fieldErrors as Record<string, string[] | undefined>;
  const fieldErrors: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(rawFieldErrors)) {
    if (msgs && msgs.length) fieldErrors[key] = msgs[0]!;
  }
  return {
    ok: false,
    error: {
      message:
        flat.formErrors[0] ?? "Veuillez corriger les champs en surbrillance.",
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    },
  };
}

async function persistSession(
  envelope: WrapperResponseLoginCommandResponseDto,
): Promise<UserDto> {
  const data = envelope.data;
  await setSessionCookies({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expires: data.expires,
  });
  return data.user;
}

/** Étape 1 — envoie un OTP par e-mail via /users/send-otp. */
export async function sendOtp(input: SendOtpInput): Promise<ActionResult> {
  const parsed = sendOtpSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    await backendFetch("/users/send-otp", {
      method: "POST",
      json: { email: parsed.data.email },
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

/**
 * Étape 2 — vérifie le code OTP via /users/verify-otp.
 * Retourne le token à passer à registerCustomer.
 */
export async function verifyOtp(
  input: VerifyOtpInput,
): Promise<ActionResult<{ token: string; email: string }>> {
  const parsed = verifyOtpSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    const res = await backendFetch<{
      data: { success: boolean; token: string; email: string };
    }>("/users/verify-otp", {
      method: "POST",
      json: { email: parsed.data.email, otp: parsed.data.otp },
    });
    if (!res.data.success) {
      return { ok: false, error: { message: "Code OTP invalide ou expiré." } };
    }
    return { ok: true, data: { token: res.data.token, email: res.data.email } };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

/**
 * Étape 3 — inscription finale. `token` vient de verifyOtp.
 * L'API connecte automatiquement l'utilisateur et retourne la session.
 */
export async function registerCustomer(
  input: RegisterInput,
): Promise<ActionResult<UserDto>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    const envelope = await backendFetch<WrapperResponseLoginCommandResponseDto>(
      "/auth/register-customer",
      {
        method: "POST",
        json: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phoneNumber: parsed.data.phoneNumber,
          password: parsed.data.password,
          token: parsed.data.token,
          avatar: "",
        },
      },
    );
    const user = await persistSession(envelope);
    return { ok: true, data: user };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

/** Connexion classique — email + password. */
export async function login(input: LoginInput): Promise<ActionResult<UserDto>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    const envelope = await backendFetch<WrapperResponseLoginCommandResponseDto>(
      "/auth/login",
      {
        method: "POST",
        json: {
          username: parsed.data.email,
          password: parsed.data.password,
          source: env.AUTH_SOURCE as LoginCommandSource,
        },
      },
    );
    const user = await persistSession(envelope);
    return { ok: true, data: user };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

/** Rafraîchit la session via le refresh token. */
export async function refreshSession(): Promise<ActionResult> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken)
    return { ok: false, error: { message: "Session expirée." } };

  try {
    const envelope = await backendFetch<WrapperResponseLoginCommandResponseDto>(
      "/auth/refresh-token",
      { method: "POST", json: { refreshToken } },
    );
    await persistSession(envelope);
    return { ok: true, data: undefined };
  } catch (err) {
    await clearSessionCookies();
    return { ok: false, error: toFormError(err) };
  }
}

/** Déconnexion locale — supprime les cookies de session. */
export async function logout(): Promise<ActionResult> {
  await clearSessionCookies();
  return { ok: true, data: undefined };
}
