import { Router, raw } from "express";
import type Stripe from "stripe";
import { prisma } from "../prisma";
import { getStripe, paymentMethodLabel, stripeConfigured } from "../services/stripe";
import { notify, notifyAdmins } from "../utils/notify";

const router = Router();

/**
 * Réception des évènements Stripe.
 *
 * C'est la seule source de vérité sur l'encaissement : le navigateur peut
 * être fermé au moment où la banque confirme, et une authentification forte
 * peut aboutir plusieurs minutes après. On ne marque donc jamais un paiement
 * réglé depuis le front — uniquement ici, sur un évènement signé.
 *
 * Le corps doit rester brut : la signature porte sur les octets exacts
 * envoyés par Stripe, qu'un parseur JSON réécrirait.
 */
router.post("/", raw({ type: "application/json" }), async (req, res) => {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "Webhook Stripe non configuré" });
  }

  const signature = req.header("stripe-signature");
  if (!signature) return res.status(400).json({ error: "Signature absente" });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // Signature invalide : la requête ne vient pas de Stripe.
    const message = err instanceof Error ? err.message : "signature invalide";
    return res.status(400).json({ error: `Webhook refusé : ${message}` });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await onPaymentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await onPaymentFailed(event.data.object);
        break;
      case "charge.refunded":
        await onChargeRefunded(event.data.object);
        break;
      case "account.updated":
        await onAccountUpdated(event.data.object);
        break;
      default:
        // Les autres évènements ne nous concernent pas ; on accuse réception
        // pour que Stripe cesse de les rejouer.
        break;
    }
  } catch (err) {
    console.error("Traitement du webhook Stripe échoué :", err);
    // 500 : Stripe réessaiera, ce qui est le comportement voulu si notre
    // base était momentanément indisponible.
    return res.status(500).json({ error: "Traitement échoué" });
  }

  res.json({ received: true });
});

async function onPaymentSucceeded(intent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: intent.id },
    include: {
      booking: {
        select: {
          id: true,
          quoteRequestId: true,
          quoteRequest: { select: { vehicleMake: true, vehicleModel: true } },
        },
      },
      client: { select: { firstName: true, lastName: true } },
      professional: { select: { userId: true, businessName: true } },
    },
  });
  // Rien en base : évènement d'un autre environnement, on l'ignore sans échouer.
  if (!payment) return;
  if (payment.status === "PAID") return; // rejeu

  const charge = await latestCharge(intent);

  // La part de l'atelier est celle qu'il avait proposée ; la marge est le reste.
  const quote = await prisma.quote.findFirst({
    where: { quoteRequestId: payment.booking.quoteRequestId, status: "SELECTED" },
    select: { price: true },
  });
  const amountWorkshop = quote ? Math.round(quote.price * 100) : 0;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripeChargeId: charge?.id ?? null,
      paymentMethodLabel: paymentMethodLabel(charge?.payment_method_details),
      amountTotal: intent.amount_received || intent.amount,
      amountWorkshop,
      amountMargin: (intent.amount_received || intent.amount) - amountWorkshop,
      failureMessage: null,
    },
  });

  const vehicle = `${payment.booking.quoteRequest.vehicleMake} ${payment.booking.quoteRequest.vehicleModel}`;
  const amount = ((intent.amount_received || intent.amount) / 100).toFixed(2);

  await notify({
    userId: payment.clientId,
    type: "PAYMENT_RECEIVED",
    title: "Paiement confirmé",
    body: `${amount} € — ${vehicle}`,
    link: "/app/bookings",
  });

  await notifyAdmins({
    type: "PAYMENT_RECEIVED",
    title: "Paiement reçu",
    body: `${payment.client.firstName} ${payment.client.lastName} — ${amount} € (${vehicle})`,
    link: "/admin/paiements",
  });

  await notify({
    userId: payment.professional.userId,
    type: "PAYOUT_PENDING",
    title: "Prestation réglée par le client",
    body: `Votre part vous sera virée une fois la prestation terminée.`,
    link: "/pro/paiements",
  });
}

async function onPaymentFailed(intent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: intent.id },
  });
  if (!payment) return;

  const message = intent.last_payment_error?.message ?? "Paiement refusé";
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED", failureMessage: message },
  });

  await notify({
    userId: payment.clientId,
    type: "PAYMENT_FAILED",
    title: "Paiement refusé",
    body: message,
    link: "/app/bookings",
  });
}

async function onChargeRefunded(charge: Stripe.Charge) {
  const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!intentId) return;

  const payment = await prisma.payment.findFirst({ where: { stripePaymentIntentId: intentId } });
  if (!payment || payment.status === "REFUNDED") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });
}

async function onAccountUpdated(account: Stripe.Account) {
  const profile = await prisma.professionalProfile.findFirst({
    where: { stripeAccountId: account.id },
  });
  if (!profile) return;

  const payoutsEnabled = Boolean(account.payouts_enabled && account.charges_enabled);
  if (payoutsEnabled === profile.stripePayoutsEnabled) return;

  await prisma.professionalProfile.update({
    where: { id: profile.id },
    data: {
      stripePayoutsEnabled: payoutsEnabled,
      stripeOnboardedAt: payoutsEnabled ? (profile.stripeOnboardedAt ?? new Date()) : null,
    },
  });

  if (payoutsEnabled) {
    await notifyAdmins({
      type: "PAYOUT_PENDING",
      title: "Atelier prêt à être payé",
      body: `${profile.businessName} a terminé son inscription au paiement.`,
      link: "/admin/paiements",
    });
  }
}

/** La charge liée à une intention, quelle que soit la forme renvoyée par l'API. */
async function latestCharge(intent: Stripe.PaymentIntent): Promise<Stripe.Charge | null> {
  const latest = (intent as Stripe.PaymentIntent & { latest_charge?: string | Stripe.Charge })
    .latest_charge;
  if (!latest) return null;
  if (typeof latest !== "string") return latest;
  return getStripe().charges.retrieve(latest);
}

export default router;
