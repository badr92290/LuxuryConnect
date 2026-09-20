import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { contactLimiter } from "../middleware/security";
import { notifyAdmins } from "../utils/notify";

const router = Router();

const SERVICE_TYPES = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"] as const;

const contactSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom trop court").max(60),
  lastName: z.string().trim().min(2, "Nom trop court").max(60),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(180),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9][0-9 .\-()]{6,19}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  serviceType: z.enum(SERVICE_TYPES).optional(),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  // Pot de miel : champ invisible pour un humain, rempli par les robots.
  // Il accepte n'importe quoi ici — le rejet se fait plus bas, silencieusement,
  // pour ne pas apprendre au robot que le piège existe.
  company: z.string().max(200).optional(),
  // Horodatage d'affichage du formulaire : un envoi instantané n'est pas humain.
  renderedAt: z.number().int().optional(),
});

const MIN_FILL_SECONDS = 3;

router.post("/", contactLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;

  // Les deux pièges anti-robot répondent 201 sans rien enregistrer :
  // un spammeur qui reçoit une erreur adapte son script.
  const tooFast =
    data.renderedAt !== undefined &&
    (Date.now() - data.renderedAt) / 1000 < MIN_FILL_SECONDS;
  if (data.company?.trim() || tooFast) {
    return res.status(201).json({ ok: true });
  }

  const lead = await prisma.contactLead.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      serviceType: data.serviceType ?? null,
      message: data.message || null,
    },
  });

  await notifyAdmins({
    type: "CONTACT_LEAD",
    title: "Nouvelle demande depuis le site",
    body: `${lead.firstName} ${lead.lastName} — ${lead.email}`,
    link: "/admin/leads",
  });

  res.status(201).json({ ok: true });
});

// Réservé à l'administrateur : la liste des demandes reçues par le site.
router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const leads = await prisma.contactLead.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ leads });
});

router.patch("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsedBody = z.object({ handled: z.boolean() }).safeParse(req.body);
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const id = req.params.id as string;
  const existing = await prisma.contactLead.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Demande introuvable" });

  const lead = await prisma.contactLead.update({
    where: { id },
    data: { handledAt: parsedBody.data.handled ? new Date() : null },
  });
  res.json({ lead });
});

export default router;
