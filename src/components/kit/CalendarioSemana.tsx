import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, alpha } from "../../brand/tokens";
import { fonts } from "../../brand/fonts";

// Plano de apoyo del kit para "llena tu agenda": una semana de calendario, con el aspecto de un calendario de trabajo,
// que se va llenando de reuniones una a una.
// Pantalla completa (sustituye a la cámara 2-3 s, como un plano de apoyo). Sin logos de terceros y sin nombres reales.
// PERSONALIZA por props: días de la semana, día destacado, franja horaria, reuniones y su etiqueta.
const ACENTO = colors.accent;

export const CalendarioSemana: React.FC<{
  readonly dur: number;
  // Cinco días: [nombre corto, número].
  readonly dias?: readonly (readonly [string, number])[];
  // Día que se marca como "hoy".
  readonly hoy?: number;
  // Franja visible: de H0 a H1 (horas enteras).
  readonly desde?: number;
  readonly hasta?: number;
  // Reuniones: [índice del día, hora de inicio], en el orden en que aparecen.
  readonly reuniones?: readonly (readonly [number, number])[];
  readonly etiqueta?: string;
}> = ({
  dur,
  dias: DIAS = [
    ["LUN", 26],
    ["MAR", 27],
    ["MIÉ", 28],
    ["JUE", 29],
    ["VIE", 30],
  ],
  hoy = 29,
  desde: H0 = 9,
  hasta: H1 = 15,
  reuniones: REUNIONES = [
    [0, 10], [2, 9.5], [3, 12], [1, 13], [4, 10.5], [0, 12.5], [3, 9], [2, 11.5], [4, 13.5], [1, 9.5],
  ],
  etiqueta = "Reunión 1:1",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 140 } });
  const out = interpolate(frame, [dur - 6, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const W = 1000, colW = (W - 90) / 5, filaH = 150;
  const cada = Math.max(3, Math.floor((dur - 16) / REUNIONES.length));
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${colors.accentDeep} 0%, ${colors.bg} 70%)`, opacity: 1 - out }}>
      <div
        style={{
          position: "absolute",
          left: (width - W) / 2,
          top: (height - (110 + filaH * (H1 - H0))) / 2 - 90,   // por encima de los subtítulos
          width: W,
          borderRadius: 26,
          background: "#FFFFFF",
          boxShadow: "0 40px 100px rgba(0,0,0,.5)",
          overflow: "hidden",
          fontFamily: fonts.body,
          scale: `${0.94 + 0.06 * enter}`,
          opacity: enter,
        }}
      >
        <div style={{ display: "flex", height: 110, paddingLeft: 90, borderBottom: "1px solid #E3E6EC" }}>
          {DIAS.map(([d, n], i) => (
            <div key={i} style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <div style={{ fontSize: 18, color: n === hoy ? ACENTO : "#5F6368", fontWeight: 600, letterSpacing: "0.04em" }}>{d}</div>
              <div style={{ width: 54, height: 54, borderRadius: 27, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, background: n === hoy ? ACENTO : "transparent", color: n === hoy ? "#FFFFFF" : "#3C4043" }}>{n}</div>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", height: filaH * (H1 - H0) }}>
          {Array.from({ length: H1 - H0 }, (_, h) => (
            <div key={h} style={{ position: "absolute", left: 0, right: 0, top: h * filaH, height: filaH, borderTop: h ? "1px solid #E3E6EC" : "none" }}>
              <div style={{ position: "absolute", left: 14, top: 6, fontSize: 17, color: "#70757A" }}>{`${H0 + h}:00`}</div>
            </div>
          ))}
          {DIAS.map((_, i) => (
            <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: 90 + i * colW, borderLeft: "1px solid #E3E6EC" }} />
          ))}
          {REUNIONES.map(([d, h], i) => {
            const p = spring({ frame: frame - 8 - i * cada, fps, config: { damping: 13, stiffness: 180 } });
            if (p <= 0.001) return null;
            const hh = Math.floor(h), mm = h % 1 ? "30" : "00";
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 90 + d * colW + 5,
                  top: (h - H0) * filaH + 3,
                  width: colW - 12,
                  height: filaH * 0.5 * 2 - 8,
                  borderRadius: 8,
                  background: ACENTO,
                  color: "#FFFFFF",
                  padding: "8px 10px",
                  fontSize: 19,
                  lineHeight: 1.25,
                  scale: `${0.7 + 0.3 * p}`,
                  opacity: p,
                  boxShadow: `0 6px 16px ${alpha(colors.accent, .35)}`,
                }}
              >
                <div style={{ fontWeight: 700 }}>{etiqueta}</div>
                <div style={{ opacity: 0.85 }}>{`${hh}:${mm}`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
