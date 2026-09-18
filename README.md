# LuxuryConnect

Plateforme d'intermédiation pour la protection automobile (PPF, covering, protection céramique,
vitres teintées, lustrage). **Vous (l'administrateur) êtes l'intermédiaire unique** entre les clients
et les professionnels : vous recevez les demandes, sélectionnez les prestataires à consulter,
comparez leurs devis, puis fixez et transmettez le prix final au client.

## Structure du projet

```
backend/   API Node.js + TypeScript + Express + Prisma + PostgreSQL + Socket.io
web/       Site web responsive (Vite + React + TypeScript + Tailwind) — ordinateur, tablette, téléphone
mobile/    App mobile React Native (Expo) — ⚠️ reflète encore l'ancien modèle, voir note en bas
```

## Le parcours (nouveau modèle d'intermédiaire)

1. **Client** : décrit son besoin (prestation, véhicule, ville) → la demande arrive dans votre file d'attente.
2. **Vous (admin)** : sélectionnez un ou plusieurs professionnels pertinents et leur transmettez la demande.
3. **Professionnel(s)** : reçoivent la demande transmise et vous répondent avec leur prix (jamais visible du client).
4. **Vous (admin)** : comparez les devis reçus, choisissez le prestataire, fixez le prix final facturé
   au client (votre marge = prix final − prix du prestataire) et envoyez l'offre.
5. **Client** : reçoit uniquement l'offre finale, l'accepte (avec une date souhaitée) → réservation créée.
6. **Messagerie** : le client et les professionnels ne discutent qu'avec vous (intermédiaire), jamais
   directement entre eux.
6bis. **Agenda** (visible uniquement par vous) : un carnet de contacts qui regroupe chaque client
   (nom, téléphone, email) avec l'historique des objets de ses demandes de devis, classé par ordre
   alphabétique et consultable avec une recherche rapide.
7. Une fois la prestation terminée, le professionnel la marque "terminée" et le client peut laisser un avis.

## Démarrer le backend

```bash
cd backend
npm install
npm run seed      # crée le compte admin + comptes de démo + scénarios types
npm run dev        # démarre l'API sur http://localhost:4000
```

**Votre compte administrateur** : `badr92290@hotmail.fr` / mot de passe `admin1234`
(changez ce mot de passe avant toute mise en production).

Comptes de démonstration (mot de passe : `password123`) :
- Client : `client.demo@example.com`
- Client : `thomas.client@example.com`
- Pro : `contact@autoshine-lyon.fr` (Lyon), `hello@ceramicpro-paris.fr` (Paris),
  `contact@tintmaster-marseille.fr` (Marseille), `info@wrapstudio-bordeaux.fr` (Bordeaux)

Le seed crée 4 demandes illustrant chaque étape du parcours (en attente, transmise avec devis reçus,
offre finale envoyée, réservation terminée + avis) pour que vous puissiez explorer immédiatement.

## Démarrer le site web (ordinateur / tablette / téléphone)

```bash
cd web
npm install
npm run dev
```

Ouvrez `http://localhost:5173` — le site s'adapte automatiquement : barre latérale sur ordinateur/tablette,
navigation en bas d'écran sur téléphone. Par défaut il pointe vers l'API sur `http://localhost:4000`
(modifiable via la variable d'environnement `VITE_API_BASE_URL`, ex. dans un fichier `web/.env`).

## Mobile (React Native / Expo) — à mettre à jour

L'app mobile construite précédemment reflète encore **l'ancien modèle** (client choisissant directement
un professionnel). Le site web ci-dessus est désormais la référence pour le nouveau parcours avec
intermédiaire. Si vous voulez que l'app mobile suive le même modèle (file d'attente admin, transmission,
prix final), dites-le moi et je la mets à jour à l'identique du site.

## Prochaines étapes suggérées

- Changer le mot de passe administrateur et sécuriser l'accès (l'inscription publique ne permet pas
  de créer de compte admin — c'est déjà le cas).
- Héberger le backend et la base PostgreSQL (Railway, Render, Fly.io...) et déployer le site (Vercel,
  Netlify...) avec un nom de domaine.
- Ajouter l'upload direct de photos (actuellement les photos de portfolio sont ajoutées par URL).
- Notifications (email/SMS) quand une demande arrive, quand un devis est reçu, quand l'offre est envoyée.
- Historique de marge / statistiques pour piloter votre activité d'intermédiaire.
