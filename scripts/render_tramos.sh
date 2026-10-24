#!/bin/bash
# Render largo por tramos: si el navegador se cae, solo se repite el tramo que falló.
# Uso: scripts/render_tramos.sh <Composición> <total_fotogramas> <salida.mp4> [tramo=1500]
# Vídeo sin audio por tramos + audio entero en WAV, y al final se unen sin recomprimir el vídeo.
set -e
cd "$(dirname "$0")/.."
ID=$1; TOTAL=$2; OUT=$3; T=${4:-1500}
D=out/tramos-$ID; mkdir -p $D
F=$(.venv/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
: > $D/lista.txt
for ((a=0; a<TOTAL; a+=T)); do
  b=$((a+T-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$D/tramo-$(printf %05d $a).mp4
  if [ ! -s $f ]; then
    for intento in 1 2 3 4; do
      # límite de 15 minutos por tramo: si el navegador se cuelga, se mata y se repite (antes se quedó 4 horas colgado)
      perl -e 'alarm shift; exec @ARGV' 900 npx remotion render $ID $f.tmp.mp4 --frames=$a-$b --muted --concurrency=3 --port=3100 && mv $f.tmp.mp4 $f && break
      echo "Tramo $a-$b falló (intento $intento)"
      pkill -f chrome-headless-shell; sleep 5
    done
    [ -s $f ] || { echo "TRAMO $a-$b SIN HACER"; exit 1; }
  fi
  echo "file '$(basename $f)'" >> $D/lista.txt
  echo "TRAMO OK $a-$b"
done
[ -s $D/audio.wav ] || npx remotion render $ID $D/audio.wav --codec=wav --port=3100
$F -v error -y -f concat -safe 0 -i $D/lista.txt -i $D/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart $OUT
echo "UNIDO $OUT"
