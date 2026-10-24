import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, alpha } from "./tokens";

// Fondo oscuro de marca con halos del color de acento que se mueven muy despacio.
export const Background: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;

  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(1400px 900px at 50% ${-200 + drift}px, ${alpha(colors.accent, .32)}, transparent 70%)`,
          `radial-gradient(900px 900px at ${100 + drift / 20}% 70%, ${alpha(colors.accentHi, .10)}, transparent 70%)`,
          `radial-gradient(800px 800px at 0% 100%, ${alpha(colors.accentDeep, .22)}, transparent 70%)`,
          colors.bg,
        ].join(","),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
