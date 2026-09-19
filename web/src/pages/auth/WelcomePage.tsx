import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { HaloBackground } from "../../components/HaloBackground";

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-14 md:max-w-lg">
        <div>
          <div className="mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">
              Concierge PPF · Covering · Céramique
            </span>
          </div>

          <h1 className="font-display text-[2.6rem] leading-[1.08] tracking-tight text-ivory md:text-5xl">
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

          <div className="mt-10 h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <HaloBackground />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 text-center"
            style={{ transform: "translate(-50%, calc(-100% - 14px))" }}
          >
            <span className="font-display text-4xl tracking-wide text-ivory md:text-[2.75rem]">
              Luxury<span className="text-gold-gradient italic">Connect</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
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
