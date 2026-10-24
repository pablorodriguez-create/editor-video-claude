import { Easing, interpolate } from "remotion";

// Zoom de énfasis (punch-in) para la versión C: en cada golpe la imagen se acerca un `amount` en 6 frames
// y vuelve suave al plano base en ~1 s. Los golpes se suman si se solapan.
const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const punchScale = (frame: number, hits: number[], base: number, amount = 0.1) => {
  let extra = 0;
  for (const h of hits) {
    if (frame < h || frame > h + 40) continue;
    extra +=
      frame < h + 6
        ? interpolate(frame, [h, h + 6], [0, amount], { easing: easeOut })
        : interpolate(frame, [h + 6, h + 40], [amount, 0], { easing: easeInOut });
  }
  return base * (1 + extra);
};
