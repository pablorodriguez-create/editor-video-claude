import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, colors } from "../brand/tokens";

// Logo oficial de LinkedIn en 3D que se tacha con una X cuando se dice algo negativo de la red (por ejemplo "aburrida").
// Arriba, por encima de la cabeza. La X es blanca y se dibuja en dos trazos (nunca roja).
export const LinkedInTachado: React.FC<{ readonly dur: number; readonly tachar: number; readonly size?: number; readonly top?: number }> = ({
  dur,
  tachar,
  size = 230,
  top = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const out = interpolate(frame, [dur - 10, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const t = frame / fps;
  const ry = Math.sin(t * 2) * 14;
  // los dos trazos de la X
  const s1 = interpolate(frame, [tachar, tachar + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const s2 = interpolate(frame, [tachar + 4, tachar + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  // al tacharlo, el logo se apaga y tiembla un poco
  const hit = interpolate(frame, [tachar, tachar + 3, tachar + 9], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const apagado = interpolate(frame, [tachar, tachar + 8], [1, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r = size * 0.1;
  const L = size * 1.25; // largo del trazo
  return (
    <div
      style={{
        position: "absolute",
        left: width / 2 - size / 2,
        top: top + (1 - enter) * -60,
        width: size,
        height: size,
        perspective: 900,
        opacity: enter * (1 - out),
        translate: `${Math.sin(frame * 2.2) * 6 * hit}px 0px`,
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "absolute", inset: -size * 0.3, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(colors.accent, .5)} 0%, ${alpha(colors.accent, 0)} 65%)`, opacity: apagado }} />
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(8deg) rotateY(${ry}deg)`, filter: `saturate(${apagado}) brightness(${0.6 + 0.4 * apagado})` }}>
        {Array.from({ length: 22 }, (_, k) => (
          <div key={k} style={{ position: "absolute", inset: 0, borderRadius: r, transform: `translateZ(${-(k + 1) * 1.6}px)`, background: `rgb(${Math.round(8 - k * 0.3)}, ${Math.round(78 - k * 2.4)}, ${Math.round(150 - k * 4.2)})` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, borderRadius: r, overflow: "hidden", transform: "translateZ(1px)", background: "#FFFFFF" }}>
          <Img src={staticFile("logos/linkedin-in-blue.png")} style={{ position: "absolute", left: 0, top: 0, height: size, width: (size * 635) / 540, maxWidth: "none" }} />
        </div>
      </div>
      <svg width={size * 1.5} height={size * 1.5} viewBox={`0 0 ${size * 1.5} ${size * 1.5}`} style={{ position: "absolute", left: -size * 0.25, top: -size * 0.25, overflow: "visible", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.6))" }}>
        <line x1={size * 0.12} y1={size * 0.12} x2={size * 1.38} y2={size * 1.38} stroke="#FFFFFF" strokeWidth={size * 0.12} strokeLinecap="round" strokeDasharray={L * 1.43} strokeDashoffset={L * 1.43 * (1 - s1)} />
        <line x1={size * 1.38} y1={size * 0.12} x2={size * 0.12} y2={size * 1.38} stroke="#FFFFFF" strokeWidth={size * 0.12} strokeLinecap="round" strokeDasharray={L * 1.43} strokeDashoffset={L * 1.43 * (1 - s2)} />
      </svg>
    </div>
  );
};
