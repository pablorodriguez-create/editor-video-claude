import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors, alpha } from "../../brand/tokens";
import { fonts } from "../../brand/fonts";
import { LineIconTile } from "../LineIcon";
import { marca } from "../../brand/marca";

// Gráficos del vídeo horizontal (YouTube), dentro de la tarjeta de contenido (1290x1008, fondo oscuro de cristal).
// Cada elemento entra en su "beat": el fotograma (desde el inicio del bloque) en que se dice.
// Todos los textos van por props: los valores por defecto son solo de ejemplo. Nunca pongas cifras que no se digan en el vídeo.

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const inP = (frame: number, at: number, d = 14) =>
  interpolate(frame, [at, at + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const GraphicTitle: React.FC<{ readonly children: React.ReactNode; readonly at?: number }> = ({ children, at = 0 }) => {
  const frame = useCurrentFrame();
  const p = inP(frame, at);
  return (
    <div style={{ position: "absolute", left: 70, top: 56, right: 70, opacity: p, translate: `0px ${(1 - p) * 16}px` }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.12em", color: colors.accentHi, textTransform: "uppercase" }}>{children}</div>
    </div>
  );
};

// 1) Flujo de un proceso en hasta 7 pasos (en zigzag). El último suele ser el resultado (gold: color de resultado).
export type FlowStep = { readonly icon: string; readonly label: string; readonly gold?: boolean };
export const FlowGraphic: React.FC<{ readonly beats: readonly number[]; readonly dur?: number; readonly title?: string; readonly steps?: readonly FlowStep[] }> = ({
  beats,
  title = "El proceso",
  steps = [
    { icon: "users", label: "Paso 1" },
    { icon: "eye", label: "Paso 2" },
    { icon: "message", label: "Paso 3" },
    { icon: "badge", label: "Paso 4" },
    { icon: "handshake", label: "Paso 5" },
    { icon: "calendar", label: "Paso 6" },
    { icon: "euro", label: "Resultado", gold: true },
  ],
}) => {
  const frame = useCurrentFrame();
  const pos = [
    [150, 320], [450, 320], [750, 320], [1050, 320],
    [750, 700], [450, 700], [150, 700],
  ];
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      <svg width={1290} height={1008} style={{ position: "absolute", inset: 0 }}>
        {pos.slice(1, steps.length).map((q, i) => {
          const a = pos[i];
          const p = inP(frame, beats[i + 1] ?? 0, 16);
          const x2 = a[0] + (q[0] - a[0]) * p, y2 = a[1] + (q[1] - a[1]) * p;
          return <line key={i} x1={a[0] + 60} y1={a[1] + 60} x2={x2 + 60} y2={y2 + 60} stroke={colors.accent} strokeWidth={4} strokeDasharray="10 10" opacity={p > 0 ? 0.8 : 0} />;
        })}
      </svg>
      {steps.map((s, i) => {
        const p = inP(frame, beats[i] ?? 0);
        return (
          <div key={s.label} style={{ position: "absolute", left: pos[i][0], top: pos[i][1], width: 120, display: "flex", flexDirection: "column", alignItems: "center", opacity: p, scale: `${0.7 + 0.3 * p}` }}>
            <LineIconTile name={s.icon} size={120} />
            <div style={{ marginTop: 20, width: 250, textAlign: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: s.gold ? colors.highlight : colors.ink }}>
              {s.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 2) Dos barras: el antes (gris) frente al después (color de resultado). Usa solo cifras que se digan en el vídeo.
export type Bar = { readonly label: string; readonly value: string; readonly height: number };
export const BarsGraphic: React.FC<{
  readonly beats: readonly number[];
  readonly dur?: number;
  readonly title?: string;
  readonly before?: Bar;
  readonly after?: Bar;
}> = ({
  beats,
  title = "Antes y después",
  before = { label: "Antes", value: "X %", height: 120 },
  after = { label: "Después", value: "Y %", height: 540 },
}) => {
  const frame = useCurrentFrame();
  const bar = (label: string, value: string, h: number, at: number, gold: boolean, x: number) => {
    const p = inP(frame, at, 22);
    return (
      <div style={{ position: "absolute", left: x, bottom: 150, width: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: fonts.thumb, fontSize: value.length > 7 ? 80 : 96, whiteSpace: "nowrap", color: gold ? colors.highlight : colors.ink, opacity: p, marginBottom: 18 }}>{value}</div>
        <div
          style={{
            width: 220,
            height: h * p,
            borderRadius: 22,
            background: gold ? `linear-gradient(180deg, ${colors.highlightHi}, ${colors.highlight})` : alpha(colors.ink, .22),
            boxShadow: gold ? `0 0 50px ${colors.highlightGlow}` : undefined,
          }}
        />
        <div style={{ marginTop: 22, fontFamily: fonts.body, fontWeight: 600, fontSize: 30, color: colors.dim, textAlign: "center" }}>{label}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      {bar(before.label, before.value, before.height, beats[0] ?? 0, false, 230)}
      {bar(after.label, after.value, after.height, beats[1] ?? 30, true, 760)}
    </AbsoluteFill>
  );
};

// 3) Dos columnas: lo de siempre (gris) frente a tu forma de hacerlo (color de resultado). 3 puntos por columna.
export const CompareGraphic: React.FC<{
  readonly beats: readonly number[];
  readonly dur?: number;
  readonly title?: string;
  readonly left?: { readonly title: string; readonly items: readonly string[] };
  readonly right?: { readonly title: string; readonly items: readonly string[] };
}> = ({
  beats,
  title = "La diferencia",
  left = { title: "Lo de siempre", items: ["Punto 1", "Punto 2", "Punto 3"] },
  right = { title: "Tu método", items: ["Punto 1", "Punto 2", "Punto 3"] },
}) => {
  const frame = useCurrentFrame();
  const col = (colTitle: string, items: readonly string[], at: number[], good: boolean, x: number) => {
    const p0 = inP(frame, at[0]);
    return (
      <div style={{ position: "absolute", left: x, top: 250, width: 540, opacity: p0 }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 52, color: good ? colors.highlight : colors.dim, marginBottom: 60 }}>{colTitle}</div>
        {items.map((t, i) => {
          const p = inP(frame, at[i + 1] ?? at[0]);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 54, opacity: p, translate: `${(1 - p) * -20}px 0px` }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: good ? colors.accent : alpha(colors.ink, .35), flex: "none" }} />
              <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 40, color: colors.ink, lineHeight: 1.25 }}>{t}</div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      {col(left.title, left.items, [beats[0], beats[1], beats[2], beats[3]], false, 80)}
      <div style={{ position: "absolute", left: 640, top: 250, width: 2, height: 560, background: colors.line2, opacity: inP(frame, beats[4] ?? 0) }} />
      {col(right.title, right.items, [beats[4], beats[5], beats[6], beats[7]], true, 700)}
    </AbsoluteFill>
  );
};

// 4) Las tres partes del vídeo (con iconos, sin números si la voz no los dice)
export const PartsGraphic: React.FC<{
  readonly beats: readonly number[];
  readonly dur?: number;
  readonly title?: string;
  readonly parts?: readonly string[];
  readonly icons?: readonly string[];
}> = ({ beats, title = "Lo que vas a ver", parts = ["Parte 1", "Parte 2", "Parte 3"], icons = ["eye", "users", "sparkles"] }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      {parts.map((t, i) => {
        const p = inP(frame, beats[i] ?? 0);
        return (
          <div key={t} style={{ position: "absolute", left: 60 + i * 400, top: 250, width: 370, height: 520, borderRadius: 30, background: alpha(colors.accent, .10), border: `2px solid ${colors.accent}`, opacity: p, translate: `0px ${(1 - p) * 40}px`, padding: 40, boxSizing: "border-box" }}>
            <LineIconTile name={icons[i]} size={130} />
            <div style={{ marginTop: 60, fontFamily: fonts.display, fontWeight: 800, fontSize: 40, color: colors.ink, lineHeight: 1.15 }}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 5) Perfil estilizado (sin datos reales) que se "lee" y se convierte en algo (por defecto, un mensaje personalizado)
export const ProfileGraphic: React.FC<{
  readonly beats: readonly number[];
  readonly dur?: number;
  readonly title?: string;
  readonly result?: string;
  readonly detail?: string;
}> = ({ beats, title = "Analizar el perfil", result = "Mensaje personalizado", detail = "A partir de su perfil y sus últimos posts" }) => {
  const frame = useCurrentFrame();
  const p0 = inP(frame, beats[0] ?? 0);
  const scan = interpolate(frame, [beats[1] ?? 20, (beats[1] ?? 20) + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2 = inP(frame, beats[2] ?? 60);
  const sk = (w: number, h = 16, c = "#d9dee6") => <div style={{ width: w, height: h, borderRadius: h / 2, background: c, marginBottom: 14 }} />;
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      <div style={{ position: "absolute", left: 80, top: 170, width: 620, height: 720, borderRadius: 26, background: "#fff", overflow: "hidden", opacity: p0, translate: `0px ${(1 - p0) * 30}px`, boxShadow: "0 24px 60px rgba(0,0,0,.4)" }}>
        <div style={{ height: 150, background: `linear-gradient(120deg,${colors.accentDeep},${colors.accent})` }} />
        <div style={{ position: "absolute", left: 40, top: 80, width: 140, height: 140, borderRadius: 70, background: "#c9d3e3", border: "6px solid #fff" }} />
        <div style={{ position: "absolute", left: 40, top: 240, right: 40 }}>
          {sk(260, 26, "#2b3a55")}
          {sk(420)}
          {sk(300)}
          <div style={{ height: 30 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ borderTop: "1px solid #e6e9ef", paddingTop: 18 }}>
              {sk(500)}
              {sk(380)}
            </div>
          ))}
        </div>
        {/* barrido de lectura */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 150 + scan * 480, height: 60, background: `linear-gradient(180deg, ${alpha(colors.accent, 0)}, ${alpha(colors.accent, .28)}, ${alpha(colors.accent, 0)})`, opacity: scan > 0 && scan < 1 ? 1 : 0 }} />
      </div>
      <div style={{ position: "absolute", left: 730, top: 420, opacity: p2, translate: `${(1 - p2) * -30}px 0px` }}>
        <svg width={120} height={60}><path d="M5 30 H95 M75 10 L100 30 L75 50" stroke={colors.accentHi} strokeWidth={6} fill="none" strokeLinecap="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 860, top: 340, width: 320, opacity: p2, translate: `${(1 - p2) * 30}px 0px` }}>
        <LineIconTile name="message" size={120} />
        <div style={{ marginTop: 26, fontFamily: fonts.display, fontWeight: 800, fontSize: 40, color: colors.ink, lineHeight: 1.15 }}>{result}</div>
        <div style={{ marginTop: 14, fontFamily: fonts.body, fontSize: 28, color: colors.dim, lineHeight: 1.3 }}>{detail}</div>
      </div>
    </AbsoluteFill>
  );
};

// 6) Estructura en 4 bloques numerados (el último, destacado). Por ejemplo, las partes de un mensaje o de una oferta.
export const StructureGraphic: React.FC<{
  readonly beats: readonly number[];
  readonly dur?: number;
  readonly title?: string;
  readonly items?: readonly string[];
}> = ({ beats, title = "La estructura", items = ["Bloque 1", "Bloque 2", "Bloque 3", "Bloque 4"] }) => {
  const frame = useCurrentFrame();
  const last = items.length - 1;
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      {items.map((t, i) => {
        const p = inP(frame, beats[i] ?? 0);
        return (
          <div key={t} style={{ position: "absolute", left: 90, top: 230 + i * 170, width: 1110, height: 130, borderRadius: 24, background: i === last ? alpha(colors.highlight, .10) : alpha(colors.accent, .10), border: `2px solid ${i === last ? colors.highlight : colors.accent}`, display: "flex", alignItems: "center", gap: 36, paddingLeft: 40, opacity: p, translate: `${(1 - p) * -50}px 0px` }}>
            <div style={{ fontFamily: fonts.thumb, fontSize: 64, color: i === last ? colors.highlight : colors.accentHi, width: 50 }}>{i + 1}</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 46, color: colors.ink }}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 7) Mensaje que se escribe solo dentro de una burbuja de chat (texto que se dicta o se lee en el vídeo)
export const MessageGraphic: React.FC<{
  readonly title: string;
  readonly lines: readonly { text: string; at: number }[];
  // Logo y nombre de la app del chat (por defecto, LinkedIn).
  readonly appLogo?: string;
  readonly appName?: string;
}> = ({ title, lines, appLogo = "logos/linkedin-in-blue.png", appName = "Mensaje de LinkedIn" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      <div style={{ position: "absolute", left: 80, top: 160, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 46, height: 46, overflow: "hidden", borderRadius: 6 }}>
            <Img src={staticFile(appLogo)} style={{ width: appLogo.includes("linkedin") ? Math.round((46 * 635) / 540) : 46, maxWidth: "none", height: 46, objectFit: "contain", objectPosition: "left center" }} />
          </div>
        </div>
        <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 28, color: colors.dim }}>{appName}</div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 260, width: 1130, borderRadius: 30, borderTopLeftRadius: 8, background: "#ffffff", padding: "40px 48px", boxSizing: "border-box", boxShadow: "0 24px 60px rgba(0,0,0,.4)" }}>
        {lines.map((l, i) => {
          // se escribe letra a letra desde su beat
          const n = Math.max(0, Math.min(l.text.length, Math.floor((frame - l.at) * 2.2)));
          if (frame < l.at) return null;
          return (
            <div key={i} style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 32, lineHeight: 1.4, color: "#1b2333", marginBottom: 14, whiteSpace: "pre-wrap" }}>
              {l.text.slice(0, n)}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Rótulo de capítulo (arriba a la izquierda) cuando cambia de parte
export const ChapterPill: React.FC<{ readonly label: string; readonly dur: number }> = ({ label, dur }) => {
  const frame = useCurrentFrame();
  const p = inP(frame, 0, 16);
  const o = interpolate(frame, [dur - 12, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 64, top: 52, opacity: p * o, translate: `${(1 - p) * -24}px 0px`, border: `2px solid ${colors.accent}`, background: alpha(colors.bg, .6), backdropFilter: "blur(16px)", borderRadius: 999, padding: "12px 26px", fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.accentHi }}>
        {label}
      </div>
    </AbsoluteFill>
  );
};

// Rótulo con el nombre al presentarse (por defecto, los datos de src/brand/marca.ts)
export const NameLowerThird: React.FC<{ readonly dur: number; readonly name?: string; readonly role?: string }> = ({
  dur,
  name = marca.persona,
  role = marca.cargo,
}) => {
  const frame = useCurrentFrame();
  const p = inP(frame, 0, 18);
  const o = interpolate(frame, [dur - 14, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 90, bottom: 110, opacity: p * o, translate: `${(1 - p) * -30}px 0px` }}>
        <div style={{ display: "inline-block", background: alpha(colors.bg, .72), backdropFilter: "blur(18px)", borderLeft: `6px solid ${colors.accent}`, borderRadius: 14, padding: "18px 30px" }}>
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 44, color: colors.ink }}>{name}</div>
          <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 26, color: colors.highlight, marginTop: 4 }}>{role}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Muro de reseñas reales (capturas que te han dado permiso para enseñar, en public/resenas/): entran una tras otra
// en dos columnas y el muro sube despacio para que se vean todas. ratio = alto / ancho de cada captura.
export type Review = { readonly src: string; readonly ratio: number };
export const ReviewsGraphic: React.FC<{ readonly beats: readonly number[]; readonly dur?: number; readonly reviews: readonly Review[] }> = ({
  beats,
  dur = 240,
  reviews,
}) => {
  const frame = useCurrentFrame();
  const start = beats[0] ?? 0;
  const W = 600, GAP = 22, X = [33, 33 + W + 24];
  const step = Math.max(10, Math.floor((dur - start - 40) / reviews.length));
  const colY = [0, 0];
  const cards = reviews.map(({ src, ratio: r }, i) => {
    const c = i % 2, h = Math.round(W * r);
    const y = colY[c]; colY[c] += h + GAP;
    return { src, x: X[c], y, h, at: start + i * step };
  });
  const total = Math.max(...colY);
  const scroll = interpolate(frame, [start + step * 4, dur], [0, Math.max(0, total - 900)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", maskImage: "linear-gradient(180deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)" }}>
      <div style={{ position: "absolute", left: 0, top: 54 - scroll, width: 1290 }}>
        {cards.map((k) => {
          const p = inP(frame, k.at, 14);
          return (
            <Img
              key={k.src}
              src={staticFile(k.src)}
              style={{
                position: "absolute", left: k.x, top: k.y, width: W, height: k.h, borderRadius: 14,
                boxShadow: "0 18px 40px rgba(0,0,0,.45)", opacity: p, translate: `0px ${(1 - p) * 60}px`, scale: `${0.94 + 0.06 * p}`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Botón de suscripción de YouTube con los colores de la marca: al principio y al final del vídeo.
// Entra desde la izquierda, un cursor lo pulsa, pasa de "Suscríbete" (acento: se pulsa) a "Suscrito" (color de resultado)
// y la campana se mueve. Abajo a la izquierda, lejos de la cara.
export const SubscribeButton: React.FC<{ readonly dur: number; readonly line1?: string; readonly line2?: string }> = ({
  dur,
  line1 = "Vídeos",
  line2 = "todas las semanas",
}) => {
  const frame = useCurrentFrame();
  const p = inP(frame, 0, 16);
  const out = interpolate(frame, [dur - 14, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const click = Math.round(dur * 0.42);
  const done = frame >= click;
  const press = interpolate(frame, [click - 4, click, click + 6], [1, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = done ? Math.sin((frame - click) / 2.2) * 18 * Math.max(0, 1 - (frame - click) / 30) : 0;
  // cursor: llega al botón y hace clic
  const cx = interpolate(frame, [10, click - 4], [520, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const cy = interpolate(frame, [10, click - 4], [150, 44], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const cursorO = interpolate(frame, [8, 14, click + 18, click + 26], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 70, bottom: 80, opacity: p * (1 - out), translate: `${(1 - p) * -60 - out * 40}px 0px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, background: alpha(colors.bg, .78), backdropFilter: "blur(18px)", border: `1px solid ${colors.line2}`, borderRadius: 26, padding: "18px 22px 18px 18px", boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12, borderRadius: 16, padding: "16px 28px", scale: `${press}`,
              background: done ? alpha(colors.highlight, .12) : colors.accent,
              border: done ? `2px solid ${colors.highlight}` : `2px solid ${colors.accent}`,
              boxShadow: done ? `0 0 30px ${colors.highlightGlow}` : `0 0 30px ${colors.accentGlow}`,
            }}
          >
            <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 34, color: done ? colors.highlight : "#fff" }}>{done ? "Suscrito" : "Suscríbete"}</div>
          </div>
          <div style={{ rotate: `${ring}deg`, transformOrigin: "50% 10%" }}>
            <LineIconTile name="bell" size={72} />
          </div>
          <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 28, color: colors.ink, lineHeight: 1.2, paddingRight: 8 }}>
            {line1}
            <br />
            {line2}
          </div>
        </div>
        <svg width={40} height={48} style={{ position: "absolute", left: cx, top: cy, opacity: cursorO, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.5))" }}>
          <path d="M4 3 L4 38 L13 29 L19 43 L25 40 L19 27 L32 27 Z" fill="#fff" stroke={colors.onHighlight} strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Gancho (retención en el primer minuto) ----------

// Titular grande sobre la cámara (abajo, sin tapar la cara): la promesa del vídeo en los primeros segundos
export const HookTitle: React.FC<{ readonly dur: number; readonly pre: string; readonly big: string }> = ({ dur, pre, big }) => {
  const frame = useCurrentFrame();
  const p = inP(frame, 0, 16);
  const p2 = inP(frame, 8, 18);
  const o = interpolate(frame, [dur - 12, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "flex-end", alignItems: "center", paddingBottom: 90, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 420, background: `linear-gradient(180deg, ${alpha(colors.bg, 0)}, ${alpha(colors.bg, .85)})` }} />
      <div style={{ position: "relative", fontFamily: fonts.mono, fontSize: 30, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.accentHi, opacity: p, translate: `0px ${(1 - p) * 20}px`, marginBottom: 18 }}>{pre}</div>
      <div style={{ position: "relative", maxWidth: 1500, fontFamily: fonts.thumb, fontSize: 104, lineHeight: 1.05, textTransform: "uppercase", color: colors.ink, opacity: p2, scale: `${0.9 + 0.1 * p2}`, textAlign: "center" }}>
        {big.split("*").map((t, i) => (i % 2 ? <span key={i} style={{ color: colors.onHighlight, background: colors.highlight, padding: "0 18px", display: "inline-block", rotate: "-2deg", margin: "0 8px" }}>{t}</span> : <span key={i}>{t}</span>))}
      </div>
    </AbsoluteFill>
  );
};

// "He probado más de N herramientas": una cuadrícula de iconos que se van tachando y un contador hasta `count`
export const AppsGraphic: React.FC<{ readonly beats: readonly number[]; readonly dur?: number; readonly title?: string; readonly count?: number }> = ({
  beats,
  title = "Herramientas probadas",
  count: total = 40,
}) => {
  const frame = useCurrentFrame();
  const start = beats[0] ?? 0;
  const icons = ["message", "chart", "users", "sparkles", "megaphone", "calendar", "laptop", "phone", "globe", "rocket", "brain", "package"];
  const N = Math.min(40, total);
  const count = Math.round(interpolate(frame, [start, start + 40], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      <div style={{ position: "absolute", left: 70, top: 130, width: 1150, display: "flex", flexWrap: "wrap", gap: 18 }}>
        {Array.from({ length: N }, (_, i) => {
          const at = start + i * 1;
          const p = inP(frame, at, 10);
          const x = inP(frame, at + 12, 8);
          return (
            <div key={i} style={{ position: "relative", opacity: p * (1 - 0.55 * x), scale: `${0.6 + 0.4 * p}` }}>
              <LineIconTile name={icons[i % icons.length]} size={96} />
              <svg width={96} height={96} style={{ position: "absolute", inset: 0, opacity: x }}>
                <path d="M22 22 L74 74 M74 22 L22 74" stroke={alpha(colors.ink, .75)} strokeWidth={6} strokeLinecap="round" />
              </svg>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 60, fontFamily: fonts.thumb, fontSize: 150, color: colors.highlight, lineHeight: 1 }}>+{count}</div>
    </AbsoluteFill>
  );
};

// Dos opciones descartadas: tarjetas que se tachan (en el color del texto, nunca en rojo)
export type RejectCard = { readonly title: string; readonly sub: string; readonly icon: string };
export const RejectGraphic: React.FC<{
  readonly beats: readonly number[];
  readonly dur?: number;
  readonly title?: string;
  readonly cards?: readonly [RejectCard, RejectCard];
}> = ({
  beats,
  title = "Lo que no me convencía",
  cards = [
    { title: "Opción A", sub: "Por qué no funcionaba", icon: "sparkles" },
    { title: "Opción B", sub: "Por qué no funcionaba", icon: "package" },
  ],
}) => {
  const frame = useCurrentFrame();
  const card = (t: string, sub: string, icon: string, at: number, x: number) => {
    const p = inP(frame, at, 14);
    const cross = inP(frame, at + 16, 10);
    return (
      <div style={{ position: "absolute", left: x, top: 230, width: 520, height: 520, borderRadius: 30, background: alpha(colors.ink, .06), border: `2px solid ${colors.line2}`, opacity: p, translate: `0px ${(1 - p) * 50}px`, rotate: `${(1 - p) * -4}deg`, padding: 48, boxSizing: "border-box" }}>
        <LineIconTile name={icon} size={120} />
        <div style={{ marginTop: 44, fontFamily: fonts.display, fontWeight: 800, fontSize: 52, color: colors.ink, lineHeight: 1.1 }}>{t}</div>
        <div style={{ marginTop: 16, fontFamily: fonts.body, fontSize: 30, color: colors.dim }}>{sub}</div>
        <svg width={520} height={520} style={{ position: "absolute", inset: 0, opacity: cross }}>
          <path d={`M60 60 L${60 + 400 * cross} ${60 + 400 * cross}`} stroke={colors.ink} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          <path d={`M460 60 L${460 - 400 * cross} ${60 + 400 * cross}`} stroke={colors.ink} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
        </svg>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      {card(cards[0].title, cards[0].sub, cards[0].icon, beats[0] ?? 0, 80)}
      {card(cards[1].title, cards[1].sub, cards[1].icon, beats[1] ?? 30, 690)}
    </AbsoluteFill>
  );
};

// "Si te quedas hasta el final vas a saber…": lista de 3 puntos que se marca punto a punto (el último, destacado)
export const ChecklistGraphic: React.FC<{ readonly beats: readonly number[]; readonly dur?: number; readonly title?: string; readonly items?: readonly string[] }> = ({
  beats,
  title = "Al final de este vídeo vas a saber",
  items = ["Punto 1", "Punto 2", "El resultado que buscas"],
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GraphicTitle>{title}</GraphicTitle>
      {items.map((t, i) => {
        const p = inP(frame, beats[i] ?? 0, 14);
        return (
          <div key={t} style={{ position: "absolute", left: 90, top: 210 + i * 220, width: 1110, display: "flex", alignItems: "center", gap: 40, opacity: p, translate: `${(1 - p) * -40}px 0px` }}>
            <div style={{ width: 110, height: 110, borderRadius: 28, flex: "none", background: i === items.length - 1 ? colors.highlight : colors.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${i === items.length - 1 ? colors.highlightGlow : colors.accentGlow}` }}>
              <svg width={60} height={60}><path d="M12 32 L26 46 L50 16" stroke={i === items.length - 1 ? colors.onHighlight : "#fff"} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: i === items.length - 1 ? 46 : 58, color: colors.ink, lineHeight: 1.15 }}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Etiqueta dentro de la tarjeta de pantalla (montaje rápido del gancho): qué parte de la herramienta se está viendo
export const ScreenLabel: React.FC<{ readonly text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const p = inP(frame, 2, 10);
  return (
    <div style={{ position: "absolute", left: 28, bottom: 28, opacity: p, translate: `${(1 - p) * -20}px 0px`, background: colors.accent, color: "#fff", borderRadius: 999, padding: "14px 30px", fontFamily: fonts.display, fontWeight: 800, fontSize: 34, boxShadow: `0 10px 30px ${colors.accentGlow}` }}>
      {text}
    </div>
  );
};
