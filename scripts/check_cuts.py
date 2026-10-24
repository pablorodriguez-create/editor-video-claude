# Comprobación obligatoria antes de renderizar: monta el audio exacto de los cortes y le pasa las mismas reglas que el
# supervisor de contenido (scripts/revisar_video.py): frases a medias, arranques repetidos, palabras repetidas, muletillas,
# tacos, palabras estiradas o escondidas (tropiezos que la transcripción general se come) y palabras partidas por un corte.
# Uso: .venv/bin/python scripts/check_cuts.py data/<proyecto>/cuts-01.json <grabación.mp4> [--permitir <palabra>]
# Sale con código 1 si hay alertas GRAVES: no se renderiza hasta corregirlas.
import argparse, json, os, sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from revisar_video import alertas, asr, fmt, frases, load_audio, todas_las_ventanas

ap = argparse.ArgumentParser()
ap.add_argument('cuts'); ap.add_argument('src'); ap.add_argument('--permitir', nargs='*', default=[])
a = ap.parse_args()
cuts = json.load(open(a.cuts))
parts = [load_audio(c.get('archivo', a.src), c['start'], c['end']) for c in cuts]   # 'archivo': cortes de varias grabaciones
audio = np.concatenate(parts); dur = len(audio) / 16000
bounds, cum = [], 0.0
for p in parts[:-1]:
    cum += len(p) / 16000; bounds.append(cum)


def src(t):
    acc = 0.0
    for c, p in zip(cuts, parts):
        d = len(p) / 16000
        if t < acc + d: return c['start'] + (t - acc)
        acc += d
    return cuts[-1]['end']


full = asr(audio)
wins = todas_las_ventanas(audio)
al = alertas(full, wins, dur, audio, bounds, a.permitir)
print('TEXTO:')
print('\n'.join(frases(full, src)))
graves = [x for x in al if x[1] == 'GRAVE']
print(f'\nALERTAS: {len(graves)} graves, {len(al) - len(graves)} para revisar' if al else '\nOK: sin alertas')
for t, g, k, d in al:
    print(f'  [{fmt(t)}] {g} · {k} · {d} · fuente {src(t):.2f} s')
sys.exit(1 if graves else 0)
