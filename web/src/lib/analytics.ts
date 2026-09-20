import { readConsent } from "./consent";

/**
 * Mesure d'audience, chargée seulement après consentement explicite.
 *
 * On vise un outil sans cookie ni identifiant personnel (Plausible par
 * défaut, Umami ou Matomo se branchent de la même façon) : il suffit de
 * renseigner VITE_ANALYTICS_SRC et VITE_ANALYTICS_DOMAIN. Sans ces
 * variables, rien n'est chargé — le site fonctionne sans mesure.
 */
const SCRIPT_SRC = import.meta.env.VITE_ANALYTICS_SRC as string | undefined;
const SITE_DOMAIN = import.meta.env.VITE_ANALYTICS_DOMAIN as string | undefined;
const SCRIPT_ID = "lc-analytics";

export function analyticsConfigured(): boolean {
  return Boolean(SCRIPT_SRC && SITE_DOMAIN);
}

export function loadAnalytics() {
  if (!analyticsConfigured()) return;
  if (readConsent() !== "granted") return;
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.defer = true;
  script.src = SCRIPT_SRC!;
  script.setAttribute("data-domain", SITE_DOMAIN!);
  document.head.appendChild(script);
}

/** Retire le script et les éventuels cookies déposés après un retrait du consentement. */
export function unloadAnalytics() {
  document.getElementById(SCRIPT_ID)?.remove();
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name) continue;
    if (name.startsWith("_pk_") || name.startsWith("_ga") || name.startsWith("umami")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}

/** Enregistre un évènement nommé, si et seulement si la mesure est active. */
export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (readConsent() !== "granted") return;
  const plausible = (window as unknown as { plausible?: (n: string, o?: unknown) => void })
    .plausible;
  plausible?.(name, props ? { props } : undefined);
}
