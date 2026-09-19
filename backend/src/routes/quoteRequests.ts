import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { ServiceType } from "@prisma/client";
import { saveDataUrlImage } from "../utils/uploads";

const router = Router();

const createSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  vehicleId: z.string().optional(),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleYear: z.number().int().optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  photos: z.array(z.string()).max(6).optional(),
});

// Le client soumet sa demande : elle atterrit dans la file d'attente de l'administrateur,
// sans professionnel assigné pour l'instant.
router.post("/", requireAuth, requireRole("CLIENT"), async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { photos, vehicleId, ...fields } = parsed.data;

  // Un véhicule ne peut être rattaché que s'il appartient bien au client.
  let linkedVehicleId: string | undefined;
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (vehicle && vehicle.ownerId === req.user!.userId) linkedVehicleId = vehicle.id;
  }

  const savedPaths = (photos ?? [])
    .map(saveDataUrlImage)
    .filter((p): p is string => p !== null);

  const quoteRequest = await prisma.quoteRequest.create({
    data: {
      ...fields,
      vehicleId: linkedVehicleId,
      clientId: req.user!.userId,
      photos: { create: savedPaths.map((imageUrl) => ({ imageUrl })) },
    },
    include: { photos: true },
  });
  res.status(201).json({ quoteRequest });
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  if (req.user!.role === "CLIENT") {
    const quoteRequests = await prisma.quoteRequest.findMany({
      where: { clientId: req.user!.userId },
      include: {
        selectedProfessional: {
          select: {
            businessName: true,
            city: true,
            isInsured: true,
            isCertified: true,
            yearsExperience: true,
            averageRating: true,
            reviewCount: true,
            portfolioImages: { orderBy: { createdAt: "desc" }, take: 8 },
          },
        },
        booking: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ quoteRequests });
  }

  if (req.user!.role === "PROFESSIONAL") {
    const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

    const forwards = await prisma.quoteForward.findMany({
      where: { professionalId: profile.id },
      include: {
        quoteRequest: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const myQuotes = await prisma.quote.findMany({ where: { professionalId: profile.id } });
    const quotesByRequest = new Map(myQuotes.map((q) => [q.quoteRequestId, q]));

    const quoteRequests = forwards.map((f) => ({
      ...f.quoteRequest,
      forwardStatus: f.status,
      myQuote: quotesByRequest.get(f.quoteRequestId) ?? null,
    }));
    return res.json({ quoteRequests });
  }

  return res.status(403).json({ error: "Utilisez /admin/quote-requests" });
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id: req.params.id as string },
    include: {
      selectedProfessional: {
          select: {
            businessName: true,
            city: true,
            isInsured: true,
            isCertified: true,
            yearsExperience: true,
            averageRating: true,
            reviewCount: true,
            portfolioImages: { orderBy: { createdAt: "desc" }, take: 8 },
          },
        },
      booking: true,
      photos: true,
    },
  });
  if (!quoteRequest) return res.status(404).json({ error: "Demande introuvable" });

  if (req.user!.role === "CLIENT") {
    if (quoteRequest.clientId !== req.user!.userId) return res.status(403).json({ error: "Accès refusé" });
    return res.json({ quoteRequest });
  }

  if (req.user!.role === "PROFESSIONAL") {
    const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
    const forward = profile
      ? await prisma.quoteForward.findUnique({
          where: { quoteRequestId_professionalId: { quoteRequestId: quoteRequest.id, professionalId: profile.id } },
        })
      : null;
    if (!forward) return res.status(403).json({ error: "Accès refusé" });
    const myQuote = await prisma.quote.findFirst({
      where: { quoteRequestId: quoteRequest.id, professionalId: profile!.id },
    });
    return res.json({ quoteRequest: { ...quoteRequest, forwardStatus: forward.status, myQuote } });
  }

  res.status(403).json({ error: "Utilisez /admin/quote-requests/:id" });
});

const quoteSchema = z.object({
  price: z.number().positive(),
  message: z.string().optional(),
});

// Le professionnel répond à une demande que l'administrateur lui a transmise.
router.post("/:id/quotes", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  const forward = await prisma.quoteForward.findUnique({
    where: {
      quoteRequestId_professionalId: { quoteRequestId: req.params.id as string, professionalId: profile.id },
    },
  });
  if (!forward) return res.status(404).json({ error: "Cette demande ne vous a pas été transmise" });

  const existing = await prisma.quote.findFirst({
    where: { quoteRequestId: forward.quoteRequestId, professionalId: profile.id },
  });

  const quote = existing
    ? await prisma.quote.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.quote.create({
        data: { ...parsed.data, quoteRequestId: forward.quoteRequestId, professionalId: profile.id },
      });

  await prisma.quoteForward.update({ where: { id: forward.id }, data: { status: "QUOTED" } });
  await prisma.quoteRequest.update({
    where: { id: forward.quoteRequestId },
    data: { status: "QUOTED" },
  });

  res.status(201).json({ quote });
});

// Le client accepte l'offre finale fixée par l'administrateur -> création de la réservation.
router.post("/:id/accept", requireAuth, requireRole("CLIENT"), async (req: AuthRequest, res) => {
  const schema = z.object({ scheduledAt: z.string().datetime() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const quoteRequest = await prisma.quoteRequest.findUnique({ where: { id: req.params.id as string } });
  if (!quoteRequest || quoteRequest.clientId !== req.user!.userId) {
    return res.status(404).json({ error: "Demande introuvable" });
  }
  if (quoteRequest.status !== "FINALIZED" || !quoteRequest.selectedProfessionalId || quoteRequest.finalPrice == null) {
    return res.status(400).json({ error: "Aucune offre finale n'est disponible pour cette demande" });
  }

  const [, booking] = await prisma.$transaction([
    prisma.quoteRequest.update({ where: { id: quoteRequest.id }, data: { status: "ACCEPTED" } }),
    prisma.booking.create({
      data: {
        quoteRequestId: quoteRequest.id,
        clientId: quoteRequest.clientId,
        professionalId: quoteRequest.selectedProfessionalId,
        price: quoteRequest.finalPrice,
        scheduledAt: new Date(parsed.data.scheduledAt),
      },
    }),
  ]);

  res.status(201).json({ booking });
});

router.post("/:id/decline", requireAuth, requireRole("CLIENT"), async (req: AuthRequest, res) => {
  const quoteRequest = await prisma.quoteRequest.findUnique({ where: { id: req.params.id as string } });
  if (!quoteRequest || quoteRequest.clientId !== req.user!.userId) {
    return res.status(404).json({ error: "Demande introuvable" });
  }
  const updated = await prisma.quoteRequest.update({
    where: { id: quoteRequest.id },
    data: { status: quoteRequest.status === "FINALIZED" ? "DECLINED" : "CANCELLED" },
  });
  res.json({ quoteRequest: updated });
});

export default router;
