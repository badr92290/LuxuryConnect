import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

router.post("/", requireAuth, requireRole("CLIENT"), async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { review: true },
  });
  if (!booking || booking.clientId !== req.user!.userId) {
    return res.status(404).json({ error: "Réservation introuvable" });
  }
  if (booking.status !== "COMPLETED") {
    return res.status(400).json({ error: "La prestation doit être terminée avant de laisser un avis" });
  }
  if (booking.review) {
    return res.status(409).json({ error: "Un avis existe déjà pour cette réservation" });
  }

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      clientId: booking.clientId,
      professionalId: booking.professionalId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { professionalId: booking.professionalId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.professionalProfile.update({
    where: { id: booking.professionalId },
    data: {
      averageRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });

  res.status(201).json({ review });
});

export default router;
