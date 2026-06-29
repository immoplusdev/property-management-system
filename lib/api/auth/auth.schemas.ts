import { z } from "zod";

/**
 * Form-input validation for the auth flow.
 *
 * Intentionally separate from the generated DTOs: the DTOs carry
 * transport-only fields the form never asks for — the actions fill those in.
 */

const email = z
  .string()
  .trim()
  .min(1, "L'adresse e-mail est requise.")
  .email("Adresse e-mail invalide.");

const password = z
  .string()
  .min(12, "12 caractères minimum.")
  .regex(/[A-Z]/, "Au moins une majuscule.")
  .regex(/[a-z]/, "Au moins une minuscule.")
  .regex(/[0-9]/, "Au moins un chiffre.")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial.");

// Format attendu par le backend : chiffres uniquement, ex. 2250123456789
const phoneNumber = z
  .string()
  .trim()
  .min(1, "Le numéro de téléphone est requis.")
  .regex(/^\d{10,15}$/, "Format invalide. Exemple : 2250123456789");

/** Étape 1 — envoi de l'OTP par e-mail (POST /users/send-otp). */
export const sendOtpSchema = z.object({ email });
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

/**
 * Étape 2 — vérification de l'OTP (POST /users/verify-otp).
 * Retourne un token utilisé ensuite pour finaliser l'inscription.
 */
export const verifyOtpSchema = z.object({
  email,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Le code doit contenir 6 chiffres."),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * Étape 3 — inscription finale (POST /auth/register-customer).
 * `token` est le jeton retourné par /users/verify-otp.
 */
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis."),
  lastName: z.string().trim().min(1, "Le nom est requis."),
  email,
  phoneNumber,
  password,
  token: z.string().min(1, "Le jeton de vérification est manquant."),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Connexion classique (POST /auth/login). */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Le mot de passe est requis."),
});
export type LoginInput = z.infer<typeof loginSchema>;
