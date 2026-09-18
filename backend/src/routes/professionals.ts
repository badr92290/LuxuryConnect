import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { distanceKm } from "../utils/geo";
import { ServiceType } from "@prisma/client";

const router = Router();

// GET /professionals?service=PPF&city=Lyon&lat=45.75&lng=4.85&radiusKm=25&q=texte
router.get("/", async (req, res) => {
  const { service, city, lat, lng, radiusKm, q } = req.query as Record<string, string | undefined>;

  const where: any = {};
  if (service) {
    where.services = { some: { serviceType: service as ServiceType } };
  }
  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  let professionals = await prisma.professionalProfile.findMany({
    where,
    include: {
      services: true,
      portfolioImages: { take: 3 },
      user: { select: { firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { averageRating: "desc" },
  });

  if (lat && lng) {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    const radius = radiusKm ? parseFloat(radiusKm) : 50;
    professionals = professionals
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({ ...p, distanceKm: distanceKm(latN, lngN, p.latitude!, p.longitude!) }))
      .filter((p: any) => p.distanceKm <= radius)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);
  }

  res.json({ professionals });
});

router.get("/:id", async (req, res) => {
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: (req.params.id as string) },
    include: {
      services: true,
      portfolioImages: { orderBy: { createdAt: "desc" } },
      user: { select: { firstName: true, lastName: true, avatarUrl: true, phone: true } },
      reviews: {
        include: { client: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!professional) return res.status(404).json({ error: "Professionnel introuvable" });
  res.json({ professional });
});

const updateProfileSchema = z.object({
  businessName: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

router.put("/me", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const profile = await prisma.professionalProfile.update({
    where: { userId: req.user!.userId },
    data: parsed.data,
  });
  res.json({ professional: profile });
});

const serviceSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  priceFrom: z.number().optional(),
  description: z.string().optional(),
});

router.put("/me/services", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  const service = await prisma.professionalService.upsert({
    where: { professionalId_serviceType: { professionalId: profile.id, serviceType: parsed.data.serviceType } },
    create: { ...parsed.data, professionalId: profile.id },
    update: parsed.data,
  });
  res.json({ service });
});

router.delete("/me/services/:serviceType", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  await prisma.professionalService.delete({
    where: {
      professionalId_serviceType: {
        professionalId: profile.id,
        serviceType: req.params.serviceType as ServiceType,
      },
    },
  });
  res.status(204).send();
});

const portfolioSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().optional(),
  isBeforeAfter: z.boolean().optional(),
});

router.post("/me/portfolio", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const parsed = portfolioSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  const image = await prisma.portfolioImage.create({
    data: { ...parsed.data, professionalId: profile.id },
  });
  res.status(201).json({ image });
});

router.delete("/me/portfolio/:id", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  const image = await prisma.portfolioImage.findUnique({ where: { id: (req.params.id as string) } });
  if (!image || image.professionalId !== profile.id) {
    return res.status(404).json({ error: "Image introuvable" });
  }
  await prisma.portfolioImage.delete({ where: { id: (req.params.id as string) } });
  res.status(204).send();
});

export default router;
