import React from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../../layout/PublicLayout";
import { PageMeta } from "../../seo/PageMeta";
import { Button } from "../../components/ui";

/** Quelques portes de sortie valent mieux qu'un renvoi silencieux vers l'accueil. */
const SUGGESTIONS = [
  { to: "/", label: "Accueil" },
  { to: "/assistance", label: "Assistance" },
  { to: "/contact", label: "Nous contacter" },
  { to: "/login", label: "Se connecter" },
];

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <PageMeta
        title="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée."
        noIndex
      />

      <div className="py-10 text-center">
        <p className="font-display text-6xl text-gold-gradient md:text-7xl">404</p>
        <h1 className="mt-6 font-display text-3xl leading-tight tracking-tight text-ivory md:text-4xl">
          Cette page a quitté l'atelier.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          L'adresse demandée n'existe pas, ou la page a été déplacée. Votre demande de devis, elle,
          n'a pas bougé.
        </p>

        <div className="mt-9 flex justify-center">
          <Link to="/register?role=CLIENT">
            <Button className="px-9">Demander un devis</Button>
          </Link>
        </div>

        <nav aria-label="Pages utiles" className="mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {SUGGESTIONS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-block py-1.5 text-muted underline underline-offset-4 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PublicLayout>
  );
}
