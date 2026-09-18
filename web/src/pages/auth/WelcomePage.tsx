import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { IconCrown } from "../../components/icons";

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-16 md:max-w-lg">
        <div>
          <div className="mb-8 flex items-center gap-2 text-gold">
            <IconCrown className="h-5 w-5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">
              Concierge PPF · Covering · Céramique
            </span>
          </div>

          <h1 className="font-display text-[2.75rem] leading-[1.08] tracking-tight text-ivory md:text-5xl">
            La protection
            <br />
            automobile,
            <br />
            <span className="text-gold-gradient italic">orchestrée</span> pour vous.
          </h1>

          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">
            Décrivez votre besoin — notre équipe consulte pour vous les meilleurs artisans du secteur
            et vous revient avec une offre unique, claire, sans négociation à mener vous-même.
          </p>

          <div className="mt-8 h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
        </div>

        <div className="mt-16 flex flex-col gap-3">
          <Link to="/login">
            <Button full>Se connecter</Button>
          </Link>
          <Link to="/register?role=CLIENT">
            <Button full variant="secondary">
              Créer un compte client
            </Button>
          </Link>
          <Link to="/register?role=PROFESSIONAL">
            <Button full variant="secondary">
              Je suis un professionnel
            </Button>
          </Link>

          <p className="mt-6 text-center text-[11px] uppercase tracking-wider2 text-mutedDark">
            LuxuryConnect — Est. 2026
          </p>
        </div>
      </div>
    </div>
  );
}
