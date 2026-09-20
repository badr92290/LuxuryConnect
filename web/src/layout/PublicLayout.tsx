import React from "react";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL, SITE_NAME } from "../seo/siteConfig";

/** Liens de bas de page, partagés par toutes les pages publiques. */
const FOOTER_LINKS = [
  { to: "/contact", label: "Nous contacter" },
  { to: "/cgu", label: "Conditions générales" },
  { to: "/confidentialite", label: "Confidentialité & RGPD" },
];

export function PublicHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link to="/" className="font-display text-lg tracking-wide text-ivory">
        Luxury<span className="text-gold-gradient italic">Connect</span>
      </Link>
      <Link
        to="/login"
        className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-gold"
      >
        Se connecter
      </Link>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-hairline pt-8">
      <nav aria-label="Liens de bas de page">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="inline-block py-1.5 text-muted transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block py-1.5 text-muted transition-colors hover:text-gold"
            >
              {CONTACT_EMAIL}
            </a>
          </li>
        </ul>
      </nav>
      <p className="mt-6 text-center text-[11px] uppercase tracking-wider2 text-mutedDark">
        {SITE_NAME} — Est. 2026
      </p>
    </footer>
  );
}

/**
 * Cadre des pages publiques : même gouttière, même en-tête et même pied de
 * page que l'accueil, pour que les pages légales ne paraissent pas rapportées.
 */
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 md:px-8">
        <PublicHeader />
        <main className="mt-12 animate-fade-in">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}

/** Corps de texte des pages légales : titres, paragraphes et listes homogènes. */
export function LegalBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-body max-w-none text-[15px] leading-relaxed text-muted">{children}</div>
  );
}
