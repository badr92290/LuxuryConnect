import { prisma } from "../prisma";
import { notify, notifyAdmins } from "../utils/notify";
import { runSupportAutomation } from "./support";

const REMINDER_AFTER_DAYS = 2;
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Relance les professionnels à qui une demande a été transmise et qui n'ont
 * toujours pas répondu. Une seule relance par transmission, pour ne pas harceler.
 */
export async function sendQuoteReminders() {
  const cutoff = new Date(Date.now() - REMINDER_AFTER_DAYS * 24 * 60 * 60 * 1000);

  const stale = await prisma.quoteForward.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
      quoteRequest: { status: { in: ["FORWARDED", "QUOTED"] } },
    },
    include: {
      quoteRequest: { select: { id: true, vehicleMake: true, vehicleModel: true } },
      professional: { select: { userId: true, businessName: true } },
    },
  });

  let sent = 0;
  for (const forward of stale) {
    const alreadyReminded = await prisma.notification.findFirst({
      where: {
        userId: forward.professional.userId,
        type: "QUOTE_REMINDER",
        link: `/pro/requests/${forward.quoteRequest.id}`,
      },
    });
    if (alreadyReminded) continue;

    await notify({
      userId: forward.professional.userId,
      type: "QUOTE_REMINDER",
      title: "Devis toujours en attente",
      body: `${forward.quoteRequest.vehicleMake} ${forward.quoteRequest.vehicleModel} — transmis il y a plus de ${REMINDER_AFTER_DAYS} jours`,
      link: `/pro/requests/${forward.quoteRequest.id}`,
    });

    await notifyAdmins({
      type: "QUOTE_REMINDER",
      title: "Professionnel relancé",
      body: `${forward.professional.businessName} n'a pas répondu sur ${forward.quoteRequest.vehicleMake} ${forward.quoteRequest.vehicleModel}`,
      link: `/admin/requests/${forward.quoteRequest.id}`,
    });

    sent++;
  }

  return sent;
}

export function startReminderJob() {
  const run = async () => {
    try {
      const sent = await sendQuoteReminders();
      if (sent > 0) console.log(`Relances devis envoyées : ${sent}`);

      const { reminded, escalated } = await runSupportAutomation();
      if (reminded > 0) console.log(`Ateliers relancés sur un SAV : ${reminded}`);
      if (escalated > 0) console.log(`Dossiers SAV remontés à l'assistance : ${escalated}`);
    } catch (err) {
      console.error("Échec des traitements automatiques :", err);
    }
  };

  run();
  setInterval(run, CHECK_INTERVAL_MS);
}
