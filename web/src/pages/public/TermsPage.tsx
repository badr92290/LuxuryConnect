import React from "react";
import { Link } from "react-router-dom";
import { LegalBody, PublicLayout } from "../../layout/PublicLayout";
import { PageMeta } from "../../seo/PageMeta";
import { CONTACT_EMAIL, SITE_NAME } from "../../seo/siteConfig";

const LAST_UPDATED = "20 septembre 2026";

export default function TermsPage() {
  return (
    <PublicLayout>
      <PageMeta
        title="Conditions générales d'utilisation"
        description="Les règles d'utilisation de LuxuryConnect : rôle d'intermédiaire, offres et prix, obligations des clients et des ateliers, responsabilités."
      />

      <h1 className="font-display text-4xl leading-tight tracking-tight text-ivory">
        Conditions générales d'utilisation
      </h1>
      <p className="mt-3 text-sm text-mutedDark">Dernière mise à jour : {LAST_UPDATED}</p>

      <LegalBody>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent l'utilisation du site {SITE_NAME} et de son
          application mobile. Créer un compte ou déposer une demande vaut acceptation pleine et
          entière de ces conditions.
        </p>

        <h2>2. Nature du service</h2>
        <p>
          {SITE_NAME} est un <strong>intermédiaire</strong>. Nous ne réalisons aucune prestation
          nous-mêmes. Notre rôle est de recueillir votre besoin, de consulter des ateliers
          professionnels, puis de vous transmettre une offre unique et ferme.
        </p>
        <p>
          En conséquence : le client ne négocie pas avec les ateliers, et les ateliers ne
          démarchent pas le client. Tous les échanges passent par nous.
        </p>

        <h2>3. Compte utilisateur</h2>
        <ul>
          <li>Vous devez être majeur et fournir des informations exactes.</li>
          <li>
            Vous êtes responsable de la confidentialité de votre mot de passe et des actions menées
            depuis votre compte.
          </li>
          <li>
            Vous pouvez demander la suppression de votre compte à tout moment à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </li>
        </ul>

        <h2>4. Demandes, offres et prix</h2>
        <ul>
          <li>Déposer une demande est gratuit et sans engagement.</li>
          <li>
            Le prix que nous vous transmettons est <strong>ferme</strong> : il inclut notre
            rémunération et n'est pas renégociable.
          </li>
          <li>
            Une offre reste valable trente jours, sauf mention contraire. Passé ce délai, elle peut
            être révisée.
          </li>
          <li>
            Le prix est établi sur la base des informations que vous fournissez. Si l'état réel du
            véhicule diffère sensiblement de votre description, l'offre peut être ajustée avant
            toute intervention, avec votre accord.
          </li>
          <li>
            Accepter une offre crée une réservation ferme auprès de l'atelier sélectionné.
          </li>
        </ul>

        <h2>5. Obligations des professionnels partenaires</h2>
        <ul>
          <li>
            Justifier d'une assurance responsabilité civile professionnelle en cours de validité.
          </li>
          <li>Répondre aux demandes transmises dans un délai raisonnable.</li>
          <li>
            Ne publier que des photographies de réalisations dont ils détiennent les droits. En
            renseignant l'adresse de leur site, ils certifient détenir ces droits et nous
            autorisent à en afficher jusqu'à six sur leur fiche.
          </li>
          <li>Ne pas solliciter directement un client rencontré via {SITE_NAME}.</li>
        </ul>

        <h2>6. Avis clients</h2>
        <p>
          Seul un client ayant effectivement bénéficié d'une prestation peut déposer un avis. Les
          avis sont publiés tels quels ; nous nous réservons le droit de retirer de la vitrine
          publique un avis injurieux, diffamatoire, hors sujet ou manifestement frauduleux, sans
          modifier son contenu.
        </p>

        <h2>7. Responsabilité</h2>
        <p>
          La prestation est exécutée par l'atelier sélectionné, sous sa seule responsabilité
          professionnelle, avec les garanties qu'il accorde. {SITE_NAME} répond de la qualité de son
          rôle d'intermédiaire : exactitude de l'offre transmise, sélection d'ateliers vérifiés,
          suivi du dossier. En cas de litige sur une prestation, contactez-nous d'abord : nous
          faisons l'intermédiaire.
        </p>
        <p>
          Nous nous efforçons d'assurer la disponibilité du service sans pouvoir la garantir de
          façon ininterrompue ; une maintenance ou un incident technique ne saurait ouvrir droit à
          indemnisation.
        </p>

        <h2>8. Droit de rétractation</h2>
        <p>
          Pour une prestation de service commandée à distance, vous disposez d'un délai de
          quatorze jours pour vous rétracter. Si vous demandez expressément que la prestation
          commence avant la fin de ce délai, vous restez redevable de ce qui a déjà été exécuté.
        </p>

        <h2>9. Propriété intellectuelle</h2>
        <p>
          La marque, le site et son contenu éditorial appartiennent à l'éditeur de {SITE_NAME}. Les
          photographies de réalisations restent la propriété des ateliers qui les fournissent.
        </p>

        <h2>10. Données personnelles</h2>
        <p>
          Le traitement de vos données est décrit dans notre{" "}
          <Link to="/confidentialite">politique de confidentialité</Link>.
        </p>

        <h2>11. Droit applicable</h2>
        <p>
          Ces conditions sont soumises au droit français. À défaut d'accord amiable, le litige sera
          porté devant les tribunaux compétents. Un consommateur peut recourir gratuitement à un
          médiateur de la consommation.
        </p>
      </LegalBody>
    </PublicLayout>
  );
}
