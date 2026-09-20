import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

// Affiche « Karim B. » plutôt que le nom complet : la vitrine est publique.
function displayName(firstName: string, lastName: string | null): string {
  const initial = lastName?.trim()?.[0];
  return initial ? `${firstName} ${initial.toUpperCase()}.` : firstName;
}

// Vitrine publique : moyenne, nombre d'avis et les derniers témoignages.
// Aucune authentification, et surtout aucune donnée identifiante du professionnel :
// le client ne connaît que LuxuryConnect.
router.get("/public", async (req, res) => {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "9"), 10) || 9, 1), 30);

  const [agg, rows] = await Promise.all([
    prisma.review.aggregate({
      where: { published: true },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { published: true, comment: { not: null } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        client: { select: { firstName: true, lastName: true } },
        booking: {
          select: {
            quoteRequest: {
              select: {
                serviceType: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleYear: true,
                city: true,
              },
            },
          },
        },
      },
    }),
  ]);

  res.json({
    summary: {
      average: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : null,
      count: agg._count.rating,
    },
    reviews: rows.map((r) => {
      const request = r.booking.quoteRequest;
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        author: displayName(r.client.firstName, r.client.lastName),
        serviceType: request.serviceType,
        vehicle: [request.vehicleMake, request.vehicleModel, request.vehicleYear]
          .filter(Boolean)
          .join(" "),
        city: request.city,
      };
    }),
  });
});

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
