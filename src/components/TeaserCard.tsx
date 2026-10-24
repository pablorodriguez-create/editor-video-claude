import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { glass } from "./GlassChip";

// Bucle abierto del hook: una tarjeta de cristal con un adelanto real de la pantalla (los leads apareciendo),
// sin sonido. Enseña el resultado antes de explicar cómo se consigue.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export const TeaserCard: React.FC<{
  readonly src: string;
  // Frame del vídeo fuente donde empieza el adelanto.
  readonly sourceFrom: number;
  // Frames del reloj de la secuencia que la contiene.
  readonly from: number;
  readonly to: number;
  // Zona del vídeo fuente (px de 1080x1920) que se ve ampliada dentro de la tarjeta.
  readonly cropX?: number;
  readonly cropY?: number;
  readonly cropW?: number;
  readonly top?: number;
  // Velocidad del adelanto (más lento para no llegar al scroll de la pantalla).
  readonly playbackRate?: number;
  // Tamaño de la tarjeta y, si se da, distancia al borde derecho (si no, va centrada).
  readonly width?: number;
  readonly height?: number;
  readonly right?: number;
}> = ({
  src,
  sourceFrom,
  from,
  to,
  cropX = 260,
  cropY = 330,
  cropW = 520,
  top = 880,
  playbackRate = 0.65,
  width: W = 640,
  height: H = 410,
  right,
}) => {
  // La tarjeta tiene 10px de marco: el área visible mide W - 20.
  const scale = (W - 20) / cropW;
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

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          ...glass,
          position: "absolute",
          top,
          right,
          width: W,
          height: H,
          padding: 10,
          borderRadius: 40,
          opacity: enterP * (1 - exitP),
          scale: `${(0.92 + 0.08 * enterP) * (1 - 0.04 * exitP)}`,
          translate: `0px ${(1 - enterP) * 40}px`,
          filter: `blur(${(1 - enterP) * 8}px)`,
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 30, overflow: "hidden", position: "relative" }}>
          <Sequence
            name="Adelanto (vídeo)"
            from={from}
            durationInFrames={Math.round((to - from) * playbackRate)}
            trimBefore={sourceFrom}
            playbackRate={playbackRate}
            layout="none"
          >
            <Video
              src={staticFile(src)}
              muted
              style={{
                position: "absolute",
                left: -cropX * scale,
                top: -cropY * scale,
                width: 1080 * scale,
                height: 1920 * scale,
              }}
            />
          </Sequence>
        </div>
      </div>
    </AbsoluteFill>
  );
};
