import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// =====================================================================================================
// PERSONALIZA: tipografías de tu marca.
// Se cargan de Google Fonts con @remotion/google-fonts (no hace falta descargar archivos).
// Para cambiar una, importa otra: por ejemplo `import { loadFont } from "@remotion/google-fonts/Montserrat"`.
// Si tu fuente no está en Google Fonts, mira .claude/skills/remotion-markup/local-fonts.md.
//
//   display: titulares (por defecto Sora 600-800)
//   thumb:   estilo miniatura y cifras grandes, siempre en MAYÚSCULAS (por defecto Anton)
//   body:    texto y subtítulos (por defecto Inter)
//   mono:    etiquetas pequeñas (por defecto JetBrains Mono)
// =====================================================================================================
export const fonts = {
  display: loadSora("normal", {
    weights: ["600", "700", "800"],
    subsets: ["latin", "latin-ext"],
  }).fontFamily,
  thumb: loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] })
    .fontFamily,
  body: loadInter("normal", {
    weights: ["400", "500", "600"],
    subsets: ["latin", "latin-ext"],
  }).fontFamily,
  mono: loadMono("normal", { weights: ["500"], subsets: ["latin"] }).fontFamily,
};
