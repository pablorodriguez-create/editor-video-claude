import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fonts } from "../brand/fonts";
import { HandUnderline } from "../brand/Highlights";
import { colors } from "../brand/tokens";

// Pregunta del entrevistador para dar contexto en los primeros segundos (sustituye a los subtítulos).
// Solo la pregunta, como un subtítulo, con la palabra clave subrayada a mano con el color de acento. Va abajo, sobre la mesa,
// nunca sobre la cara. Ya se ve en el primer fotograma: es la portada del vídeo.

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export const QuestionCard: React.FC<{
  readonly question: string;
  // Trozo de la pregunta que se subraya (tal cual aparece en `question`).
  readonly mark?: string;
  // Frame (del reloj de la secuencia que la contiene) en el que termina de salir.
  readonly to: number;
  readonly bottom?: number;
  // "destacado": la palabra clave en el color de resultado, sin subrayado
  readonly resalte?: "subrayado" | "destacado";
}> = ({ question, mark, to, bottom = 400, resalte = "subrayado" }) => {
  const frame = useCurrentFrame();
  const exitP = interpolate(frame, [to - 14, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  // Visible desde el frame 0 (portada); se asienta con un pequeño movimiento en el primer medio segundo.
  const settle = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut });
  const at = mark ? question.indexOf(mark) : -1;
  const pre = at > 0 && /[¿¡]/.test(question[at - 1]) ? question[at - 1] : "";
  const post = at >= 0 && mark ? (question.slice(at + mark.length).match(/^[?!.,]+/)?.[0] ?? "") : "";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* degradado oscuro abajo para que el texto se lea sobre cualquier plano */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 760,
          background: "linear-gradient(to top, rgba(0,0,0,.62) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,0) 100%)",
          opacity: 1 - exitP,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 1 - exitP,
          translate: `0px ${(1 - settle) * 10 + exitP * 16}px`,
          filter: `blur(${exitP * 6}px)`,
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 66,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            textAlign: "center",
            textWrap: "balance",
            textShadow: "0 4px 30px rgba(0,0,0,.55)",
          }}
        >
          {at >= 0 && mark ? (
            <>
              {question.slice(0, at - pre.length)}
              {/* el "¿" de apertura y la "?" de cierre van pegados al subrayado: nunca se quedan solos en una línea */}
              <span style={{ whiteSpace: "nowrap" }}>
                {pre}
                {resalte === "destacado" ? <span style={{ color: colors.highlight }}>{mark}</span> : <HandUnderline start={4}>{mark}</HandUnderline>}
                {post}
              </span>
              {question.slice(at + mark.length + post.length)}
            </>
          ) : (
            question
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
