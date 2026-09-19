import "dotenv/config";
import express from "express";
import cors from "cors";
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
import { registerChatSockets } from "./sockets/chat";
import { UPLOAD_DIR } from "./utils/uploads";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.set("io", io);

app.use(cors());
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
app.use("/admin", adminRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

registerChatSockets(io);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
httpServer.listen(PORT, () => {
  console.log(`API en écoute sur le port ${PORT}`);
});
