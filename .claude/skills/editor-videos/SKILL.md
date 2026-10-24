---
name: editor-videos
description: Edita vídeos grabados (Reels, clips de podcast o entrevista, vídeos de YouTube con cámara y pantalla, anuncios) con Remotion y los scripts de este proyecto, siguiendo un método probado de cortes por audio, revisión automática y supervisor antes de entregar. Úsala siempre que haya que editar, cortar, montar, subtitular, renderizar o revisar un vídeo: "edita este vídeo", "haz el clip", "saca los Reels de la entrevista", "monta el vídeo de YouTube", "corta las tomas", "revisa este vídeo".
---

# Editor de vídeos

Esta skill reúne el método para editar vídeos grabados sin que se escape un tropiezo. La marca, la voz y las reglas propias de quien usa el proyecto están en `CLAUDE.md` (secciones "MI MARCA" y "MI VOZ Y MIS REGLAS"). **Léelas siempre antes de editar.** Si una indicación nueva de la persona choca con algo de aquí, manda la persona: apunta el cambio en `CLAUDE.md` para la próxima vez.

## 1. Normas innegociables

1. **La voz manda.** Ningún vídeo sale con un tropiezo, una toma repetida, una frase a medias, una muletilla ("eh", "vale" de arranque) o un corte que se coma una sílaba. Se usa siempre la última toma completa.
2. **Nunca tapar la cara**, ni con subtítulos ni con animaciones. Si no cabe, se quita el elemento.
3. **Tacos:** lo que diga `CLAUDE.md`. Por defecto se cortan; si la persona quiere conservarlos, se pasan a `--permitir`.
4. **Supervisor antes de entregar, siempre.** Nada sale del proyecto sin el veredicto APROBADO del agente `supervisor-contenido` (sección 6).
5. **Marca:** solo los colores, tipografías y logo de `src/brand/`. Nada de emojis: iconos de línea (`src/components/LineIcon.tsx`) o logos oficiales de `public/logos/`.
6. **Logos de otras marcas:** solo los oficiales, descargados de su página de marca y guardados en `public/logos/`. Si falta uno, pide permiso antes de descargarlo.
7. **Cifras reales o nada.** En pantalla nunca va una cifra, un caso o un resultado que la persona no haya dicho o aprobado.
8. **Datos sensibles:** en las grabaciones de pantalla no se ven barras laterales con cuentas, pestañas ni marcadores. Precios internos, datos de clientes y conversaciones privadas van difuminados.

## 2. Qué tipo de vídeo es

| Encargo | Guía |
|---|---|
| Clips verticales de un podcast o entrevista: versión A con subtítulos y versión C con animaciones | `references/reels-entrevista.md` |
| Vídeo horizontal (YouTube): persona a cámara explicando con la pantalla de una herramienta | `references/youtube.md` |
| Reels sacados de un vídeo largo ya grabado, anuncios y vídeos largos | `references/operacion.md` (render mixto y por tramos) |
| Fotos y clips de apoyo con IA | skill `/recursos-youart` |
| Cómo trabajar sin que se caigan los renders | `references/operacion.md` |
| Errores típicos y su arreglo | `references/lecciones.md` |
| Generador de ejemplo para copiar | `ejemplos/README.md` |

## 3. El método de cortes (vale para todo)

1. **Pasa el audio a WAV de 16 kHz** (ffmpeg de `imageio_ffmpeg`, no hay ffmpeg en el PATH).
2. **Transcribe frase a frase, nunca de corrido:** `scripts/transcribir_por_frases.py <wav> data/<proyecto>/frases.json`. La transcripción de corrido de Whisper "funde" las tomas repetidas: tres intentos de una frase aparecen como uno. Frase a frase se ve cada intento. Léelo entero antes de elegir tomas.
3. **Elige la última toma completa de cada frase.** Si dentro de una frase hay un arranque repetido, una palabra estirada o un "eh", escúchalo en ventanas cortas: `scripts/revisar_video.py <wav> --fragmentos a-b c-d`.
4. **El corte lo decide el audio**, no el tiempo de la palabra: `scripts/cutter.py` busca el silencio real. Whisper suele dar la primera palabra tarde: si un trozo empieza en el borde de una frase, el corte va al inicio de la voz de esa frase. Deja 0,2-0,4 s entre frases distintas: menos suena atropellado.
5. **Escribe los cortes** en `data/<proyecto>/cuts-NN.json`: `[{"name": "...", "start": s, "end": s}]` (con `"archivo"` si hay varias grabaciones).
6. **`scripts/check_cuts.py` antes de renderizar.** Monta el audio exacto de los cortes y pasa las reglas automáticas: frases a medias, arranques repetidos, palabras estiradas o escondidas, muletillas, palabras partidas, ruidos al arrancar. Con una alerta GRAVE no se renderiza: se escucha el fragmento y se decide. Nunca se descarta una alerta "a ojo". Las repeticiones retóricas con las frases completas son válidas.

