import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../brand/tokens";
import { fonts } from "../brand/fonts";

// Botón de llamada a la acción de los anuncios: "Agenda una reunión" con el color de acento, arriba (nunca sobre la cara).
// Entra con un muelle suave y late despacio mientras se dice la llamada a la acción.
export const CtaAnuncio: React.FC<{ readonly dur: number; readonly texto?: string }> = ({ dur, texto = "Agenda una reunión" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const exit = interpolate(frame, [dur - 8, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const pulso = 1 + Math.sin((frame / fps) * Math.PI * 1.6) * 0.025 * enter;
  return (
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "22px 40px 22px 30px",
          borderRadius: 999,
          background: `linear-gradient(180deg, ${colors.accentHi}, ${colors.accent})`,
          boxShadow: `0 0 0 2px rgba(255,255,255,.25) inset, 0 20px 60px ${colors.accentGlow}, 0 12px 30px rgba(0,0,0,.45)`,
          color: "#FFFFFF",
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 50,
          letterSpacing: "-0.01em",
          opacity: enter * (1 - exit),
          translate: `0px ${(1 - enter) * -40}px`,
          scale: `${pulso}`,
        }}
      >
        {/* calendario (icono de línea) */}
        <svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="m9 16 2 2 4-4" stroke={colors.highlight} />
        </svg>
        {texto}
      </div>
    </div>
  );
};
