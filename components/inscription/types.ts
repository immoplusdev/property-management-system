export interface AccountState {
  fullName: string;
  phone: string;
  email: string;
  rccm: string;
  idCardFrontFileId: string | null;
  idCardBackFileId: string | null;
  acceptedTerms: boolean;
}

export interface HotelState {
  name: string;
  type: string;
  stars: number;
  address: string;
  villeId: string | null;
  villeName: string;
  communeId: string | null;
  communeName: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  yearOpened: string;
  capacity: number | string;
  languages: string[];
  shortDesc: string;
  longDesc: string;
  strengths: string[];
  coverFileId: string | null;
  galleryFileIds: string[];
  videoFileId: string | null;
  droneVideoFileId: string | null;
  lat: number;
  lng: number;
}

export interface EquipState {
  wifi: boolean; wifiFree: boolean;
  aircon: boolean; hotWater: boolean;
  security247: boolean; cctv: boolean;
  parking: boolean;
  safe: boolean; accessBadge: boolean;
  reception247: boolean; laundry: boolean;
  shuttle: boolean; carRental: boolean;
  concierge: boolean; roomService: boolean;
  breakfastInRoom: boolean; dailyCleaning: boolean;
  pool: boolean; gym: boolean; spa: boolean;
  sports: boolean; kids: boolean; garden: boolean;
  conference: boolean; coworking: boolean;
  printer: boolean; secretariat: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  totalRooms: number;
  surface: number | string;
  bedType: string;
  bedCount: number;
  maxOccupancy: number;
  basePrice: number;
  weekendPrice: number | string;
  longStayPrice: number | string;
  breakfastOption: "included" | "available" | "not_available";
  imageIds: string[];
  amenities: string[];
  complete: boolean;
  isNew?: boolean;
}

export type SpaceKey = "restaurant" | "bar" | "pool" | "gym" | "spa" | "conference" | "outdoor";

interface ValueAddBase {
  configured: boolean;
  isOpenToPublic: boolean;
  imageIds: string[];
}

export interface CustomSpace {
  id: string;
  title: string;
  description: string;
  icon: string;
  isOpenToPublic: boolean;
  imageIds: string[];
}

export interface ValueAddsState {
  restaurant: ValueAddBase & { name?: string; cuisine?: string; priceAvg?: number; capacity?: string };
  bar:        ValueAddBase & { name?: string; type?: string };
  pool:       ValueAddBase & { type?: string; depth?: number };
  gym:        ValueAddBase & { description?: string; hours?: string };
  spa:        ValueAddBase & { description?: string; hours?: string };
  conference: ValueAddBase & { rooms?: number; capacity?: number; description?: string; hours?: string };
  outdoor:    ValueAddBase & { description?: string; hours?: string };
  customSpaces: CustomSpace[];
}

export interface ServicesState {
  transferAirport: boolean; transferPrice: number | string;
  rental: boolean; laundryService: boolean; laundryPrice: number | string;
  babysit: boolean; excursions: boolean; infirmary: boolean;
  exchange: boolean; atm: boolean; shop: boolean; printing: boolean;
}

export interface PricingState {
  payWave: boolean; payOM: boolean;
  payCard: boolean; payCash: boolean;
  depositRequired: boolean;
  depositPct: number;
  cancelPolicy: string;
  kidsFree: number | string;
  cribAvailable: boolean;
  cribPaid: boolean;
  pets: boolean;
  smoking: string;
  cityTax: number | string;
  earlyCheckin: string;
  lateCheckout: string;
}

export interface InscriptionState {
  account: AccountState;
  hotel: HotelState;
  equip: EquipState;
  roomTypes: RoomType[];
  valueAdds: ValueAddsState;
  services: ServicesState;
  pricing: PricingState;
}

export type UpdateFn = <K extends keyof InscriptionState>(
  key: K,
  value: InscriptionState[K] | ((prev: InscriptionState[K]) => InscriptionState[K]),
) => void;

export interface StepProps {
  state: InscriptionState;
  update: UpdateFn;
  completion?: number;
  goTo?: (step: number) => void;
}

export interface StepDef {
  id: number;
  title: string;
  sub: string;
  icon: string;
}
