import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { notifyAdmins } from "../utils/notify";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  if (req.user!.role === "CLIENT") {
    const bookings = await prisma.booking.findMany({
      where: { clientId: req.user!.userId },
      include: {
        professional: { select: { businessName: true } },
        quoteRequest: true,
        review: true,
      },
      orderBy: { scheduledAt: "desc" },
    });
    return res.json({ bookings });
  }

  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  const bookings = await prisma.booking.findMany({
    where: { professionalId: profile.id },
    include: {
      client: { select: { firstName: true, lastName: true, phone: true } },
      quoteRequest: true,
      review: true,
    },
    orderBy: { scheduledAt: "desc" },
  });
  res.json({ bookings });
});

const statusSchema = z.object({ status: z.enum(["COMPLETED", "CANCELLED"]) });

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const booking = await prisma.booking.findUnique({
    where: { id: (req.params.id as string) },
    include: { professional: true },
  });
  if (!booking) return res.status(404).json({ error: "Réservation introuvable" });

  const isOwnerClient = booking.clientId === req.user!.userId;
  const isOwnerPro = booking.professional.userId === req.user!.userId;
  if (!isOwnerClient && !isOwnerPro) return res.status(403).json({ error: "Accès refusé" });

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: parsed.data.status },
  });

  // Prestation terminée et déjà réglée : c'est le moment où LuxuryConnect
  // doit verser sa part à l'atelier.
  if (parsed.data.status === "COMPLETED") {
    const payment = await prisma.payment.findUnique({ where: { bookingId: booking.id } });
    if (payment?.status === "PAID" && payment.payoutStatus === "PENDING") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { payoutStatus: "SCHEDULED" },
      });
      await notifyAdmins({
        type: "PAYOUT_PENDING",
        title: "Virement à effectuer",
        body: `${booking.professional.businessName} — ${(payment.amountWorkshop / 100).toFixed(2)} €`,
        link: "/admin/paiements",
      });
    }
  }

  res.json({ booking: updated });
});

export default router;
