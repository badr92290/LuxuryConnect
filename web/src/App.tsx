import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CookieBanner } from "./components/CookieBanner";
import { ScrollToTop } from "./components/ScrollToTop";
import { AppShell, NavItem } from "./layout/AppShell";

import WelcomePage from "./pages/auth/WelcomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import NewRequestPage from "./pages/client/NewRequestPage";
import MyRequestsPage from "./pages/client/MyRequestsPage";
import RequestDetailPage from "./pages/client/RequestDetailPage";
import BookingsPage from "./pages/client/BookingsPage";
import GaragePage from "./pages/client/GaragePage";
import LeaveReviewPage from "./pages/client/LeaveReviewPage";
import ProfilePage from "./pages/client/ProfilePage";

import ProRequestsPage from "./pages/pro/RequestsPage";
import ProRequestDetailPage from "./pages/pro/RequestDetailPage";
import ProBookingsPage from "./pages/pro/BookingsPage";
import ProfileEditPage from "./pages/pro/ProfileEditPage";

import DashboardPage from "./pages/admin/DashboardPage";
import QueuePage from "./pages/admin/QueuePage";
import AdminRequestDetailPage from "./pages/admin/RequestDetailPage";
import AdminBookingsPage from "./pages/admin/BookingsPage";
import AgendaPage from "./pages/admin/AgendaPage";
import AdminReviewsPage from "./pages/admin/ReviewsPage";
import AdminLeadsPage from "./pages/admin/LeadsPage";
import AdminPaymentsPage from "./pages/admin/PaymentsPage";
import ProPaymentsPage from "./pages/pro/PaymentsPage";
import PaymentPage from "./pages/client/PaymentPage";

import PrivacyPage from "./pages/public/PrivacyPage";
import TermsPage from "./pages/public/TermsPage";
import ContactPage from "./pages/public/ContactPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import HelpPage from "./pages/public/HelpPage";

import SupportListPage from "./pages/shared/SupportListPage";
import SupportTicketPage from "./pages/shared/SupportTicketPage";
import NewSupportTicketPage from "./pages/client/NewSupportTicketPage";

import MessagesPage from "./pages/shared/MessagesPage";
import ChatPage from "./pages/shared/ChatPage";

import { IconPlus, IconList, IconCalendar, IconMessage, IconUser, IconInbox, IconContacts, IconChart, IconCar, IconStar, IconMail, IconLifebuoy, IconCard } from "./components/icons";

const CLIENT_NAV: NavItem[] = [
  { to: "/app/requests/new", label: "Nouvelle demande", icon: IconPlus },
  { to: "/app/requests", label: "Mes demandes", icon: IconList },
  { to: "/app/garage", label: "Mon garage", icon: IconCar },
  { to: "/app/bookings", label: "Réservations", icon: IconCalendar },
  { to: "/app/sav", label: "Service après-vente", icon: IconLifebuoy },
  { to: "/app/messages", label: "Messages", icon: IconMessage },
  { to: "/app/profile", label: "Profil", icon: IconUser },
];

const PRO_NAV: NavItem[] = [
  { to: "/pro/requests", label: "Demandes", icon: IconList },
  { to: "/pro/bookings", label: "Réservations", icon: IconCalendar },
  { to: "/pro/sav", label: "Service après-vente", icon: IconLifebuoy },
  { to: "/pro/paiements", label: "Mes paiements", icon: IconCard },
  { to: "/pro/messages", label: "Messages", icon: IconMessage },
  { to: "/pro/profile", label: "Profil", icon: IconUser },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Tableau de bord", icon: IconChart, end: true },
  { to: "/admin/queue", label: "File d'attente", icon: IconInbox },
  { to: "/admin/leads", label: "Demandes du site", icon: IconMail },
  { to: "/admin/agenda", label: "Agenda", icon: IconContacts },
  { to: "/admin/bookings", label: "Réservations", icon: IconCalendar },
  { to: "/admin/reviews", label: "Avis clients", icon: IconStar },
  { to: "/admin/sav", label: "Assistance SAV", icon: IconLifebuoy },
  { to: "/admin/paiements", label: "Paiements", icon: IconCard },
  { to: "/admin/messages", label: "Messages", icon: IconMessage },
];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

function RequireRole({ role, children }: { role: "CLIENT" | "PROFESSIONAL" | "ADMIN"; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    const home = user.role === "ADMIN" ? "/admin" : user.role === "PROFESSIONAL" ? "/pro" : "/app";
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    const home = user.role === "ADMIN" ? "/admin" : user.role === "PROFESSIONAL" ? "/pro" : "/app";
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicOnly><WelcomePage /></PublicOnly>} />
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

      {/* Pages publiques accessibles connecté comme déconnecté. */}
      <Route path="/assistance" element={<HelpPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/cgu" element={<TermsPage />} />
      <Route path="/confidentialite" element={<PrivacyPage />} />

      <Route
        path="/app"
        element={
          <RequireRole role="CLIENT">
            <AppShell navItems={CLIENT_NAV} title="Espace client" />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="requests" replace />} />
        <Route path="requests/new" element={<NewRequestPage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="requests/:requestId" element={<RequestDetailPage />} />
        <Route path="garage" element={<GaragePage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:bookingId/review" element={<LeaveReviewPage />} />
        <Route path="bookings/:bookingId/sav" element={<NewSupportTicketPage />} />
        <Route path="bookings/:bookingId/paiement" element={<PaymentPage />} />
        <Route path="sav" element={<SupportListPage basePath="/app" />} />
        <Route path="sav/:ticketId" element={<SupportTicketPage basePath="/app" />} />
        <Route path="messages" element={<MessagesPage basePath="/app" />} />
        <Route path="messages/:conversationId" element={<ChatPage basePath="/app" />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/pro"
        element={
          <RequireRole role="PROFESSIONAL">
            <AppShell navItems={PRO_NAV} title="Espace professionnel" />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="requests" replace />} />
        <Route path="requests" element={<ProRequestsPage />} />
        <Route path="requests/:requestId" element={<ProRequestDetailPage />} />
        <Route path="bookings" element={<ProBookingsPage />} />
        <Route path="sav" element={<SupportListPage basePath="/pro" />} />
        <Route path="sav/:ticketId" element={<SupportTicketPage basePath="/pro" />} />
        <Route path="paiements" element={<ProPaymentsPage />} />
        <Route path="messages" element={<MessagesPage basePath="/pro" />} />
        <Route path="messages/:conversationId" element={<ChatPage basePath="/pro" />} />
        <Route path="profile" element={<ProfileEditPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole role="ADMIN">
            <AppShell navItems={ADMIN_NAV} title="Administration" />
          </RequireRole>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="requests/:requestId" element={<AdminRequestDetailPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="leads" element={<AdminLeadsPage />} />
        <Route path="sav" element={<SupportListPage basePath="/admin" />} />
        <Route path="sav/:ticketId" element={<SupportTicketPage basePath="/admin" />} />
        <Route path="paiements" element={<AdminPaymentsPage />} />
        <Route path="messages" element={<MessagesPage basePath="/admin" />} />
        <Route path="messages/:conversationId" element={<ChatPage basePath="/admin" />} />
      </Route>

      {/* Une adresse inconnue mérite une explication, pas une redirection muette. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <AppRoutes />
          <CookieBanner />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
