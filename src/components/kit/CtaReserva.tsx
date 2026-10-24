import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, colors } from "../../brand/tokens";
import { fonts } from "../../brand/fonts";
import { marca } from "../../brand/marca";

// Llamada a la acción del kit: una tarjeta tipo página de reserva de reunión (estilo Calendly), redibujada en vertical
// con los colores de la marca. Entra sobre el pecho (nunca sobre la cara, top 1020 en 1080x1920); el cursor elige un
// día, una hora y confirma.
// PERSONALIZA por props: nombre, foto, título, duración, mes, días libres, día elegido y horas.
// Por defecto, el nombre y la foto salen de src/brand/marca.ts.
const TINTA = "#1A2B48";
const SUAVE = "rgba(26,43,72,.55)";

const Cursor: React.FC<{ x: number; y: number; pulsa: number }> = ({ x, y, pulsa }) => (
  <svg width={44} height={44} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, scale: `${1 - 0.15 * pulsa}`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.35))" }}>
    <path d="M4 2 L4 19 L8.6 14.8 L11.6 21.4 L14.6 20 L11.6 13.6 L18 13.6 Z" fill={colors.onHighlight} stroke="#FFFFFF" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

export const CtaReserva: React.FC<{
  readonly dur: number;
  readonly top?: number;
  readonly nombre?: string;
  readonly titulo?: string;
  // Foto en public/ (por ejemplo "marca/avatar.jpg"). Vacío = círculo con la inicial del nombre.
  readonly avatar?: string;
  readonly duracion?: string;
  readonly mes?: string;
  // Semanas del calendario, de lunes a domingo (0 = día vacío).
  readonly semanas?: readonly (readonly number[])[];
  // Días con huecos libres (se marcan con el color de acento).
  readonly libres?: readonly number[];
  // Día que elige el cursor y cómo se escribe encima de las horas.
  readonly dia?: number;
  readonly diaTexto?: string;
  // Horas disponibles y la que elige el cursor (índice).
  readonly horas?: readonly string[];
  readonly hora?: number;
}> = ({
  dur,
  top = 1020,
  nombre = marca.persona,
  titulo = "Reunión 1:1",
  avatar = marca.avatar,
  duracion = "30 min",
  mes = "octubre 2026",
  semanas = [
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, 0],
  ],
  libres = [26, 27, 28, 29, 30],
  dia = 29,
  diaTexto = "jueves, 29 de octubre",
  horas = ["10:00", "10:30", "11:00"],
  hora = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const W = 940;
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const out = interpolate(frame, [dur - 8, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  // posición del día elegido en la cuadrícula (7 columnas de 80 px, filas de 60 px)
  const fila = Math.max(0, semanas.findIndex((s) => s.includes(dia)));
  const col = Math.max(0, (semanas[fila] ?? []).indexOf(dia));
  const diaX = 64 + col * 80, diaY = 260 + fila * 60;
  const horaY = (j: number) => 212 + j * 74;
  // guion del cursor: día → hora → confirmar
  const t1 = 14, t2 = 36, t3 = 58;
  const pts: [number, number, number][] = [[0, 860, 520], [t1, diaX, diaY], [t2, 758, horaY(hora)], [t3, 758, horaY(horas.length)]];
  let i = 0;
  while (i < pts.length - 2 && frame > pts[i + 1][0]) i++;
  const [fa, xa, ya] = pts[i], [fb, xb, yb] = pts[i + 1];
  const k = interpolate(frame, [fa + 4, fb], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const cx = xa + (xb - xa) * k, cy = ya + (yb - ya) * k;
  const clic = (t: number) => interpolate(frame, [t, t + 3, t + 7], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const diaOn = frame >= t1 + 2, horaOn = frame >= t2 + 2, ok = frame >= t3 + 3;
  const horasP = spring({ frame: frame - t1 - 2, fps, config: { damping: 18, stiffness: 140 } });
  const okP = spring({ frame: frame - t3 - 3, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <div
      style={{
        position: "absolute",
        left: (width - W) / 2,
        top,
        width: W,
        borderRadius: 18,
        background: "#FFFFFF",
        boxShadow: "0 30px 80px rgba(0,0,0,.45)",
        padding: "26px 30px 28px",
        fontFamily: fonts.body,
        color: TINTA,
        opacity: enter * (1 - out),
        translate: `0px ${(1 - enter) * 60}px`,
        overflow: "hidden",
      }}
    >
      {/* cabecera de la reserva: foto, nombre, título y duración */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: 20, borderBottom: "1px solid rgba(26,43,72,.1)" }}>
        {avatar ? (
          <Img src={staticFile(avatar)} style={{ width: 76, height: 76, borderRadius: 38, objectFit: "cover" }} />
        ) : (
          <div style={{ width: 76, height: 76, borderRadius: 38, background: colors.accent, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700 }}>
            {nombre.trim().charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: SUAVE, fontWeight: 600 }}>{nombre}</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.01em" }}>{titulo}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 22, fontWeight: 600, color: SUAVE }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={TINTA} strokeWidth={2}>
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5l3 2" strokeLinecap="round" />
          </svg>
          {duracion}
        </div>
      </div>
      <div style={{ display: "flex", gap: 26, marginTop: 18 }}>
        {/* mes */}
        <div style={{ width: 560 }}>
          <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Selecciona una fecha y hora</div>
          <div style={{ textAlign: "center", fontSize: 21, fontWeight: 700, marginBottom: 8 }}>{mes}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 6, textAlign: "center" }}>
            {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((d) => (
              <div key={d} style={{ fontSize: 17, color: SUAVE, fontWeight: 600 }}>{d}</div>
            ))}
            {semanas.flat().map((n, j) => {
              const libre = libres.includes(n), sel = diaOn && n === dia;
              return (
                <div key={j} style={{ display: "flex", justifyContent: "center" }}>
                  {n > 0 && (
                    <div style={{ width: 54, height: 54, borderRadius: 27, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: libre ? 700 : 500, background: sel ? colors.accent : libre ? alpha(colors.accent, 0.1) : "transparent", color: sel ? "#FFFFFF" : libre ? colors.accent : TINTA }}>
                      {n}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* horas del día elegido */}
        <div style={{ flex: 1, opacity: horasP, translate: `${(1 - horasP) * 30}px 0px` }}>
          <div style={{ fontSize: 21, color: SUAVE, fontWeight: 600, marginTop: 6, marginBottom: 14 }}>{diaTexto}</div>
          {horas.map((h, j) => {
            const sel = horaOn && j === hora;
            return (
              <div key={h} style={{ height: 62, marginBottom: 12, borderRadius: 8, border: `2px solid ${colors.accent}`, background: sel ? colors.accent : "#FFFFFF", color: sel ? "#FFFFFF" : colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700 }}>
                {h}
              </div>
            );
          })}
          <div style={{ height: 62, borderRadius: 8, background: ok ? colors.highlight : horaOn ? TINTA : "rgba(26,43,72,.08)", color: ok ? colors.onHighlight : horaOn ? "#FFFFFF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 24, fontWeight: 700 }}>
            {ok ? (
              <>
                <svg width={30} height={30} viewBox="0 0 24 24" style={{ scale: `${0.4 + 0.6 * okP}` }}>
                  <circle cx={12} cy={12} r={11} fill={colors.onHighlight} />
                  <path d="m7 12.5 3.2 3.2L17 9" stroke={colors.highlight} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Confirmada
              </>
            ) : (
              "Confirmar"
            )}
          </div>
        </div>
      </div>
      <Cursor x={cx} y={cy} pulsa={Math.max(clic(t1), clic(t2), clic(t3))} />
    </div>
  );
};
