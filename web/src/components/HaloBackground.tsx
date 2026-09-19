import React from "react";

export function HaloBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative h-[620px] w-[620px] shrink-0">
        <div className="absolute inset-0 rounded-full bg-gold/12 blur-[110px]" />
        <div className="absolute inset-[70px] rounded-full border border-gold/25" />
        <div className="absolute inset-[125px] rounded-full border border-gold/45" />
        <div className="absolute inset-[165px] rounded-full border border-ivory/20" />
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
    </div>
  );
}
