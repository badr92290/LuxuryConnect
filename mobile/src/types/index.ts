export type Role = "CLIENT" | "PROFESSIONAL";

export type ServiceType = "PPF" | "COVERING" | "CERAMIC" | "TINT" | "POLISH";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  PPF: "PPF (Paint Protection Film)",
  COVERING: "Covering",
  CERAMIC: "Protection céramique",
  TINT: "Vitres teintées",
  POLISH: "Lustrage",
};

export type QuoteRequestStatus =
  | "PENDING_REVIEW"
  | "FORWARDED"
  | "QUOTED"
  | "FINALIZED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED";

export const QUOTE_REQUEST_STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  PENDING_REVIEW: "En attente de traitement",
  FORWARDED: "Transmise à des professionnels",
  QUOTED: "Devis reçus",
  FINALIZED: "Offre finale envoyée",
  ACCEPTED: "Réservée",
  DECLINED: "Refusée",
  CANCELLED: "Annulée",
};

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  professionalProfile?: ProfessionalProfile | null;
}

export interface ProfessionalService {
  id: string;
  serviceType: ServiceType;
  priceFrom?: number | null;
  description?: string | null;
}

export interface PortfolioImage {
  id: string;
  imageUrl: string;
  caption?: string | null;
  isBeforeAfter: boolean;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  businessName: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  averageRating: number;
  reviewCount: number;
  services?: ProfessionalService[];
  portfolioImages?: PortfolioImage[];
  user?: { firstName: string; lastName: string; avatarUrl?: string | null; phone?: string | null };
  reviews?: Review[];
  distanceKm?: number;
}

export interface QuoteRequest {
  id: string;
  clientId: string;
  professionalId: string;
  serviceType: ServiceType;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number | null;
  description?: string | null;
  status: QuoteRequestStatus;
  finalPrice?: number | null;
  createdAt: string;
  professional?: { businessName: string };
  client?: { firstName: string; lastName: string; phone?: string | null };
  quotes?: Quote[];
  booking?: Booking | null;
}

export interface Quote {
  id: string;
  quoteRequestId: string;
  professionalId: string;
  price: number;
  message?: string | null;
  status: "PROPOSED" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  createdAt: string;
}

export interface Booking {
  id: string;
  quoteRequestId: string;
  clientId: string;
  professionalId: string;
  price: number;
  scheduledAt: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  professional?: { businessName: string };
  client?: { firstName: string; lastName: string; phone?: string | null };
  quoteRequest?: QuoteRequest;
  review?: Review | null;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  professionalId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  client?: { firstName: string; lastName: string };
}

export interface Conversation {
  id: string;
  clientId: string;
  professionalId: string;
  createdAt: string;
  professional?: { businessName: string };
  client?: { firstName: string; lastName: string };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}
