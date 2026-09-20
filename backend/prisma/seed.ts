import { PrismaClient, ServiceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";
const ADMIN_EMAIL = "badr92290@hotmail.fr";
const ADMIN_PASSWORD = "admin1234";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  console.log("Nettoyage des données existantes...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.quoteForward.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.professionalService.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création du compte administrateur (intermédiaire)...");
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "LuxuryConnect",
    },
  });

  console.log("Création des professionnels...");
  const proData = [
    {
      email: "contact@autoshine-lyon.fr",
      firstName: "Jean",
      lastName: "Dupont",
      businessName: "Auto Shine Lyon",
      description: "Spécialiste PPF et covering depuis 10 ans. Pose sans bulle garantie.",
      city: "Lyon",
      address: "12 rue de la Carrosserie, 69003 Lyon",
      latitude: 45.764043,
      longitude: 4.835659,
      services: [
        { serviceType: ServiceType.PPF_GLOSS, priceFrom: 890 },
        { serviceType: ServiceType.PPF_SATIN, priceFrom: 990 },
        { serviceType: ServiceType.COVERING, priceFrom: 1200 },
        { serviceType: ServiceType.PPF_COLORED, priceFrom: 1290 },
      ],
      portfolio: [
        { imageUrl: "https://picsum.photos/seed/autoshine1/800/600", caption: "PPF capot avant/après", isBeforeAfter: true },
        { imageUrl: "https://picsum.photos/seed/autoshine2/800/600", caption: "Covering mat intégral" },
      ],
    },
    {
      email: "hello@ceramicpro-paris.fr",
      firstName: "Sofia",
      lastName: "Bernard",
      businessName: "Ceramic Pro Paris",
      description: "Traitement céramique haut de gamme, protection jusqu'à 5 ans.",
      city: "Paris",
      address: "45 avenue des Garages, 75015 Paris",
      latitude: 48.841112,
      longitude: 2.288334,
      services: [
        { serviceType: ServiceType.CERAMIC, priceFrom: 650 },
        { serviceType: ServiceType.PPF_SATIN, priceFrom: 1050 },
        { serviceType: ServiceType.TINT, priceFrom: 220 },
      ],
      portfolio: [
        { imageUrl: "https://picsum.photos/seed/ceramicpro1/800/600", caption: "Traitement céramique berline" },
        { imageUrl: "https://picsum.photos/seed/ceramicpro2/800/600", caption: "Finition brillance miroir" },
      ],
    },
    {
      email: "contact@tintmaster-marseille.fr",
      firstName: "Karim",
      lastName: "Haddad",
      businessName: "Tint Master Marseille",
      description: "Vitres teintées homologuées et lustrage professionnel.",
      city: "Marseille",
      address: "8 boulevard du Prado, 13008 Marseille",
      latitude: 43.276567,
      longitude: 5.402857,
      services: [
        { serviceType: ServiceType.TINT, priceFrom: 180 },
        { serviceType: ServiceType.PPF_GLOSS, priceFrom: 940 },
        { serviceType: ServiceType.CERAMIC, priceFrom: 600 },
      ],
      portfolio: [
        { imageUrl: "https://picsum.photos/seed/tintmaster1/800/600", caption: "Vitres teintées SUV" },
      ],
    },
    {
      email: "info@wrapstudio-bordeaux.fr",
      firstName: "Lucie",
      lastName: "Petit",
      businessName: "Wrap Studio Bordeaux",
      description: "Covering couleur et PPF, film premium 3M et XPEL.",
      city: "Bordeaux",
      address: "3 rue de l'Atelier, 33000 Bordeaux",
      latitude: 44.837789,
      longitude: -0.57918,
      services: [
        { serviceType: ServiceType.COVERING, priceFrom: 1100 },
        { serviceType: ServiceType.PPF_COLORED, priceFrom: 1350 },
      ],
      portfolio: [
        { imageUrl: "https://picsum.photos/seed/wrapstudio1/800/600", caption: "Covering vert chrome" },
        { imageUrl: "https://picsum.photos/seed/wrapstudio2/800/600", caption: "PPF pare-chocs" },
      ],
    },
  ];

  const professionals = [];
  for (const p of proData) {
    const user = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash,
        role: "PROFESSIONAL",
        firstName: p.firstName,
        lastName: p.lastName,
        phone: "+33600000000",
        professionalProfile: {
          create: {
            businessName: p.businessName,
            description: p.description,
            city: p.city,
            address: p.address,
            latitude: p.latitude,
            longitude: p.longitude,
            services: { create: p.services },
            portfolioImages: { create: p.portfolio },
          },
        },
      },
      include: { professionalProfile: true },
    });
    professionals.push(user);
  }

  console.log("Création des clients...");
  const client1 = await prisma.user.create({
    data: {
      email: "client.demo@example.com",
      passwordHash,
      role: "CLIENT",
      firstName: "Marie",
      lastName: "Martin",
      phone: "+33600000001",
    },
  });
  const client2 = await prisma.user.create({
    data: {
      email: "thomas.client@example.com",
      passwordHash,
      role: "CLIENT",
      firstName: "Thomas",
      lastName: "Girard",
      phone: "+33600000002",
    },
  });

  const proLyon = professionals[0].professionalProfile!; // PPF/Covering
  const proParis = professionals[1].professionalProfile!; // Ceramic
  const proMarseille = professionals[2].professionalProfile!; // Tint/Ceramic
  const proBordeaux = professionals[3].professionalProfile!; // Covering/PPF

  console.log("Scénario 1 : demande fraîche, encore à traiter par l'admin...");
  await prisma.quoteRequest.create({
    data: {
      clientId: client1.id,
      serviceType: ServiceType.PPF_GLOSS,
      vehicleMake: "Peugeot",
      vehicleModel: "308",
      vehicleYear: 2022,
      description: "PPF sur capot et boucliers avant, voiture noire.",
      city: "Lyon",
      status: "PENDING_REVIEW",
    },
  });

  console.log("Scénario 2 : demande transmise à deux pros, un a répondu...");
  const forwardedRequest = await prisma.quoteRequest.create({
    data: {
      clientId: client2.id,
      serviceType: ServiceType.CERAMIC,
      vehicleMake: "Audi",
      vehicleModel: "A3",
      vehicleYear: 2021,
      description: "Traitement céramique complet, véhicule gris.",
      city: "Paris",
      status: "FORWARDED",
    },
  });
  await prisma.quoteForward.create({
    data: { quoteRequestId: forwardedRequest.id, professionalId: proParis.id, status: "QUOTED" },
  });
  await prisma.quote.create({
    data: {
      quoteRequestId: forwardedRequest.id,
      professionalId: proParis.id,
      price: 680,
      message: "Traitement céramique 2 couches + polish, garantie 3 ans.",
    },
  });
  await prisma.quoteForward.create({
    data: { quoteRequestId: forwardedRequest.id, professionalId: proMarseille.id, status: "PENDING" },
  });
  await prisma.quoteRequest.update({ where: { id: forwardedRequest.id }, data: { status: "QUOTED" } });

  console.log("Scénario 3 : offre finale envoyée au client, en attente de sa décision...");
  const finalizedRequest = await prisma.quoteRequest.create({
    data: {
      clientId: client1.id,
      serviceType: ServiceType.COVERING,
      vehicleMake: "Volkswagen",
      vehicleModel: "Golf",
      vehicleYear: 2020,
      description: "Covering intégral couleur gris satiné.",
      city: "Bordeaux",
      status: "FINALIZED",
      selectedProfessionalId: proBordeaux.id,
      finalPrice: 1290,
      finalMessage: "Covering complet couleur gris satiné, pose incluse, garantie 5 ans.",
    },
  });
  await prisma.quoteForward.create({
    data: { quoteRequestId: finalizedRequest.id, professionalId: proBordeaux.id, status: "QUOTED" },
  });
  await prisma.quote.create({
    data: {
      quoteRequestId: finalizedRequest.id,
      professionalId: proBordeaux.id,
      price: 1100,
      message: "Devis film premium 3M, pose 2 jours.",
      status: "SELECTED",
    },
  });

  console.log("Scénario 4 : historique complet avec réservation terminée et avis...");
  const completedRequest = await prisma.quoteRequest.create({
    data: {
      clientId: client2.id,
      serviceType: ServiceType.PPF_GLOSS,
      vehicleMake: "BMW",
      vehicleModel: "Serie 1",
      vehicleYear: 2023,
      description: "PPF intégral.",
      city: "Lyon",
      status: "ACCEPTED",
      selectedProfessionalId: proLyon.id,
      finalPrice: 1450,
      finalMessage: "PPF intégral carrosserie, garantie 5 ans.",
    },
  });
  await prisma.quoteForward.create({
    data: { quoteRequestId: completedRequest.id, professionalId: proLyon.id, status: "QUOTED" },
  });
  await prisma.quote.create({
    data: {
      quoteRequestId: completedRequest.id,
      professionalId: proLyon.id,
      price: 1250,
      message: "PPF intégral, film XPEL Ultimate.",
      status: "SELECTED",
    },
  });
  const booking = await prisma.booking.create({
    data: {
      quoteRequestId: completedRequest.id,
      clientId: client2.id,
      professionalId: proLyon.id,
      price: 1450,
      scheduledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      status: "COMPLETED",
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking.id,
      clientId: client2.id,
      professionalId: proLyon.id,
      rating: 5,
      comment: "Travail impeccable, voiture comme neuve. Je recommande !",
    },
  });
  const agg = await prisma.review.aggregate({
    where: { professionalId: proLyon.id },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.professionalProfile.update({
    where: { id: proLyon.id },
    data: { averageRating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
  });

  console.log("Historique d'avis clients pour alimenter la vitrine publique...");
  // Chaque avis public s'appuie sur une prestation réellement terminée : on rejoue
  // donc le parcours complet (demande -> devis pro -> prix final -> réservation -> avis).
  const pastReviews = [
    {
      firstName: "Karim", lastName: "Benali", email: "karim.b@example.com",
      service: ServiceType.PPF_SATIN, make: "Porsche", model: "911 (992)", year: 2022,
      city: "Lyon", pro: proLyon, proPrice: 2400, finalPrice: 2790, rating: 5,
      daysAgo: 12,
      comment: "Le devis est arrivé en deux jours, un seul prix, pas de marchandage. L'atelier proposé faisait exactement ce que je cherchais.",
    },
    {
      firstName: "Élodie", lastName: "Mercier", email: "elodie.m@example.com",
      service: ServiceType.COVERING, make: "Audi", model: "RS3", year: 2021,
      city: "Bordeaux", pro: proBordeaux, proPrice: 1450, finalPrice: 1690, rating: 5,
      daysAgo: 26,
      comment: "J'avais appelé quatre carrossiers sans obtenir de réponse claire. Ici je n'ai parlé qu'à une personne, et le prix annoncé est celui que j'ai payé.",
    },
    {
      firstName: "Sofiane", lastName: "Acher", email: "sofiane.a@example.com",
      service: ServiceType.CERAMIC, make: "BMW", model: "M3", year: 2023,
      city: "Paris", pro: proParis, proPrice: 780, finalPrice: 950, rating: 5,
      daysAgo: 41,
      comment: "Suivi impeccable du dépôt au retour du véhicule. La céramique tient toujours après deux hivers.",
    },
    {
      firstName: "Claire", lastName: "Dubois", email: "claire.d@example.com",
      service: ServiceType.TINT, make: "Tesla", model: "Model 3", year: 2024,
      city: "Marseille", pro: proMarseille, proPrice: 320, finalPrice: 420, rating: 4,
      daysAgo: 58,
      comment: "Pose nickel et conforme à la réglementation. J'aurais aimé un créneau un peu plus tôt, mais rien à redire sur le résultat.",
    },
    {
      firstName: "Nicolas", lastName: "Perrot", email: "nicolas.p@example.com",
      service: ServiceType.PPF_COLORED, make: "Mercedes-Benz", model: "Classe C", year: 2019,
      city: "Lyon", pro: proLyon, proPrice: 280, finalPrice: 390, rating: 5,
      daysAgo: 73,
      comment: "Micro-rayures parties, la peinture a retrouvé sa profondeur. Le fait de n'avoir qu'un interlocuteur change vraiment tout.",
    },
  ];

  for (const entry of pastReviews) {
    const reviewer = await prisma.user.create({
      data: {
        email: entry.email,
        passwordHash,
        role: "CLIENT",
        firstName: entry.firstName,
        lastName: entry.lastName,
      },
    });
    const request = await prisma.quoteRequest.create({
      data: {
        clientId: reviewer.id,
        serviceType: entry.service,
        vehicleMake: entry.make,
        vehicleModel: entry.model,
        vehicleYear: entry.year,
        city: entry.city,
        status: "ACCEPTED",
        selectedProfessionalId: entry.pro.id,
        finalPrice: entry.finalPrice,
        createdAt: new Date(Date.now() - (entry.daysAgo + 10) * 24 * 3600 * 1000),
      },
    });
    await prisma.quoteForward.create({
      data: { quoteRequestId: request.id, professionalId: entry.pro.id, status: "QUOTED" },
    });
    await prisma.quote.create({
      data: {
        quoteRequestId: request.id,
        professionalId: entry.pro.id,
        price: entry.proPrice,
        status: "SELECTED",
      },
    });
    const pastBooking = await prisma.booking.create({
      data: {
        quoteRequestId: request.id,
        clientId: reviewer.id,
        professionalId: entry.pro.id,
        price: entry.finalPrice,
        scheduledAt: new Date(Date.now() - (entry.daysAgo + 2) * 24 * 3600 * 1000),
        status: "COMPLETED",
      },
    });
    await prisma.review.create({
      data: {
        bookingId: pastBooking.id,
        clientId: reviewer.id,
        professionalId: entry.pro.id,
        rating: entry.rating,
        comment: entry.comment,
        createdAt: new Date(Date.now() - entry.daysAgo * 24 * 3600 * 1000),
      },
    });
  }

  // Recalcule la note moyenne de chaque atelier après l'insertion de l'historique.
  for (const profile of [proLyon, proParis, proMarseille, proBordeaux]) {
    const stats = await prisma.review.aggregate({
      where: { professionalId: profile.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: { averageRating: stats._avg.rating ?? 0, reviewCount: stats._count.rating },
    });
  }

  console.log("Dossier SAV de démonstration (client <-> atelier, en direct)...");
  // Le SAV est le seul endroit où le client et l'atelier échangent sans
  // passer par l'intermédiaire : on en sème un pour que l'écran ne soit pas vide.
  const savTicket = await prisma.supportTicket.create({
    data: {
      bookingId: booking.id,
      clientId: client2.id,
      professionalId: proLyon.id,
      reason: "DEFECT",
      subject: "Léger décollement du film sur le pare-chocs avant",
      status: "IN_PROGRESS",
      firstResponseAt: new Date(Date.now() - 20 * 3600 * 1000),
      messages: {
        create: [
          {
            senderId: client2.id,
            content:
              "Bonjour, j'ai constaté un léger décollement du film sur l'angle du pare-chocs avant, " +
              "côté conducteur. Est-ce que cela se reprend sous garantie ?",
            createdAt: new Date(Date.now() - 26 * 3600 * 1000),
          },
          {
            senderId: client2.id,
            isSystem: true,
            content:
              "Dossier ouvert auprès de Auto Shine Lyon. Vos échanges sont directs. " +
              "LuxuryConnect peut être appelé en renfort à tout moment.",
            createdAt: new Date(Date.now() - 26 * 3600 * 1000),
          },
          {
            senderId: professionals[0].id,
            content:
              "Bonjour, oui c'est couvert par la garantie pose. Passez quand vous voulez cette semaine, " +
              "comptez une heure sur place.",
            createdAt: new Date(Date.now() - 20 * 3600 * 1000),
          },
        ],
      },
    },
  });
  console.log(`  dossier SAV : ${savTicket.subject}`);

  console.log("Création des conversations (client <-> admin, pro <-> admin)...");
  function pairId(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
  }

  const [caA, caB] = pairId(client1.id, admin.id);
  const clientAdminConvo = await prisma.conversation.create({
    data: { participantAId: caA, participantBId: caB },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: clientAdminConvo.id, senderId: client1.id, content: "Bonjour, où en est ma demande de covering ?" },
      { conversationId: clientAdminConvo.id, senderId: admin.id, content: "Bonjour Marie, je viens de recevoir un devis, je vous transmets l'offre finale très vite !" },
    ],
  });

  const [paA, paB] = pairId(professionals[0].id, admin.id);
  const proAdminConvo = await prisma.conversation.create({
    data: { participantAId: paA, participantBId: paB },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: proAdminConvo.id, senderId: admin.id, content: "Bonjour Jean, j'ai une nouvelle demande de PPF à Lyon, ça vous intéresse ?" },
      { conversationId: proAdminConvo.id, senderId: professionals[0].id, content: "Oui avec plaisir, je regarde ça et je vous fais un prix." },
    ],
  });

  console.log("Seed terminé.\n");
  console.log(`Compte administrateur (vous) : ${ADMIN_EMAIL} / mot de passe : ${ADMIN_PASSWORD}`);
  console.log(`Comptes de démo clients/pros (mot de passe pour tous : "${DEMO_PASSWORD}") :`);
  console.log("- Client:", client1.email);
  console.log("- Client:", client2.email);
  for (const p of proData) console.log("- Pro:", p.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
