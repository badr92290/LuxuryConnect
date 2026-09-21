/** Rôles proposés à l'inscription depuis l'application. */
export type Role = "CLIENT" | "PROFESSIONAL";

/** Rôle porté par un compte, y compris celui de l'intermédiaire. */
export type AccountRole = Role | "ADMIN";

export type ServiceType =
  | "PPF_SATIN"
  | "PPF_COLORED"
  | "PPF_GLOSS"
  | "COVERING"
  | "CERAMIC"
  | "TINT"
  // Valeurs historiques : plus proposées, conservées pour l'affichage des
  // demandes déjà enregistrées.
  | "PPF"
  | "POLISH";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  PPF_SATIN: "PPF satin",
  PPF_COLORED: "PPF coloré",
  PPF_GLOSS: "PPF brillant",
  COVERING: "Covering",
  CERAMIC: "Céramique",
  TINT: "Vitres teintées",
  PPF: "PPF",
  POLISH: "Lustrage",
};

/** Prestations réellement proposées aujourd'hui, dans l'ordre d'affichage. */
export const OFFERED_SERVICES: ServiceType[] = [
  "PPF_SATIN",
  "PPF_COLORED",
  "PPF_GLOSS",
  "COVERING",
  "CERAMIC",
  "TINT",
];

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
  city?: string | null;
  status: QuoteRequestStatus;
  // Fixés par LuxuryConnect au moment de transmettre l'offre au client.
  finalPrice?: number | null;
  finalMessage?: string | null;
  selectedProfessional?: {
    businessName: string;
    city?: string | null;
    isInsured?: boolean;
    isCertified?: boolean;
    yearsExperience?: number | null;
  } | null;
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

/**
 * Conversation à deux. Hors service après-vente, l'un des participants est
 * toujours LuxuryConnect : le client et l'atelier ne se parlent pas ici.
 */
export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  role: AccountRole;
}

export interface Conversation {
  id: string;
  participantAId: string;
  participantBId: string;
  participantA?: ConversationParticipant;
  participantB?: ConversationParticipant;
  createdAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

// ── Service après-vente ──────────────────────────────────────────────────
// Seule partie du service où le client et l'atelier se parlent directement.

export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED";
export type SupportTicketReason = "DEFECT" | "WARRANTY" | "APPOINTMENT" | "INVOICE" | "OTHER";

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  OPEN: "En attente de l'atelier",
  IN_PROGRESS: "Échange en cours",
  ESCALATED: "Assistance saisie",
  RESOLVED: "Réglé",
};

export const SUPPORT_REASON_LABELS: Record<SupportTicketReason, string> = {
  DEFECT: "Défaut constaté",
  WARRANTY: "Garantie",
  APPOINTMENT: "Rendez-vous ou retouche",
  INVOICE: "Facture",
  OTHER: "Autre",
};

export const SUPPORT_REASONS: SupportTicketReason[] = [
  "DEFECT",
  "WARRANTY",
  "APPOINTMENT",
  "INVOICE",
  "OTHER",
];

export interface SupportMessage {
  id: string;
  content: string;
  isSystem: boolean;
  createdAt: string;
  senderId: string;
  sender?: { id: string; firstName: string; lastName: string; role: AccountRole };
}

export interface SupportTicket {
  id: string;
  bookingId: string;
  clientId: string;
  professionalId: string;
  reason: SupportTicketReason;
  subject: string;
  status: SupportTicketStatus;
  escalatedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    price: number;
    scheduledAt: string;
    quoteRequest: {
      serviceType: ServiceType;
      vehicleMake: string;
      vehicleModel: string;
      vehicleYear?: number | null;
    };
  };
  client: { id: string; firstName: string; lastName: string; phone?: string | null; email: string };
  professional: {
    id: string;
    businessName: string;
    city?: string | null;
    address?: string | null;
    user: { id: string; firstName: string; lastName: string; phone?: string | null };
  };
  photos: { id: string; imageUrl: string }[];
  messages: SupportMessage[];
}
