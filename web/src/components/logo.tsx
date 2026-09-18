import React from "react";

/**
 * Silhouette "un seul trait" façon GT bas et long (inspiration 911) :
 * nez bas, une courbe continue capot → pare-brise → toit → custode, pas de rupture.
 * Dessinée sur une grille 0-100 x 0-35.
 */
const CAR_BODY =
  "M4,25 C4,21 7,17 13,14 C20,10 28,8 38,7 C46,6.3 53,6 58,6.3 " +
  "C66,7 75,10 83,15 C89,18.5 93,21.5 95,24.5 C95.6,25.6 95,26.7 93,26.7 " +
  "L6,26.7 C4.3,26.7 4,26 4,25 Z";
const CAR_FENDER_CREASE = "M74,15.5 C78,17 81,19.5 83,22.5";
const HEADLIGHT = { cx: 10, cy: 16, r: 1.1 };
const WHEEL_FRONT = { cx: 20, cy: 26.7, r: 6.8 };
const WHEEL_REAR = { cx: 81, cy: 26.7, r: 7.4 };

export function CarGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 35" className={className} fill="none">
      <path d={CAR_BODY} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <path d={CAR_FENDER_CREASE} stroke="currentColor" strokeWidth={0.7} strokeLinecap="round" opacity={0.5} />
      <circle cx={HEADLIGHT.cx} cy={HEADLIGHT.cy} r={HEADLIGHT.r} fill="currentColor" />
      <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={WHEEL_FRONT.r} stroke="currentColor" strokeWidth={1.6} />
      <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={1.4} fill="currentColor" />
      <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={WHEEL_REAR.r} stroke="currentColor" strokeWidth={1.6} />
      <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={1.4} fill="currentColor" />
    </svg>
  );
}

/** Médaillon (badge circulaire) contenant le glyphe — pour la navigation, l'en-tête, le favicon. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth={2.2} />
      <circle cx="50" cy="50" r="40.5" stroke="currentColor" strokeWidth={0.6} opacity={0.5} />
      <g transform="translate(9, 39) scale(0.82)">
        <path d={CAR_BODY} stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={WHEEL_FRONT.r} stroke="currentColor" strokeWidth={1.9} />
        <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={WHEEL_REAR.r} stroke="currentColor" strokeWidth={1.9} />
      </g>
    </svg>
  );
}

/** Illustration héro : voiture agrandie, remplissage dégradé, ligne de sol réfléchissante. */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 78" className={className} fill="none">
      <defs>
        <linearGradient id="heroCarStroke" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E3C68A" />
          <stop offset="55%" stopColor="#C9A876" />
          <stop offset="100%" stopColor="#8C6B44" />
        </linearGradient>
        <linearGradient id="heroCarFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A876" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#C9A876" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="groundLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C9A876" stopOpacity="0" />
          <stop offset="50%" stopColor="#C9A876" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C9A876" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform="translate(18, 4) scale(1.64)">
        <path d={CAR_BODY} fill="url(#heroCarFill)" stroke="url(#heroCarStroke)" strokeWidth={1} strokeLinejoin="round" strokeLinecap="round" />
        <path d={CAR_FENDER_CREASE} stroke="url(#heroCarStroke)" strokeWidth={0.6} strokeLinecap="round" opacity={0.55} />
        <circle cx={HEADLIGHT.cx} cy={HEADLIGHT.cy} r={HEADLIGHT.r} fill="#C9A876" />
        <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={WHEEL_FRONT.r} stroke="url(#heroCarStroke)" strokeWidth={1} />
        <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={1.3} fill="#C9A876" />
        <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={WHEEL_REAR.r} stroke="url(#heroCarStroke)" strokeWidth={1} />
        <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={1.3} fill="#C9A876" />
      </g>

      <line x1="0" y1="72" x2="200" y2="72" stroke="url(#groundLine)" strokeWidth={1} />
    </svg>
  );
}
