import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, colors } from "../brand/tokens";
import { LineIconTile } from "./LineIcon";

// Versión C: elemento visual que entra en pantalla cuando se dice la palabra (sin texto: el texto ya va en los
// subtítulos). Icono de línea o logo oficial en la franja de arriba, nunca sobre la cara. Entra con salto suave y
// un halo, flota un poco y sale rápido.

export const LOGOS: Record<string, { src: string; w: number }> = {
  linkedin: { src: "logos/linkedin-in-blue.png", w: 635 / 540 },
  instagram: { src: "logos/instagram-glyph-gradient.png", w: 1 },
  claude: { src: "logos/claude-icon-rounded.svg", w: 1 },
  chatgpt: { src: "logos/openai-blossom.svg", w: 1 },
  tiktok: { src: "logos/tiktok-icon-circle.png", w: 1 },
  google: { src: "logos/google-g.png", w: 1 },
  meta: { src: "logos/meta-symbol.png", w: 1 },
};

export const IconPop: React.FC<{
  readonly icon: string; // icono de LineIcon o "logo:<nombre>" (claves de LOGOS)
  // Centro horizontal del elemento (px). Se alterna izquierda / centro / derecha para dar ritmo.
  readonly x?: number;
  readonly top?: number;
  readonly size?: number;
}> = ({ icon, x = 540, top = 150, size = 210 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // entra barriendo desde la izquierda con rebote y sale por la derecha acelerando (misma dirección de arte que Broll)
  const enterP = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1.35, 0.4, 1),
  });
  const exitP = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.55, 0, 0.9, 0.4),
  });
  const float = Math.sin(frame / 12) * 4 * Math.min(1, Math.max(0, (frame - 14) / 10));
  const logo = icon.startsWith("logo:") ? LOGOS[icon.slice(5)] : undefined;
  const glow = icon === "euro" || icon === "coins" || icon === "banknote" ? alpha(colors.highlight, .38) : alpha(colors.accentHi, .42);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x - size / 2,
          top,
          width: size,
          height: size,
          opacity: Math.min(1, enterP * 1.6) * (1 - exitP * 0.6),
          translate: `${(1 - enterP) * -900 + exitP * 1000}px ${float}px`,
          rotate: `${(1 - enterP) * -25 + exitP * 20}deg`,
          filter: `blur(${Math.abs(1 - enterP) * 10 + exitP * 10}px)`,
        }}
      >
        {/* halo detrás del elemento */}
        <div
          style={{
            position: "absolute",
            inset: -size * 0.35,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${glow}, rgba(0,0,0,0))`,
            opacity: 0.9,
          }}
        />
        {logo ? (
          <div
            style={{
              position: "relative",
              width: size,
              height: size,
              borderRadius: size * 0.26,
              background: "rgba(255,255,255,.95)",
              border: "1px solid rgba(255,255,255,.35)",
              boxShadow: "0 18px 40px rgba(0,0,0,.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* ventana cuadrada: la ® del PNG de LinkedIn queda fuera entera */}
            <div style={{ width: size * 0.66, height: size * 0.66, overflow: "hidden", borderRadius: size * 0.06 }}>
              <Img
                src={staticFile(logo.src)}
                style={{ width: Math.round(size * 0.66 * logo.w), maxWidth: "none", height: size * 0.66, objectFit: "contain", objectPosition: "left center" }}
              />
            </div>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <LineIconTile name={icon} size={size} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
