import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth";
import professionalRoutes from "./routes/professionals";
import quoteRequestRoutes from "./routes/quoteRequests";
import bookingRoutes from "./routes/bookings";
import reviewRoutes from "./routes/reviews";
import conversationRoutes from "./routes/conversations";
import adminRoutes from "./routes/admin";
import vehicleRoutes from "./routes/vehicles";
import notificationRoutes from "./routes/notifications";
import contactRoutes from "./routes/contact";
import supportRoutes from "./routes/support";
import paymentRoutes from "./routes/payments";
import stripeWebhookRoutes from "./routes/stripeWebhook";
import { registerChatSockets } from "./sockets/chat";
import { UPLOAD_DIR } from "./utils/uploads";
import { startReminderJob } from "./jobs/reminders";
import { allowedOrigins, apiLimiter, forceHttps } from "./middleware/security";

const app = express();
const httpServer = createServer(app);

const origins = allowedOrigins();
const corsOptions = origins ? { origin: origins, credentials: true } : { origin: "*" };

const io = new Server(httpServer, { cors: corsOptions });

app.set("io", io);

// Railway, Fly et consorts placent l'API derrière un proxy : sans cela,
// `req.protocol` et l'IP client (utile au rate limiting) sont faux.
app.set("trust proxy", 1);

app.use(forceHttps);
app.use(
  helmet({
    // L'API ne sert pas de pages HTML ; la CSP est posée par l'hébergeur du site.
    contentSecurityPolicy: false,
    // Les photos d'ateliers sont servies à un front hébergé sur un autre domaine.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Six mois, sous-domaines compris : le navigateur refusera le HTTP ensuite.
    hsts: { maxAge: 15552000, includeSubDomains: true },
  }),
);
app.use(cors(corsOptions));
app.use(apiLimiter);

// Monté avant `express.json` : la signature d'un webhook Stripe porte sur les
// octets bruts, qu'un parseur JSON réécrirait.
app.use("/stripe/webhook", stripeWebhookRoutes);
// Les photos de véhicules arrivent en data URL dans le corps JSON.
app.use(express.json({ limit: "12mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/professionals", professionalRoutes);
app.use("/quote-requests", quoteRequestRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/conversations", conversationRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/notifications", notificationRoutes);
app.use("/contact", contactRoutes);
app.use("/support", supportRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

registerChatSockets(io);
startReminderJob();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
httpServer.listen(PORT, () => {
  console.log(`API en écoute sur le port ${PORT}`);
});
