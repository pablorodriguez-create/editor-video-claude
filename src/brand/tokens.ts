// =====================================================================================================
// PERSONALIZA: colores de TU marca.
// Los valores de abajo son de ejemplo (neutros). En la primera sesión, Claude te pregunta tus colores
// y los cambia aquí. Todos los componentes leen de este archivo: no hace falta tocar nada más.
//
// Regla del kit:
//   accent    = lo que se pulsa o estructura (botones, subrayados, tarjetas, iconos, barra de progreso).
//   highlight = resultados, cifras, garantía y marca (recuadro de cifras, palabra del CTA, logo).
// =====================================================================================================
export const colors = {
  // Fondo
  bg: "#101114", // fondo principal (oscuro)
  bg2: "#1A1C21", // fondo secundario (tarjetas, degradados)

  // Color de acento (acciones y estructura)
  accent: "#2BB3A3",
  accentHi: "#5FD6C7", // versión más clara: textos y trazos sobre fondo oscuro
  accentDeep: "#17786D", // versión más oscura: degradados
  accentGlow: "rgba(43,179,163,.42)", // halo del acento

  // Color de resultado (cifras, garantía, marca)
  highlight: "#F2C14E",
  highlightHi: "#FFE3A3",
  highlightGlow: "rgba(242,193,78,.32)",
  onHighlight: "#14161A", // texto encima del color de resultado

  // Texto y líneas
  ink: "#F4F4F2", // texto principal
  dim: "rgba(244,244,242,.7)",
  faint: "rgba(244,244,242,.48)",
  line: "rgba(244,244,242,.12)",
  line2: "rgba(244,244,242,.24)",
  card: "rgba(26,28,33,.55)",
} as const;

export const radius = {
  card: 32,
  pill: 999,
} as const;

// Convierte un color #RRGGBB en rgba con la opacidad que quieras: alpha(colors.accent, 0.2).
export const alpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
