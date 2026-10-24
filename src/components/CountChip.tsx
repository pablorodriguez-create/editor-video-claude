import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fonts } from "../brand/fonts";
import { colors } from "../brand/tokens";
import { glass } from "./GlassChip";

// Tarjeta de cristal para el gancho: logo (por defecto LinkedIn), contador que sube hasta `target` cuando se dice la cifra
// y una fila de avatares genéricos (sin caras ni nombres reales) que entran escalonados.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const AVATAR_TONES = [colors.accent, colors.accentHi, colors.accentDeep, colors.accent, colors.accentHi];

export const CountChip: React.FC<{
  readonly target: number;
  readonly label: string;
  // Frames del reloj de la secuencia que la contiene.
  readonly from: number;
  readonly countFrom: number;
  readonly to: number;
  readonly top?: number;
  // Logo de public/ que va a la izquierda (por defecto el oficial de LinkedIn). Cadena vacía = sin logo.
  readonly logo?: string;
}> = ({ target, label, from, countFrom, to, top = 200, logo = "logos/linkedin-in-blue.png" }) => {
  const frame = useCurrentFrame();
  const enterP = interpolate(frame, [from, from + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const exitP = interpolate(frame, [to - 8, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const count = Math.round(
    interpolate(frame, [countFrom, countFrom + 20], [0, target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOut,
    }),
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          ...glass,
          position: "absolute",
          top,
          display: "flex",
          alignItems: "center",
          gap: 26,
          padding: "20px 34px 20px 22px",
          borderRadius: 40,
          opacity: enterP * (1 - exitP),
          scale: `${(0.94 + 0.06 * enterP) * (1 - 0.03 * exitP)}`,
          translate: `0px ${(1 - enterP) * -12 + exitP * -8}px`,
          filter: `blur(${(1 - enterP) * 6}px)`,
        }}
      >
        {logo ? <Img src={staticFile(logo)} style={{ height: 96, width: 113, objectFit: "contain", objectPosition: "left center" }} /> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span
              style={{
                color: colors.highlight,
                fontFamily: fonts.display,
                fontWeight: 800,
                fontSize: 84,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {count}
            </span>
            <span style={{ color: "#ffffff", fontFamily: fonts.body, fontWeight: 600, fontSize: 46 }}>{label}</span>
          </div>
          <div style={{ display: "flex" }}>
            {AVATAR_TONES.map((tone, i) => {
              const p = interpolate(frame, [countFrom + i * 3, countFrom + i * 3 + 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: easeOut,
              });
              return (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: 44,
                    marginLeft: i === 0 ? 0 : -12,
                    borderRadius: 999,
                    background: `linear-gradient(160deg, ${tone}, ${colors.onHighlight})`,
                    border: "3px solid rgba(255,255,255,.85)",
                    opacity: p,
                    scale: `${0.7 + 0.3 * p}`,
                  }}
                />
              );
            })}
            <span
              style={{
                marginLeft: 14,
                alignSelf: "center",
                color: "rgba(255,255,255,.8)",
                fontFamily: fonts.body,
                fontWeight: 500,
                fontSize: 30,
                opacity: interpolate(frame, [countFrom + 15, countFrom + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              +{Math.max(0, count - AVATAR_TONES.length)}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
