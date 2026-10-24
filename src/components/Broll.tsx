import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Heart, Send, UserRound, UserPlus } from "lucide-react";
import { colors, alpha } from "../brand/tokens";
import { IconPop, LOGOS } from "./IconPop";

// Versión C: animaciones de apoyo SIN TEXTO (el texto ya va en los subtítulos). Todas viven en la franja de arriba
// (y de ~110 a ~410 px), por encima de la cabeza: nunca tapan la cara.
//   money          billetes que salen disparados
//   chart-up/down  gráfica de barras que sube o baja
//   li-profile     pantallazo estilizado de un perfil de LinkedIn (líneas en vez de texto)
//   li-message     conversación de LinkedIn que se escribe sola
//   network        red de conexiones que se va trazando hasta un nodo destacado
//   hearts         corazones que suben con el logo de Instagram
//   icon:<nombre>  icono de línea o logo con salto (IconPop)
//   pair:a>b       dos logos oficiales y gente que pasa del primero al segundo (pair:a|b, los dos sin flujo)
//   ads-logos      fichas de Google y Meta que se tragan billetes (el dinero que se va en anuncios)
//   photo:<ruta>   foto recortada (por ejemplo de YouArt, en public/recursos/...) que entra flotando con halo
//   video:<ruta>   clip sin sonido en una tarjeta 16:9 (public/recursos/<ruta>.mp4)

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const spring = Easing.bezier(0.34, 1.45, 0.64, 1);
const TOP = 80;   // tarjetas altas: su borde de abajo queda por encima de y≈345, lejos del pelo incluso en el pico del zoom

// Dirección de arte: todo entra barriendo desde la izquierda (giro 3D y pequeño rebote al frenar), flota mientras
// está en pantalla y sale por la derecha acelerando.
const easeIn = Easing.bezier(0.55, 0, 0.9, 0.4);
// hold: la animación sigue en pantalla cuando acaba el vídeo; sin salida, para que el último fotograma la muestre entera
const Hold = React.createContext(false);
const useMotion = () => {
  const frame = useCurrentFrame();
  const hold = React.useContext(Hold);
  const { durationInFrames: dur0 } = useVideoConfig();
  const dur = hold ? 100000 : dur0;
  const enter = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 1.35, 0.4, 1) });
  const exit = interpolate(frame, [dur - 12, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeIn });
  const float = Math.sin(frame / 11) * 6 * Math.min(1, Math.max(0, (frame - 16) / 10));
  return { frame, dur, enter, exit, float };
};
const cardStyle = (enter: number, exit: number, float = 0): React.CSSProperties => ({
  opacity: Math.min(1, enter * 1.6) * (1 - exit * 0.6),
  translate: `${(1 - enter) * -1000 + exit * 1100}px ${float}px`,
  rotate: `${(1 - enter) * -9 + exit * 7}deg`,
  transform: `perspective(1400px) rotateY(${(1 - enter) * 38 - exit * 30}deg)`,
  filter: `blur(${Math.abs(1 - enter) * 10 + exit * 10}px)`,
});

const LiLogo: React.FC<{ readonly size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, overflow: "hidden", borderRadius: size * 0.12 }}>
    <Img
      src={staticFile("logos/linkedin-in-blue.png")}
      style={{ width: Math.round((size * 635) / 540), maxWidth: "none", height: size, objectFit: "contain", objectPosition: "left center" }}
    />
  </div>
);

// Línea gris que sustituye al texto en los pantallazos
const Skel: React.FC<{ readonly w: number; readonly h?: number; readonly c?: string; readonly p?: number }> = ({ w, h = 14, c = "#d9dee6", p = 1 }) => (
  <div style={{ width: w * p, height: h, borderRadius: h / 2, background: c }} />
);

