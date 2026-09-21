import { Role } from "../types";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { role: Role };
  Reviews: undefined;
  Help: undefined;
};

/**
 * Parcours client. Aucun écran ne mène à un professionnel : la demande part
 * chez LuxuryConnect, qui la transmet et fixe le prix. Seul le service
 * après-vente met le client en relation directe avec l'atelier.
 */
export type ClientStackParamList = {
  ClientTabs: undefined;
  RequestDetail: { requestId: string };
  Chat: { conversationId: string; title: string };
  LeaveReview: { bookingId: string; businessName: string };
  NewSupportTicket: { bookingId: string; businessName: string };
  Payment: { bookingId: string };
  SupportTicket: { ticketId: string };
  Reviews: undefined;
  Help: undefined;
};

export type ClientTabParamList = {
  NewRequest: undefined;
  MyRequests: undefined;
  MyBookings: undefined;
  Support: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type ProStackParamList = {
  ProTabs: undefined;
  QuoteRequestDetail: { quoteRequestId: string };
  Chat: { conversationId: string; title: string };
  SupportTicket: { ticketId: string };
  Help: undefined;
};

export type ProTabParamList = {
  Requests: undefined;
  ProBookings: undefined;
  ProPayments: undefined;
  Support: undefined;
  Messages: undefined;
  ProProfile: undefined;
};
