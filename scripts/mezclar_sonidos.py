# Mezcla los efectos de un anuncio bajo la voz: un sonido por idea, a un nivel fijo por debajo de la voz medida.
# Uso: mezclar_sonidos.py voz.wav eventos.json salida.wav
#   eventos.json: [{"t": segundos, "son": "pop|ding|whoosh|golpe"}, ...]
import json, os, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# dB por debajo del nivel medio de la voz (el resultado, más alto; lo que solo acompaña, más bajo)
NIVEL = {'pop': -13, 'golpe': -13, 'ding': -16, 'whoosh': -19}
PESO = {'golpe': 4, 'pop': 3, 'ding': 2, 'whoosh': 1}

def leer(ruta):
    with wave.open(ruta) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    return (x.reshape(-1, ch) if ch > 1 else x[:, None]), sr

voz, sr = leer(sys.argv[1])
ev = sorted(json.load(open(sys.argv[2])), key=lambda e: e['t'])
# dos sonidos a menos de 0,8 s: se queda el que pesa más
limpio = []
for e in ev:
    if limpio and e['t'] - limpio[-1]['t'] < 0.8:
        if PESO[e['son']] > PESO[limpio[-1]['son']]: limpio[-1] = e
        continue
    limpio.append(e)
# nivel de la voz: RMS de las ventanas con voz
m = voz.mean(1); v = int(sr * 0.05)
rms = np.sqrt(np.array([np.mean(m[i:i + v] ** 2) for i in range(0, len(m) - v, v)]) + 1e-12)
ref = np.sqrt(np.mean(rms[rms > rms.max() * 0.1] ** 2))
out = voz.copy()
for e in limpio:
    s, ssr = leer(f'{ROOT}/public/sonidos/{e["son"]}.wav'); s = s[:, 0]
    if ssr != sr: s = np.interp(np.arange(int(len(s) * sr / ssr)) * ssr / sr, np.arange(len(s)), s)
    s = s / np.sqrt(np.mean(s[:int(sr * 0.15)] ** 2)) * ref * 10 ** (NIVEL[e['son']] / 20)
    i = int(e['t'] * sr); j = min(len(out), i + len(s))
    if i < len(out): out[i:j] += s[:j - i, None]
out = np.clip(out, -1, 1)
with wave.open(sys.argv[3], 'wb') as w:
    w.setnchannels(out.shape[1]); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f'{len(limpio)} sonidos mezclados ({len(ev) - len(limpio)} quitados por estar demasiado juntos)')
