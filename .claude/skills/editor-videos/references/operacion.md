# Cómo trabajar sin que se caigan los renders

Un render de Remotion y una transcripción de Whisper a la vez pueden dejar un Mac de 16 GB sin memoria, y el render se cae a mitad. Para que no pase:

## Una tarea pesada a la vez

Todo lo pesado va por la cola: renders, Whisper y ffmpeg con archivos grandes.

```bash
scripts/pesado.sh render-r01 npx remotion render R01 out/R01.mp4 --port=3100
```

- Las tareas pasan de una en una con un candado (`out/cola/.candado`).
- El estado queda en `out/cola/<nombre>.estado`: EN COLA, EN MARCHA, OK o FALLO (código).
- **Nunca esperes con `pgrep -f`.** La orden de espera contiene el patrón que busca, se encuentra a sí misma y no termina nunca.
- Mientras renderiza, no hagas otro trabajo pesado: lo ralentiza o lo tumba.

## Vigilar y avisar

- Vigila el log del render filtrando "crashed|Error|<archivo>.mp4". Si falla, avisa en el momento, no media hora después.
- Al acabar, comprueba la duración del mp4 (OpenCV) y que el log no tenga "crashed".

## Tres formas de renderizar

1. **Remotion directo** (vídeos cortos con gráficos): `npx remotion render <Composición> out/<nombre>.mp4`.
2. **Render mixto** (Reels sacados de grabaciones largas o en 4K, anuncios): mucho más rápido.
   - ffmpeg con el chip del Mac (`h264_videotoolbox`) monta la imagen base: cámara recortada a vertical, pantalla, planos de apoyo.
   - Remotion solo renderiza una capa transparente con los textos y animaciones (ProRes 4444 con transparencia: `--codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png --muted`).
   - ffmpeg une base + capa + audio exacto por muestras.
   - Un Reel de unos 50 s sale en 3-4 minutos.
3. **Por tramos** (vídeos de más de 5 minutos): `scripts/pesado.sh render-<id> scripts/render_tramos.sh <Composición> <fotogramas> out/<id>.mp4`. Tramos de 1 minuto sin audio, audio entero en WAV y unión sin recomprimir. Si un tramo falla, solo se repite ese.

## Tiempos y validación

Para no hacer esperar en cada cambio:
1. Valida diseños con fotogramas sueltos: `npx remotion still <id> out/checks/<id>.jpg --frame=N --port=3101 --scale=0.5`.
2. Valida el montaje con un render rápido a media resolución (`--scale=0.5`).
3. Haz el render final una sola vez.

Si la persona pide ver el vídeo, enséñaselo en cuanto exista, avisando de que aún pasa por el supervisor.

## Puertos

- Renders: `--port=3100`.
- Fotogramas sueltos: `--port=3101`.
- Remotion Studio: 3000 (`.claude/launch.json`).

## Herramientas

Python en `.venv`: mlx-whisper 0.4.3, opencv-python-headless 5.0.0.93, imageio-ffmpeg 0.6.0 y numpy 2.0.2.

```bash
python3 -m venv .venv && .venv/bin/pip install mlx-whisper==0.4.3 opencv-python-headless==5.0.0.93 imageio-ffmpeg==0.6.0 numpy==2.0.2
```

- El ffmpeg es el de `imageio_ffmpeg` (`.venv/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`): no hace falta tenerlo en el PATH.
- Para pasar audio a Whisper, carga el WAV con numpy y pásale el array.
- Whisper transcribe en español por defecto. Para otro idioma: `IDIOMA=en .venv/bin/python scripts/...`.
- La primera transcripción descarga el modelo de Whisper (unos 1,6 GB): tarda unos minutos solo esa vez.

## Grabaciones en Google Drive

Con Google Drive para escritorio, las carpetas de Drive aparecen en Finder (`~/Library/CloudStorage/GoogleDrive-<cuenta>/`). Lee las grabaciones desde ahí o cópialas a `public/<proyecto>/`. Si un archivo está "solo en la nube", ábrelo una vez en Finder para que se descargue.
