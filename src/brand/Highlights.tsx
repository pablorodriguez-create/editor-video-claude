import { useCurrentFrame } from "remotion";
import { colors, alpha, radius } from "./tokens";
import { fonts } from "./fonts";
import { progress } from "./anim";

// Palabra clave subrayada a mano con el color de acento. El trazo se dibuja desde `start`.
export const HandUnderline: React.FC<{ children: React.ReactNode; start: number }> = ({
  children,
  start,
}) => {
  const p = progress(useCurrentFrame(), start, 16);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <svg
        viewBox="0 0 300 14"
        preserveAspectRatio="none"
        style={{ position: "absolute", left: 0, bottom: "-0.12em", width: "100%", height: "0.32em" }}
      >
        <path
          d="M3 9 C 70 4, 150 3, 297 6"
          stroke={colors.accentHi}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
          // con progreso 0 el extremo redondeado del trazo deja un punto suelto: no se pinta hasta que empieza
          opacity={p > 0.001 ? 1 : 0}
        />
      </svg>
    </span>
  );
};

// Recuadro inclinado con el color de resultado para cifras, resultados o la palabra del CTA.
export const HighlightBox: React.FC<{
  children: React.ReactNode;
  start: number;
  style?: React.CSSProperties;
}> = ({ children, start, style }) => {
  const p = progress(useCurrentFrame(), start, 14);
  return (
    <span
      style={{
        display: "inline-block",
        background: colors.highlight,
        color: colors.onHighlight,
        padding: "0.02em 0.22em",
        borderRadius: "0.12em",
        rotate: "-2deg",
        scale: `${0.85 + 0.15 * p}`,
        opacity: p,
        boxShadow: `0 20px 60px ${colors.highlightGlow}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Píldora con borde del color de acento (etiquetas de sección).
export const Badge: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      display: "inline-block",
      border: `3px solid ${colors.accent}`,
      background: alpha(colors.accent, .12),
      color: colors.accentHi,
      borderRadius: radius.pill,
      padding: "14px 32px",
      fontFamily: fonts.mono,
      fontWeight: 500,
      fontSize: 30,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);
