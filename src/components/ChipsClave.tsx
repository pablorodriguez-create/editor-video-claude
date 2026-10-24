import React from "react";
import { Bot, CalendarCheck, ChartColumnIncreasing, Clock, Megaphone, MessageCircle, PiggyBank, Rocket, Sparkles, Target, Users, type LucideIcon } from "lucide-react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, alpha } from "../brand/tokens";
import { fonts } from "../brand/fonts";

// Palabras clave de los anuncios cortos: cada vez que se dice una ("estrategia", "leads", "reuniones"…) aparece
// arriba, por encima de la cabeza, una píldora con su icono de línea. Una a la vez, con un pop suave. Nunca sobre la cara.
const ICONOS: Record<string, LucideIcon> = {
  estrategia: Target, contenido: Megaphone, creativos: Sparkles, leads: Users, clientes: Users, mensajes: MessageCircle,
  conversaciones: MessageCircle, reuniones: CalendarCheck, agenda: CalendarCheck, piloto: Rocket, ia: Bot, tiempo: Clock,
  publicidad: PiggyBank, resultados: ChartColumnIncreasing,
};
// los resultados van con el color de resultado; el resto, con el de acento
const RESULTADO = new Set(["reuniones", "agenda", "clientes", "resultados"]);

export type Chip = { readonly from: number; readonly dur: number; readonly label: string; readonly icon: string };

const Pildora: React.FC<{ readonly chip: Chip }> = ({ chip }) => {
  const frame = useCurrentFrame() - chip.from;
  const { fps } = useVideoConfig();
  if (frame < 0 || frame >= chip.dur) return null;
  const p = spring({ frame, fps, config: { damping: 13, stiffness: 160 } });
  const out = interpolate(frame, [chip.dur - 6, chip.dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const Icon = ICONOS[chip.icon] ?? Sparkles;
  const am = RESULTADO.has(chip.icon);
  return (
    <div style={{ position: "absolute", top: 130, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 34px 18px 22px",
          borderRadius: 999,
          background: am ? colors.highlight : alpha(colors.onHighlight, .82),
          border: am ? "none" : `2px solid ${colors.accent}`,
          boxShadow: am ? `0 16px 50px ${colors.highlightGlow}` : `0 16px 50px ${colors.accentGlow}`,
          backdropFilter: "blur(14px)",
          color: am ? colors.onHighlight : "#FFFFFF",
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 46,
          opacity: p * (1 - out),
          scale: `${0.6 + 0.4 * p}`,
          translate: `0px ${(1 - p) * -24 + out * -14}px`,
        }}
      >
        <div style={{ width: 58, height: 58, borderRadius: 16, background: am ? alpha(colors.onHighlight, .12) : colors.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={36} strokeWidth={2.4} color={am ? colors.onHighlight : "#FFFFFF"} />
        </div>
        {chip.label}
      </div>
    </div>
  );
};

export const ChipsClave: React.FC<{ readonly chips: readonly Chip[] }> = ({ chips }) => (
  <>
    {chips.map((c, i) => (
      <Pildora key={i} chip={c} />
    ))}
  </>
);
