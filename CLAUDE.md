# Editor de vídeo con Claude

Proyecto de Remotion más scripts de Python (Whisper, ffmpeg, OpenCV en `.venv`) para editar vídeos grabados: Reels, clips de podcast o entrevista, vídeos de YouTube con cámara y pantalla, anuncios y miniaturas.

- Método completo: skill `editor-videos` (`.claude/skills/editor-videos/`).
- Revisor obligatorio: agente `supervisor-contenido` (`.claude/agents/supervisor-contenido.md`).
- Miniaturas: agente `miniaturas-youtube`.
- Fotos y clips con IA (opcional): skill `recursos-youart`.
- Skills oficiales de Remotion: `/remotion-create`, `/remotion-markup`, `/remotion-studio`, `/remotion-render`, `/remotion-captions`…
- Ejemplo de generador: `ejemplos/README.md`.

## PRIMERA SESIÓN (Claude: haz esto si las secciones "MI MARCA" y "MI VOZ" tienen huecos)

1. Instala lo que falte: `npm install` y el entorno de Python (ver "Herramientas"). Comprueba con `npx tsc --noEmit`.
2. Entrevista a la persona, de una pregunta en una, y rellena las dos secciones de abajo:
   - marca: nombre, colores (o su web para sacarlos), tipografías, logo (que lo deje en `public/marca/`);
   - voz y tono, cosas que nunca dirían, cifras que se pueden enseñar;
   - qué vídeos hace, formatos y dónde guarda sus grabaciones y dónde quiere recibir los vídeos terminados.
3. Pasa los colores a `src/brand/tokens.ts`, las tipografías a `src/brand/fonts.ts` y nombre, logo y datos a `src/brand/marca.ts`.
4. Abre Remotion Studio (`npx remotion studio`) y enséñale `BrandReel` y `KitDemo` con su marca. Ajusta hasta que diga que sí.
5. Borra esta sección "PRIMERA SESIÓN" cuando todo esté relleno.

## MI MARCA (rellenar)

- **Nombre de la marca:** _(por rellenar)_
- **Colores:**
  - Fondo: _(por rellenar)_
  - Acento (lo que se pulsa o estructura: botones, subrayados, tarjetas, iconos): _(por rellenar)_
  - Resultado (cifras, garantía, marca): _(por rellenar)_
  - Colores prohibidos: _(por rellenar, por ejemplo "nunca rojo")_
- **Tipografías:** titulares _(por rellenar)_ · texto _(por rellenar)_ · cifras y miniaturas _(por rellenar)_
- **Logo:** _(ruta en `public/marca/`)_. Qué va junto al logo: _(por rellenar)_
- **Foto o avatar para tarjetas:** _(ruta en `public/marca/`)_
- **Fotos para miniaturas:** _(carpeta)_
- **Llamada a la acción habitual:** _(por rellenar, por ejemplo "Escríbeme INFO por mensaje privado")_
- **Presupuesto de YouArt por vídeo (si lo usas):** _(por rellenar)_

Regla rápida del kit: si se pulsa o estructura, color de acento. Si es un resultado, la garantía o la marca, color de resultado.

## MI VOZ Y MIS REGLAS (rellenar)

- **Idioma y trato:** _(por rellenar, por ejemplo "español de España, tuteo")_
- **Tono:** _(por rellenar: directo, cercano, técnico…)_
- **Palabras o expresiones que nunca uso:** _(por rellenar)_
- **Signos o formatos prohibidos en los textos:** _(por rellenar)_
- **Tacos:** _(¿se quedan o se cortan?)_
- **Cifras y resultados que se pueden enseñar:** _(solo reales; por rellenar)_
- **Qué me importa más al revisar:** _(por ejemplo "la voz es innegociable; los subtítulos finos no bloquean")_
- **Qué vídeos hago:** _(Reels, podcast, YouTube, anuncios…)_
- **Dónde están mis grabaciones:** _(carpeta local o de Google Drive)_
- **Dónde quiero los vídeos terminados:** _(por ejemplo `~/Downloads/Vídeos editados/`)_
- **Datos que nunca deben verse en pantalla:** _(clientes, precios internos, conversaciones…)_

## Formatos

