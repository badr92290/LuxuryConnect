import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { QuoteRequestStatus } from "@prisma/client";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/quote-requests", async (req: AuthRequest, res) => {
  const { status } = req.query as { status?: string };
  const where = status ? { status: status as QuoteRequestStatus } : {};

  const quoteRequests = await prisma.quoteRequest.findMany({
    where,
    include: {
      client: { select: { firstName: true, lastName: true, phone: true, email: true } },
      selectedProfessional: { select: { businessName: true } },
      forwards: { include: { professional: { select: { businessName: true } } } },
      quotes: true,
      booking: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ quoteRequests });
});

router.get("/quote-requests/:id", async (req, res) => {
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id: req.params.id as string },
    include: {
      client: { select: { firstName: true, lastName: true, phone: true, email: true } },
      selectedProfessional: { select: { businessName: true } },
      forwards: {
        include: {
          professional: { select: { id: true, userId: true, businessName: true, city: true, averageRating: true } },
        },
      },
      quotes: { include: { professional: { select: { id: true, userId: true, businessName: true } } } },
      booking: true,
    },
  });
  if (!quoteRequest) return res.status(404).json({ error: "Demande introuvable" });
  res.json({ quoteRequest });
});

const forwardSchema = z.object({ professionalIds: z.array(z.string().uuid()).min(1) });

router.post("/quote-requests/:id/forward", async (req, res) => {
  const parsed = forwardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const quoteRequest = await prisma.quoteRequest.findUnique({ where: { id: req.params.id as string } });
  if (!quoteRequest) return res.status(404).json({ error: "Demande introuvable" });

  await prisma.$transaction(
    parsed.data.professionalIds.map((professionalId) =>
      prisma.quoteForward.upsert({
        where: { quoteRequestId_professionalId: { quoteRequestId: quoteRequest.id, professionalId } },
        create: { quoteRequestId: quoteRequest.id, professionalId },
        update: {},
      })
    )
  );

  if (quoteRequest.status === "PENDING_REVIEW") {
    await prisma.quoteRequest.update({ where: { id: quoteRequest.id }, data: { status: "FORWARDED" } });
  }

  const updated = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequest.id },
    include: { forwards: { include: { professional: { select: { businessName: true } } } } },
  });
  res.status(201).json({ quoteRequest: updated });
});

const finalizeSchema = z.object({
  professionalId: z.string().uuid(),
  finalPrice: z.number().positive(),
  finalMessage: z.string().optional(),
  adminNote: z.string().optional(),
});

router.post("/quote-requests/:id/finalize", async (req, res) => {
  const parsed = finalizeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const quoteRequest = await prisma.quoteRequest.findUnique({ where: { id: req.params.id as string } });
  if (!quoteRequest) return res.status(404).json({ error: "Demande introuvable" });

  const chosenQuote = await prisma.quote.findFirst({
    where: { quoteRequestId: quoteRequest.id, professionalId: parsed.data.professionalId },
  });
  if (!chosenQuote) {
    return res.status(400).json({ error: "Ce professionnel n'a pas encore transmis de devis pour cette demande" });
  }

  await prisma.$transaction([
    prisma.quote.updateMany({
      where: { quoteRequestId: quoteRequest.id },
      data: { status: "REJECTED" },
    }),
    prisma.quote.update({ where: { id: chosenQuote.id }, data: { status: "SELECTED" } }),
    prisma.quoteRequest.update({
      where: { id: quoteRequest.id },
      data: {
        status: "FINALIZED",
        selectedProfessionalId: parsed.data.professionalId,
        finalPrice: parsed.data.finalPrice,
        finalMessage: parsed.data.finalMessage,
        adminNote: parsed.data.adminNote,
      },
    }),
  ]);

  const updated = await prisma.quoteRequest.findUnique({ where: { id: quoteRequest.id } });
  res.json({ quoteRequest: updated });
});

router.get("/professionals", async (req, res) => {
  const { service, city } = req.query as { service?: string; city?: string };
  const where: any = {};
  if (service) where.services = { some: { serviceType: service } };
  if (city) where.city = { contains: city, mode: "insensitive" };

  const professionals = await prisma.professionalProfile.findMany({
    where,
    include: { services: true, user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { businessName: "asc" },
  });
  res.json({ professionals });
});

// Agenda / carnet de contacts clients : nom, téléphone et objet de chaque demande de devis.
router.get("/contacts", async (req, res) => {
  const { q } = req.query as { q?: string };
  const where: any = { role: "CLIENT" };
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const clients = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      createdAt: true,
      quoteRequests: {
        select: {
          id: true,
          serviceType: true,
          vehicleMake: true,
          vehicleModel: true,
          vehicleYear: true,
          city: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const contacts = clients.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email,
    clientSince: c.createdAt,
    requests: c.quoteRequests,
    requestCount: c.quoteRequests.length,
    lastRequestAt: c.quoteRequests[0]?.createdAt ?? null,
  }));

  res.json({ contacts });
});

router.get("/bookings", async (_req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      client: { select: { firstName: true, lastName: true, phone: true } },
      professional: { select: { businessName: true } },
      quoteRequest: true,
      review: true,
    },
    orderBy: { scheduledAt: "desc" },
  });
  res.json({ bookings });
});

export default router;
