"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";
import type { Review, ReviewStats } from "@/lib/types/pms";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface ReviewsList {
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

export async function getReviews(params?: {
  page?: number;
  limit?: number;
  minRating?: number;
  needsReply?: boolean;
}): Promise<ActionResult<ReviewsList>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.minRating !== undefined) qs.set("minRating", String(params.minRating));
    if (params?.needsReply !== undefined) qs.set("needsReply", String(params.needsReply));
    const query = qs.toString() ? `?${qs}` : "";
    const data = await backendFetch<ReviewsList>(`/pms/reviews${query}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function replyToReview(
  id: string,
  response: string
): Promise<ActionResult<Review>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<Review>(`/pms/reviews/${id}/response`, {
      method: "POST",
      json: { body: response },
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function suggestReviewReply(
  id: string
): Promise<ActionResult<{ suggestion: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ suggestion: string }>(
      `/pms/reviews/${id}/response/suggest`,
      { method: "POST", accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
