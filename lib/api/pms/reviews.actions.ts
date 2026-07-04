"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

/** See dimension.md §12.1. */
export interface ReviewGuest {
  firstName: string;
  lastName: string;
  nationality: string;
}

/** See dimension.md §12.1. */
export interface Review {
  id: string;
  guest: ReviewGuest;
  rating: number;
  comment: string;
  response: string | null;
  source: string;
  createdAt: string;
}

/** See dimension.md §12.1. */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  responseRate: number;
}

export interface ReviewsList {
  stats: ReviewStats;
  data: Review[];
  total: number;
}

/** Response of `POST /pms/reviews/:id/response` — see dimension.md §12.2. */
export interface ReplyToReviewResult {
  success: boolean;
  reviewId: string;
  response: string;
  respondedAt: string;
}

/** Response of `POST /pms/reviews/:id/response/suggest` — kicks off an async BullMQ job, see dimension.md §12.3. The actual suggestion arrives later via the `review.ai_suggestion` WS event. */
export interface SuggestReviewReplyResult {
  success: boolean;
  jobId: string;
  message: string;
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
): Promise<ActionResult<ReplyToReviewResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<ReplyToReviewResult>(`/pms/reviews/${id}/response`, {
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
): Promise<ActionResult<SuggestReviewReplyResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<SuggestReviewReplyResult>(
      `/pms/reviews/${id}/response/suggest`,
      { method: "POST", accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
