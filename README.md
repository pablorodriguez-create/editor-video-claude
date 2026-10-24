# Editor de vídeo con Claude

Plantilla para editar vídeos grabados (Reels, clips de podcast o entrevista, YouTube con cámara y pantalla, anuncios y miniaturas) con Claude Code, Remotion y scripts de Python que corren en tu Mac.

- Corta por el audio y se queda con la última toma buena, sin titubeos ni palabras partidas.
- Subtítulos, rótulos y animaciones con tu marca.
- Revisión automática antes de renderizar y un agente supervisor antes de entregar.
- Volumen final a -14 LUFS.

## Empieza aquí

1. Lee **[EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)**: requisitos, instalación y el primer mensaje que tienes que pegar en Claude Code.
2. Mira **[HERRAMIENTAS-Y-CONEXIONES.md](HERRAMIENTAS-Y-CONEXIONES.md)**: qué es obligatorio, qué es opcional y cómo se conecta cada cosa.
3. Las normas del proyecto y tu marca están en **[CLAUDE.md](CLAUDE.md)**.

## Requisitos rápidos

- Mac con chip Apple (recomendado para Whisper con MLX).
- Claude Code (app de escritorio, pestaña Code) con plan de pago.
- Node 20 o superior y Python 3.

```bash
npm install
python3 -m venv .venv && .venv/bin/pip install mlx-whisper==0.4.3 opencv-python-headless==5.0.0.93 imageio-ffmpeg==0.6.0 numpy==2.0.2
npx remotion studio
```

## Licencia de Remotion

Remotion es gratis para particulares y empresas pequeñas. Las empresas más grandes necesitan licencia: compruébalo en remotion.dev/license.
