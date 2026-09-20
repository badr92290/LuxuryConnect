import React from "react";
import { Link } from "react-router-dom";
import { LegalBody, PublicLayout } from "../../layout/PublicLayout";
import { PageMeta } from "../../seo/PageMeta";
import { CONTACT_EMAIL, SITE_NAME } from "../../seo/siteConfig";
import { clearConsent, readConsent } from "../../lib/consent";
import { analyticsConfigured } from "../../lib/analytics";
import { useToast } from "../../context/ToastContext";

const LAST_UPDATED = "20 septembre 2026";

export default function PrivacyPage() {
  const { toast } = useToast();
  const consent = readConsent();

  return (
    <PublicLayout>
      <PageMeta
        title="Politique de confidentialité"
        description="Quelles données LuxuryConnect collecte, pourquoi, combien de temps elles sont conservées et comment exercer vos droits RGPD."
      />

      <h1 className="font-display text-4xl leading-tight tracking-tight text-ivory">
        Politique de confidentialité
      </h1>
      <p className="mt-3 text-sm text-mutedDark">Dernière mise à jour : {LAST_UPDATED}</p>

      <LegalBody>
        <p className="mt-8">
          {SITE_NAME} est un service d'intermédiation : vous nous décrivez votre besoin, nous
          consultons des ateliers partenaires pour vous, puis nous vous transmettons une offre
          unique. Cette page explique en clair quelles données nous traitons et ce que vous pouvez
          exiger de nous.
        </p>

        <h2>1. Qui est responsable du traitement</h2>
        <p>
          Le responsable du traitement est l'éditeur de {SITE_NAME}, joignable à l'adresse{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Toute demande relative à vos
          données doit être adressée à cette adresse.
        </p>

        <h2>2. Données collectées et finalités</h2>
        <div className="legal-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Données</th>
                <th scope="col">Pourquoi</th>
                <th scope="col">Base légale</th>
                <th scope="col">Conservation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Données">Nom, prénom, e-mail, téléphone</td>
                <td data-label="Pourquoi">Créer votre compte, vous transmettre nos offres, vous recontacter</td>
                <td data-label="Base légale">Exécution du contrat</td>
                <td data-label="Conservation">3 ans après le dernier contact</td>
              </tr>
              <tr>
                <td data-label="Données">Véhicule, prestation souhaitée, ville, photos jointes</td>
                <td data-label="Pourquoi">Consulter les ateliers et établir un prix</td>
                <td data-label="Base légale">Exécution du contrat</td>
                <td data-label="Conservation">3 ans après le dernier contact</td>
              </tr>
              <tr>
                <td data-label="Données">Messages échangés avec notre équipe</td>
                <td data-label="Pourquoi">Assurer le suivi de votre demande</td>
                <td data-label="Base légale">Exécution du contrat</td>
                <td data-label="Conservation">3 ans après le dernier échange</td>
              </tr>
              <tr>
                <td data-label="Données">Avis laissé après une prestation</td>
                <td data-label="Pourquoi">Informer les futurs clients</td>
                <td data-label="Base légale">Consentement</td>
                <td data-label="Conservation">Jusqu&rsquo;au retrait de l&rsquo;avis</td>
              </tr>
              <tr>
                <td data-label="Données">Factures et réservations</td>
                <td data-label="Pourquoi">Obligations comptables</td>
                <td data-label="Base légale">Obligation légale</td>
                <td data-label="Conservation">10 ans</td>
              </tr>
              <tr>
                <td data-label="Données">Statistiques de fréquentation</td>
                <td data-label="Pourquoi">Comprendre quelles pages servent, améliorer le site</td>
                <td data-label="Base légale">Consentement</td>
                <td data-label="Conservation">13 mois maximum</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>3. Ce que nous ne faisons pas</h2>
        <ul>
          <li>Nous ne vendons ni ne louons vos données à quiconque.</li>
          <li>Nous ne faisons pas de publicité ciblée et ne déposons aucun cookie publicitaire.</li>
          <li>
            Nous ne transmettons jamais vos coordonnées complètes à un atelier avant que vous ayez
            accepté une offre : tant que vous n'avez rien accepté, l'atelier ne connaît que la
            prestation et le véhicule.
          </li>
        </ul>

        <h2>4. Destinataires</h2>
        <p>
          Vos données sont accessibles à l'équipe {SITE_NAME}. Une fois l'offre acceptée, l'atelier
          retenu reçoit les informations nécessaires à la réalisation de la prestation (identité,
          coordonnées, véhicule, rendez-vous). Nos prestataires techniques — hébergement du site et
          de la base de données — traitent les données sur nos seules instructions, au sein de
          l'Union européenne.
        </p>

        <h2>5. Cookies et mesure d'audience</h2>
        <p>
          Le site fonctionne sans cookie publicitaire. Nous utilisons uniquement le stockage local
          de votre navigateur pour vous garder connecté et mémoriser votre choix ci-dessous ; ce
          sont des éléments strictement nécessaires, qui ne demandent pas de consentement.
        </p>
        <p>
          La mesure d'audience, elle, n'est activée qu'avec votre accord et peut être retirée à tout
          moment, aussi simplement qu'elle a été donnée.
        </p>
        {analyticsConfigured() && (
          <p>
            <strong>Votre choix actuel :</strong>{" "}
            {consent === "granted"
              ? "mesure d'audience acceptée"
              : consent === "denied"
                ? "mesure d'audience refusée"
                : "aucun choix enregistré"}
            .{" "}
            <button
              type="button"
              onClick={() => {
                clearConsent();
                toast("Votre choix a été effacé, la bannière va réapparaître.", "success");
              }}
              className="text-gold underline underline-offset-2"
            >
              Modifier mon choix
            </button>
          </p>
        )}

        <h2>6. Vos droits</h2>
        <p>
          Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation,
          d'opposition et de portabilité de vos données. Écrivez à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> : nous répondons sous un mois. Si
          la réponse ne vous satisfait pas, vous pouvez saisir la CNIL, 3 place de Fontenoy, 75007
          Paris, ou déposer une plainte sur{" "}
          <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
            cnil.fr
          </a>
          .
        </p>

        <h2>7. Sécurité</h2>
        <p>
          Les échanges avec le site sont chiffrés (HTTPS forcé). Les mots de passe sont stockés
          hachés, jamais en clair. L'accès à la base est restreint à l'équipe technique.
        </p>

        <h2>8. Modifications</h2>
        <p>
          Toute évolution de cette politique sera publiée sur cette page, avec une nouvelle date de
          mise à jour. Les{" "}
          <Link to="/cgu">conditions générales d'utilisation</Link> complètent ce document.
        </p>
      </LegalBody>
    </PublicLayout>
  );
}
