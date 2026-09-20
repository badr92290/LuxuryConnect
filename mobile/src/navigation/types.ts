import { Role } from "../types";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { role: Role };
  Reviews: undefined;
};

export type ClientStackParamList = {
  ClientTabs: undefined;
  ProfessionalDetail: { professionalId: string };
  QuoteRequestForm: { professionalId: string; businessName: string };
  Chat: { conversationId: string; title: string };
  LeaveReview: { bookingId: string; businessName: string };
  Reviews: undefined;
};

export type ClientTabParamList = {
  Search: undefined;
  MyQuotes: undefined;
  MyBookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type ProStackParamList = {
  ProTabs: undefined;
  QuoteRequestDetail: { quoteRequestId: string };
  Chat: { conversationId: string; title: string };
};

export type ProTabParamList = {
  Requests: undefined;
  ProBookings: undefined;
  Messages: undefined;
  ProProfile: undefined;
};
