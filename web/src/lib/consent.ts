/**
 * Consentement aux cookies de mesure d'audience.
 *
 * Le site ne dépose aucun cookie de suivi tant que la personne n'a pas
 * accepté : c'est ce qu'exige le RGPD, et le refus doit être aussi simple
 * que l'acceptation — d'où deux boutons de même poids dans la bannière.
 * Seul le choix lui-même est stocké, dans le stockage local, pour ne pas
 * reposer la question à chaque visite.
 */
export type ConsentChoice = "granted" | "denied";

const STORAGE_KEY = "lc_consent";
/** Un consentement se re-demande au bout de six mois (recommandation CNIL). */
const MAX_AGE_MS = 182 * 24 * 3600 * 1000;

interface StoredConsent {
  choice: ConsentChoice;
  at: number;
}

export function readConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.choice !== "granted" && parsed.choice !== "denied") return null;
    if (Date.now() - parsed.at > MAX_AGE_MS) return null;
    return parsed.choice;
  } catch {
    // Navigation privée, stockage bloqué : on repose la question.
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    // Sans stockage, le choix ne vaut que pour la session en cours.
  }
  listeners.forEach((fn) => fn(choice));
}

export function clearConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* rien à faire */
  }
  listeners.forEach((fn) => fn(null));
}

type Listener = (choice: ConsentChoice | null) => void;
const listeners = new Set<Listener>();

export function onConsentChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
