import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Background } from "../brand/Background";
import { Logo, LogoMark } from "../brand/Logo";
import { Badge, HandUnderline, HighlightBox } from "../brand/Highlights";
import { colors, alpha, radius } from "../brand/tokens";
import { fonts } from "../brand/fonts";
import { enter, progress } from "../brand/anim";
import { marca } from "../brand/marca";

// Reel 9:16 de prueba del kit de marca: logo, gancho, dos ideas, prueba y llamada a la acción.
// Sirve para ver de un vistazo tus colores, tipografías y logo. Los textos son de ejemplo: cámbialos por los tuyos.
// Recuerda: cifras reales o nada. La cifra de "Prueba" es un hueco a propósito.
const FADE = 12;
const SCENES = [75, 120, 120, 90, 105];
export const BRAND_REEL_DURATION = SCENES.reduce((a, b) => a + b, 0) - FADE * (SCENES.length - 1);

const center: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  padding: "0 90px",
  textAlign: "center",
};

const headline: React.CSSProperties = {
  fontFamily: fonts.display,
  fontWeight: 800,
  fontSize: 104,
  lineHeight: 1.08,
  letterSpacing: "-0.03em",
  color: colors.ink,
};

const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, 24);
  return (
    <AbsoluteFill style={center}>
      <div style={{ scale: `${0.7 + 0.3 * p}`, opacity: p, filter: `drop-shadow(0 0 80px ${colors.accentGlow})` }}>
        <LogoMark size={300} src={marca.logo || undefined} brand={marca.nombre} />
      </div>
      <div style={{ ...enter(frame, 18), marginTop: 70 }}>
        <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 64, color: colors.ink }}>{marca.nombre}</span>
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={center}>
      <div style={enter(frame, 0)}>
        <Badge>Tu tema</Badge>
      </div>
      <div style={{ ...headline, ...enter(frame, 8), marginTop: 60 }}>
        La promesa de tu vídeo <HandUnderline start={30}>en una frase</HandUnderline>
      </div>
      <div
        style={{
          ...enter(frame, 40),
          marginTop: 60,
          fontFamily: fonts.body,
          fontSize: 44,
          lineHeight: 1.35,
          color: colors.dim,
        }}
      >
        Una línea que aclara para quién es.
      </div>
    </AbsoluteFill>
  );
};

const IdeaCard: React.FC<{ label: string; title: string; pills: string[]; start: number }> = ({ label, title, pills, start }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        ...enter(frame, start, 20, 60),
        width: "100%",
        textAlign: "left",
        padding: "48px 52px",
        borderRadius: radius.card,
        border: `3px solid ${colors.accent}`,
        background: `linear-gradient(160deg, ${alpha(colors.accent, 0.22)}, ${colors.card})`,
        boxShadow: `0 30px 90px -30px ${colors.accentGlow}`,
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.1em", color: colors.accentHi }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 62, color: colors.ink, marginTop: 14 }}>{title}</div>
      <div style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
        {pills.map((pill) => (
          <span
            key={pill}
            style={{
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 30,
              color: colors.ink,
              padding: "10px 24px",
              borderRadius: radius.pill,
              border: `2px solid ${colors.line2}`,
            }}
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
};

const Ideas: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...center, gap: 44 }}>
      <IdeaCard label="Idea 1" title="Lo primero que haces" pills={["Detalle", "Detalle", "Detalle"]} start={0} />
      <IdeaCard label="Idea 2" title="Lo segundo que haces" pills={["Detalle", "Detalle", "Detalle"]} start={14} />
      <div
        style={{
          ...enter(frame, 40),
          fontFamily: fonts.thumb,
          fontSize: 76,
          color: colors.highlight,
          textTransform: "uppercase",
          marginTop: 10,
        }}
      >
        <span style={{ color: colors.accentHi }}>= </span>El resultado
      </div>
    </AbsoluteFill>
  );
};

const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={center}>
      <div style={{ fontFamily: fonts.thumb, fontSize: 230, lineHeight: 1 }}>
        <HighlightBox start={4}>TU CIFRA</HighlightBox>
      </div>
      <div
        style={{
          ...enter(frame, 20),
          marginTop: 70,
          fontFamily: fonts.thumb,
          fontSize: 84,
          lineHeight: 1.1,
          color: colors.ink,
          textTransform: "uppercase",
        }}
      >
        Un resultado real y comprobable
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={center}>
      <div style={{ ...enter(frame, 0), fontFamily: fonts.thumb, fontSize: 120, lineHeight: 1.15, color: colors.ink }}>
        ESCRÍBEME
        <br />
        <HighlightBox start={12}>{marca.palabraCta}</HighlightBox>
      </div>
      <div style={{ ...enter(frame, 26), marginTop: 56, fontFamily: fonts.body, fontSize: 44, color: colors.dim }}>
        Por mensaje privado y te lo explico.
      </div>
      <div style={{ ...enter(frame, 40), position: "absolute", bottom: 160 }}>
        <Logo size={72} brand={marca.nombre} highlightWord={marca.destacado || undefined} src={marca.logo || undefined} />
      </div>
    </AbsoluteFill>
  );
};

export const BrandReel: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = linearTiming({ durationInFrames: FADE });
  return (
    <Background>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Logo" durationInFrames={2.5 * fps}>
          <LogoIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({ shouldFadeOutExitingScene: true })} timing={t} />
        <TransitionSeries.Sequence name="Gancho" durationInFrames={4 * fps}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({ shouldFadeOutExitingScene: true })} timing={t} />
        <TransitionSeries.Sequence name="Ideas" durationInFrames={4 * fps}>
          <Ideas />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({ shouldFadeOutExitingScene: true })} timing={t} />
        <TransitionSeries.Sequence name="Prueba" durationInFrames={3 * fps}>
          <Proof />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({ shouldFadeOutExitingScene: true })} timing={t} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={3.5 * fps}>
          <Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </Background>
  );
};
