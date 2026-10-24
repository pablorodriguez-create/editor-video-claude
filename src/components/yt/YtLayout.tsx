import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { colors, alpha } from "../../brand/tokens";

// Vídeo horizontal de YouTube: la cámara es la base. Cuando entra la pantalla o un gráfico, la cámara de fondo se
// desenfoca y oscurece (nunca negro) y la persona que habla pasa a una ventana a la derecha, sin tapar el contenido.

// src: otro vídeo en lugar de la cámara (un clip fijo que se inserta a mitad del vídeo, o una pista ya cortada).
// zooms: en una pista ya cortada (varios cortes seguidos en un solo vídeo), el encuadre de cada corte: [fotograma, zoom].
export type Piece = {
  readonly trim: number;
  readonly dur: number;
  readonly zoom: number;
  readonly src?: string;
  readonly zooms?: readonly (readonly number[])[];
};
export type Range = readonly [number, number];

const ease = Easing.bezier(0.45, 0, 0.55, 1);
const T = 12; // fotogramas de transición

// 0 = cámara a pantalla completa, 1 = cámara en ventana (dentro de alguno de los tramos)
export const pipAmount = (frame: number, ranges: readonly Range[]) => {
  let p = 0;
  for (const [a, b] of ranges) {
    if (b <= a) continue;
    const v = interpolate(frame, [a - T, a, b, b + T], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    p = Math.max(p, v);
  }
  return p;
};

const zoomAt = (p: Piece, f: number) => {
  if (!p.zooms) return p.zoom;
  let z = p.zoom;
  for (const [at, v] of p.zooms) if (f >= at) z = v;
  return z;
};

const PieceVideo: React.FC<{ readonly p: Piece; readonly muted: boolean; readonly style: (zoom: number) => React.CSSProperties }> = ({ p, muted, style }) => {
  const f = useCurrentFrame();
  return (
    <Video
      src={staticFile(p.src ?? "camara.mp4")}
      trimBefore={p.trim}
      muted={muted}
      // primer fotograma de cada trozo de cámara en silencio: sin chasquidos al empezar
      volume={muted ? 0 : (fr) => (fr < 1 && !p.src && !p.zooms ? 0 : 1)}
      objectFit="cover"
      style={{ width: "100%", height: "100%", ...style(zoomAt(p, f)) }}
    />
  );
};

const Pieces: React.FC<{ readonly pieces: readonly Piece[]; readonly muted?: boolean; readonly style: (zoom: number) => React.CSSProperties }> = ({
  pieces,
  muted = false,
  style,
}) => {
  let from = 0;
  return (
    <>
      {pieces.map((p, i) => {
        const s0 = from;
        from += p.dur;
        return (
          <Sequence key={i} from={s0} durationInFrames={p.dur} name={`Cámara ${i + 1}`}>
            <PieceVideo p={p} muted={muted} style={style} />
          </Sequence>
        );
      })}
    </>
  );
};

// Cámara de fondo: a pantalla completa o desenfocada detrás del contenido.
export const CamBase: React.FC<{ readonly pieces: readonly Piece[]; readonly ranges: readonly Range[] }> = ({ pieces, ranges }) => {
  const frame = useCurrentFrame();
  const p = pipAmount(frame, ranges);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Pieces
        pieces={pieces}
        style={(zoom) => ({
          transformOrigin: "50% 35%",
          scale: `${zoom + p * 0.12}`,
          filter: `blur(${p * 26}px) brightness(${1 - p * 0.55}) saturate(${1 - p * 0.3})`,
        })}
      />
      {/* velo oscuro de marca sobre la cámara desenfocada: el contenido se lee mejor y mantiene la marca */}
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 30% 40%, ${alpha(colors.bg2, .35)}, ${alpha(colors.bg, .75)})`, opacity: p }} />
    </AbsoluteFill>
  );
};

// Panel con la cámara a la derecha (unos 30 % del ancho, a toda altura) mientras se ve la pantalla o un gráfico.
// Cara centrada, un 20 % más grande y sin aire de sobra sobre la cabeza. AJUSTA FACE a tu encuadre de cámara.
export const PIP = { x: 1350, y: 36, w: 534, h: 1008 };
// Recorte de la cámara de 1920x1080 que entra en el panel: cara centrada (x≈1010), cabeza a unos 60 px del borde.
const FACE = { x: 788, y: 185, w: 445 };
export const CamPip: React.FC<{ readonly pieces: readonly Piece[]; readonly ranges: readonly Range[] }> = ({ pieces, ranges }) => {
  const frame = useCurrentFrame();
  const p = pipAmount(frame, ranges);
  if (p <= 0.001) return null;
  const s = PIP.w / FACE.w;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: PIP.x,
          top: PIP.y,
          width: PIP.w,
          height: PIP.h,
          borderRadius: 28,
          overflow: "hidden",
          opacity: p,
          translate: `${(1 - p) * 60}px 0px`,
          scale: `${0.95 + 0.05 * p}`,
          border: "2px solid rgba(255,255,255,.22)",
          boxShadow: `0 26px 60px rgba(0,0,0,.5), 0 0 40px ${colors.accentGlow}`,
        }}
      >
        <div style={{ position: "absolute", left: -FACE.x * s, top: -FACE.y * s, width: 1920 * s, height: 1080 * s }}>
          <Pieces pieces={pieces} muted style={() => ({})} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Área de trabajo de la herramienta dentro de la grabación de pantalla 1920x1080 (sin pestañas, marcadores ni barra lateral)
export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export type TimedRect = Rect & { readonly from: number; readonly to: number };
// Ejemplo: área de trabajo de una app web en una grabación 1920x1080 (sin pestañas, marcadores ni barra lateral)
const CROP: Rect = { x: 360, y: 122, w: 1462, h: 948 };

// Zona del contenido (pantalla o gráfico): unos 70 % del ancho, a toda altura, a la izquierda del panel de la cámara.
export const CARD = { x: 36, y: 36, w: 1290, h: 1008 };
// alto máximo de la tarjeta de pantalla: deja libre arriba la píldora del capítulo (y 52-107)
const CARD_MAX_H = 840;
// escala de la grabación dentro de la tarjeta: entera de ancho, salvo que sea tan alta que tape la píldora
export const cardScale = (crop: Rect) => Math.min(CARD.w / crop.w, CARD_MAX_H / crop.h);

export const ContentCard: React.FC<{ readonly dur: number; readonly children: React.ReactNode; readonly plain?: boolean; readonly crop?: Rect }> = ({
  dur,
  children,
  plain = false,
  crop = CROP,
}) => {
  // la pantalla grabada se ve entera (si se estira para rellenar, se cortan los laterales): la tarjeta toma su proporción, centrada en vertical
  const h = plain ? CARD.h : Math.round(crop.h * cardScale(crop));
  const w = plain ? CARD.w : Math.round(crop.w * cardScale(crop));
  const top = CARD.y + (CARD.h - h) / 2;
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [2, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const exit = interpolate(frame, [dur - 10, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: CARD.x + (CARD.w - w) / 2,
          top,
          width: w,
          height: h,
          borderRadius: 28,
          overflow: "hidden",
          opacity: enter * (1 - exit),
          translate: `0px ${(1 - enter) * 40 + exit * 20}px`,
          scale: `${0.97 + 0.03 * enter}`,
          background: plain ? alpha(colors.bg2, .62) : "#ffffff",
          backdropFilter: plain ? "blur(30px) saturate(140%)" : undefined,
          border: plain ? `1px solid ${colors.line2}` : "1px solid rgba(255,255,255,.3)",
          boxShadow: "0 30px 80px rgba(0,0,0,.55)",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// Grabación de pantalla recortada al área de trabajo de la herramienta: sin pestañas, sin barra de marcadores y sin
// la barra lateral con las cuentas de clientes (regla de CLAUDE.md). AJUSTA CROP al área de trabajo de tu herramienta en tu grabación 1920x1080.
export const ScreenClip: React.FC<{
  readonly src?: string;
  readonly trim: number;
  readonly rate?: number;
  readonly crop?: Rect;
  readonly blur?: readonly Rect[];
  readonly cover?: readonly Rect[]; // tapado en blanco (avisos del sistema que no son de la herramienta)
  // difuminados y tapados solo durante unos fotogramas [from, to) del tramo (paneles que aparecen y desaparecen)
  readonly blurT?: readonly TimedRect[];
  readonly coverT?: readonly TimedRect[];
}> = ({ src = "pantalla.mp4", trim, rate = 1, crop = CROP, blur = [], cover = [], blurT = [], coverT = [] }) => {
  const s = cardScale(crop);
  const frame = useCurrentFrame();
  const on = (r: TimedRect) => frame >= r.from && frame < r.to;
  blur = [...blur, ...blurT.filter(on)];
  cover = [...cover, ...coverT.filter(on)];
  return (
    <div style={{ position: "absolute", left: -crop.x * s, top: -crop.y * s, width: 1920 * s, height: 1080 * s }}>
      <Video src={staticFile(src)} trimBefore={trim} muted playbackRate={rate} style={{ width: "100%", height: "100%" }} />
      {/* zonas difuminadas (datos internos o conversaciones privadas), en coordenadas de la grabación */}
      {blur.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x * s, top: b.y * s, width: b.w * s, height: b.h * s, backdropFilter: "blur(9px)", background: "rgba(255,255,255,.25)" }} />
      ))}
      {cover.map((b, i) => (
        <div key={`c${i}`} style={{ position: "absolute", left: b.x * s, top: b.y * s, width: b.w * s, height: b.h * s, background: "#ffffff" }} />
      ))}
    </div>
  );
};

// Clip de apoyo (por ejemplo de YouArt) a pantalla completa (la voz de la cámara sigue debajo).
export const FullBroll: React.FC<{ readonly src: string; readonly dur: number }> = ({ src, dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const z = interpolate(frame, [0, dur], [1.04, 1.12]);
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <Video src={staticFile(src)} muted objectFit="cover" style={{ width: "100%", height: "100%", scale: `${z}` }} />
    </AbsoluteFill>
  );
};

// Imagen fija (captura) dentro de la tarjeta, con un acercamiento lento hacia `focus` (porcentaje x y de la imagen).
export const ImageClip: React.FC<{ readonly src: string; readonly dur: number; readonly focus?: string }> = ({ src, dur, focus = "30% 60%" }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", scale: `${z}`, transformOrigin: focus }} />;
};
