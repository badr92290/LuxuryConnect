import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

async function findOrCreateConversation(userAId: string, userBId: string) {
  const [participantAId, participantBId] = orderedPair(userAId, userBId);
  return prisma.conversation.upsert({
    where: { participantAId_participantBId: { participantAId, participantBId } },
    create: { participantAId, participantBId },
    update: {},
  });
}

// Le client et le professionnel ne discutent qu'avec l'administrateur (intermédiaire).
// L'administrateur peut initier une conversation avec n'importe quel utilisateur.
const createSchema = z.object({ userId: z.string().uuid().optional() });

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (req.user!.role === "ADMIN") {
    if (!parsed.data.userId) return res.status(400).json({ error: "userId est requis" });
    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
    if (!target) return res.status(404).json({ error: "Utilisateur introuvable" });
    const conversation = await findOrCreateConversation(req.user!.userId, target.id);
    return res.status(201).json({ conversation });
  }

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return res.status(500).json({ error: "Aucun administrateur configuré" });
  const conversation = await findOrCreateConversation(req.user!.userId, admin.id);
  res.status(201).json({ conversation });
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: req.user!.userId }, { participantBId: req.user!.userId }] },
    include: {
      participantA: { select: { id: true, firstName: true, lastName: true, role: true } },
      participantB: { select: { id: true, firstName: true, lastName: true, role: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ conversations });
});

async function assertMember(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return null;
  const isMember = conversation.participantAId === userId || conversation.participantBId === userId;
  return isMember ? conversation : null;
}

router.get("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const conversation = await assertMember(req.params.id as string, req.user!.userId);
  if (!conversation) return res.status(404).json({ error: "Conversation introuvable" });

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ messages });
});

const messageSchema = z.object({ content: z.string().min(1) });

router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const conversation = await assertMember(req.params.id as string, req.user!.userId);
  if (!conversation) return res.status(404).json({ error: "Conversation introuvable" });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: req.user!.userId,
      content: parsed.data.content,
    },
  });

  const io = req.app.get("io");
  io?.to(`conversation:${conversation.id}`).emit("new_message", message);

  res.status(201).json({ message });
});

export default router;
