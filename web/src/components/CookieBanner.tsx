import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsConfigured, loadAnalytics, unloadAnalytics } from "../lib/analytics";
import { ConsentChoice, onConsentChange, readConsent, writeConsent } from "../lib/consent";

/**
 * Bandeau de consentement. Accepter et refuser sont deux boutons de même
 * taille et de même visibilité : le refus ne doit pas être plus coûteux que
 * l'acceptation. Tant qu'aucun choix n'est fait, aucun traceur n'est chargé.
 */
export function CookieBanner() {
  const [choice, setChoice] = useState<ConsentChoice | null>(() => readConsent());

  useEffect(() => {
    if (readConsent() === "granted") loadAnalytics();
    return onConsentChange((next) => {
      setChoice(next);
      if (next === "granted") loadAnalytics();
      else unloadAnalytics();
    });
  }, []);

  // Sans outil de mesure configuré, le site ne dépose rien : pas de bandeau.
  if (!analyticsConfigured() || choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-50 animate-fade-in-up border-t border-hairline bg-surface/95 px-5 py-5 backdrop-blur-xl md:px-8"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p id="cookie-title" className="font-semibold text-ivory">
            Mesure d'audience
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Nous aimerions mesurer la fréquentation du site pour l'améliorer. Aucune donnée n'est
            revendue et rien n'est déposé sans votre accord.{" "}
            <Link to="/confidentialite" className="text-gold underline underline-offset-2">
              En savoir plus
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => writeConsent("denied")}
            className="min-h-[44px] flex-1 rounded-xl border border-border px-5 text-sm font-semibold text-ivory transition-colors hover:border-gold/60 hover:text-gold md:flex-none"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => writeConsent("granted")}
            className="min-h-[44px] flex-1 rounded-xl border border-border px-5 text-sm font-semibold text-ivory transition-colors hover:border-gold/60 hover:text-gold md:flex-none"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
