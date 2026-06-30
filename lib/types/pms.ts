// ─── Room ─────────────────────────────────────────────────────────────────────

export type RoomStatus =
  | "free"
  | "occupied"
  | "departure"
  | "cleaning"
  | "arriving"
  | "out_of_service";

export interface Room {
  id?: string;
  num: string;
  type: string;
  floor: number;
  status: RoomStatus;
  guest?: string;
  checkout?: string;
  checkin?: string;
  housekeepingStatus?: "clean" | "dirty";
  currentReservation?: {
    id: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    balance?: number;
    status?: string;
  } | null;
}

export interface RoomType {
  id?: string;
  code: string;
  name: string;
  price: number;
  color: string;
}

// ─── Reservation ──────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checking_out"
  | "checked_out"
  | "cancelled";

export interface Booking {
  id: string;
  ref: string;
  guest: string;
  guestId: string;
  room: string;
  roomType: string;
  checkin: string;
  checkout: string;
  nights: number;
  status: BookingStatus;
  amount: number;
  paid: number;
  payment: string;
  source: string;
  adults?: number;
  children?: number;
  balance?: number;
  breakfastIncluded?: boolean;
  specialRequests?: string;
}

// ─── Guest (CRM) ──────────────────────────────────────────────────────────────

export type GuestType = "standard" | "vip" | "corporate";

export interface GuestStay {
  reservationId: string;
  checkInDate: string;
  checkOutDate: string;
  roomTypeName: string;
  totalAmount: number;
  status: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nationality: string;
  type: GuestType;
  totalStays: number;
  totalSpent: number;
  lastStay?: string;
  isBlacklisted: boolean;
  blacklistReason?: string | null;
  corporateName?: string | null;
  notes?: string;
  averageSpendPerStay?: number;
  stayHistory?: GuestStay[];
  // legacy optional fields kept for mock compat
  avatar?: number;
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  time: string;
  type: string;
  desc: string;
  amount: number;
  method: string;
  status: string;
  reference?: string;
  reservationId?: string;
  guestName?: string;
  roomNumber?: string;
  recordedBy?: string;
}

// ─── App interactions ─────────────────────────────────────────────────────────

export interface AppProfile {
  complete: number;
  cniScanned: boolean;
  cniVerified: boolean;
  photoUploaded: boolean;
  preferencesSet: boolean;
  checkInTimePref?: string;
  arrivalMode: string;
  purpose: string;
}

export interface AppRequest {
  id: string;
  time: string;
  room: string;
  guest: string;
  type: string;
  title: string;
  details?: string;
  price: number;
  status: string;
  priority?: string;
  reservationId?: string;
  paymentMethod?: string;
  assignedTo?: string | null;
}

export interface RequestType {
  label: string;
  icon: string;
  color: string;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewScore {
  cleanliness: number;
  staff: number;
  comfort: number;
  location: number;
  valueForMoney: number;
}

export interface ReviewGuest {
  firstName: string;
  lastName: string;
  nationality: string;
}

export interface Review {
  id: string;
  date: string;
  guest: ReviewGuest;
  roomType?: string;
  stays?: number;
  rating: number;
  scores?: ReviewScore;
  title?: string;
  comment: string;
  photos?: number;
  response: string | null;
  responseDate?: string | null;
  helpful?: number;
  verified?: boolean;
  needsReply?: boolean;
  source?: string;
  avatar?: number;
}

export interface ReviewStats {
  overall: number;
  count: number;
  monthCount: number;
  monthAvg: number;
  trend: string;
  distribution: Record<number, number>;
  byCategory: ReviewScore;
  responseRate: number;
  avgResponseTime: string;
}

// ─── Planning ─────────────────────────────────────────────────────────────────

export interface PlanningBooking {
  room: string;
  guest: string;
  start: number;
  end: number;
  status: string;
}

// ─── UI config ────────────────────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}
