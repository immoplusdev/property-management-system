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
  title?: string;
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
  guestId?: string;
}): Promise<ActionResult<ReviewsList>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.minRating !== undefined) qs.set("minRating", String(params.minRating));
    if (params?.needsReply !== undefined) qs.set("needsReply", String(params.needsReply));
    if (params?.guestId) qs.set("guestId", params.guestId);
    const query = qs.toString() ? `?${qs}` : "";
    const response = await backendFetch<unknown>(`/pms/reviews${query}`, { accessToken });
    const raw = response && typeof response === "object" ? response as Record<string, unknown> : {};
    const nested = raw.reviews && typeof raw.reviews === "object" ? raw.reviews as Record<string, unknown> : {};
    const rows = Array.isArray(raw.data) ? raw.data : nested.data;
    if (!Array.isArray(rows)) throw new Error("Réponse API invalide : avis absents.");
    const distribution = raw.distribution && typeof raw.distribution === "object" ? raw.distribution as Record<number, number> : {};
    const data: Review[] = rows.map((item: Record<string, unknown>) => {
      const guest = item.guest && typeof item.guest === "object" ? item.guest as ReviewGuest : { firstName: "Client", lastName: "", nationality: "" };
      const reply = item.response && typeof item.response === "object" ? item.response as Record<string, unknown> : {};
      return {
        id: String(item.id ?? ""), guest,
        rating: Number(item.rating ?? item.globalRating ?? 0),
        comment: String(item.comment ?? item.body ?? ""),
        response: typeof item.response === "string" ? item.response : typeof reply.body === "string" ? reply.body : null,
        source: String(item.source ?? "app"),
        createdAt: String(item.createdAt ?? ""),
        title: typeof item.title === "string" ? item.title : undefined,
      };
    });
    return { ok: true, data: {
      data,
      total: Number(raw.total ?? nested.total ?? data.length),
      stats: {
        averageRating: Number(raw.averageRating ?? raw.globalRating ?? 0),
        totalReviews: Number(raw.totalReviews ?? raw.total ?? nested.total ?? data.length),
        distribution,
        responseRate: Number(raw.responseRate ?? 0),
      },
    } };
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
    const data = await backendFetch<{ jobId: string }>(
      `/pms/reviews/${id}/response/suggest`,
      { method: "POST", accessToken }
    );
    return { ok: true, data: { success: true, jobId: data.jobId, message: "Suggestion en cours de génération." } };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