// ---------- dinero: billetes ----------
const Bill: React.FC<{ readonly w: number }> = ({ w }) => (
  <div
    style={{
      width: w,
      height: w * 0.5,
      borderRadius: 10,
      background: `linear-gradient(135deg, ${colors.highlightHi} 0%, ${colors.highlight} 55%, ${colors.highlight} 100%)`,
      border: `2px solid ${alpha(colors.onHighlight, .25)}`,
      boxShadow: "0 10px 26px rgba(0,0,0,.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}
  >
    <div style={{ position: "absolute", inset: 8, border: `2px solid ${alpha(colors.onHighlight, .18)}`, borderRadius: 6 }} />
    <div
      style={{
        width: w * 0.3,
        height: w * 0.3,
        borderRadius: "50%",
        border: `3px solid ${alpha(colors.onHighlight, .55)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors.onHighlight,
        fontSize: w * 0.2,
        fontWeight: 800,
        fontFamily: "Inter, sans-serif",
      }}
    >
      €
    </div>
  </div>
);

const Money: React.FC = () => {
  const { frame, dur } = useMotion();
  const bills = Array.from({ length: 12 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bills.map((i) => {
        const delay = i * 3;
        const life = Math.max(30, dur - delay);
        const t = interpolate(frame - delay, [0, life], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const w = 140 + random(`w${i}`) * 50;
        // carriles altos y poca ola: el borde más bajo de un billete (incluso girado) queda por encima de y≈385
        const lane = TOP - 20 + random(`l${i}`) * 110;
        const x = -250 + t * 1580 + Math.sin(t * 6 + i) * 30;
        const y = lane + Math.sin(t * Math.PI * 2 + i * 1.3) * 22;
        const rot = -25 + t * 70 * (random(`r${i}`) > 0.5 ? 1 : -1) + Math.sin(frame / 6 + i) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - w / 2,
              top: Math.min(225, y),
              opacity: frame < delay ? 0 : 1,
              rotate: `${rot}deg`,
              transform: `perspective(900px) rotateY(${Math.sin(frame / 5 + i) * 40}deg)`,
            }}
          >
            <Bill w={w} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- gráfica ----------
const Chart: React.FC<{ readonly up: boolean }> = ({ up }) => {
  const { frame, enter, exit, float } = useMotion();
  const vals = up ? [0.22, 0.34, 0.31, 0.52, 0.66, 0.95] : [0.95, 0.8, 0.84, 0.55, 0.38, 0.16];
  const W = 600, H = 240, bw = 62, gap = 26, base = H - 34;
  const pts = vals.map((v, i) => [56 + i * (bw + gap) + bw / 2, base - v * (H - 80)]);
  const draw = interpolate(frame, [8, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TOP,
          width: W,
          height: H,
          borderRadius: 34,
          background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))",
          backdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(255,255,255,.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 18px 40px rgba(0,0,0,.35)",
          ...cardStyle(enter, exit, float),
        }}
      >
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {vals.map((v, i) => {
            const g = interpolate(frame, [0 + i * 2, 14 + i * 3], [0.35, 1],   // ya visibles desde el primer fotograma
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.3, 1.8, 0.5, 1) });
            const h = v * (H - 80) * Math.max(0, g);
            const last = up ? i === vals.length - 1 : false;
            return (
              <rect
                key={i}
                x={56 + i * (bw + gap)}
                y={base - h}
                width={bw}
                height={h}
                rx={12}
                fill={last ? colors.highlight : up ? colors.accent : "rgba(255,255,255,.55)"}
                opacity={up ? 0.95 : 0.85}
              />
            );
          })}
          <polyline
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke={up ? colors.highlight : "#ffffff"}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - draw}
          />
          <line x1={40} x2={W - 40} y1={base + 2} y2={base + 2} stroke="rgba(255,255,255,.3)" strokeWidth={2} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- pantallazo: perfil de LinkedIn ----------
const LiProfile: React.FC = () => {
  const { frame, enter, exit, float } = useMotion();
  const btn = interpolate(frame, [22, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: spring });
  const W = 640, H = 262;
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TOP,
          width: W,
          height: H,
          borderRadius: 28,
          background: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 22px 50px rgba(0,0,0,.4)",
          ...cardStyle(enter, exit, float),
        }}
      >
        <div style={{ height: 84, background: `linear-gradient(120deg, #0a66c2 0%, ${colors.accent} 60%, #6aa7ff 100%)` }} />
        <div style={{ position: "absolute", right: 22, top: 20 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 4 }}>
            <LiLogo size={46} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 36,
            width: 108,
            height: 108,
            borderRadius: "50%",
            background: "#e8edf3",
            border: "5px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserRound size={66} color="#8a97a8" strokeWidth={1.6} />
        </div>
        <div style={{ position: "absolute", left: 34, top: 158, display: "flex", flexDirection: "column", gap: 11 }}>
          <Skel w={250} h={20} c="#1d2633" p={interpolate(frame, [10, 22], [0.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          <Skel w={360} p={interpolate(frame, [14, 26], [0.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          <Skel w={200} p={interpolate(frame, [18, 30], [0.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </div>
        <div
          style={{
            position: "absolute",
            right: 30,
            bottom: 24,
            width: 150,
            height: 50,
            borderRadius: 25,
            background: "#0a66c2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: `${0.6 + 0.4 * btn}`,
            opacity: btn,
          }}
        >
          <UserPlus size={28} color="#fff" strokeWidth={2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- pantallazo: mensajes de LinkedIn ----------
const LiMessage: React.FC = () => {
  const { frame, enter, exit, float } = useMotion();
  const W = 640, H = 262;
  const b1 = interpolate(frame, [10, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: spring });
  const typing = frame > 20 && frame < 36;
  const b2 = interpolate(frame, [36, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: spring });
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TOP,
          width: W,
          height: H,
          borderRadius: 28,
          background: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 22px 50px rgba(0,0,0,.4)",
          ...cardStyle(enter, exit, float),
        }}
      >
        <div style={{ height: 64, borderBottom: "1px solid #e6e9ee", display: "flex", alignItems: "center", gap: 14, padding: "0 22px" }}>
          <LiLogo size={34} />
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8edf3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserRound size={22} color="#8a97a8" strokeWidth={1.8} />
          </div>
          <Skel w={180} h={16} c="#1d2633" />
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ alignSelf: "flex-end", background: "#0a66c2", borderRadius: "22px 22px 6px 22px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 9, opacity: b1, scale: `${0.7 + 0.3 * b1}`, transformOrigin: "right bottom" }}>
            <Skel w={300} c="rgba(255,255,255,.85)" />
            <Skel w={200} c="rgba(255,255,255,.85)" />
          </div>
          {typing ? (
            <div style={{ alignSelf: "flex-start", background: "#eef1f5", borderRadius: 18, padding: "14px 18px", display: "flex", gap: 7 }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 11, height: 11, borderRadius: "50%", background: "#8a97a8", opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame + d * 4) / 4)) }} />
              ))}
            </div>
          ) : (
            <div style={{ alignSelf: "flex-start", background: "#eef1f5", borderRadius: "22px 22px 22px 6px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 9, opacity: b2, scale: `${0.7 + 0.3 * b2}`, transformOrigin: "left bottom" }}>
              <Skel w={260} c="#9aa6b6" />
              <Skel w={150} c="#9aa6b6" />
            </div>
          )}
        </div>
        <div style={{ position: "absolute", right: 22, bottom: 18 }}>
          <Send size={30} color="#0a66c2" strokeWidth={2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- red de conexiones ----------
const Network: React.FC = () => {
  const { frame, enter, exit, float } = useMotion();
  const nodes = [
    [110, 170],
    [250, 90],
    [400, 190],
    [560, 100],
    [720, 175],
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: TOP, width: 840, height: 250, ...cardStyle(enter, exit, float) }}>
        <svg width={840} height={250} style={{ position: "absolute", inset: 0 }}>
          {nodes.slice(1).map((n, i) => {
            const p = interpolate(frame, [8 + i * 7, 18 + i * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
            const a = nodes[i];
            return (
              <line key={i} x1={a[0]} y1={a[1]} x2={a[0] + (n[0] - a[0]) * p} y2={a[1] + (n[1] - a[1]) * p} stroke={colors.accentHi} strokeWidth={5} strokeLinecap="round" />
            );
          })}
        </svg>
        {nodes.map((n, i) => {
          const last = i === nodes.length - 1;
          const p = interpolate(frame, [2 + i * 7, 12 + i * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: spring });
          const s = last ? 120 : 88;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: n[0] - s / 2,
                top: n[1] - s / 2,
                width: s,
                height: s,
                borderRadius: "50%",
                background: last ? colors.highlight : i === 0 ? colors.accent : "rgba(255,255,255,.92)",
                border: "3px solid rgba(255,255,255,.9)",
                boxShadow: last ? `0 0 40px ${colors.highlightGlow}` : "0 10px 24px rgba(0,0,0,.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: Math.min(1, p),
                scale: `${0.4 + 0.6 * p}`,
              }}
            >
              <UserRound size={s * 0.5} color={last ? colors.onHighlight : i === 0 ? "#fff" : "#5b6878"} strokeWidth={1.8} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- likes: corazones que suben ----------
const Hearts: React.FC = () => {
  const { frame, enter, exit, float } = useMotion();
  const hearts = Array.from({ length: 10 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 540 - 85, top: TOP + 70, ...cardStyle(enter, exit, float) }}>
        <div style={{ width: 170, height: 170, borderRadius: 44, background: "rgba(255,255,255,.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 40px rgba(0,0,0,.35)" }}>
          <Img src={staticFile("logos/instagram-glyph-gradient.png")} style={{ width: 112, height: 112 }} />
        </div>
      </div>
      {hearts.map((i) => {
        const delay = 4 + i * 3;
        const t = interpolate(frame - delay, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
        const side = i % 2 === 0 ? -1 : 1;
        const x = 540 + side * (130 + random(`hx${i}`) * 230) + Math.sin((frame + i * 9) / 7) * 10;
        const y = TOP + 300 - t * (220 + random(`hy${i}`) * 60);
        const s = 50 + random(`hs${i}`) * 34;
        return (
          <div key={i} style={{ position: "absolute", left: x - s / 2, top: y, opacity: frame < delay ? 0 : Math.sin(Math.PI * Math.min(1, t * 1.1)), scale: `${0.5 + 0.5 * t}` }}>
            <Heart size={s} color="#ffffff" fill="rgba(255,255,255,.9)" strokeWidth={1.5} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};


// Clip de vídeo real (YouArt) en una tarjeta 16:9 que entra barriendo por la izquierda y sale por la derecha. Sin sonido.
const VideoCard: React.FC<{ readonly src: string }> = ({ src }) => {
  const { enter, exit, float } = useMotion();
  const W = 540, H = 304;
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TOP,
          width: W,
          height: H,
          borderRadius: 30,
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,.18)",
          boxShadow: `0 24px 60px rgba(0,0,0,.55), 0 0 40px ${alpha(colors.accentHi, .25)}`,
          ...cardStyle(enter, exit, float),
        }}
      >
        <Video src={staticFile(src)} muted objectFit="cover" style={{ width: W, height: H }} />
      </div>
    </AbsoluteFill>
  );
};

// Google y Meta (anuncios): las dos fichas con su logo oficial entran girando desde la izquierda (Google primero, Meta
// medio segundo después, cuando se nombra) y unos billetes salen volando hacia ellas y desaparecen dentro:
// el dinero que se traga la publicidad. Luego salen por la derecha.
const AdsLogos: React.FC = () => {
  const { frame, dur, exit, float } = useMotion();
  const tile = (src: string, x: number, delay: number, w: number) => {
    const e = interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 1.35, 0.4, 1) });
    return (
      <div
        style={{
          position: "absolute",
          left: x - 95,
          top: TOP + 40,
          width: 190,
          height: 190,
          borderRadius: 48,
          background: "rgba(255,255,255,.96)",
          boxShadow: `0 20px 44px rgba(0,0,0,.45), 0 0 36px ${alpha(colors.accentHi, .25)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: Math.min(1, e * 1.6) * (1 - exit * 0.6),
          translate: `${(1 - e) * -900 + exit * 1000}px ${float}px`,
          rotate: `${(1 - e) * -25 + exit * 20}deg`,
          transform: `perspective(900px) rotateY(${(1 - e) * 60}deg)`,
          filter: `blur(${Math.abs(1 - e) * 8 + exit * 8}px)`,
        }}
      >
        <Img src={staticFile(src)} style={{ width: w, objectFit: "contain" }} />
      </div>
    );
  };
  const bills = Array.from({ length: 8 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bills.map((i) => {
        const start = 16 + i * 5;
        const t = interpolate(frame - start, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.5, 0, 0.75, 0) });
        if (frame < start || t >= 1 || frame > dur - 12) return null;
        const target = i % 2 === 0 ? 400 : 680;
        const x0 = 40 + random(`bx${i}`) * 160;
        const x = x0 + (target - x0) * t;
        const y = TOP + 10 + Math.sin(t * Math.PI) * -40 + t * 120;
        return (
          <div key={i} style={{ position: "absolute", left: x - 85, top: y, scale: `${1 - 0.75 * t}`, opacity: 1 - t * 0.7, rotate: `${-30 + t * 200}deg` }}>
            <Bill w={170} />
          </div>
        );
      })}
      {tile("logos/meta-symbol.png", 680, 14, 140)}
      {tile("logos/google-g.png", 400, 0, 120)}
    </AbsoluteFill>
  );
};

// Dos logos oficiales (claves de LOGOS en IconPop). Con "a>b" unas personas salen del primero y vuelan al segundo:
// gente que se lleva de una red a otra. Con "a|b" solo los dos logos.
const Pair: React.FC<{ readonly spec: string }> = ({ spec }) => {
  const { frame, dur, exit, float } = useMotion();
  const flow = spec.includes(">");
  const [a, b] = spec.split(/[>|]/);
  const tile = (key: string, x: number, delay: number) => {
    const logo = LOGOS[key];
    const e = interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 1.35, 0.4, 1) });
    return (
      <div
        style={{
          position: "absolute",
          left: x - 95,
          top: TOP + 40,
          width: 190,
          height: 190,
          borderRadius: 48,
          background: "rgba(255,255,255,.96)",
          boxShadow: `0 20px 44px rgba(0,0,0,.45), 0 0 36px ${alpha(colors.accentHi, .25)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: Math.min(1, e * 1.6) * (1 - exit * 0.6),
          translate: `${(1 - e) * -900 + exit * 1000}px ${float}px`,
          rotate: `${(1 - e) * -25 + exit * 20}deg`,
          transform: `perspective(900px) rotateY(${(1 - e) * 60}deg)`,
          filter: `blur(${Math.abs(1 - e) * 8 + exit * 8}px)`,
        }}
      >
        {logo ? (
          <div style={{ width: 120, height: 120, overflow: "hidden", borderRadius: 8 }}>
            <Img src={staticFile(logo.src)} style={{ width: Math.round(120 * logo.w), maxWidth: "none", height: 120, objectFit: "contain", objectPosition: "left center" }} />
          </div>
        ) : null}
      </div>
    );
  };
  // (supervisor) tres personas grandes que cruzan por delante de los logos nada más entrar: se ve mientras aún se dice
  const people = Array.from({ length: 3 }, (_, i) => i);
  const tiles = (
    <>
      {tile(b, 750, 4)}
      {tile(a, 330, 0)}
    </>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {tiles}
      {flow
        ? people.map((i) => {
            const start = 8 + i * 6;
            const t = interpolate(frame - start, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.55, 1) });
            if (frame < start || t >= 1 || frame > dur - 12) return null;
            const x = 330 + 420 * t;
            const y = TOP + 92 - Math.sin(t * Math.PI) * (80 + i * 22);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x - 44,
                  top: y,
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  background: colors.accent,
                  border: "3px solid #fff",
                  boxShadow: `0 0 26px ${alpha(colors.accentHi, .8)}, 0 12px 24px rgba(0,0,0,.4)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: Math.min(1, t * 5) * Math.min(1, (1 - t) * 5),
                  scale: 0.8 + Math.sin(t * Math.PI) * 0.3,
                }}
              >
                <UserRound size={50} color="#fff" strokeWidth={2} />
              </div>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

// Foto de objeto recortada (YouArt): entra girando desde la izquierda, flota con un halo cálido y sale por la derecha.
const PhotoObject: React.FC<{ readonly src: string }> = ({ src }) => {
  const { frame, enter, exit, float } = useMotion();
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TOP - 10,
          width: 420,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...cardStyle(enter, exit, float),
        }}
      >
        <div style={{ position: "absolute", inset: -40, borderRadius: "50%", background: `radial-gradient(closest-side, ${alpha(colors.highlight, .35)}, rgba(0,0,0,0))` }} />
        <Img
          src={staticFile(src)}
          style={{
            position: "relative",
            maxWidth: 420,
            maxHeight: 300,
            objectFit: "contain",
            rotate: `${Math.sin(frame / 16) * 4}deg`,
            filter: `drop-shadow(0 22px 26px rgba(0,0,0,.55)) drop-shadow(0 0 24px ${alpha(colors.highlight, .35)})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Broll: React.FC<{ readonly kind: string; readonly x?: number; readonly hold?: boolean }> = ({ kind, x, hold = false }) => (
  <Hold.Provider value={hold}>
    <BrollKind kind={kind} x={x} />
  </Hold.Provider>
);

const BrollKind: React.FC<{ readonly kind: string; readonly x?: number }> = ({ kind, x }) => {
  if (kind === "money") return <Money />;
  if (kind === "ads-logos") return <AdsLogos />;
  if (kind === "chart-up") return <Chart up />;
  if (kind === "chart-down") return <Chart up={false} />;
  if (kind === "li-profile") return <LiProfile />;
  if (kind === "li-message") return <LiMessage />;
  if (kind === "network") return <Network />;
  if (kind === "hearts") return <Hearts />;
  if (kind.startsWith("video:")) return <VideoCard src={`recursos/${kind.slice(6)}.mp4`} />;
  if (kind.startsWith("icon:")) return <IconPop icon={kind.slice(5)} x={x} />;
  if (kind.startsWith("pair:")) return <Pair spec={kind.slice(5)} />;
  if (kind.startsWith("photo:")) return <PhotoObject src={kind.slice(6)} />;
  return null;
};
