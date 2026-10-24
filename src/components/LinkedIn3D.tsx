import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, colors } from "../brand/tokens";

// Logo oficial de LinkedIn en 3D para dar contexto en los primeros segundos de un Reel:
// entra por la izquierda girando, flota con un brillo que lo recorre y sale por la derecha.
// El grosor se hace con capas apiladas en profundidad (CSS 3D). Va arriba, por encima de la cabeza: nunca sobre la cara.

const ease = Easing.bezier(0.45, 0, 0.55, 1);
const LAYERS = 22;

export const LinkedIn3D: React.FC<{ readonly dur: number; readonly size?: number; readonly top?: number }> = ({ dur, size = 230, top = 38 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 55, mass: 1 } });
  const exit = interpolate(frame, [dur - 20, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const x = interpolate(enter, [0, 1], [-size * 1.6, width / 2]) + exit * (width / 2 + size * 1.6);
  const t = frame / fps;
  // giro: entra de canto, se queda oscilando suave y sale girando hacia el otro lado
  const ry = interpolate(enter, [0, 1], [-95, 0]) + Math.sin(t * 2.1) * 26 * enter * (1 - exit) + exit * 100;
  const rx = Math.sin(t * 1.6 + 0.8) * 10 * enter;
  const rz = interpolate(enter, [0, 1], [-14, 0]) + exit * 10;
  const float = Math.sin(t * 2.4) * 5;
  // brillo que cruza la cara del logo
  const sheen = ((t * 0.75) % 1.6) / 1.6;
  const r = size * 0.1;
  const face: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: r, overflow: "hidden" };

  return (
    <div style={{ position: "absolute", left: x - size / 2, top: top + float, width: size, height: size, perspective: 900, pointerEvents: "none" }}>
      {/* sombra y halo del color de acento */}
      <div
        style={{
          position: "absolute",
          left: size * 0.1,
          right: size * 0.1,
          bottom: -size * 0.16,
          height: size * 0.14,
          borderRadius: "50%",
          background: "rgba(0,0,0,.55)",
          filter: "blur(10px)",
          opacity: 0.8 * enter * (1 - exit),
          scale: `${1 - Math.abs(Math.sin((ry * Math.PI) / 180)) * 0.4}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -size * 0.25,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(colors.accent, .45)} 0%, ${alpha(colors.accent, 0)} 65%)`,
          opacity: enter * (1 - exit),
        }}
      />
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
        {/* grosor: capas apiladas hacia atrás, cada vez más oscuras */}
        {Array.from({ length: LAYERS }, (_, k) => (
          <div
            key={k}
            style={{
              ...face,
              transform: `translateZ(${-(k + 1) * 1.6}px)`,
              background: `rgb(${Math.round(8 - k * 0.3)}, ${Math.round(78 - k * 2.4)}, ${Math.round(150 - k * 4.2)})`,
            }}
          />
        ))}
        {/* cara: logo oficial (se recorta el ® de la derecha del PNG; la "in" del PNG es transparente, por eso va blanco detrás) */}
        <div style={{ ...face, transform: "translateZ(1px)", background: "#FFFFFF", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.35), inset 0 2px 0 rgba(255,255,255,.45)" }}>
          <Img
            src={staticFile("logos/linkedin-in-blue.png")}
            style={{ position: "absolute", left: 0, top: 0, height: size, width: (size * 635) / 540, maxWidth: "none" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 42%, rgba(0,0,0,.06) 100%)" }} />
          <div
            style={{
              position: "absolute",
              top: -size,
              bottom: -size,
              width: size * 0.35,
              left: interpolate(ease(sheen), [0, 1], [-size * 0.8, size * 1.4]),
              rotate: "22deg",
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.45) 50%, rgba(255,255,255,0) 100%)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </div>
  );
};
