export interface AccountState {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  rccm: string;
  cniUploaded: boolean;
  cgu: boolean;
}

export interface HotelState {
  name: string;
  type: string;
  stars: number;
  address: string;
  commune: string;
  city: string;
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
  coverPhoto: boolean;
  galleryCount: number;
  hasVideo: boolean;
  hasDrone: boolean;
  lat: number;
  lng: number;
}

export interface EquipState {
  wifi: boolean; wifiFree: boolean;
  aircon: boolean; hotWater: boolean;
  security247: boolean; cctv: boolean;
  parking: boolean; parkingCount: number | string;
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
  count: number;
  surface: number | string;
  floors: string;
  bedType: string;
  bedCount: number;
  maxOccupants: number;
  pricePerNight: number;
  priceWeekend: number | string;
  priceLong: number | string;
  breakfast: string;
  photos: number;
  hasVideo: boolean;
  view: string;
  cancelPolicy: string;
  checkin: string;
  checkout: string;
  complete: boolean;
  cover: string;
  isNew?: boolean;
}

export interface ValueAddsState {
  restaurant: { configured: boolean; name?: string; cuisine?: string; priceAvg?: number };
  bar: { configured: boolean; name?: string; type?: string };
  pool: { configured: boolean; type?: string };
  gym: { configured: boolean };
  spa: { configured: boolean };
  conference: { configured: boolean; rooms?: number; capacity?: number };
  outdoor: { configured: boolean };
}

export interface ServicesState {
  transferAirport: boolean; transferPrice: number | string;
  rental: boolean; laundryService: boolean; laundryPrice: number | string;
  babysit: boolean; excursions: boolean; infirmary: boolean;
  exchange: boolean; atm: boolean; shop: boolean; printing: boolean;
}

export interface PricingState {
  payWave: boolean; payOM: boolean; payMTN: boolean;
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

export type UpdateFn = <K extends keyof InscriptionState>(key: K, value: InscriptionState[K]) => void;

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
