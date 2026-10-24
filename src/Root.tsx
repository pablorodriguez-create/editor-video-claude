import { Composition } from "remotion";
import { BRAND_REEL_DURATION, BrandReel } from "./videos/BrandReel";
import { KIT_DEMO_DURATION, KitDemo } from "./videos/KitDemo";

// Registro de composiciones. Cada vídeo nuevo se añade aquí (Claude lo hace por ti).
// Formatos: Reel / Story 1080x1920 · Post 1080x1350 o 1080x1080 · Horizontal 1920x1080.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="BrandReel" component={BrandReel} durationInFrames={BRAND_REEL_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="KitDemo" component={KitDemo} durationInFrames={KIT_DEMO_DURATION} fps={25} width={1080} height={1920} />
    </>
  );
};
