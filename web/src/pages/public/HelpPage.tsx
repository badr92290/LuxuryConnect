import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../../layout/PublicLayout";
import { PageMeta } from "../../seo/PageMeta";
import { CONTACT_EMAIL } from "../../seo/siteConfig";
import { Button } from "../../components/ui";
import { IconPlus } from "../../components/icons";

const FAQ = [
  {
    q: "Comment se passe une demande ?",
    a: "Vous décrivez votre besoin une seule fois : prestation, véhicule, photos si vous en avez. Nous consultons les ateliers qualifiés de votre région, nous comparons leurs prix, et nous revenons vers vous avec une offre unique. Vous n'avez personne à appeler.",
  },
  {
    q: "Pourquoi je ne choisis pas l'atelier moi-même ?",
    a: "C'est le principe : nous sommes votre interlocuteur unique. Nous sélectionnons l'atelier qui convient à votre véhicule et à votre prestation, en vérifiant son assurance et ses certifications. Vous découvrez son nom au moment où vous acceptez l'offre.",
  },
  {
    q: "Le prix annoncé peut-il changer ?",
    a: "Non. Le prix que nous vous transmettons est ferme et comprend tout. Il n'est révisé que si l'état réel du véhicule diffère sensiblement de ce que vous avez décrit — et jamais sans votre accord préalable.",
  },
  {
    q: "Combien de temps pour recevoir une offre ?",
    a: "En général 48 à 72 heures ouvrées. Si un atelier tarde à répondre, nous le relançons automatiquement au bout de deux jours.",
  },
  {
    q: "Un défaut apparaît après la prestation, que faire ?",
    a: "Ouvrez un dossier de service après-vente depuis la réservation concernée. Là, et seulement là, vous échangez directement avec l'atelier qui a posé : c'est lui qui garantit son travail. Si personne ne vous répond sous trois jours, nous reprenons la main sans que vous ayez à le demander.",
  },
  {
    q: "Puis-je nous appeler en renfort sur un dossier SAV ?",
    a: "Oui, à tout moment. Un bouton « Demander l'assistance LuxuryConnect » figure dans chaque dossier. Nous rejoignons alors la discussion.",
  },
  {
    q: "Quelles prestations proposez-vous ?",
    a: "PPF satin, PPF coloré, PPF brillant, covering, céramique et vitres teintées.",
  },
  {
    q: "Comment supprimer mon compte et mes données ?",
    a: `Écrivez-nous à ${CONTACT_EMAIL}. Nous répondons sous un mois, comme l'exige le RGPD.`,
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-hairline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-ivory">{q}</span>
        <IconPlus
          className={`h-5 w-5 shrink-0 text-gold transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {open && <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-muted">{a}</p>}
    </li>
  );
}

export default function HelpPage() {
  return (
    <PublicLayout>
      <PageMeta
        title="Assistance"
        description="Questions fréquentes sur LuxuryConnect : déroulé d'une demande, prix ferme, service après-vente et contact de l'assistance."
      />

      <h1 className="font-display text-4xl leading-tight tracking-tight text-ivory">Assistance</h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Les réponses aux questions qui reviennent le plus souvent. Si la vôtre n'y est pas, écrivez-nous.
      </p>

      <ul className="mt-10 border-t border-hairline">
        {FAQ.map((item) => (
          <FaqItem key={item.q} {...item} />
        ))}
      </ul>

      <div className="mt-12 rounded-2xl border border-gold/20 p-8 text-center">
        <p className="font-display text-2xl text-ivory">Besoin d'une réponse sur votre dossier ?</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Si vous avez déjà un compte, tout est dans votre espace. Sinon, écrivez-nous : nous
          répondons sous 24 à 48 heures ouvrées.
        </p>
        <div className="mt-7 flex justify-center">
          <Link to="/contact">
            <Button className="px-9">Nous écrire</Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted">
          ou directement à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </PublicLayout>
  );
}
