import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

/**
 * Derrière un reverse proxy (Railway, Fly, Nginx…), la requête arrive en HTTP
 * et le protocole d'origine n'est lisible que dans `X-Forwarded-Proto`.
 * On renvoie donc l'internaute vers l'équivalent HTTPS avant tout traitement.
 * Désactivé en développement, où l'on sert en clair sur localhost.
 */
export const forceHttps: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  const proto = req.header("x-forwarded-proto") ?? req.protocol;
  if (proto === "https") return next();
  // 308 conserve la méthode et le corps : un POST reste un POST.
  return res.redirect(308, `https://${req.header("host")}${req.originalUrl}`);
};

/**
 * Origines autorisées à appeler l'API, lues dans CORS_ORIGINS
 * (liste séparée par des virgules). Sans réglage, on reste permissif
 * en développement et on refuse tout le reste en production.
 */
export function allowedOrigins(): string[] | null {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return process.env.NODE_ENV === "production" ? [] : null;
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

/** Limite générale : protège l'API d'un martèlement accidentel ou malveillant. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Trop de requêtes, merci de réessayer dans quelques minutes." },
});

/** Limite serrée sur l'authentification : freine le bourrage d'identifiants. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Réessayez dans quelques minutes." },
});

/** Limite sur les formulaires publics : un robot ne passera pas la 5ᵉ soumission. */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Vous avez déjà envoyé plusieurs demandes. Réessayez plus tard." },
});
