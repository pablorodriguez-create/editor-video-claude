import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fonts } from "../brand/fonts";
import { colors } from "../brand/tokens";
import { glass } from "./GlassChip";
import { LineIconTile } from "./LineIcon";

// Lista de cristal: cada fila (icono, texto y valor) entra cuando se dice y se queda hasta `to`.
// La fila más reciente va a opacidad plena; las anteriores bajan un poco para guiar la vista.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export type InfoRow = {
  // Nombre de un icono de línea de LineIcon.tsx (nada de emojis).
  readonly icon: string;
  readonly label: string;
  readonly value?: string;
  // Frame (del reloj de la secuencia que la contiene) en el que entra la fila.
  readonly at: number;
  // Frame en el que aparece el valor (por defecto, con la fila). Así la cifra sale cuando se dice.
  readonly valueAt?: number;
};

export const InfoList: React.FC<{
  readonly rows: InfoRow[];
  readonly to: number;
  readonly top?: number;
}> = ({ rows, to, top = 200 }) => {
  const frame = useCurrentFrame();
  const exitP = interpolate(frame, [to - 8, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const latest = rows.filter((r) => frame >= r.at).length - 1;

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top,
          width: 780,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          opacity: 1 - exitP,
          translate: `0px ${exitP * -8}px`,
        }}
      >
        {rows.map((row, i) => {
          const p = interpolate(frame, [row.at, row.at + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeOut,
          });
          if (p === 0) return null;
          return (
            <div
              key={`${row.label}-${i}`}
              style={{
                ...glass,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "16px 30px",
                borderRadius: 28,
                opacity: p * (i === latest ? 1 : 0.78),
                scale: `${0.95 + 0.05 * p}`,
                translate: `0px ${(1 - p) * 14}px`,
                filter: `blur(${(1 - p) * 6}px)`,
              }}
            >
              <LineIconTile name={row.icon} size={64} />
              <span
                style={{
                  flex: 1,
                  color: "#ffffff",
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: 44,
                  letterSpacing: "-0.01em",
                }}
              >
                {row.label}
              </span>
              {row.value ? (
                <span
                  style={{
                    opacity: interpolate(frame, [row.valueAt ?? row.at, (row.valueAt ?? row.at) + 8], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: easeOut,
                    }),
                    scale: `${interpolate(frame, [row.valueAt ?? row.at, (row.valueAt ?? row.at) + 12], [0.85, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: easeOut,
                    })}`,
                    color: colors.highlight,
                    fontFamily: fonts.display,
                    fontWeight: 800,
                    fontSize: 50,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {row.value}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
