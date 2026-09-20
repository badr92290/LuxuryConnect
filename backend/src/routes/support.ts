import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { saveDataUrlImage } from "../utils/uploads";
import { notify, notifyAdmins } from "../utils/notify";

const router = Router();

const REASONS = ["DEFECT", "WARRANTY", "APPOINTMENT", "INVOICE", "OTHER"] as const;

const createSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.enum(REASONS),
  subject: z.string().trim().min(4, "Décrivez l'objet en quelques mots").max(140),
  message: z.string().trim().min(10, "Détaillez un peu votre demande").max(4000),
  photos: z.array(z.string()).max(6).optional(),
});

const messageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

/** Vue commune du ticket, avec tout ce qu'il faut pour afficher le fil. */
const ticketInclude = {
  booking: {
    select: {
      id: true,
      price: true,
      scheduledAt: true,
      quoteRequest: {
        select: {
          serviceType: true,
          vehicleMake: true,
          vehicleModel: true,
          vehicleYear: true,
        },
      },
    },
  },
  client: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
  professional: {
    select: {
      id: true,
      businessName: true,
      city: true,
      address: true,
      // Le téléphone est porté par le compte, pas par la fiche atelier.
      user: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  },
  photos: { select: { id: true, imageUrl: true } },
  messages: {
    orderBy: { createdAt: "asc" as const },
    include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
  },
} as const;

/**
 * Qui a le droit de voir ce ticket : le client, l'atelier concerné, et
 * l'administrateur. Ce dernier n'est pas dans la boucle par défaut — le SAV
 * se règle entre le client et l'atelier — mais il garde l'accès pour
 * intervenir en renfort quand on le lui demande.
 */
async function loadTicketFor(ticketId: string, user: { userId: string; role: string }) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: ticketInclude,
  });
  if (!ticket) return null;

  if (user.role === "ADMIN") return ticket;
  if (ticket.clientId === user.userId) return ticket;
  if (ticket.professional.user.id === user.userId) return ticket;
  return null;
}

/** Les deux interlocuteurs du fil, pour notifier celui qui n'a pas écrit. */
function counterparts(ticket: { clientId: string; professional: { user: { id: string } } }) {
  return { clientId: ticket.clientId, proUserId: ticket.professional.user.id };
}

// ── Ouverture d'un dossier ───────────────────────────────────────────────
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { bookingId, reason, subject, message, photos } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { professional: { select: { id: true, userId: true, businessName: true } } },
  });
  if (!booking || booking.clientId !== req.user!.userId) {
    return res.status(404).json({ error: "Réservation introuvable" });
  }
  if (booking.status !== "COMPLETED") {
    return res
      .status(400)
      .json({ error: "Le service après-vente s'ouvre une fois la prestation terminée." });
  }

  const open = await prisma.supportTicket.findFirst({
    where: { bookingId, status: { not: "RESOLVED" } },
  });
  if (open) {
    return res.status(409).json({
      error: "Un dossier est déjà ouvert pour cette prestation.",
      ticketId: open.id,
    });
  }

  const savedPhotos = (await Promise.all((photos ?? []).map(saveDataUrlImage))).filter(
    (p): p is string => p !== null,
  );

  const ticket = await prisma.supportTicket.create({
    data: {
      bookingId,
      clientId: req.user!.userId,
      professionalId: booking.professionalId,
      reason,
      subject,
      photos: { create: savedPhotos.map((imageUrl) => ({ imageUrl })) },
      messages: {
        create: [
          {
            senderId: req.user!.userId,
            content: message,
          },
          {
            // Le fil s'ouvre en disant qui parle à qui : le client doit
            // comprendre qu'ici, contrairement au reste, il s'adresse
            // directement à l'atelier.
            senderId: req.user!.userId,
            isSystem: true,
            content:
              `Dossier ouvert auprès de ${booking.professional.businessName}. ` +
              `Vos échanges sont directs. LuxuryConnect peut être appelé en renfort à tout moment.`,
          },
        ],
      },
    },
    include: ticketInclude,
  });

  await notify({
    userId: booking.professional.userId,
    type: "SUPPORT_OPENED",
    title: "Nouveau dossier SAV",
    body: subject,
    link: `/pro/sav/${ticket.id}`,
  });

  res.status(201).json({ ticket });
});

