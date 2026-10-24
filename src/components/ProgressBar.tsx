import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../brand/tokens";

// Barra de progreso fina arriba (versión C): da sensación de avance y empuja a ver hasta el final.
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 7,
        width: `${(frame / (durationInFrames - 1)) * 100}%`,
        background: colors.accent,
        boxShadow: `0 0 14px ${colors.accent}`,
        borderRadius: "0 4px 4px 0",
      }}
    />
  );
};
