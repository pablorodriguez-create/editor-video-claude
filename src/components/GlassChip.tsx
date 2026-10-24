import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fonts } from "../brand/fonts";

// Etiqueta de cristal para nombrar cada paso de la demo. Entra con fundido, desenfoque y 10px de recorrido,
// y sale en la mitad de tiempo. `from` y `to` son frames del reloj de la secuencia que la contiene.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export const glass: React.CSSProperties = {
  background: "rgba(20,24,36,0.42)",
  backdropFilter: "blur(28px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.22)",
  boxShadow: "0 18px 50px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.22)",
};

export const GlassChip: React.FC<{
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly icon?: string;
  readonly top?: number;
}> = ({ label, from, to, icon, top = 170 }) => {
  const frame = useCurrentFrame();
  const enterP = interpolate(frame, [from + 4, from + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const exitP = interpolate(frame, [to - 8, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          ...glass,
          position: "absolute",
          top,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: icon ? "16px 34px 16px 18px" : "20px 36px",
          borderRadius: 999,
          color: "#ffffff",
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: "-0.01em",
          opacity: enterP * (1 - exitP),
          scale: `${(0.95 + 0.05 * enterP) * (1 - 0.03 * exitP)}`,
          translate: `0px ${(1 - enterP) * -10 + exitP * -6}px`,
          filter: `blur(${(1 - enterP) * 6}px)`,
        }}
      >
        {icon ? (
          <Img src={staticFile(icon)} style={{ height: 64, width: 75, objectFit: "contain", objectPosition: "left center" }} />
        ) : null}
        {label}
      </div>
    </AbsoluteFill>
  );
};
