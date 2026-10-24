import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fonts } from "../brand/fonts";
import { glass } from "./GlassChip";
import { LineIconTile } from "./LineIcon";

// Dock de cristal (estilo macOS) para el hook: resume de un vistazo de qué va el vídeo.
// Los iconos entran uno a uno con un pequeño salto y luego flotan muy despacio. Siempre arriba, lejos de la cara.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const DEFAULT_TILE = 112;

type Item = { readonly label: string; readonly img?: string; readonly icon?: string; readonly linkedin?: boolean };

// Fichas disponibles por etiqueta. PERSONALIZA: añade las tuyas (logo oficial de public/logos o icono de LineIcon.tsx).
export const ITEMS: Item[] = [
  { label: "LinkedIn", img: "logos/linkedin-in-blue.png", linkedin: true },
  { label: "Claude", img: "logos/claude-icon-rounded.svg" },
  { label: "Instagram", img: "logos/instagram-glyph-gradient.png" },
  { label: "ChatGPT", img: "logos/openai-blossom.svg" },
  { label: "TikTok", img: "logos/tiktok-icon-circle.png" },
  { label: "Clientes", icon: "handshake" },
  { label: "Mensajes", icon: "message" },
  { label: "Llamadas", icon: "phone" },
  { label: "Dinero", icon: "euro" },
  { label: "Empresas", icon: "building" },
  { label: "Equipo", icon: "users" },
  { label: "Ideas", icon: "brain" },
  { label: "Likes", icon: "heart" },
  { label: "Fama", icon: "star" },
  { label: "Crecer", icon: "rocket" },
  { label: "Realidad", icon: "trending-down" },
  { label: "Liderazgo", icon: "crown" },
  { label: "Impuestos", icon: "landmark" },
  { label: "Tiempo", icon: "calendar" },
  { label: "Ventas", icon: "chart" },
];

export const ContextDock: React.FC<{
  // Frames del reloj de la secuencia que la contiene.
  readonly from: number;
  readonly to: number;
  readonly top?: number;
  // Qué iconos salen (por etiqueta). Con dos, van grandes y unidos por un "+": LinkedIn y su acompañante.
  readonly pick?: string[];
  readonly tile?: number;
  // Signo entre los dos iconos: "+" (suma) o "vs" (contraste).
  readonly joiner?: string;
  // Visible ya en el primer frame (para que salga en la portada del vídeo).
  readonly instant?: boolean;
}> = ({ from, to, top = 150, pick, tile, joiner = "+", instant = false }) => {
  const frame = useCurrentFrame();
  // Respeta el orden de `pick`.
  const items = pick ? pick.map((l) => ITEMS.find((it) => it.label === l)).filter((it): it is Item => Boolean(it)) : ITEMS;
  const pair = items.length === 2;
  const hasLinkedIn = items.some((it) => it.linkedin);
  const TILE = tile ?? (pair ? 200 : DEFAULT_TILE);
  const enterP = instant
    ? 1
    : interpolate(frame, [from, from + 14], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeOut,
      });
  const exitP = interpolate(frame, [to - 10, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          ...glass,
          position: "absolute",
          top,
          display: "flex",
          alignItems: "center",
          gap: pair ? 34 : 18,
          padding: pair ? "26px 40px 20px" : "18px 22px 14px",
          borderRadius: pair ? 56 : 40,
          opacity: enterP * (1 - exitP),
          scale: `${(0.92 + 0.08 * enterP) * (1 - 0.03 * exitP)}`,
          translate: `0px ${(1 - enterP) * -14 + exitP * -10}px`,
          filter: `blur(${(1 - enterP) * 6}px)`,
        }}
      >
        {items.map((item, i) => {
          const at = instant ? from - 24 : from + 6 + i * (pair ? 7 : 4);
          const p = instant
            ? 1
            : interpolate(frame, [at, at + 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.34, 1.4, 0.64, 1),
              });
          // flotación suave, desfasada por icono
          const float = Math.sin((frame - at) / 14 + i * 0.9) * 3 * Math.min(1, Math.max(0, (frame - at - 12) / 10));
          // El de LinkedIn va un 15 % más grande que su acompañante.
          const size = pair && hasLinkedIn && !item.linkedin ? Math.round(TILE * 0.85) : TILE;
          const plus =
            pair && i === 1 ? (
              <span
                key="plus"
                style={{
                  color: "#ffffff",
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fontSize: joiner === "+" ? 72 : 54,
                  letterSpacing: "-0.02em",
                  marginBottom: 40,
                  opacity: instant ? 1 : interpolate(frame, [at - 4, at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                {joiner}
              </span>
            ) : null;
          return [
            plus,
            <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: pair ? 12 : 8 }}>
              <div
                style={{
                  // hueco fijo del tamaño de la ficha grande: las etiquetas quedan alineadas aunque las fichas midan distinto
                  height: TILE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: Math.min(1, p),
                  scale: `${0.6 + 0.4 * p}`,
                  translate: `0px ${(1 - Math.min(1, p)) * 18 + float}px`,
                }}
              >
                {item.img ? (
                  <div
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size * 0.25,
                      background: "rgba(255,255,255,.92)",
                      border: "1px solid rgba(255,255,255,.35)",
                      boxShadow: "0 10px 24px rgba(0,0,0,.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {item.linkedin ? (
                      // el PNG lleva la ® a la derecha del cuadrado: una ventana cuadrada la deja fuera entera
                      <div style={{ width: size * 0.72, height: size * 0.72, overflow: "hidden", borderRadius: size * 0.08 }}>
                        <Img
                          src={staticFile(item.img)}
                          style={{
                            width: Math.round((size * 0.72 * 635) / 540),
                            maxWidth: "none",
                            height: size * 0.72,
                            objectFit: "contain",
                            objectPosition: "left center",
                          }}
                        />
                      </div>
                    ) : (
                      <Img
                        src={staticFile(item.img)}
                        style={
                          item.label === "Instagram" || item.label === "ChatGPT" || item.label === "TikTok"
                            ? { width: size * 0.66, height: size * 0.66, objectFit: "contain" }
                            : { width: size, height: size, objectFit: "cover" }
                        }
                      />
                    )}
                  </div>
                ) : (
                  <LineIconTile name={item.icon ?? ""} size={size} />
                )}
              </div>
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: pair ? 34 : 22,
                  letterSpacing: "-0.01em",
                  opacity: Math.min(1, p),
                  textShadow: "0 1px 6px rgba(0,0,0,.4)",
                }}
              >
                {item.label}
              </span>
            </div>,
          ];
        })}
      </div>
    </AbsoluteFill>
  );
};