- Reel / Story: 1080x1920, 30 fps.
- Post: 1080x1350 (4:5) o 1080x1080.
- Horizontal (YouTube): 1920x1080, a los fps de la cámara.

## Normas de edición (universales, obligatorias)

### Reels y vídeos grabados

Menos es más. Tiene que verse natural, nunca como un anuncio (salvo que sea un anuncio).
- Solo apoyo: subtítulos limpios, logos oficiales de las herramientas que se nombran y animaciones suaves.
- Nada de emojis: iconos de línea (`src/components/LineIcon.tsx`) o logos oficiales (`public/logos/`).

### Cortes y encuadre (sin excepciones)

- **Nunca tapar la cara**: ni subtítulos ni ningún elemento encima del rostro. Si una tarjeta convive con la cámara, va abajo; en pantalla partida, los subtítulos van en píldora sobre la unión. Si no caben sin tapar la cara, se quitan los subtítulos de ese plano.
- **Nunca cortar una palabra**: cada corte termina cuando termina la voz (lo decide el audio, no solo la transcripción). Mejor que el vídeo dure unos segundos más a que un corte quede brusco.
- **Nunca dejar titubeos**: arranques repetidos ("le pido, le pido"), frases a medias, muletillas o trozos de 1-2 palabras sin sentido. Ante una repetición, se usa la última toma completa.
- **Antes de renderizar, siempre** `.venv/bin/python scripts/check_cuts.py data/<proyecto>/cuts-XX.json <grabación>`. Con una alerta GRAVE no se renderiza: se escucha el tramo (`scripts/revisar_video.py <audio o vídeo> --fragmentos a-b`) y se corrige. Nunca se descarta una alerta "a ojo".
- **Transiciones suaves y sin negro**: detrás de las composiciones va la propia cámara desenfocada, nunca un fondo negro.
- **Pantallas grabadas**: nunca se ven barras laterales con cuentas, pestañas ni marcadores; solo el área de trabajo de la herramienta. Datos privados, difuminados.
- **Volumen final: -14 LUFS** (`scripts/loudnorm2.sh`).

### Supervisor de contenido (obligatorio antes de entregar)

1. `check_cuts.py` sin alertas graves.
2. Render a `out/` (nunca directo a la carpeta de entrega).
3. El agente `supervisor-contenido` revisa el vídeo renderizado como un espectador y devuelve APROBADO o NO APROBADO con los fallos y su arreglo.
4. Si es NO APROBADO: se corrige, se vuelve a renderizar y vuelve al supervisor. Se repite hasta APROBADO.
5. Solo con APROBADO se copia a la carpeta de entrega.

### Una tarea pesada a la vez

- Renders, Whisper y ffmpeg con archivos grandes van por la cola: `scripts/pesado.sh <nombre> <comando>`. Nunca dos a la vez.
- Nunca esperas con `pgrep -f` (se encuentra a sí misma y no termina).
- Si un render falla, se avisa en el momento.

### Render mixto y por tramos

- Reels sacados de grabaciones largas y anuncios: ffmpeg monta la imagen con el chip del Mac y Remotion solo la capa transparente de textos. Mucho más rápido.
- Vídeos de más de 5 minutos: por tramos con `scripts/render_tramos.sh`.
- Detalle en `.claude/skills/editor-videos/references/operacion.md`.

## Textos

- Cifras reales o nada. Nunca inventes casos, resultados ni testimonios.
- Las reglas de "MI VOZ Y MIS REGLAS" mandan en rótulos, subtítulos, títulos y descripciones.
- Si un vídeo es para un cliente, no uses la marca de este proyecto: pregunta por la del cliente.

## Herramientas

- Node 20 o superior: `npm install`.
- Python 3 en `.venv`: `python3 -m venv .venv && .venv/bin/pip install mlx-whisper==0.4.3 opencv-python-headless==5.0.0.93 imageio-ffmpeg==0.6.0 numpy==2.0.2`.
- ffmpeg viene dentro de `imageio-ffmpeg`: no hace falta instalarlo aparte.
- Whisper con MLX necesita un Mac con chip Apple (M1 o posterior).

## Referencia

- `src/videos/BrandReel.tsx`: ejemplo base del kit (logo, gancho, ideas, prueba y llamada a la acción). Cópialo como punto de partida.
- `src/videos/KitDemo.tsx`: muestra de animaciones del kit.
