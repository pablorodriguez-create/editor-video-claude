#!/bin/bash
# Exporta un vídeo terminado a 4K para YouTube: con 4K YouTube usa VP9/AV1 (mucho mejor que el AVC que da a los 1080p)
# y se ve más nítido incluso viéndolo en 1080p. Limpieza suave del ruido (hqdn3d, sin enfocar: el enfoque dispara el grano), escalado lanczos y HEVC con el chip del Mac a ~35 Mbps.
# Uso: scripts/exportar_youtube_4k.sh <entrada.mp4> <salida.mp4>
set -e
F=$("$(dirname "$0")/../.venv/bin/python" -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
"$F" -v error -stats -y -i "$1" -vf "hqdn3d=1.5:1.5:6:6,scale=3840:2160:flags=lanczos,format=yuv420p" \
  -c:v hevc_videotoolbox -b:v 35M -maxrate 45M -tag:v hvc1 -r 25 -c:a aac -b:a 320k -movflags +faststart "$2"
echo "4K OK $2"
