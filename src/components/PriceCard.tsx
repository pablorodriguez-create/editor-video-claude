import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fonts } from "../brand/fonts";
import { colors } from "../brand/tokens";
import { glass } from "./GlassChip";

// Tarjeta de cristal con una foto (producto, servicio…) y un precio o cifra que cuenta hacia arriba.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export const PriceCard: React.FC<{
  readonly image: string;
  readonly title: string;
  readonly amount: number;
  readonly prefix?: string;
  // Frames del reloj de la secuencia que la contiene.
  readonly from: number;
  readonly countFrom: number;
  readonly to: number;
  readonly top?: number;
}> = ({ image, title, amount, prefix = "$", from, countFrom, to, top = 220 }) => {
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
  const count = interpolate(frame, [countFrom, countFrom + 24], [0, amount], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const shown = Math.round(count / 1000) * 1000;

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          ...glass,
          position: "absolute",
          top,
          width: 780,
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: 16,
          borderRadius: 36,
          opacity: enterP * (1 - exitP),
          scale: `${(0.94 + 0.06 * enterP) * (1 - 0.03 * exitP)}`,
          translate: `0px ${(1 - enterP) * 16 + exitP * -8}px`,
          filter: `blur(${(1 - enterP) * 6}px)`,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{ width: 300, height: 180, objectFit: "cover", borderRadius: 24 }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ color: "rgba(255,255,255,.75)", fontFamily: fonts.body, fontWeight: 500, fontSize: 34 }}>
            {title}
          </span>
          <span
            style={{
              color: colors.highlight,
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {prefix}
            {shown.toLocaleString("es-ES")}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
