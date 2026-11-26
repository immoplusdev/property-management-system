"use client";
import { io, type Socket } from "socket.io-client";

/**
 * PMS realtime gateway (Socket.IO).
 *
 * Conforms to the backend contract documented in PMS_WEBSOCKET.md:
 *   - Namespace:  `/pms-ws`
 *   - Auth:       `auth.token` (JWT) + `auth.hotelId`, checked against hotel staff.
 *
 * Singleton so the connection is shared across the whole PMS app.
 */

export interface PmsEventMap {
  "reservation.created": {
    reservationId: string;
    reference: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    immoplusCommission: number;
  };
  "reservation.status_changed": { reservationId: string; status: string; roomId?: string };
  "room.status_changed": { roomId: string; status: string };
  "payment.received": {
    reservationId: string;
    amount: number;
    paymentStatus: "partial" | "paid";
    transactionId: string;
  };
  "checkin.completed": { reservationId: string; roomId: string; guestId: string; checkinId: string };
  "checkout.invoice_ready": {
    reservationId: string;
    roomId: string;
    invoiceId: string;
    totalAmount: number;
    balanceDue: number;
  };
  "request.new": {
    requestId: string;
    roomId: string;
    guestId: string;
    type: string;
    priority: string;
    description: string;
  };
  "request.status_changed": { requestId: string; status: string; handledBy?: string };
  "housekeeping.task_updated": { taskId: string; roomId: string; status: string; assignedTo?: string };
  "export.ready": { jobId: string; kind?: string; url: string | null };
  "review.ai_suggestion": { reviewId: string; suggestion: string };
}

export type PmsEventName = keyof PmsEventMap;

class PmsSocketManager {
  private socket: Socket | null = null;
  private key: string | null = null; // identifies the current (url, hotelId) connection

  /** Open (or reuse) the connection for the given credentials. */
  connect(wsUrl: string, token: string, hotelId: string) {
    const key = `${wsUrl}::${hotelId}`;
    if (this.socket?.connected && this.key === key) return;
    // Different hotel/url or stale socket → tear down first.
    if (this.socket && this.key !== key) this.disconnect();

    this.key = key;
    this.socket = io(`${wsUrl}/pms-ws`, {
      path: "/socket.io",
      auth: { token, hotelId },
      // Polling can send custom headers; websocket uses auth.hotelId.
      extraHeaders: { "x-hotel-id": hotelId },
      query: { hotelId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 30_000,
      reconnectionAttempts: Infinity,
      withCredentials: true,
    });
  }

  on<K extends PmsEventName>(event: K, handler: (data: PmsEventMap[K]) => void) {
    this.socket?.on(event as string, handler as (data: unknown) => void);
  }

  off<K extends PmsEventName>(event: K, handler: (data: PmsEventMap[K]) => void) {
    this.socket?.off(event as string, handler as (data: unknown) => void);
  }

  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.key = null;
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const pmsSocket = new PmsSocketManager();
