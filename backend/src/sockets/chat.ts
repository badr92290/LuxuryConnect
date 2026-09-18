import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../prisma";

async function isMember(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return false;
  return conversation.participantAId === userId || conversation.participantBId === userId;
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
