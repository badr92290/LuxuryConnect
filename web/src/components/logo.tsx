import React from "react";

/** Silhouette de coupé GT bas et allongé, dessinée sur une grille 0-100 x 0-34. */
const CAR_BODY =
  "M3,25 C3,22 6,20 11,19 L28,18 C31,12 36,8 45,7 C53,6 61,6.3 66,7.5 " +
  "C72,9 76,12 78,15 L84,17 C90,18 95,21 96.5,24.5 C97,26 96,27 94,27 " +
  "L6,27 C4,27 3,26 3,25 Z";
const CAR_CREASE = "M32,18 L44,18.4 M68,9.8 L79,15.3";
const WHEEL_FRONT = { cx: 23, cy: 27, r: 7 };
const WHEEL_REAR = { cx: 79, cy: 27, r: 7 };

export function CarGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 34" className={className} fill="none">
      <path d={CAR_BODY} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <path d={CAR_CREASE} stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" opacity={0.6} />
      <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={WHEEL_FRONT.r} stroke="currentColor" strokeWidth={1.6} />
      <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={1.6} fill="currentColor" />
      <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={WHEEL_REAR.r} stroke="currentColor" strokeWidth={1.6} />
      <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={1.6} fill="currentColor" />
    </svg>
  );
}

/** Médaillon (badge circulaire) contenant le glyphe — pour la navigation, l'en-tête, le favicon. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth={2.2} />
      <circle cx="50" cy="50" r="40.5" stroke="currentColor" strokeWidth={0.6} opacity={0.5} />
      <g transform="translate(9, 38) scale(0.82)">
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
          <stop offset="50%" stopColor="#C9A876" />
          <stop offset="100%" stopColor="#8C6B44" />
        </linearGradient>
        <linearGradient id="heroCarFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A876" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#C9A876" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="groundLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C9A876" stopOpacity="0" />
          <stop offset="50%" stopColor="#C9A876" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C9A876" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform="translate(18, 4) scale(1.64)">
        <path d={CAR_BODY} fill="url(#heroCarFill)" stroke="url(#heroCarStroke)" strokeWidth={1.1} strokeLinejoin="round" strokeLinecap="round" />
        <path d={CAR_CREASE} stroke="url(#heroCarStroke)" strokeWidth={0.5} strokeLinecap="round" opacity={0.7} />
        <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={WHEEL_FRONT.r} stroke="url(#heroCarStroke)" strokeWidth={1.1} />
        <circle cx={WHEEL_FRONT.cx} cy={WHEEL_FRONT.cy} r={1.4} fill="#C9A876" />
        <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={WHEEL_REAR.r} stroke="url(#heroCarStroke)" strokeWidth={1.1} />
        <circle cx={WHEEL_REAR.cx} cy={WHEEL_REAR.cy} r={1.4} fill="#C9A876" />
      </g>

      <line x1="0" y1="72" x2="200" y2="72" stroke="url(#groundLine)" strokeWidth={1} />
    </svg>
  );
}