## 4. Subtítulos y sonido

- **Subtítulos** (`src/components/CleanCaptions.tsx`): una línea, unos 30 caracteres como máximo, que se encienden con la voz. Se parten en las pausas reales y en la puntuación. Ninguna página termina en "de", "que", "a"… Dicen exactamente lo que se oye.
- **Palabras que Whisper escribe mal** (marca, herramientas): corrígelas siempre (`FIX` en los scripts y el mapa de palabras clave de `CleanCaptions`).
- **Volumen:** todos los vídeos salen a **-14 LUFS** con pico de -1,5 dBTP: `scripts/loudnorm2.sh entrada.wav salida.wav` (dos pasadas, sin bombeo). `revisar_video.py` marca como GRAVE lo que quede fuera de -17 a -11 LUFS.
- **Efectos de sonido** (opcionales): `scripts/sonidos_marca.py` crea `pop`, `ding`, `whoosh` y `golpe` en `public/sonidos/` (sintetizados, sin licencias). `scripts/mezclar_sonidos.py` los pone muy por debajo de la voz, uno por idea.

## 5. Formatos y entrega

- Reel / Story: 1080x1920, 30 fps. Post: 1080x1350 o 1080x1080. Horizontal: 1920x1080 (los fps de la cámara, normalmente 25 o 30).
- Siempre se renderiza a `out/`, nunca directo a la carpeta de entrega.
- Solo con APROBADO del supervisor se copia a la carpeta de entrega que diga `CLAUDE.md`, con nombres claros: "R01 - Título corto.mp4".

## 6. Supervisor de contenido

Agente `supervisor-contenido` (`.claude/agents/supervisor-contenido.md`). Se le pasa:
- la ruta del render,
- el JSON de cortes y el de subtítulos,
- lo que ha cambiado desde la última revisión,
- las decisiones de la persona que no son fallo (por ejemplo, palabras permitidas).

Revisa como un espectador exigente y devuelve APROBADO o NO APROBADO con cada fallo, el minuto y el arreglo exacto. Se corrige, se vuelve a renderizar y vuelve al supervisor hasta que salga APROBADO. Si solo cambió la imagen, se le pide "revisión rápida".

## 7. Kit propio

Los componentes de `src/components/` ya llevan la marca de `src/brand/`. Antes de crear uno nuevo, mira si alguno sirve:
- **Texto:** `CleanCaptions` (subtítulos), `QuestionCard` (pregunta de entrevista en los primeros segundos), `Callout`, `ChipsClave`, `kit/MomentosClave`.
- **Apoyo visual sin texto:** `Broll` (billetes, gráficas, perfil y chat estilizados, red, corazones, iconos, logos, fotos y clips), `IconPop`, `LinkedIn3D`, `LinkedInTachado`, `ContextDock`, `ToolLogos`, `CountChip`, `PriceCard`.
- **Llamada a la acción:** `CtaAnuncio`, `kit/CtaReserva`, `kit/CalendarioSemana`.
- **Montaje:** `DuoLayout` (cámara + pantalla en vertical), `TeaserCard`, `FilmLook` (grano de cine, no en YouTube), `ProgressBar`, `punch.ts` (golpes de zoom).
- **Horizontal:** `yt/YtLayout` (cámara, panel lateral, pantalla recortada y difuminados) y `yt/YtGraphics` (gráficos, capítulos, botón de suscripción, rótulo de nombre).

Si falta un icono, añádelo al mapa de `LineIcon.tsx` (Lucide). Si cambia la marca, solo se tocan `src/brand/tokens.ts`, `fonts.ts`, `marca.ts` y el logo.
