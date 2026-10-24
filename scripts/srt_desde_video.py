# Subtítulos .srt para YouTube a partir del audio del vídeo ya montado (cuadran exactos con lo que se oye).
# Uso: .venv/bin/python scripts/srt_desde_video.py out/<vídeo>.mp4 data/<proyecto>/subtitulos.srt
import os, re, subprocess, sys
import numpy as np, imageio_ffmpeg, mlx_whisper
src, dst = sys.argv[1], sys.argv[2]
raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'quiet', '-i', src, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
r = mlx_whisper.transcribe(a, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language=os.environ.get('IDIOMA', 'es'), word_timestamps=True,
                           condition_on_previous_text=False)
ws = [w for s in r['segments'] for w in s.get('words', []) if w['word'].strip()]
# PERSONALIZA: cómo se escriben bien las palabras que Whisper suele fallar (tu marca, tus herramientas…).
FIX = {'linkedin': 'LinkedIn', 'Linkedin': 'LinkedIn', 'chatgpt': 'ChatGPT', 'Chatgpt': 'ChatGPT'}
subs, cur = [], []
for w in ws:
    t = w['word'].strip(); base = re.sub(r'[.,?!¿]+$', '', t)
    t = FIX.get(base, base) + t[len(base):]
    cur.append((w['start'], w['end'], t))
    if re.search(r'[.?!]$', t) or len(cur) >= 10 or (re.search(r',$', t) and len(cur) >= 6):
        subs.append(cur); cur = []
if cur: subs.append(cur)
ts = lambda s: f'{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round((s % 1) * 1000)) % 1000:03d}'
with open(dst, 'w') as fo:
    for i, s in enumerate(subs):
        fo.write(f'{i + 1}\n{ts(s[0][0])} --> {ts(s[-1][1])}\n{" ".join(x[2] for x in s)}\n\n')
print(len(subs), 'subtítulos')
