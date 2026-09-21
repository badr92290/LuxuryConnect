import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { AuthRequest, requireAuth, requireRole } from "../middleware/auth";
import {
  CURRENCY,
  getStripe,
  paymentMethodLabel,
  StripeNotConfiguredError,
  stripeConfigured,
  toCents,
} from "../services/stripe";
import { notify, notifyAdmins } from "../utils/notify";

const router = Router();

/** Réponse commune quand aucune clé Stripe n'est renseignée. */
function notConfigured(res: import("express").Response) {
  return res.status(503).json({
    error:
      "Le paiement en ligne n'est pas encore activé. Contactez LuxuryConnect pour régler cette prestation.",
  });
}

// ── Ce que le client voit d'un paiement ──────────────────────────────────
// Jamais la part de l'atelier ni la marge : pour lui, il n'existe qu'un prix.
const clientView = {
  id: true,
  amountTotal: true,
  currency: true,
  status: true,
  paymentMethodLabel: true,
  paidAt: true,
  refundedAt: true,
} as const;

/**
 * Prépare le paiement d'une réservation et renvoie le secret client.
 *
 * L'intention est créée une seule fois puis réutilisée : rappeler cette
 * route après un abandon reprend le même paiement au lieu d'en empiler un
 * nouveau. Les portefeuilles (Apple Pay, Google Pay) n'ont rien de
 * particulier à déclarer ici — ce sont des cartes aux yeux de Stripe, et
 * c'est le composant de paiement qui les propose selon l'appareil.
 */
router.post("/bookings/:bookingId/intent", requireAuth, requireRole("CLIENT"), async (req: AuthRequest, res) => {
  if (!stripeConfigured()) return notConfigured(res);

  const bookingId = req.params.bookingId as string;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
      quoteRequest: { select: { serviceType: true, vehicleMake: true, vehicleModel: true } },
      client: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  if (!booking || booking.clientId !== req.user!.userId) {
    return res.status(404).json({ error: "Réservation introuvable" });
  }
  if (booking.payment?.status === "PAID") {
    return res.status(409).json({ error: "Cette prestation est déjà réglée." });
  }

  const stripe = getStripe();
  const amount = booking.payment?.amountTotal ?? toCents(booking.price);

  // Une intention encore ouverte est reprise telle quelle.
  if (booking.payment?.stripePaymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(booking.payment.stripePaymentIntentId);
    if (existing.status !== "canceled" && existing.status !== "succeeded") {
      return res.json({
        clientSecret: existing.client_secret,
        amountTotal: amount,
        currency: CURRENCY,
      });
    }
  }

  const vehicle = `${booking.quoteRequest.vehicleMake} ${booking.quoteRequest.vehicleModel}`;
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: CURRENCY,
    // Encaissé sur le compte LuxuryConnect : aucun `transfer_data` ici.
    // Le reversement à l'atelier est un mouvement distinct, déclenché
    // après la prestation.
    //
    // Carte uniquement, et c'est délibéré. Apple Pay et Google Pay passent
    // par ce même rail — ce sont des cartes aux yeux de Stripe — et sont
    // donc couverts. En revanche `automatic_payment_methods` ouvrirait la
    // porte à tout ce qui est coché dans le tableau de bord, dont des
    // moyens à règlement différé (prélèvement SEPA, paiement fractionné)
    // qui se confirment en « processing » puis se dénouent plusieurs jours
    // après, parfois par un échec. Notre modèle reverse la part de
    // l'atelier une fois la prestation faite : on virerait alors un argent
    // pas encore arrivé. Tant que ce décalage n'est pas géré, on s'en tient
    // aux moyens qui se règlent immédiatement.
    payment_method_types: ["card"],
    description: `LuxuryConnect — ${vehicle}`,
    receipt_email: booking.client.email,
    metadata: {
      bookingId: booking.id,
      clientId: booking.clientId,
      professionalId: booking.professionalId,
    },
  });

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      clientId: booking.clientId,
      professionalId: booking.professionalId,
      amountTotal: amount,
      amountWorkshop: 0,
      amountMargin: amount,
      stripePaymentIntentId: intent.id,
      status: "PENDING",
    },
    update: { stripePaymentIntentId: intent.id, status: "PENDING", failureMessage: null },
  });

  res.json({
    clientSecret: intent.client_secret,
    amountTotal: payment.amountTotal,
    currency: payment.currency,
  });
});

/** État du paiement d'une réservation, vu par le client. */
router.get("/bookings/:bookingId", requireAuth, async (req: AuthRequest, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.bookingId as string },
    include: { payment: { select: clientView }, professional: { select: { userId: true } } },
  });
  if (!booking) return res.status(404).json({ error: "Réservation introuvable" });

  const allowed =
    booking.clientId === req.user!.userId ||
    booking.professional.userId === req.user!.userId ||
    req.user!.role === "ADMIN";
  if (!allowed) return res.status(404).json({ error: "Réservation introuvable" });

  res.json({ payment: booking.payment, amountDue: toCents(booking.price) });
});

