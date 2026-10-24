# Herramientas y conexiones

Todo lo que usa el editor, separado en obligatorio y opcional. **Puedes empezar solo con lo obligatorio.** Las opcionales se añaden cuando las necesites.

Los precios cambian a menudo. Donde pone "consulta su web", mira el precio actual en la web oficial antes de contratar.

## Obligatorio

### Claude Code

- **Para qué sirve:** es quien edita. Lee tus grabaciones, escribe el código de cada vídeo, lanza los scripts, renderiza y revisa.
- **Pago:** necesitas un plan de pago de Claude. Consulta su web (claude.com/pricing).
- **Cómo conectarlo:** instala la app de escritorio de Claude, entra con tu cuenta, abre la pestaña Code y elige la carpeta `editor-video-claude`.

### Node.js y Remotion

- **Para qué sirve:** Remotion convierte código de React en vídeo. Con él se dibujan subtítulos, rótulos, animaciones y se renderiza el MP4. Remotion Studio es la vista previa en el navegador.
- **Pago:**
  - Node.js es gratis.
  - Remotion es gratis para particulares y empresas pequeñas; las empresas más grandes necesitan licencia. Compruébalo en remotion.dev/license.
- **Cómo conectarlo:**
  - Instala Node 20 o superior desde nodejs.org (versión LTS).
  - En la carpeta del proyecto: `npm install` (Claude lo hace en la primera sesión).
  - Vista previa: `npx remotion studio`.
  - Las tipografías se cargan solas de Google Fonts con `@remotion/google-fonts`: no hay que descargar archivos.
  - Los iconos de línea vienen de `lucide-react` (gratis, se instala con `npm install`).

### Python con Whisper, OpenCV y ffmpeg (`.venv`)

- **Para qué sirve:**
  - **Whisper (mlx-whisper):** transcribe palabra a palabra para elegir tomas, cortar sin partir palabras y comprobar que los subtítulos dicen lo que se oye. Funciona en tu Mac, sin enviar el audio a ningún sitio.
  - **OpenCV:** mira los fotogramas para el supervisor (caras tapadas, negros, imagen congelada) y detecta paneles en las grabaciones de pantalla.
  - **imageio-ffmpeg:** trae ffmpeg incluido, para pasar audio a WAV, normalizar el volumen a -14 LUFS, montar la imagen en el render mixto y exportar en 4K. No hace falta instalar ffmpeg aparte.
  - **numpy:** cálculos de audio.
- **Pago:** gratis. La primera transcripción descarga el modelo de Whisper (unos 1,6 GB).
- **Requisito:** Mac con chip Apple (M1 o posterior) para mlx-whisper.
- **Cómo conectarlo:**
  ```bash
  python3 -m venv .venv && .venv/bin/pip install mlx-whisper==0.4.3 opencv-python-headless==5.0.0.93 imageio-ffmpeg==0.6.0 numpy==2.0.2
  ```

## Opcional

### YouArt (conector MCP en Claude)

- **Para qué sirve:** genera imágenes y clips cortos de apoyo (b-roll, fondos, planos de transición), quita el fondo de fotos para animarlas y ayuda con las miniaturas de YouTube. Lo usan la skill `recursos-youart` y el agente `miniaturas-youtube`.
- **Pago:** funciona con créditos. Consulta su web. Pon un presupuesto por vídeo en `CLAUDE.md` para que Claude no gaste de más.
- **Cómo conectarlo:**
  - Crea una cuenta en YouArt.
  - Conéctalo como servidor MCP en Claude (en la configuración de conectores de Claude o con `/mcp` en Claude Code). El servidor se llama `YouArt`.
  - Abre una sesión nueva en la carpeta del proyecto: las herramientas solo aparecen en sesiones abiertas después de conectarlo.
- **Sin YouArt:** se usan las animaciones del kit y los logos de `public/logos/`. Las miniaturas se montan en Remotion.

### Claude in Chrome (extensión del navegador)

- **Para qué sirve:** que Claude abra tus herramientas en el navegador para sacar pantallazos limpios, revisar tu perfil o analizar canales de YouTube de referencia.
- **Pago:** consulta su web.
- **Cómo conectarlo:** instala la extensión "Claude" desde la Chrome Web Store, entra con tu cuenta y actívala para Claude Code.

### Google Drive para escritorio

- **Para qué sirve:** leer tus grabaciones directamente desde Drive, sin descargarlas a mano. Las carpetas aparecen en Finder.
- **Pago:** gratis con una cuenta de Google (el espacio depende de tu plan de Google).
- **Cómo conectarlo:** instala Google Drive para escritorio, entra con tu cuenta y dile a Claude la ruta de la carpeta (en Mac, dentro de `~/Library/CloudStorage/`). Apúntala en `CLAUDE.md`.

### ElevenLabs

- **Para qué sirve:** efectos de sonido y música generados, voz en off o transcripción en la nube. El proyecto no lo necesita: los efectos básicos (`pop`, `ding`, `whoosh`, `golpe`) se crean gratis con `scripts/sonidos_marca.py` y la transcripción se hace en tu Mac con Whisper. Las skills de Remotion explican cómo usarlo para voz en off (`.claude/skills/remotion-markup/voiceover.md`).
- **Pago:** tiene plan gratuito y planes de pago. Consulta su web.
- **Cómo conectarlo:** crea una cuenta, genera una API key en su panel y guárdala en un archivo `.env` en la raíz del proyecto (`ELEVENLABS_API_KEY=...`). El `.env` está en `.gitignore`: nunca lo subas ni lo pegues en el chat.

### Conectores de Remotion o de diseño

- Este proyecto **no trae ningún servidor MCP configurado** (no hay `.mcp.json`). Remotion se usa con sus skills oficiales, que ya vienen en `.claude/skills/` (`remotion-create`, `remotion-markup`, `remotion-render`, `remotion-docs`…). La skill `remotion-docs` busca en la documentación oficial cuando hace falta.
- Si usas una herramienta de diseño con conector para Claude (por ejemplo, para sacar tus colores y tipografías de tu web o de tu sistema de diseño), conéctala en Claude y pídele a Claude que pase los valores a `src/brand/`.

### Descarga de miniaturas de referencia

- **Para qué sirve:** el agente `miniaturas-youtube` analiza los vídeos más vistos de los canales que le digas.
- **Pago:** gratis.
- **Cómo funciona:** `scripts/yt_populares.py <url_canal>` lee la página pública del canal y descarga las miniaturas. **No usa yt-dlp** ni necesita claves: no hay que instalar nada más. Si YouTube cambia su web y deja de funcionar, pide a Claude que lo adapte o que use yt-dlp (gratis, `pip install yt-dlp` dentro de `.venv`).

## Seguridad

- Nunca pegues contraseñas, tokens ni API keys en el chat ni en archivos del proyecto que se compartan. Si una herramienta necesita clave, va en `.env`.
- Tus grabaciones, `data/`, `out/` y `public/recursos/` no se suben al repositorio (están en `.gitignore`).
