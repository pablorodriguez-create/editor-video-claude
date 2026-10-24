import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractiveTransformProps,
  type InteractivitySchema,
  type SequenceProps,
} from "remotion";
import { fonts } from "../brand/fonts";
import { colors } from "../brand/tokens";

// Subtítulos limpios para Reels grabados, basados en <BasicCaptions>.
// Texto blanco sin caja: lo ya dicho en blanco pleno y lo que falta atenuado.
// Cada página entra con un fundido corto y sube 8px.

type CleanCaptionsProps = InteractiveTransformProps &
  Pick<SequenceProps, "width"> & {
    readonly captions: Caption[];
    readonly combineTokensWithinMilliseconds?: number;
    // Tamaño de letra: más grande en el hook.
    readonly fontSize?: number;
    // Píldora oscura detrás del texto, para cuando va sobre la unión de dos imágenes.
    readonly pill?: boolean;
  };

const defaultCombineTokensWithinMilliseconds = 1200;
const defaultWidth = 900;
const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

// PERSONALIZA: palabras clave con color del kit (en minúsculas y sin tildes de más: tal y como las transcribe Whisper).
// Herramientas o conceptos con el color de acento; resultados con el de resultado. Pocas, para no recargar.
const KEYWORDS: Record<string, string> = {
  linkedin: colors.accentHi,
  instagram: colors.accentHi,
  clientes: colors.highlight,
  resultados: colors.highlight,
};
const keywordColor = (text: string) => KEYWORDS[text.trim().toLowerCase().replace(/[.,;:!?¿¡]/g, "")];

const cleanCaptionsSchema = {
  ...Interactive.captionsSchema,
  width: {
    type: "number",
    min: 1,
    step: 1,
    default: undefined,
    description: "Caption area width",
    hiddenFromList: false,
  },
  combineTokensWithinMilliseconds: {
    type: "number",
    min: 0,
    step: 50,
    default: defaultCombineTokensWithinMilliseconds,
    description: "Time between caption pages",
    hiddenFromList: false,
  },
} as const satisfies InteractivitySchema;

const CleanCaptionsContent: React.FC<CleanCaptionsProps> = ({
  captions,
  combineTokensWithinMilliseconds = defaultCombineTokensWithinMilliseconds,
  style,
  width = defaultWidth,
  fontSize = 62,
  pill = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds,
      }).pages,
    [captions, combineTokensWithinMilliseconds],
  );
  const currentTimeMs = (frame / fps) * 1000;
  const page = pages.find(
    (candidate) =>
      currentTimeMs >= candidate.startMs &&
      currentTimeMs < candidate.startMs + candidate.durationMs,
  );

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        width,
        ...style,
      }}
    >
      {page ? (
        <div
          style={{
            color: "#ffffff",
            fontFamily: fonts.body,
            fontSize,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            textAlign: "center",
            textWrap: "balance",
            whiteSpace: "pre-wrap",
            textShadow: pill ? "none" : "0 2px 18px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.45)",
            ...(pill
              ? {
                  background: "rgba(12,14,20,.78)",
                  backdropFilter: "blur(20px)",
                  padding: "12px 28px",
                  borderRadius: 28,
                  border: "1px solid rgba(255,255,255,.14)",
                }
              : {}),
            opacity: interpolate(currentTimeMs, [page.startMs, page.startMs + 180], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: easeOut,
            }),
            translate: interpolate(
              currentTimeMs,
              [page.startMs, page.startMs + 260],
              ["0px 8px", "0px 0px"],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut },
            ),
          }}
        >
          {page.tokens.map((token, i) => (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                color: keywordColor(token.text),
                opacity: interpolate(
                  currentTimeMs,
                  [token.fromMs, token.fromMs + 120],
                  [0.45, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut },
                ),
              }}
            >
              {i === 0 ? token.text.trimStart() : token.text}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const CleanCaptions = Interactive.create({
  Component: CleanCaptionsContent,
  componentName: "<CleanCaptions>",
  schema: cleanCaptionsSchema,
});
