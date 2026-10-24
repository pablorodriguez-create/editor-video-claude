#!/bin/bash
# Normaliza una pista a -14 LUFS (pico -1.5 dBTP) a dos pasadas, en modo lineal: sin bombeo de volumen.
# Uso: scripts/loudnorm2.sh entrada.wav salida.wav
set -e
cd "$(dirname "$0")/.."
F=$(.venv/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
M=$($F -hide_banner -i "$1" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
V=$(echo "$M" | .venv/bin/python -c "import json,sys;m=json.load(sys.stdin);print(f\"measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}\")")
$F -v error -y -i "$1" -af "loudnorm=I=-14:TP=-1.5:LRA=11:$V:linear=true,aresample=48000" -c:a pcm_s16le "$2"
