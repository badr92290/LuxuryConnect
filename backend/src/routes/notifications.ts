import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  const unreadCount = notifications.filter((n) => n.readAt === null).length;
  res.json({ notifications, unreadCount });
});

router.post("/read-all", async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, readAt: null },
    data: { readAt: new Date() },
  });
  res.status(204).end();
});

router.post("/:id/read", async (req: AuthRequest, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id as string } });
  if (!notification || notification.userId !== req.user!.userId) {
    return res.status(404).json({ error: "Notification introuvable" });
  }
  await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
  res.status(204).end();
});

export default router;
