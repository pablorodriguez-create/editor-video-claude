import { Easing, interpolate } from "remotion";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// 0 → 1 entre `start` y `start + duration` (en frames), con salida suave.
export const progress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

// Entrada estándar de marca: aparece y sube unos píxeles.
export const enter = (frame: number, start: number, duration = 18, distance = 40) => {
  const p = progress(frame, start, duration);
  return {
    opacity: p,
    translate: `0px ${(1 - p) * distance}px`,
  } as const;
};