// ── Compte Stripe de l'atelier ───────────────────────────────────────────

/**
 * Démarre ou reprend l'inscription de l'atelier chez Stripe.
 *
 * Le compte est de type « Express » : Stripe recueille lui-même l'identité,
 * le RIB et les pièces justificatives, et en porte la conformité. Nous ne
 * stockons qu'un identifiant de compte.
 */
router.post("/connect/onboard", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  if (!stripeConfigured()) return notConfigured(res);

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: req.user!.userId },
    include: { user: { select: { email: true } } },
  });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  const stripe = getStripe();
  let accountId = profile.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: profile.user.email,
      business_type: "company",
      business_profile: { name: profile.businessName, url: profile.websiteUrl ?? undefined },
      capabilities: { transfers: { requested: true } },
      metadata: { professionalId: profile.id },
    });
    accountId = account.id;
    await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: { stripeAccountId: accountId },
    });
  }

  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:5173";
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/pro/paiements?refresh=1`,
    return_url: `${baseUrl}/pro/paiements?done=1`,
    type: "account_onboarding",
  });

  res.json({ url: link.url });
});

/** Où en est l'atelier de son inscription, et peut-il recevoir des virements ? */
router.get("/connect/status", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  if (!stripeConfigured() || !profile.stripeAccountId) {
    return res.json({
      configured: stripeConfigured(),
      connected: false,
      payoutsEnabled: false,
    });
  }

  // On interroge Stripe plutôt que de se fier à notre copie : l'atelier a pu
  // compléter son dossier depuis un autre appareil.
  const account = await getStripe().accounts.retrieve(profile.stripeAccountId);
  const payoutsEnabled = Boolean(account.payouts_enabled && account.charges_enabled);

  if (payoutsEnabled !== profile.stripePayoutsEnabled) {
    await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: {
        stripePayoutsEnabled: payoutsEnabled,
        stripeOnboardedAt: payoutsEnabled ? (profile.stripeOnboardedAt ?? new Date()) : null,
      },
    });
  }

  res.json({
    configured: true,
    connected: true,
    payoutsEnabled,
    requirements: account.requirements?.currently_due ?? [],
  });
});

/** Ce que l'atelier a touché et ce qui lui reste dû. */
router.get("/earnings", requireAuth, requireRole("PROFESSIONAL"), async (req: AuthRequest, res) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!profile) return res.status(404).json({ error: "Profil professionnel introuvable" });

  const payments = await prisma.payment.findMany({
    where: { professionalId: profile.id, status: "PAID" },
    orderBy: { paidAt: "desc" },
    select: {
      id: true,
      amountWorkshop: true,
      currency: true,
      payoutStatus: true,
      paidOutAt: true,
      createdAt: true,
      booking: {
        select: {
          scheduledAt: true,
          status: true,
          quoteRequest: {
            select: { serviceType: true, vehicleMake: true, vehicleModel: true },
          },
        },
      },
    },
  });

  const paidOut = payments
    .filter((p) => p.payoutStatus === "PAID")
    .reduce((sum, p) => sum + p.amountWorkshop, 0);
  const pending = payments
    .filter((p) => p.payoutStatus !== "PAID")
    .reduce((sum, p) => sum + p.amountWorkshop, 0);

  res.json({ payments, totals: { paidOut, pending } });
});

// ── Côté LuxuryConnect ───────────────────────────────────────────────────

const releaseSchema = z.object({
  /** Part de l'atelier en centimes ; par défaut le prix qu'il avait proposé. */
  amountWorkshop: z.number().int().positive().optional(),
});

/**
 * Verse à l'atelier sa part, une fois la prestation réalisée.
 *
 * C'est le second mouvement : l'argent est déjà chez nous, on en détache ce
 * qui revient à l'atelier et on garde la marge. Rien n'est versé tant que la
 * réservation n'est pas terminée — c'est ce délai qui permet de trancher un
 * litige avant que les fonds ne soient partis.
 */
router.post("/:paymentId/release", requireAuth, requireRole("ADMIN"), async (req: AuthRequest, res) => {
  if (!stripeConfigured()) return notConfigured(res);

  const parsed = releaseSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const payment = await prisma.payment.findUnique({
    where: { id: req.params.paymentId as string },
    include: {
      booking: { select: { status: true, quoteRequestId: true } },
      professional: { select: { id: true, userId: true, businessName: true, stripeAccountId: true, stripePayoutsEnabled: true } },
    },
  });
  if (!payment) return res.status(404).json({ error: "Paiement introuvable" });
  if (payment.status !== "PAID") {
    return res.status(400).json({ error: "Le client n'a pas encore réglé cette prestation." });
  }
  if (payment.payoutStatus === "PAID") {
    return res.status(409).json({ error: "L'atelier a déjà été payé pour cette prestation." });
  }
  if (payment.booking.status !== "COMPLETED") {
    return res.status(400).json({ error: "La prestation n'est pas encore terminée." });
  }
  if (!payment.professional.stripeAccountId || !payment.professional.stripePayoutsEnabled) {
    return res.status(400).json({
      error: `${payment.professional.businessName} n'a pas terminé son inscription au paiement.`,
    });
  }

  // À défaut de montant explicite, on reverse le prix que l'atelier avait proposé.
  let amountWorkshop = parsed.data.amountWorkshop ?? payment.amountWorkshop;
  if (!amountWorkshop) {
    const quote = await prisma.quote.findFirst({
      where: { quoteRequestId: payment.booking.quoteRequestId, status: "SELECTED" },
      select: { price: true },
    });
    amountWorkshop = quote ? toCents(quote.price) : 0;
  }
  if (amountWorkshop <= 0 || amountWorkshop > payment.amountTotal) {
    return res.status(400).json({ error: "Montant à reverser invalide." });
  }

  try {
    const transfer = await getStripe().transfers.create(
      {
        amount: amountWorkshop,
        currency: payment.currency,
        destination: payment.professional.stripeAccountId,
        transfer_group: payment.bookingId,
        metadata: { paymentId: payment.id, bookingId: payment.bookingId },
      },
      // Rejouer la requête ne crée pas un second virement.
      { idempotencyKey: `payout_${payment.id}` },
    );

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        amountWorkshop,
        amountMargin: payment.amountTotal - amountWorkshop,
        payoutStatus: "PAID",
        stripeTransferId: transfer.id,
        paidOutAt: new Date(),
        payoutError: null,
      },
    });

    await notify({
      userId: payment.professional.userId,
      type: "PAYOUT_SENT",
      title: "Virement envoyé",
      body: `${(amountWorkshop / 100).toFixed(2)} € pour votre prestation`,
      link: "/pro/paiements",
    });

    res.json({ payment: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Virement refusé";
    await prisma.payment.update({
      where: { id: payment.id },
      data: { payoutStatus: "FAILED", payoutError: message },
    });
    res.status(502).json({ error: `Le virement a échoué : ${message}` });
  }
});

