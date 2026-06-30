"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pmsSocket, type PmsEventMap } from "@/lib/sockets/pmsSocket";
import { getPmsRealtimeCredentials } from "@/lib/api/pms/realtime.actions";
import { reservationKeys } from "./useReservations";
import { roomKeys }        from "./useRooms";
import { requestKeys }     from "./useRequests";
import { dashboardKeys }   from "./useDashboard";
import { reviewKeys }      from "./useReviews";
import { checkoutKeys }    from "./useCheckOut";
import { financeKeys }     from "./useFinances";

/**
 * Mount once at the PMS layout level (PMSApp).
 *
 * Fetches the realtime credentials from a Server Action (the access token lives
 * in an httpOnly cookie, so it can only be read server-side), opens the Socket.IO
 * connection, and invalidates the matching TanStack Query caches when the backend
 * pushes an event. Cleans up on unmount.
 *
 * Query keys below MUST match the ones declared in each module hook — these are
 * the real keys (`["reservations"]`, `["rooms"]`, …), not the illustrative
 * `["pms", …]` keys from the documentation.
 */
export function usePmsSocket() {
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    type Handler<K extends keyof PmsEventMap> = (data: PmsEventMap[K]) => void;
    const bound: Array<[keyof PmsEventMap, Handler<keyof PmsEventMap>]> = [];

    const sub = <K extends keyof PmsEventMap>(event: K, handler: Handler<K>) => {
      pmsSocket.on(event, handler);
      bound.push([event, handler as Handler<keyof PmsEventMap>]);
    };

    (async () => {
      const res = await getPmsRealtimeCredentials();
      if (cancelled || !res.ok) return;

      const { wsUrl, token, hotelId } = res.data;
      pmsSocket.connect(wsUrl, token, hotelId);

      // ── Réservations ─────────────────────────────────────────────
      sub("reservation.created", () => {
        qc.invalidateQueries({ queryKey: reservationKeys.all() });
        qc.invalidateQueries({ queryKey: ["planning"] });
        qc.invalidateQueries({ queryKey: dashboardKeys.all() });
      });
      sub("reservation.status_changed", ({ reservationId }) => {
        qc.invalidateQueries({ queryKey: reservationKeys.all() });
        qc.invalidateQueries({ queryKey: reservationKeys.detail(reservationId) });
        qc.invalidateQueries({ queryKey: ["planning"] });
        qc.invalidateQueries({ queryKey: dashboardKeys.all() });
      });

      // ── Chambres & housekeeping ──────────────────────────────────
      sub("room.status_changed", ({ roomId }) => {
        qc.invalidateQueries({ queryKey: roomKeys.all() });
        qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
        qc.invalidateQueries({ queryKey: dashboardKeys.rooms() });
        qc.invalidateQueries({ queryKey: ["planning"] });
      });
      sub("housekeeping.task_updated", ({ roomId }) => {
        qc.invalidateQueries({ queryKey: roomKeys.housekeeping() });
        qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
      });

      // ── Paiements ────────────────────────────────────────────────
      sub("payment.received", ({ reservationId }) => {
        qc.invalidateQueries({ queryKey: reservationKeys.detail(reservationId) });
        qc.invalidateQueries({ queryKey: reservationKeys.all() });
        qc.invalidateQueries({ queryKey: financeKeys.summary() });
        qc.invalidateQueries({ queryKey: ["finances"] });
      });

      // ── Check-in / Check-out ─────────────────────────────────────
      sub("checkin.completed", () => {
        qc.invalidateQueries({ queryKey: reservationKeys.all() });
        qc.invalidateQueries({ queryKey: roomKeys.all() });
        qc.invalidateQueries({ queryKey: dashboardKeys.all() });
      });
      sub("checkout.invoice_ready", ({ reservationId }) => {
        qc.invalidateQueries({ queryKey: checkoutKeys.invoice(reservationId) });
        qc.invalidateQueries({ queryKey: reservationKeys.all() });
        qc.invalidateQueries({ queryKey: roomKeys.all() });
        qc.invalidateQueries({ queryKey: ["finances"] });
        qc.invalidateQueries({ queryKey: dashboardKeys.all() });
      });

      // ── Demandes clients ─────────────────────────────────────────
      sub("request.new", () => {
        qc.invalidateQueries({ queryKey: requestKeys.all() });
        qc.invalidateQueries({ queryKey: dashboardKeys.all() });
      });
      sub("request.status_changed", () => {
        qc.invalidateQueries({ queryKey: requestKeys.all() });
        qc.invalidateQueries({ queryKey: dashboardKeys.all() });
      });

      // ── Avis (suggestion IA async) ───────────────────────────────
      sub("review.ai_suggestion", () => {
        qc.invalidateQueries({ queryKey: reviewKeys.all() });
      });
    })();

    return () => {
      cancelled = true;
      for (const [event, handler] of bound) pmsSocket.off(event, handler);
      pmsSocket.disconnect();
    };
  }, [qc]);
}
