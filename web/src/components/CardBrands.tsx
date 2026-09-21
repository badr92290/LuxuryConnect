import React from "react";

/**
 * Logos des réseaux acceptés, rendus en SVG plutôt qu'en images : ils
 * restent nets à toute taille et n'ajoutent aucune requête. Ils servent à
 * dire, avant même d'ouvrir le formulaire, que la carte est acceptée.
 */
function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex h-7 w-11 items-center justify-center rounded-md border border-hairline bg-surfaceAlt"
    >
      {children}
    </span>
  );
}

export function CardBrands({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <Frame label="Visa">
        <svg viewBox="0 0 48 16" className="h-3.5" aria-hidden="true">
          <text
            x="24"
            y="13"
            textAnchor="middle"
            fontFamily="Manrope, sans-serif"
            fontSize="14"
            fontStyle="italic"
            fontWeight="800"
            fill="#F6F2EA"
            letterSpacing="0.5"
          >
            VISA
          </text>
        </svg>
      </Frame>

      <Frame label="Mastercard">
        <svg viewBox="0 0 40 24" className="h-4" aria-hidden="true">
          <circle cx="15" cy="12" r="9" fill="#EB6B4B" />
          <circle cx="25" cy="12" r="9" fill="#E8B44B" fillOpacity="0.9" />
        </svg>
      </Frame>

      <Frame label="Carte Bancaire">
        <svg viewBox="0 0 48 20" className="h-3.5" aria-hidden="true">
          <text
            x="24"
            y="15"
            textAnchor="middle"
            fontFamily="Manrope, sans-serif"
            fontSize="13"
            fontWeight="800"
            fill="#F6F2EA"
          >
            CB
          </text>
        </svg>
      </Frame>

      <Frame label="American Express">
        <svg viewBox="0 0 48 20" className="h-3" aria-hidden="true">
          <text
            x="24"
            y="14"
            textAnchor="middle"
            fontFamily="Manrope, sans-serif"
            fontSize="10"
            fontWeight="800"
            fill="#F6F2EA"
            letterSpacing="0.3"
          >
            AMEX
          </text>
        </svg>
      </Frame>
    </span>
  );
}