/** Rembourse le client, en tout ou partie. */
router.post("/:paymentId/refund", requireAuth, requireRole("ADMIN"), async (req: AuthRequest, res) => {
  if (!stripeConfigured()) return notConfigured(res);

  const payment = await prisma.payment.findUnique({ where: { id: req.params.paymentId as string } });
  if (!payment) return res.status(404).json({ error: "Paiement introuvable" });
  if (payment.status !== "PAID" || !payment.stripePaymentIntentId) {
    return res.status(400).json({ error: "Ce paiement ne peut pas être remboursé." });
  }
  if (payment.payoutStatus === "PAID") {
    return res.status(409).json({
      error:
        "L'atelier a déjà été payé : remboursez le client depuis Stripe après avoir récupéré les fonds auprès de lui.",
    });
  }

  const refund = await getStripe().refunds.create(
    { payment_intent: payment.stripePaymentIntentId },
    { idempotencyKey: `refund_${payment.id}` },
  );

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });

  await notify({
    userId: payment.clientId,
    type: "PAYMENT_RECEIVED",
    title: "Remboursement en cours",
    body: `${(payment.amountTotal / 100).toFixed(2)} € vous seront recrédités sous quelques jours.`,
    link: "/app/bookings",
  });

  res.json({ payment: updated, refundId: refund.id });
});

/** Tableau des encaissements et des reversements, côté LuxuryConnect. */
router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { firstName: true, lastName: true, email: true } },
      professional: { select: { businessName: true, stripePayoutsEnabled: true } },
      booking: {
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          quoteRequest: {
            select: { serviceType: true, vehicleMake: true, vehicleModel: true },
          },
        },
      },
    },
  });

  const collected = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountTotal, 0);
  const owed = payments
    .filter((p) => p.status === "PAID" && p.payoutStatus !== "PAID")
    .reduce((sum, p) => sum + p.amountWorkshop, 0);
  const margin = payments
    .filter((p) => p.status === "PAID" && p.payoutStatus === "PAID")
    .reduce((sum, p) => sum + p.amountMargin, 0);

  res.json({ payments, totals: { collected, owed, margin }, configured: stripeConfigured() });
});

// Erreur de configuration : on la traduit une fois pour toutes les routes.
router.use((err: unknown, _req: unknown, res: import("express").Response, next: (e?: unknown) => void) => {
  if (err instanceof StripeNotConfiguredError) return notConfigured(res);
  next(err);
});

export default router;
