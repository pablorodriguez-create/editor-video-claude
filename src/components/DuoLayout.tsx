import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { glass } from "./GlassChip";

// Composición de dos fuentes sincronizadas: la cámara (con el audio) y la grabación de pantalla (muda).
// El plano se monta sin recorte propio: cada vídeo lleva su `trimBefore`, así el reloj local va de 0 a `duration`.
// La pantalla muestra una zona (`boxA`) y se desplaza suavemente hasta `boxB` durante el plano.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export type Box = readonly [number, number, number, number]; // x, y, ancho, alto en px de la pantalla 1920x1080
export type DuoMode = "cam" | "split" | "card" | "loom";

const SCREEN_W = 1920;
const SCREEN_H = 1080;
// Área de trabajo de la herramienta en la grabación (sin barra lateral ni navegador).
const SAFE: Box = [372, 128, 1452, 944];

const ScreenWindow: React.FC<{
  readonly src: string;
  readonly trimBefore: number;
  readonly playbackRate: number;
  readonly duration: number;
  readonly boxA: Box;
  readonly boxB: Box;
  readonly w: number;
  readonly h: number;
  readonly safe: Box;
}> = ({ src, trimBefore, playbackRate, duration, boxA, boxB, w, h, safe }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const [x, y, bw, bh] = boxA.map((v, i) => v + (boxB[i] - v) * t);
  // La zona elegida entra entera en la ventana (como object-fit: contain) y queda centrada.
  // Lo que se ve nunca sale de SAFE (el área de trabajo de la herramienta): así la barra lateral con
  // las cuentas de clientes y la barra del navegador no aparecen nunca.
  const [sx, sy, sw, sh] = safe;
  const scale = Math.max(Math.min(w / bw, h / bh), w / sw, h / sh);
  const vw = w / scale;
  const vh = h / scale;
  const cx = Math.min(Math.max(x + bw / 2, sx + vw / 2), sx + sw - vw / 2);
  const cy = Math.min(Math.max(y + bh / 2, sy + vh / 2), sy + sh - vh / 2);
  const left = -(cx - vw / 2) * scale;
  const top = -(cy - vh / 2) * scale;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#f7f7f8" }}>
      <Sequence durationInFrames={Math.ceil(duration * playbackRate) + 2} trimBefore={trimBefore} playbackRate={playbackRate} layout="none">
        <Video
          src={staticFile(src)}
          muted
          style={{ position: "absolute", left, top, width: SCREEN_W * scale, height: SCREEN_H * scale }}
        />
      </Sequence>
    </div>
  );
};

export const DuoLayout: React.FC<{
  readonly mode: DuoMode;
  readonly duration: number;
  readonly cam: string;
  readonly camTrim: number;
  readonly screen?: string;
  readonly screenTrim?: number;
  readonly screenRate?: number;
  readonly boxA?: Box;
  readonly boxB?: Box;
  // Área segura de esa grabación de pantalla (por defecto, la de la grabación principal).
  readonly safe?: Box;
  // Animación de entrada / salida de la pantalla (cambio de composición entre planos).
  readonly enter?: boolean;
  readonly exit?: boolean;
  readonly grade?: string;
  // Zoom lento de la cámara (1 = sin zoom).
  readonly push?: number;
  readonly punchIn?: boolean;
}> = ({
  mode,
  duration,
  cam,
  camTrim,
  screen = "pantalla.mp4",
  screenTrim = 0,
  screenRate = 1,
  boxA = [360, 130, 1460, 940],
  boxB,
  safe = SAFE,
  enter = false,
  exit = false,
  grade = "contrast(1.05) saturate(1.06)",
  push = 1.03,
  punchIn = false,
}) => {
  const frame = useCurrentFrame();
  const inP = enter
    ? interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut })
    : 1;
  const outP = exit
    ? interpolate(frame, [duration - 14, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut })
    : 0;
  const camScale = interpolate(frame, punchIn ? [0, 10, duration] : [0, duration], punchIn ? [1.12, 1, push] : [1, push], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const camVideo = (objectPosition: string) => (
    <Video
      src={staticFile(cam)}
      trimBefore={camTrim}
      objectFit="cover"
      style={{ width: "100%", height: "100%", objectPosition, filter: grade, scale: `${camScale}`, transformOrigin: "50% 35%" }}
    />
  );
  const scr = (w: number, h: number) =>
    mode === "cam" ? null : (
      <ScreenWindow
        src={screen}
        trimBefore={screenTrim}
        playbackRate={screenRate}
        duration={duration}
        boxA={boxA}
        boxB={boxB ?? boxA}
        w={w}
        h={h}
        safe={safe}
      />
    );
  const vis = inP * (1 - outP);
  // Fondo para split y loom: la misma cámara, muda, desenfocada y oscurecida. Así ninguna transición deja ver negro.
  const backdrop = (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        src={staticFile(cam)}
        trimBefore={camTrim}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%", filter: "blur(40px) brightness(0.55) saturate(1.1)", scale: "1.15" }}
      />
    </AbsoluteFill>
  );

  if (mode === "cam") {
    return <AbsoluteFill style={{ backgroundColor: "#000" }}>{camVideo("50% 50%")}</AbsoluteFill>;
  }

  if (mode === "split") {
    // Pantalla arriba (960px) y cámara abajo, con una línea fina de separación.
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        {backdrop}
        <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden" }}>
          {camVideo("50% 40%")}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 956,
            overflow: "hidden",
            clipPath: `inset(0 0 ${(1 - vis) * 100}% 0)`,
          }}
        >
          {scr(1080, 956)}
        </div>
      </AbsoluteFill>
    );
  }

  if (mode === "card") {
    // Cámara a pantalla completa y la pantalla en una tarjeta de cristal abajo, para no tapar nunca la cara.
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        {camVideo("50% 50%")}
        <div
          style={{
            ...glass,
            position: "absolute",
            left: 44,
            top: 1000,
            width: 992,
            height: 620,
            padding: 10,
            borderRadius: 44,
            opacity: vis,
            scale: `${0.94 + 0.06 * vis}`,
            translate: `0px ${(1 - inP) * 40 + outP * 20}px`,
            filter: `blur(${(1 - vis) * 8}px)`,
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 34, overflow: "hidden" }}>
            {scr(972, 600)}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // loom: la pantalla ocupa la parte de arriba y la cámara va en una burbuja redonda.
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d12" }}>
      {backdrop}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1340,
          overflow: "hidden",
          opacity: vis,
          scale: `${0.97 + 0.03 * vis}`,
          borderBottomLeftRadius: 48,
          borderBottomRightRadius: 48,
        }}
      >
        {scr(1080, 1340)}
      </div>
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 1050,
          width: 494,
          height: 494,
          borderRadius: 999,
          overflow: "hidden",
          border: "6px solid rgba(255,255,255,.9)",
          boxShadow: "0 24px 60px rgba(0,0,0,.45)",
          opacity: enter ? interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
        }}
      >
        <div style={{ position: "absolute", left: -247, top: -390, width: 988, height: 1756 }}>{camVideo("50% 30%")}</div>
      </div>
    </AbsoluteFill>
  );
};
