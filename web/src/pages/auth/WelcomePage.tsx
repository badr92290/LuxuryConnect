import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { HaloBackground } from "../../components/HaloBackground";
import { IconInbox, IconCrown, IconShield, IconSparkle } from "../../components/icons";

const STEPS = [
  {
    icon: IconInbox,
    title: "Vous décrivez votre besoin",
    body: "Prestation, véhicule, photos. Trois minutes, sans créer de dossier compliqué.",
  },
  {
    icon: IconSparkle,
    title: "Nous consultons pour vous",
    body: "Nous sollicitons les ateliers qualifiés de votre région et récupérons leurs prix.",
  },
  {
    icon: IconCrown,
    title: "Vous recevez une offre unique",
    body: "Un prix ferme, un prestataire sélectionné. Aucune négociation à mener vous-même.",
  },
];

const SERVICES = [
  "PPF — film de protection",
  "Covering",
  "Protection céramique",
  "Vitres teintées",
  "Lustrage",
];

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Grain discret : casse l'aplat numérique et donne de la matière. */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16 pt-12 md:px-10">
        {/* ─── En-tête ─── */}
        <header className="mb-16 flex items-center justify-between gap-4 md:mb-24">
          <span className="font-display text-lg tracking-wide text-ivory">
            Luxury<span className="text-gold-gradient italic">Connect</span>
          </span>
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-gold"
          >
            Se connecter
          </Link>
        </header>

        {/* ─── Hero ─── */}
        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 opacity-70">
            <HaloBackground />
          </div>

          <div className="relative max-w-2xl">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-wider2 text-gold">
              Concierge PPF · Covering · Céramique
            </p>
            <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-tight text-ivory md:text-6xl">
              La protection automobile,
              <br />
              <span className="text-gold-gradient italic">orchestrée</span> pour vous.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted">
              Vous décrivez votre besoin une seule fois. Nous consultons les meilleurs ateliers,
              comparons leurs devis, et revenons vers vous avec une offre unique et ferme.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/register?role=CLIENT" className="sm:w-auto">
                <Button full className="sm:w-auto sm:px-8">
                  Demander un devis
                </Button>
              </Link>
              <Link
                to="/register?role=PROFESSIONAL"
                className="rounded-lg px-1 py-2 text-center text-sm font-semibold text-muted transition-colors hover:text-gold sm:px-3"
              >
                Je suis un professionnel →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Preuve ─── */}
        <section className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3 md:mt-28">
          {[
            { value: "1 seule demande", label: "Plusieurs ateliers consultés" },
            { value: "Prix ferme", label: "Aucune négociation de votre côté" },
            { value: "Ateliers vérifiés", label: "Assurance et certifications contrôlées" },
          ].map((item) => (
            <div key={item.value} className="bg-background px-6 py-7">
              <p className="font-display text-xl text-ivory">{item.value}</p>
              <p className="mt-1.5 text-sm text-muted">{item.label}</p>
            </div>
          ))}
        </section>

        {/* ─── Fonctionnement ─── */}
        <section className="mt-20 md:mt-28">
          <h2 className="font-display text-3xl tracking-tight text-ivory md:text-4xl">
            Comment ça marche
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Nous sommes votre intermédiaire : vous ne traitez qu'avec nous, jamais avec plusieurs
            ateliers en parallèle.
          </p>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-gold/30"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-2xl text-border">0{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-ivory">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ─── Prestations ─── */}
        <section className="mt-20 md:mt-28">
          <h2 className="font-display text-3xl tracking-tight text-ivory md:text-4xl">
            Nos prestations
          </h2>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {SERVICES.map((service) => (
              <li
                key={service}
                className="rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm text-ivory"
              >
                {service}
              </li>
            ))}
          </ul>
        </section>

        {/* ─── CTA final ─── */}
        <section className="relative mt-20 overflow-hidden rounded-3xl border border-gold/20 px-8 py-14 text-center md:mt-28 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-radial-glow" aria-hidden="true" />
          <div className="relative">
            <IconShield className="mx-auto mb-6 h-8 w-8 text-gold" aria-hidden="true" />
            <h2 className="mx-auto max-w-xl font-display text-3xl leading-tight tracking-tight text-ivory md:text-4xl">
              Votre véhicule mérite le bon atelier. Pas le premier trouvé.
            </h2>
            <div className="mt-9 flex justify-center">
              <Link to="/register?role=CLIENT">
                <Button className="px-9">Demander un devis</Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-hairline pt-8 text-center">
          <p className="text-[11px] uppercase tracking-wider2 text-mutedDark">
            LuxuryConnect — Est. 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
