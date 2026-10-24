import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../brand/fonts";
import { colors } from "../brand/tokens";
import { LOGOS } from "./IconPop";
import { LineIconTile } from "./LineIcon";

// Rótulo de la versión C: icono (logo oficial o icono de línea) + frase clave en Anton, en la franja de arriba (nunca sobre la cara).
// Entra con salto suave, se queda mientras dura su secuencia y sale rápido. `count` anima una cifra hasta su valor.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export const Callout: React.FC<{
  readonly text: string;
  readonly icon?: string; // icono de línea (LineIcon) o "logo:<nombre>" (claves de LOGOS en IconPop.tsx)
  // Recuadro inclinado con el color de resultado (kit de marca) para cifras y resultados.
  readonly highlight?: boolean;
  // Cifra animada: el texto debe contener {n}; cuenta desde `from` hasta `to`.
  readonly count?: { readonly from: number; readonly to: number };
  readonly top?: number;
}> = ({ text, icon, highlight = false, count, top = 170 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enterP = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.35, 0.64, 1),
  });
  const exitP = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  let shown = text;
  if (count) {
    const n = interpolate(frame, [2, 22], [count.from, count.to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
    // punto de miles siempre ("6.819"): "es-ES" no agrupa las cifras de 4 dígitos por defecto
    shown = text.replace("{n}", String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }
  const logo = icon?.startsWith("logo:") ? LOGOS[icon.slice(5)] : undefined;

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top,
          maxWidth: 980,
          display: "flex",
          alignItems: "center",
          gap: 28,
          opacity: Math.min(1, enterP) * (1 - exitP),
          scale: `${(0.88 + 0.12 * enterP) * (1 - 0.04 * exitP)}`,
          translate: `0px ${(1 - Math.min(1, enterP)) * -18 - exitP * 10}px`,
          filter: `blur(${(1 - Math.min(1, enterP)) * 6 + exitP * 4}px)`,
        }}
      >
        {logo ? (
          <div
            style={{
              width: 150,
              height: 150,
              minWidth: 150,
              borderRadius: 38,
              background: "rgba(255,255,255,.94)",
              border: "1px solid rgba(255,255,255,.35)",
              boxShadow: "0 14px 34px rgba(0,0,0,.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* ventana cuadrada: la ® del PNG de LinkedIn queda fuera entera, nunca cortada a medias */}
            <div style={{ width: 100, height: 100, overflow: "hidden", borderRadius: 10 }}>
              <Img
                src={staticFile(logo.src)}
                style={{ width: Math.round(100 * logo.w), maxWidth: "none", height: 100, objectFit: "contain", objectPosition: "left center" }}
              />
            </div>
          </div>
        ) : icon ? (
          <LineIconTile name={icon} size={150} />
        ) : null}
        <div
          style={{
            fontFamily: fonts.thumb,
            fontSize: shown.length > 18 ? 76 : 96,
            lineHeight: 1.02,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: highlight ? colors.onHighlight : "#ffffff",
            textShadow: highlight ? "none" : "0 6px 30px rgba(0,0,0,.6)",
            ...(highlight
              ? { background: colors.highlight, padding: "6px 22px 2px", rotate: "-2deg", borderRadius: 10, boxShadow: `0 10px 40px ${colors.highlightGlow}` }
              : {}),
          }}
        >
          {shown}
        </div>
      </div>
    </AbsoluteFill>
  );
};