// ── Liste des dossiers vus par le demandeur ──────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { userId, role } = req.user!;

  let where = {};
  if (role === "CLIENT") {
    where = { clientId: userId };
  } else if (role === "PROFESSIONAL") {
    const profile = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (!profile) return res.json({ tickets: [] });
    where = { professionalId: profile.id };
  } else {
    // L'administrateur ne voit que ce qui le concerne : les dossiers qui lui
    // ont été remontés ou qui traînent sans réponse.
    where = { OR: [{ status: "ESCALATED" as const }, { status: "OPEN" as const }] };
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      ...ticketInclude,
      messages: {
        orderBy: { createdAt: "desc" as const },
        take: 1,
        include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
      },
    },
  });

  res.json({ tickets });
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const ticket = await loadTicketFor(req.params.id as string, req.user!);
  if (!ticket) return res.status(404).json({ error: "Dossier introuvable" });
  res.json({ ticket });
});

// ── Fil de discussion direct ─────────────────────────────────────────────
router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ticket = await loadTicketFor(req.params.id as string, req.user!);
  if (!ticket) return res.status(404).json({ error: "Dossier introuvable" });
  if (ticket.status === "RESOLVED") {
    return res.status(400).json({ error: "Ce dossier est clos." });
  }

  const message = await prisma.supportMessage.create({
    data: { ticketId: ticket.id, senderId: req.user!.userId, content: parsed.data.content },
    include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });

  const { clientId, proUserId } = counterparts(ticket);
  const isPro = req.user!.userId === proUserId;

  // La première réponse de l'atelier fait passer le dossier en cours et
  // arrête les relances automatiques.
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: ticket.status === "OPEN" && isPro ? "IN_PROGRESS" : ticket.status,
      firstResponseAt: isPro && !ticket.firstResponseAt ? new Date() : ticket.firstResponseAt,
    },
  });

  // On prévient l'autre bord du fil, jamais l'expéditeur.
  const recipients = [clientId, proUserId].filter((id) => id !== req.user!.userId);
  for (const userId of recipients) {
    await notify({
      userId,
      type: "SUPPORT_REPLY",
      title: "Nouveau message sur un dossier SAV",
      body: ticket.subject,
      link: `/sav/${ticket.id}`,
    });
  }

  const io = req.app.get("io");
  io?.to(`support:${ticket.id}`).emit("support_message", message);

  res.status(201).json({ message });
});

// ── Appel à l'assistance LuxuryConnect ───────────────────────────────────
router.post("/:id/escalate", requireAuth, async (req: AuthRequest, res) => {
  const ticket = await loadTicketFor(req.params.id as string, req.user!);
  if (!ticket) return res.status(404).json({ error: "Dossier introuvable" });
  if (ticket.status === "RESOLVED") return res.status(400).json({ error: "Ce dossier est clos." });
  if (ticket.escalatedAt) return res.json({ ticket });

  const updated = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: "ESCALATED",
      escalatedAt: new Date(),
      messages: {
        create: {
          senderId: req.user!.userId,
          isSystem: true,
          content: "L'assistance LuxuryConnect a été appelée en renfort sur ce dossier.",
        },
      },
    },
    include: ticketInclude,
  });

  await notifyAdmins({
    type: "SUPPORT_ESCALATED",
    title: "Dossier SAV remonté à l'assistance",
    body: ticket.subject,
    link: `/admin/sav/${ticket.id}`,
  });

  res.json({ ticket: updated });
});

// ── Clôture ──────────────────────────────────────────────────────────────
router.post("/:id/resolve", requireAuth, async (req: AuthRequest, res) => {
  const ticket = await loadTicketFor(req.params.id as string, req.user!);
  if (!ticket) return res.status(404).json({ error: "Dossier introuvable" });

  // Un atelier ne clôt pas son propre dossier : seuls le client, qui juge si
  // le problème est réglé, et l'assistance peuvent le faire.
  const isClient = ticket.clientId === req.user!.userId;
  if (!isClient && req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Seul le client peut clore son dossier." });
  }
  if (ticket.status === "RESOLVED") return res.json({ ticket });

  const updated = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      messages: {
        create: {
          senderId: req.user!.userId,
          isSystem: true,
          content: isClient
            ? "Le client a indiqué que le dossier était réglé."
            : "L'assistance LuxuryConnect a clos ce dossier.",
        },
      },
    },
    include: ticketInclude,
  });

  const { proUserId } = counterparts(ticket);
  await notify({
    userId: proUserId,
    type: "SUPPORT_RESOLVED",
    title: "Dossier SAV clos",
    body: ticket.subject,
    link: `/pro/sav/${ticket.id}`,
  });

  res.json({ ticket: updated });
});

export default router;
