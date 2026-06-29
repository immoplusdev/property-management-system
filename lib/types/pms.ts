export type RoomStatus = "libre" | "occupee" | "depart" | "menage" | "reservee" | "hs";

export interface Room {
  num: string;
  type: string;
  floor: number;
  status: RoomStatus;
  guest?: string;
  checkout?: string;
  checkin?: string;
}

export interface RoomType {
  code: string;
  name: string;
  price: number;
  color: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checking-out"
  | "completed"
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
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  idType: string;
  idNumber: string;
  stays: number;
  totalSpent: number;
  vip: boolean;
  corporate: string | null;
  lastStay?: string;
  avatar: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  time: string;
  type: string;
  desc: string;
  amount: number;
  method: string;
  status: string;
}

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
  details: string;
  price: number;
  status: string;
  priority: string;
}

export interface RequestType {
  label: string;
  icon: string;
  color: string;
}

export interface ReviewScore {
  cleanliness: number;
  staff: number;
  comfort: number;
  location: number;
  valueForMoney: number;
}

export interface Review {
  id: string;
  date: string;
  guest: string;
  avatar: number;
  country: string;
  roomType: string;
  stays: number;
  overall: number;
  scores: ReviewScore;
  title: string;
  text: string;
  photos: number;
  reply: string | null;
  replyDate: string | null;
  helpful: number;
  verified: boolean;
  needsReply?: boolean;
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

export interface PlanningBooking {
  room: string;
  guest: string;
  start: number;
  end: number;
  status: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}
