import { NotificationType } from "@prisma/client";
import { prisma } from "../prisma";

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

export async function notify({ userId, type, title, body, link }: NotifyInput) {
  return prisma.notification.create({ data: { userId, type, title, body, link } });
}

/** Notifie tous les comptes administrateurs (l'intermédiaire). */
export async function notifyAdmins(input: Omit<NotifyInput, "userId">) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await prisma.notification.createMany({
    data: admins.map((a) => ({ ...input, userId: a.id })),
  });
}
