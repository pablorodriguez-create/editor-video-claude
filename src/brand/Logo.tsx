import { Img, staticFile } from "remotion";
import { colors } from "./tokens";
import { fonts } from "./fonts";

// =====================================================================================================
// PERSONALIZA: tu logo.
// Opción A (recomendada): guarda tu logo en public/marca/logo.svg (o .png) y pasa `src="marca/logo.svg"`.
// Opción B: sin archivo, se dibuja un símbolo de ejemplo (un círculo con la inicial de tu marca).
// =====================================================================================================

// Solo el símbolo.
export const LogoMark: React.FC<{
  size: number;
  // Ruta dentro de public/ (por ejemplo "marca/logo.svg"). Si no hay, se dibuja la inicial de `brand`.
  src?: string;
  brand?: string;
  style?: React.CSSProperties;
}> = ({ size, src, brand = "Tu marca", style }) => {
  if (src) {
    return <Img src={staticFile(src)} style={{ width: size, height: size, objectFit: "contain", ...style }} />;
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(160deg, ${colors.highlightHi}, ${colors.highlight})`,
        color: colors.onHighlight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.display,
        fontWeight: 800,
        fontSize: size * 0.5,
        ...style,
      }}
    >
      {brand.trim().charAt(0).toUpperCase()}
    </div>
  );
};

// Símbolo + nombre de marca. `highlightWord`: parte del nombre que va en el color de resultado (opcional).
export const Logo: React.FC<{
  brand?: string;
  highlightWord?: string;
  src?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ brand = "Tu marca", highlightWord, src, size = 64, style }) => {
  const at = highlightWord ? brand.indexOf(highlightWord) : -1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, ...style }}>
      <LogoMark size={size} src={src} brand={brand} />
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: size * 0.5,
          letterSpacing: "-0.01em",
          color: colors.ink,
          whiteSpace: "nowrap",
        }}
      >
        {at >= 0 && highlightWord ? (
          <>
            {brand.slice(0, at)}
            <span style={{ color: colors.highlight }}>{highlightWord}</span>
            {brand.slice(at + highlightWord.length)}
          </>
        ) : (
          brand
        )}
      </span>
    </div>
  );
};
