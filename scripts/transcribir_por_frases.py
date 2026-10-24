# Transcribe una grabación frase a frase: corta por silencios (energía) y pasa cada tramo a Whisper por separado.
# La transcripción de corrido "funde" las tomas repetidas; tramo a tramo se ve cada intento.
# Uso: .venv/bin/python scripts/transcribir_por_frases.py data/<proyecto>/voz16k.wav data/<proyecto>/frases.json
import json, os, sys, wave
import numpy as np
import mlx_whisper
src, dst = sys.argv[1], sys.argv[2]
w = wave.open(src); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
env = 20 * np.log10(np.sqrt((a[: len(a) // 160 * 160].reshape(-1, 160) ** 2).mean(1)) + 1e-9)   # 100 Hz
thr = max(np.percentile(env, 97) - 32, np.percentile(env, 15) + 8)
on = env > thr
# tramos de voz: se unen los huecos de menos de 0,30 s
segs, i, n = [], 0, len(on)
while i < n:
    if on[i]:
        j = i
        while j < n and (on[j] or on[j:j + 30].any()): j += 1
        if j - i >= 12: segs.append([i / 100, j / 100])
        i = j
    else: i += 1
# frases: tramos seguidos con huecos de menos de 0,7 s y hasta 14 s
fr = []
for s in segs:
    if fr and s[0] - fr[-1][1] < 0.7 and s[1] - fr[-1][0] < 14: fr[-1][1] = s[1]
    else: fr.append(list(s))
out = []
for k, (s, e) in enumerate(fr):
    s0, e0 = max(0, s - 0.15), e + 0.2
    clip = a[int(s0 * 16000):int(e0 * 16000)]
    r = mlx_whisper.transcribe(clip, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language=os.environ.get('IDIOMA', 'es'), word_timestamps=True,
                               condition_on_previous_text=False)
    words = [dict(w=x['word'].strip(), s=round(x['start'] + s0, 2), e=round(x['end'] + s0, 2), p=round(x['probability'], 2))
             for seg in r['segments'] for x in seg.get('words', []) if x['word'].strip()]
    out.append(dict(s=round(s, 2), e=round(e, 2), text=' '.join(x['w'] for x in words), words=words))
    print(f'[{s:7.2f}-{e:7.2f}] {out[-1]["text"]}', flush=True)
json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=0)
