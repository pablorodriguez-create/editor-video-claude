#!/bin/bash
# Hoja de contacto de un vídeo renderizado: 12 fotogramas repartidos en una sola imagen → out/checks/<nombre>.jpg
# Uso: scripts/hoja_contacto.sh out/<vídeo>.mp4
cd "$(dirname "$0")/.." && mkdir -p out/checks
V=$1; N=$(basename "$V" .mp4)
F=$(.venv/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
D=$($F -i "$V" 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
$F -v error -y -i "$V" -vf "fps=12/$D,scale=270:-1,tile=6x2" -frames:v 1 out/checks/$N.jpg
echo "$N $D s"
