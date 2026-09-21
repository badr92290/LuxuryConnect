# Mettre le paiement en service

Le code est en place des deux côtés. Ce qui suit ne peut être fait que par
vous : cela demande un compte Stripe, un compte développeur Apple et le
domaine du site.

## 1. Le principe retenu

Le client paie **LuxuryConnect**. Sa marge reste sur votre compte. Vous
virez ensuite à l'atelier la part convenue — le prix qu'il avait proposé —
une fois la prestation terminée.

```
client ──(carte / Apple Pay / Google Pay)──▶ compte LuxuryConnect
                                                  │
                                    marge ────────┤
                                                  │
                                    part atelier ─┴──▶ compte de l'atelier
```

Techniquement, ce sont des **charges séparées** : l'encaissement et le
virement sont deux mouvements distincts, ce qui vous laisse la main entre
les deux. Un litige se tranche tant que l'argent est encore chez vous.

**Point réglementaire à vérifier.** Encaisser pour le compte d'un tiers puis
le reverser est une activité de service de paiement, encadrée en France par
l'ACPR. Stripe porte cet agrément et vous couvre au titre de son service
Connect, à condition que votre compte soit bien déclaré comme plateforme.
Confirmez-le auprès de Stripe à l'ouverture, et faites relire vos CGU sur ce
point : c'est le seul endroit du projet où une erreur ne se corrige pas par
du code.

## 2. Côté Stripe

1. Créez un compte sur stripe.com, en France, au nom de votre société.
2. Activez **Connect** (Paramètres → Connect). Choisissez les comptes
   **Express** : Stripe recueille lui-même l'identité et le RIB des ateliers,
   vous n'en stockez rien.
3. Relevez vos clés (Développeurs → Clés API). Commencez en mode **test**.
4. Créez le webhook : Développeurs → Webhooks → Ajouter un point de
   terminaison, URL `https://votre-api/stripe/webhook`, et abonnez-le à :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `account.updated`

   Relevez le **secret de signature** affiché ensuite.

## 3. Variables d'environnement

API (`backend/.env`) :

```
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…
APP_BASE_URL=https://luxuryconnect.fr
```

Site (`web/.env`) :

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_…
```

Application (`mobile/app.json`, section `extra`) :

```json
"stripePublishableKey": "pk_test_…"
```

Sans ces clés, tout continue de fonctionner : les écrans de paiement
affichent « pas encore activé » et vous réglez les ateliers par virement
classique.

## 3 bis. Moyens de paiement acceptés

Volontairement restreint à la **carte bancaire** (Visa, Mastercard, CB,
American Express). Apple Pay et Google Pay passent par ce même rail — ce
sont des cartes du point de vue de Stripe — et sont donc couverts sans
réglage supplémentaire.

Ce choix est explicite dans le code (`payment_method_types: ["card"]`)
plutôt que laissé au tableau de bord Stripe, et c'est important : activer
un prélèvement SEPA ou un paiement fractionné ferait apparaître des moyens
qui se confirment d'abord puis se dénouent plusieurs jours après, parfois
par un échec. Comme vous reversez la part de l'atelier une fois la
prestation faite, vous vireriez un argent pas encore arrivé. Si vous voulez
un jour les proposer, il faudra d'abord attendre l'encaissement effectif
avant d'autoriser le virement.

## 4. Apple Pay

1. Dans Stripe : Paramètres → Moyens de paiement → Apple Pay → **ajoutez le
   domaine** `luxuryconnect.fr`. Stripe vous donne un fichier de
   vérification à déposer à la racine du site ; il doit rester accessible.
   Sans cette étape, Apple Pay ne s'affiche pas sur le **site**.
2. Pour l'**application** : créez un identifiant marchand sur le compte
   développeur Apple (`merchant.fr.luxuryconnect`, déjà inscrit dans
   `app.json`), activez la capacité Apple Pay sur l'App ID, et reliez
   l'identifiant à Stripe.

## 5. Google Pay

Rien à faire côté Stripe : c'est activé par le plugin
(`enableGooglePay: true`). Pour la mise en production, Google demande de
soumettre l'intégration depuis la console Google Pay & Wallet.

## 6. Compiler l'application

Apple Pay et Google Pay **ne fonctionnent pas dans Expo Go** : ils exigent
un build de développement.

```
cd mobile
npx expo run:ios      # ou : eas build --profile development --platform ios
npx expo run:android
```

## 7. Vérifier avant d'ouvrir

En mode test, carte `4242 4242 4242 4242`, n'importe quelle date future :

- [ ] Le client règle depuis le site — le paiement passe à « Réglé ».
- [ ] Le client règle depuis l'application, Apple Pay proposé sur iPhone.
- [ ] Un atelier termine son inscription (Mes paiements → M'inscrire).
- [ ] La prestation est marquée terminée, puis vous virez sa part depuis
      Admin → Paiements. Le virement apparaît chez l'atelier.
- [ ] Un remboursement fonctionne tant que l'atelier n'a pas été payé.
- [ ] `stripe listen --forward-to localhost:4000/stripe/webhook` confirme
      que les évènements arrivent.

Passez ensuite les clés en `sk_live_` / `pk_live_`, et refaites le webhook :
son secret est différent en production.
