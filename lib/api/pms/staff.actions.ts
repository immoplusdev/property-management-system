"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken, setHotelId } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export type StaffRole = "director" | "receptionist" | "housekeeper";

export interface StaffMember {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  role: StaffRole;
  invitedAt: string;
  status: "active" | "pending" | "revoked";
}

export interface StaffList {
  staff: StaffMember[];
}

export interface StaffInvitationPreview {
  email: string;
  role: StaffRole;
  hotelName: string;
  expiresAt: string;
}

export async function getStaffInvitation(token: string): Promise<ActionResult<StaffInvitationPreview>> {
  try {
    const data = await backendFetch<StaffInvitationPreview>(`/pms/staff/invitations/${encodeURIComponent(token)}`);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function acceptStaffInvitation(token: string): Promise<ActionResult<{ success: boolean; hotelId: string; role: StaffRole }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Connectez-vous avec l'adresse invitée." } };
  try {
    const data = await backendFetch<{ success: boolean; hotelId: string; role: StaffRole }>(
      `/pms/staff/invitations/${encodeURIComponent(token)}/accept`, { method: "POST", accessToken },
    );
    await setHotelId(data.hotelId);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getStaff(): Promise<ActionResult<StaffList>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<StaffList>("/pms/staff", { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function inviteStaff(payload: {
  email: string;
  role: StaffRole;
}): Promise<ActionResult<{ success: boolean; invitationId: string; email: string; role: StaffRole; message: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ success: boolean; invitationId: string; email: string; role: StaffRole; message: string }>(
      "/pms/staff/invite",
      { method: "POST", json: payload, accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function revokeStaff(
  id: string
): Promise<ActionResult<{ success: boolean; staffId: string; revokedAt: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ success: boolean; staffId: string; revokedAt: string }>(
      `/pms/staff/${id}`,
      { method: "DELETE", accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
