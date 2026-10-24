import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

// Acabado cinematográfico: grano de película fino (cambia en cada frame) y viñeteado suave.

// `rapido`: el grano sale de 4 texturas ya hechas (public/grain) que se alternan y desplazan. Mismo aspecto y render
// mucho más ligero que calcular el ruido SVG en cada fotograma.
export const FilmLook: React.FC<{ readonly grain?: number; readonly rapido?: boolean }> = ({ grain = 0.07, rapido = false }) => {
  const frame = useCurrentFrame();
  if (rapido) {
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <AbsoluteFill
          style={{ background: "radial-gradient(115% 80% at 50% 40%, transparent 55%, rgba(0,0,0,.42) 100%)" }}
        />
        <Img
          src={staticFile(`grain/grain-${frame % 4}.png`)}
          style={{
            position: "absolute",
            inset: 0,
            width: 1080,
            height: 1920,
            opacity: grain * 1.6,
            mixBlendMode: "overlay",
            translate: `${((frame * 37) % 7) - 3}px ${((frame * 53) % 7) - 3}px`,
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(115% 80% at 50% 40%, transparent 55%, rgba(0,0,0,.42) 100%)" }}
      />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "overlay" }}>
        <filter id={`grain-${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};
