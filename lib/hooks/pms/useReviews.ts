"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReviews,
  replyToReview,
  suggestReviewReply,
} from "@/lib/api/pms/reviews.actions";

export const reviewKeys = {
  all:        () => ["reviews"] as const,
  list:       (params?: object) => ["reviews", "list", params] as const,
  suggestion: (reviewId: string) => ["reviews", "suggestion", reviewId] as const,
};

export function useReviews(params?: { page?: number; limit?: number; minRating?: number; needsReply?: boolean }) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: async () => {
      const res = await getReviews(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 120_000,
  });
}

export function useReplyToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      replyToReview(id, response).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.all() });
    },
  });
}

export function useSuggestReviewReply() {
  return useMutation({
    mutationFn: (id: string) =>
      suggestReviewReply(id).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
  });
}

/**
 * Reads the AI-generated reply suggestion for a review, delivered asynchronously
 * via the `review.ai_suggestion` WS event (see usePmsSocket.ts) into this same
 * cache entry. Returns `null` until the event arrives.
 */
export function useReviewSuggestion(reviewId: string) {
  return useQuery({
    queryKey: reviewKeys.suggestion(reviewId),
    queryFn: () => null as string | null,
    initialData: null,
    staleTime: Infinity,
    enabled: false,
  });
}
