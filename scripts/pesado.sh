#!/bin/bash
# Cola para tareas pesadas (renders, Whisper, conversiones de vídeo): solo UNA a la vez.
# Con 16 GB de memoria, un render y una transcripción a la vez dejan el Mac sin memoria y el render se cae.
# Usa un candado atómico (mkdir), nada de pgrep (una espera con pgrep se encuentra a sí misma y no acaba nunca).
#
# Uso:  scripts/pesado.sh <nombre> <comando...>
# Deja el estado en out/cola/<nombre>.estado: EN COLA → EN MARCHA → OK | FALLO (código)
set -u
NOMBRE="$1"; shift
DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$DIR/out/cola"
ESTADO="$DIR/out/cola/$NOMBRE.estado"
LOCK="$DIR/out/cola/.candado"
echo "EN COLA $(date '+%H:%M:%S')" > "$ESTADO"
until mkdir "$LOCK" 2>/dev/null; do
  # candado huérfano (su tarea ya no existe): se libera
  if [ -f "$LOCK/pid" ] && ! kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then rm -rf "$LOCK"; fi
  sleep 5
done
echo $$ > "$LOCK/pid"
trap 'rm -rf "$LOCK"' EXIT
echo "EN MARCHA $(date '+%H:%M:%S')" > "$ESTADO"
"$@"
CODIGO=$?
if [ $CODIGO -eq 0 ]; then echo "OK $(date '+%H:%M:%S')" > "$ESTADO"; else echo "FALLO ($CODIGO) $(date '+%H:%M:%S')" > "$ESTADO"; fi
exit $CODIGO
