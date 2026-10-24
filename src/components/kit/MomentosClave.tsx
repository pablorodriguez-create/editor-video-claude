import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../brand/tokens";
import { fonts } from "../../brand/fonts";

// Kit para las palabras clave (alternativa a las píldoras con icono de ChipsClave):
// - reuniones/agenda → cae una notificación de calendario, como la del móvil
// - leads/mensajes/conversaciones → notificación de LinkedIn con el logo oficial
// - el resto → la palabra en Anton grande; los resultados con el recuadro del color de resultado (sin subrayado)
// Todo arriba, por encima de la cabeza. Mismo tipo de dato que ChipsClave para cambiar uno por otro.
export type Momento = { readonly from: number; readonly dur: number; readonly label: string; readonly icon: string };

const CALENDARIO = new Set(["reuniones", "agenda"]);
const RESULTADO = new Set(["clientes", "resultados"]);

const TEXTO_NOTI: Record<string, [string, string]> = {
  reuniones: ["Calendario", "Nueva reunión agendada"],
  agenda: ["Calendario", "Nueva reunión agendada"],
  leads: ["LinkedIn", "Nuevo mensaje de un lead"],
  mensajes: ["LinkedIn", "Nuevo mensaje"],
  conversaciones: ["LinkedIn", "Te han respondido"],
};

const IconoCalendario: React.FC = () => (
  <div style={{ width: 76, height: 76, borderRadius: 18, background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: "100%", height: 22, background: colors.accent, color: "#FFFFFF", fontFamily: fonts.mono, fontSize: 13, textAlign: "center", lineHeight: "22px" }}>JUE</div>
    <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 38, color: colors.onHighlight, lineHeight: "52px" }}>29</div>
  </div>
);

const Notificacion: React.FC<{ m: Momento; f: number; fps: number }> = ({ m, f, fps }) => {
  const p = spring({ frame: f, fps, config: { damping: 17, stiffness: 140 } });
  const out = interpolate(f, [m.dur - 7, m.dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const [app, txt] = TEXTO_NOTI[m.icon];
  return (
    <div style={{ position: "absolute", top: 36, left: 70, right: 70, translate: `0px ${(1 - p) * -200 - out * 200}px`, opacity: 1 - out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 26px", borderRadius: 36, background: "rgba(28,32,44,.72)", backdropFilter: "blur(24px) saturate(1.4)", boxShadow: "0 18px 50px rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.08)" }}>
        {CALENDARIO.has(m.icon) ? (
          <IconoCalendario />
        ) : (
          <div style={{ width: 76, height: 76, borderRadius: 18, overflow: "hidden", background: "#FFFFFF" }}>
            <Img src={staticFile("logos/linkedin-in-blue.png")} style={{ height: 76, width: (76 * 635) / 540, maxWidth: "none" }} />
          </div>
        )}
        <div style={{ flex: 1, color: "#FFFFFF", fontFamily: fonts.body }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, opacity: 0.6, fontWeight: 500 }}>
            <span>{app}</span>
            <span>ahora</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, marginTop: 2 }}>{txt}</div>
        </div>
      </div>
    </div>
  );
};

const Palabra: React.FC<{ m: Momento; f: number; fps: number }> = ({ m, f, fps }) => {
  const p = spring({ frame: f, fps, config: { damping: 15, stiffness: 150 } });
  const out = interpolate(f, [m.dur - 6, m.dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const am = RESULTADO.has(m.icon);
  return (
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: p * (1 - out), translate: `0px ${(1 - p) * 30}px` }}>
      <div
        style={{
          position: "relative",
          fontFamily: fonts.thumb,
          fontSize: Math.min(118, Math.floor(1700 / Math.max(1, m.label.length))),   // las largas encogen para caber
          lineHeight: 1,
          textTransform: "uppercase",
          letterSpacing: "0.01em",
          color: am ? colors.onHighlight : "#FFFFFF",
          background: am ? colors.highlight : "transparent",
          padding: am ? "10px 26px 6px" : 0,
          borderRadius: 14,
          rotate: am ? "-2deg" : "0deg",
          boxShadow: am ? `0 20px 60px ${colors.highlightGlow}` : "none",
          textShadow: am ? "none" : "0 6px 30px rgba(0,0,0,.55)",
        }}
      >
        {m.label}
      </div>
    </div>
  );
};

const Uno: React.FC<{ m: Momento }> = ({ m }) => {
  const f = useCurrentFrame() - m.from;
  const { fps } = useVideoConfig();
  if (f < 0 || f >= m.dur) return null;
  return TEXTO_NOTI[m.icon] ? <Notificacion m={m} f={f} fps={fps} /> : <Palabra m={m} f={f} fps={fps} />;
};

export const MomentosClave: React.FC<{ readonly momentos: readonly Momento[] }> = ({ momentos }) => (
  <>
    {momentos.map((m, i) => (
      <Uno key={i} m={m} />
    ))}
  </>
);
