import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fonts } from "../brand/fonts";
import { glass } from "./GlassChip";

// Cápsula de cristal con los logos oficiales de las herramientas que se nombran (por ejemplo Claude + LinkedIn).
// Entra grande con el nombre, a los ~1,3 s se recoge a solo iconos y sale más rápido de lo que entra.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);
const ICON = 116;
const GAP = 22;

// imgWidth: ancho real de la imagen. El PNG de LinkedIn lleva la ® a la derecha del cuadrado:
// el hueco mide como el cuadrado (ICON) y la ® sobresale, para que el símbolo quede centrado.
const SOURCES = {
  claude: { src: "logos/claude-icon-rounded.svg", imgWidth: ICON, name: "Claude" },
  linkedin: { src: "logos/linkedin-in-blue.png", imgWidth: Math.round((ICON * 635) / 540), name: "LinkedIn" },
  instagram: { src: "logos/instagram-glyph-gradient.png", imgWidth: ICON, name: "Instagram" },
  chatgpt: { src: "logos/openai-blossom.svg", imgWidth: ICON, name: "ChatGPT" },
  tiktok: { src: "logos/tiktok-icon-circle.png", imgWidth: ICON, name: "TikTok" },
  google: { src: "logos/google-g.png", imgWidth: ICON, name: "Google" },
  meta: { src: "logos/meta-symbol.png", imgWidth: ICON, name: "Meta" },
} as const;

type Tool = keyof typeof SOURCES;

export const ToolLogos: React.FC<{
  // Cada logo con el frame (de esta secuencia) en el que aparece.
  readonly tools: { readonly tool: Tool; readonly at: number }[];
  // Frame en el que termina de salir.
  readonly end: number;
  readonly top?: number;
}> = ({ tools, end, top = 170 }) => {
  const frame = useCurrentFrame();
  const start = tools[0]?.at ?? 0;
  const exitStart = end - 8;
  const enterP = interpolate(frame, [start, start + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  // De presentación (grande, con nombre) a cápsula compacta.
  const compactP = interpolate(frame, [start + 38, start + 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const exitP = interpolate(frame, [exitStart, exitStart + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const label = tools.map((t) => SOURCES[t.tool].name).join(" + ");
  // Con dos logos y el nombre largo, la presentación entra menos ampliada para que quepa en 1080px.
  const introScale = tools.length > 1 ? 1.05 : 1.3;

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          ...glass,
          position: "absolute",
          top,
          transformOrigin: "50% 0%",
          display: "flex",
          alignItems: "center",
          padding: 18,
          borderRadius: 999,
          opacity: enterP * (1 - exitP),
          scale: `${(0.95 + 0.05 * enterP) * (introScale - (introScale - 1) * compactP) * (1 - 0.03 * exitP)}`,
          translate: `0px ${(1 - enterP) * -10 + exitP * -6}px`,
          filter: `blur(${(1 - enterP) * 6}px)`,
        }}
      >
        {tools.map(({ tool, at }, i) => {
          const p = interpolate(frame, [at, at + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeOut,
          });
          const s = SOURCES[tool];
          return (
            <div
              key={tool}
              style={{
                // El hueco crece cuando entra el segundo logo, para que la cápsula se abra sin saltos.
                width: i === 0 ? ICON : p * (ICON + GAP),
                paddingLeft: i === 0 ? 0 : GAP,
                boxSizing: "border-box",
                height: ICON,
                display: "flex",
                justifyContent: "flex-start",
                overflow: "visible",
              }}
            >
              <Img
                src={staticFile(s.src)}
                alt={s.name}
                style={{
                  width: s.imgWidth,
                  minWidth: s.imgWidth,
                  height: ICON,
                  objectFit: "contain",
                  objectPosition: "left center",
                  opacity: p,
                  scale: `${0.9 + 0.1 * p}`,
                  filter: `blur(${(1 - p) * 4}px)`,
                }}
              />
            </div>
          );
        })}
        <div
          style={{
            // El nombre se pliega al compactar: el ancho baja a 0 y el texto se desvanece antes.
            width: (1 - compactP) * (label.length * 32 + 44),
            overflow: "hidden",
            whiteSpace: "nowrap",
            paddingLeft: (1 - compactP) * 28,
            color: "#ffffff",
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 56,
            letterSpacing: "-0.02em",
            opacity: interpolate(compactP, [0, 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
