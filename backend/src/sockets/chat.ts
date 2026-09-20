import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../prisma";

async function isMember(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return false;
  return conversation.participantAId === userId || conversation.participantBId === userId;
}

/**
 * Un fil SAV réunit le client, l'atelier et — s'il a été appelé — l'assistance.
 * C'est la seule discussion où deux utilisateurs non-administrateurs se
 * parlent directement.
 */
async function canJoinTicket(ticketId: string, user: { userId: string; role: string }) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { professional: { select: { userId: true } } },
  });
  if (!ticket) return false;
  if (user.role === "ADMIN") return true;
  return ticket.clientId === user.userId || ticket.professional.userId === user.userId;
}

export function registerChatSockets(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentification requise"));
    try {
      const payload = verifyToken(token);
      (socket.data as any).user = payload;
      next();
    } catch {
      next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket.data as any).user as { userId: string; role: string };

    socket.on("join_conversation", async (conversationId: string) => {
      if (await isMember(conversationId, user.userId)) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("join_support", async (ticketId: string) => {
      if (await canJoinTicket(ticketId, user)) {
        socket.join(`support:${ticketId}`);
      }
    });

    socket.on(
      "send_support_message",
      async ({ ticketId, content }: { ticketId: string; content: string }) => {
        if (!content?.trim()) return;
        if (!(await canJoinTicket(ticketId, user))) return;

        const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
        if (!ticket || ticket.status === "RESOLVED") return;

        const message = await prisma.supportMessage.create({
          data: { ticketId, senderId: user.userId, content: content.trim() },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, role: true } },
          },
        });

        io.to(`support:${ticketId}`).emit("support_message", message);
      },
    );

    socket.on("send_message", async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!content?.trim()) return;
      if (!(await isMember(conversationId, user.userId))) return;

      const message = await prisma.message.create({
        data: { conversationId, senderId: user.userId, content },
      });

      io.to(`conversation:${conversationId}`).emit("new_message", message);
    });
  });
}
