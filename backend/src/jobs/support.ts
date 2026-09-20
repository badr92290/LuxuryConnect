import { prisma } from "../prisma";
import { notify, notifyAdmins } from "../utils/notify";

/** L'atelier a ce délai pour donner signe de vie avant d'être relancé. */
const REMINDER_AFTER_HOURS = 24;
/** Sans réponse passé ce délai, le dossier remonte à l'assistance tout seul. */
const ESCALATE_AFTER_HOURS = 72;

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

/**
 * Relance l'atelier resté muet sur un dossier SAV.
 *
 * Une seule relance par dossier : `lastReminderAt` sert de garde, si bien que
 * le travail est idempotent et peut tourner aussi souvent qu'on veut.
 */
export async function remindSilentWorkshops(): Promise<number> {
  const stale = await prisma.supportTicket.findMany({
    where: {
      status: "OPEN",
      firstResponseAt: null,
      lastReminderAt: null,
      createdAt: { lt: hoursAgo(REMINDER_AFTER_HOURS) },
    },
    include: {
      professional: { select: { userId: true, businessName: true } },
    },
  });

  for (const ticket of stale) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        lastReminderAt: new Date(),
        messages: {
          create: {
            senderId: ticket.clientId,
            isSystem: true,
            content:
              `Relance automatique : ce dossier attend une réponse depuis plus de ` +
              `${REMINDER_AFTER_HOURS} heures.`,
          },
        },
      },
    });

    await notify({
      userId: ticket.professional.userId,
      type: "SUPPORT_REMINDER",
      title: "Dossier SAV sans réponse",
      body: ticket.subject,
      link: `/pro/sav/${ticket.id}`,
    });
  }

  return stale.length;
}

/**
 * Remonte à l'assistance les dossiers que l'atelier laisse sans réponse.
 *
 * Le client n'a pas à relancer lui-même : passé le délai, LuxuryConnect entre
 * dans la boucle. C'est la contrepartie du contact direct.
 */
export async function escalateAbandonedTickets(): Promise<number> {
  const abandoned = await prisma.supportTicket.findMany({
    where: {
      status: "OPEN",
      firstResponseAt: null,
      escalatedAt: null,
      createdAt: { lt: hoursAgo(ESCALATE_AFTER_HOURS) },
    },
    include: {
      professional: { select: { businessName: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  for (const ticket of abandoned) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: "ESCALATED",
        escalatedAt: new Date(),
        messages: {
          create: {
            senderId: ticket.clientId,
            isSystem: true,
            content:
              `Sans réponse de l'atelier après ${ESCALATE_AFTER_HOURS} heures, ` +
              `l'assistance LuxuryConnect a été saisie automatiquement.`,
          },
        },
      },
    });

    await notify({
      userId: ticket.clientId,
      type: "SUPPORT_ESCALATED",
      title: "Nous prenons le relais sur votre dossier",
      body: `${ticket.professional.businessName} n'a pas répondu — nous nous en occupons.`,
      link: `/app/sav/${ticket.id}`,
    });

    await notifyAdmins({
      type: "SUPPORT_ESCALATED",
      title: "Dossier SAV sans réponse de l'atelier",
      body: `${ticket.professional.businessName} — ${ticket.subject}`,
      link: `/admin/sav/${ticket.id}`,
    });
  }

  return abandoned.length;
}

export async function runSupportAutomation() {
  const reminded = await remindSilentWorkshops();
  const escalated = await escalateAbandonedTickets();
  return { reminded, escalated };
}
