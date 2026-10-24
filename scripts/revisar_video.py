# Supervisor de contenido, parte automática. Revisa un vídeo YA RENDERIZADO como lo vería un espectador y deja en una
# carpeta todo lo que necesita el agente supervisor (.claude/agents/supervisor-contenido.md) para aprobarlo o devolverlo:
#   informe.md   alertas automáticas, transcripción palabra a palabra, transcripción por ventanas cortas, cortes, audio
#   hojas/*.jpg  fotogramas con su minuto y segundo (los 5 primeros segundos cada medio segundo; después, uno por segundo)
#   cortes/*.jpg fotograma justo antes y justo después de cada corte
# Uso:
#   .venv/bin/python scripts/revisar_video.py out/<vídeo>.mp4 --cuts data/<proyecto>/cuts-01.json --subtitulos data/<proyecto>/captions-01.json
#                                            [--permitir <palabra>] [--out carpeta]
#   .venv/bin/python scripts/revisar_video.py out/<vídeo>.mp4 --fragmento 26.5 35   (escucha un tramo palabra a palabra)
#   .venv/bin/python scripts/revisar_video.py out/<vídeo>.mp4 --fragmentos 12-16 26.5-35   (varios tramos de una vez, más rápido)
# Sale con código 1 si hay alertas GRAVES. Las mismas reglas las usa scripts/check_cuts.py antes de renderizar.
import argparse, json, os, re, subprocess, sys

import numpy as np

SR = 16000
MODEL = 'mlx-community/whisper-large-v3-turbo'
# Un prompt con titubeos hace que Whisper los transcriba en vez de limpiarlos.
PROMPT = 'Eh... mmm, o sea, eh, lo, lo que, eeh, la, la gente. Ehm.'
STOP = {'de', 'que', 'a', 'y', 'la', 'el', 'en', 'los', 'las', 'lo', 'un', 'una', 'es', 'se', 'no', 'te', 'me', 'por', 'con',
        'para', 'del', 'al', 'o', 'yo', 'tu', 'mi', 'su'}
FILLERS = {'eh', 'ehm', 'eeh', 'em', 'mmm', 'mm', 'hmm', 'osea'}
SOFT_FILLERS = {'bueno', 'vale', 'pues'}
# "este" casi siempre es demostrativo ("este tipo de"); solo se marca para revisar si va suelto entre comas.
SWEARS = {'joder', 'hostia', 'puta', 'puto', 'mierda', 'coño', 'cojones', 'cabrón'}
norm = lambda x: re.sub(r'[^\wáéíóúñü]', '', x.lower())


def ffmpeg():
    if os.environ.get('FFMPEG'): return os.environ['FFMPEG']
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def load_audio(path, start=None, end=None):
    cmd = [ffmpeg(), '-loglevel', 'error']
    if start is not None: cmd += ['-ss', f'{start:.3f}']
    if end is not None: cmd += ['-to', f'{end:.3f}']
    cmd += ['-i', path, '-vn', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def asr(audio, offset=0.0):
    """Transcribe con tiempos por palabra y probabilidad. 0,4 s de silencio delante para no perder la primera palabra."""
    import mlx_whisper
    pad = np.zeros(int(0.4 * SR), np.float32)
    r = mlx_whisper.transcribe(np.concatenate([pad, audio]), path_or_hf_repo=MODEL, language=os.environ.get('IDIOMA', 'es'), word_timestamps=True,
                               condition_on_previous_text=False, initial_prompt=PROMPT)
    return [dict(w=x['word'].strip(), s=max(offset, offset - 0.4 + x['start']), e=max(offset, offset - 0.4 + x['end']), p=float(x.get('probability', 1.0)))
            for seg in r['segments'] for x in seg.get('words', []) if x['word'].strip()]


def todas_las_ventanas(audio):
    """Dos pases: ventanas de 6 s (frases) y de 3 s (tropiezos cortos, como "los, bueno, los que")."""
    return ventanas(audio) + ventanas(audio, 3.0, 1.5)


def ventanas(audio, win=6.0, hop=3.0):
    dur = len(audio) / SR; out = []; t0 = 0.0
    while t0 < dur - 0.5:
        t1 = min(dur, t0 + win)
        out.append(dict(t0=t0, t1=t1, win=win, words=asr(audio[int(t0 * SR):int(t1 * SR)], t0)))
        if t1 >= dur: break
        t0 += hop
    return out


def voz(audio):
    """Energía cada 10 ms en dB y umbral de voz (mismo criterio que scripts/cutter.py)."""
    env = np.sqrt((audio[: len(audio) // 160 * 160].reshape(-1, 160) ** 2).mean(1))
    db = 20 * np.log10(env + 1e-9)
    return db, max(np.percentile(db, 97) - 32, np.percentile(db, 15) + 8)


def fmt(t):
    return f'{int(t // 60):02d}:{t % 60:04.1f}'


def alertas(full, wins, dur, audio, bounds=(), permitir=()):
    """Reglas automáticas. Devuelve [(t, 'GRAVE'|'REVISAR', tipo, detalle)]."""
    out = []
    add = lambda t, g, k, d: out.append((round(t, 2), g, k, d))
    allowed = {norm(x) for x in permitir}

    def sigue(w):
        # ¿la transcripción completa tiene esa misma palabra ahí y la frase continúa enseguida? Entonces es una pausa, no un abandono.
        for k, x in enumerate(full):
            if norm(x['w']) == norm(w['w']) and abs(x['s'] - w['s']) < 0.35:
                return k + 1 < len(full) and full[k + 1]['s'] - x['e'] < 1.2 and not re.search(r'[.?!…]$', x['w'])
        return False

    def scan(ws, lo, hi, fuente, ventana=False):
        toks = [norm(w['w']) for w in ws]
        for i, w in enumerate(ws):
            if not (lo <= w['s'] < hi): continue
            t = toks[i]
            if re.search(r'(\.\.\.|…)$', w['w']):
                if t and ventana and sigue(w):
                    add(w['s'], 'REVISAR', 'pausa a mitad de frase', f'"{w["w"]}" y la frase sigue: escucha que no sea un tropiezo ({fuente})')
                elif t: add(w['s'], 'GRAVE', 'frase a medias', f'"{w["w"]}" se queda colgando ({fuente})')
                else: add(w['s'], 'REVISAR', 'pausa con titubeo', f'Whisper oye un silencio dudoso ({fuente})')
                continue
            if i and t and t == toks[i - 1]:
                add(w['s'], 'GRAVE', 'palabra repetida', f'"{ws[i - 1]["w"]} {w["w"]}" ({fuente})')
            if t in FILLERS:
                add(w['s'], 'GRAVE', 'muletilla', f'"{w["w"]}" ({fuente})')
            if t in SOFT_FILLERS and (i == 0 or re.search(r'[.?!]$', ws[i - 1]['w'])):
                add(w['s'], 'REVISAR', 'muletilla de arranque', f'"{w["w"]}" ({fuente})')
            elif t in ('bueno', 'vale') and i and not re.search(r'[.?!]$', ws[i - 1]['w']):
                ctx = ' '.join(x['w'] for x in ws[max(0, i - 3):i + 3])
                add(w['s'], 'GRAVE', 'autocorrección', f'"{w["w"]}" en mitad de una frase: "{ctx}" ({fuente})')
            if t == 'este' and re.search(r',$', w['w']):
                add(w['s'], 'REVISAR', 'muletilla', f'"{w["w"]}" suelto ({fuente})')
            if t in SWEARS and t not in allowed:
                add(w['s'], 'GRAVE', 'taco', f'"{w["w"]}" ({fuente})')
            if w['p'] < 0.3 and t:
                add(w['s'], 'REVISAR', 'palabra dudosa', f'"{w["w"]}" probabilidad {w["p"]:.2f}: puede ser un balbuceo ({fuente})')
        # arranques repetidos: el mismo trozo de 2 a 4 palabras dos veces en menos de 6 s
        for n in (4, 3, 2):
            for i in range(len(toks) - n + 1):
                g = toks[i:i + n]
                if not all(g) or all(x in STOP for x in g) or not (lo <= ws[i]['s'] < hi): continue
                j = i + 1
                while j <= len(toks) - n and ws[j]['s'] - ws[i]['s'] < 6:
                    if toks[j:j + n] == g:
                        add(ws[j]['s'], 'GRAVE' if n >= 3 else 'REVISAR', 'arranque repetido',
                            f'"{" ".join(w["w"] for w in ws[i:i + n])}" otra vez en {fmt(ws[j]["s"])} ({fuente}). Si la primera queda a medias, es un tropiezo: se usa la última toma')
                        break
                    j += 1

    scan(full, 0, dur + 1, 'transcripción completa')
    for wv in wins:
        # lo que cae en el último 0,8 s de la ventana puede estar cortado por la propia ventana: no cuenta
        # y lo del primer 0,5 s tampoco: la ventana empieza a mitad de palabra y Whisper se inventa algo (ya lo cubre la anterior)
        scan(wv['words'], wv['t0'] + (0.5 if wv['t0'] > 0 else 0), (wv['t1'] - 0.8) if wv['t1'] < dur - 0.01 else dur + 1, f'ventana {fmt(wv["t0"])}', True)
    # palabras estiradas: la transcripción general se come algo (tropiezo escondido)
    db, thr = voz(audio)
    for w in full:
        d = w['e'] - w['s']
        if len(norm(w['w'])) <= 3 and d > 0.5:
            sonoro = (db[int(w['s'] * 100):int(w['e'] * 100)] > thr).sum() / 100
            add(w['s'], 'GRAVE' if d > 0.75 and sonoro > 0.45 else 'REVISAR', 'palabra corta estirada',
                f'"{w["w"]}" dura {d:.2f} s con {sonoro:.2f} s de voz: una palabra tan corta no dura eso; suele esconder un atasco ("los… bueno, los")')
        elif d > 1.1:
            add(w['s'], 'GRAVE' if d > 1.6 else 'REVISAR', 'palabra estirada',
                f'"{w["w"]}" dura {d:.1f} s en la transcripción completa: suele esconder un tropiezo o una toma repetida')
    # discrepancias: la ventana corta oye palabras que la transcripción completa no recoge
    for wv in wins:
        a, b = wv['t0'] + 0.5, wv['t1'] - 0.8
        nw = [w for w in wv['words'] if a <= w['s'] < b]
        nf = [w for w in full if a <= w['s'] < b]
        extra = len(nw) - len(nf)
        if extra >= 3 or (wv['win'] < 6 and extra >= 2):
            add(a, 'GRAVE' if extra >= 3 else 'REVISAR', 'palabras escondidas',
                f'la ventana oye "{" ".join(w["w"] for w in nw)}" y la completa solo "{" ".join(w["w"] for w in nf)}"')
    # pausas largas dentro del discurso
    for x, y in zip(full, full[1:]):
        if y['s'] - x['e'] > 0.9:
            add(x['e'], 'REVISAR', 'pausa larga', f'{y["s"] - x["e"]:.1f} s de silencio entre "{x["w"]}" y "{y["w"]}"')
    # chasquidos o golpes en el silencio antes de la primera palabra (se oyen mucho porque no hay voz que los tape)
    if full and full[0]['s'] > 0.08:
        pre = audio[:max(0, int((full[0]['s'] - 0.05) * SR))]
        if len(pre) and np.abs(pre).max() > 10 ** (-30 / 20):
            t = np.abs(pre).argmax() / SR
            add(t, 'GRAVE', 'ruido al arrancar', f'chasquido o golpe de {20 * np.log10(np.abs(pre).max()):.1f} dBFS antes de la primera palabra: empieza el corte después')
    if full and full[0]['s'] > 0.8:
        add(0, 'REVISAR', 'arranque lento', f'la voz empieza en {fmt(full[0]["s"])}')
    if full and (dur - full[-1]['e'] < 0.12 or (db[-6:] > thr).mean() > 0.5):
        add(dur, 'GRAVE', 'final cortado', 'la voz llega hasta el último fotograma: posible palabra cortada al final')
    # cortes: ninguna palabra partida y nada de voz a ambos lados del salto
    for k, b in enumerate(bounds):
        i = int(b * 100)
        before, after = (db[max(0, i - 4):i] > thr).mean(), (db[i:i + 4] > thr).mean()
        # una palabra "partida" solo cuenta si de verdad hay voz pegada al corte (Whisper a veces inventa una "y" en el silencio)
        if max(before, after) > 0.25:
            for w in full:
                if w['s'] < b - 0.04 and w['e'] > b + 0.04 and w['e'] - w['s'] < 1.1:
                    add(b, 'GRAVE', 'palabra partida', f'el corte {k + 1} cae dentro de "{w["w"]}" y hay voz junto al corte')
        if before > 0.5 and after > 0.5:
            add(b, 'REVISAR', 'corte con voz', f'el corte {k + 1} tiene voz justo antes y justo después: escúchalo')
    out.sort()
    seen, res = set(), []
    for t, g, k, d in out:
        key = (k, round(t))
        if key in seen: continue
        seen.add(key); res.append((t, g, k, d))
    return res


def juntar_cifras(ws):
    out = []
    for w in ws:
        if out and re.match(r'^[.,]\d', w['w']): out[-1] = dict(out[-1], w=out[-1]['w'] + w['w'])
        else: out.append(dict(w))
    return out


def subtitulos_adelantados(caps, audio):
    """Palabras cuyo subtítulo se enciende en plena pausa: los 0,3 s siguientes casi sin voz."""
    db, thr = voz(audio)
    out = []
    for c in caps:
        i = int(c['t'] * 100)
        if (db[i:i + 30] > thr + 8).mean() < 0.2:
            j = i
            while j < len(db) and db[j] <= thr + 8: j += 1
            if j - i >= 15:
                out.append((c['t'], 'GRAVE' if j - i >= 30 else 'REVISAR', 'subtítulo adelantado',
                            f'"{c["w"]}" se enciende {(j - i) / 100:.2f} s antes de oírse'))
    return out


def comparar_subtitulos(caps, full):
    """Diferencias entre lo que se lee y lo que se oye (desde el primer subtítulo). Palabra que falta o que sobra = GRAVE."""
    import difflib
    if not caps: return []
    t0 = caps[0]['t'] - 0.3
    oido = [w for w in juntar_cifras(full) if w['s'] >= t0]
    a = [norm(w['w']) for w in oido]; b = [norm(c['w']) for c in caps]
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == 'equal': continue
        t = oido[i1]['s'] if i1 < len(oido) else caps[min(j1, len(caps) - 1)]['t']
        se_oye = ' '.join(w['w'] for w in oido[max(0, i1 - 2):i2 + 2]); se_lee = ' '.join(c['w'] for c in caps[max(0, j1 - 2):j2 + 2])
        g = 'GRAVE' if op in ('delete', 'insert') or abs((i2 - i1) - (j2 - j1)) > 0 else 'REVISAR'
        out.append((t, g, 'subtítulo distinto del audio', f'se oye "{se_oye}" y se lee "{se_lee}"'))
    return out


def medir_audio(path):
    r = subprocess.run([ffmpeg(), '-hide_banner', '-nostats', '-i', path, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    lufs = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); peak = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)
    return (float(lufs[-1]) if lufs else None), (float(peak[-1]) if peak else None)


def detectar_video(path):
    r = subprocess.run([ffmpeg(), '-hide_banner', '-nostats', '-i', path, '-an', '-vf',
                        'blackdetect=d=0.05:pix_th=0.08,freezedetect=n=0.001:d=1.5', '-f', 'null', '-'], capture_output=True, text=True).stderr
    negro = [float(x) for x in re.findall(r'black_start:(-?[\d.]+)', r)]
    congelado = [float(x) for x in re.findall(r'freeze_start: (-?[\d.]+)', r)]
    return negro, congelado


def fotogramas(path, outdir, bounds, dur):
    import cv2
    cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS) or 30
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    want = {}
    for t in list(np.arange(0, min(5.0, dur), 0.5)) + list(np.arange(5.0, dur, 1.0)) + [dur - 1 / fps]:
        want.setdefault(min(n - 1, int(round(t * fps))), set()).add('hoja')
    for t in np.arange(0, dur, 0.5):
        want.setdefault(min(n - 1, int(round(t * fps))), set()).add('cara')
    for k, b in enumerate(bounds):
        fb = int(round(b * fps))
        want.setdefault(max(0, fb - 1), set()).add(f'corte{k}a'); want.setdefault(min(n - 1, fb), set()).add(f'corte{k}b')
    want.setdefault(0, set()).add('portada')
    casc = None
    try:
        casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    except Exception:
        pass
    thumbs, sin_cara, pairs = [], [], {}
    os.makedirs(f'{outdir}/hojas', exist_ok=True); os.makedirs(f'{outdir}/cortes', exist_ok=True)
    i = 0
    while True:
        ok, fr = cap.read()
        if not ok: break
        if i in want:
            tags = want[i]; t = i / fps
            if 'portada' in tags: cv2.imwrite(f'{outdir}/portada.jpg', fr, [cv2.IMWRITE_JPEG_QUALITY, 88])
            if 'hoja' in tags:
                th = cv2.resize(fr, (270, 480), interpolation=cv2.INTER_AREA)
                cv2.rectangle(th, (0, 0), (118, 34), (0, 0, 0), -1)
                cv2.putText(th, fmt(t), (6, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2, cv2.LINE_AA)
                thumbs.append(th)
            if 'cara' in tags and casc is not None and not casc.empty():
                g = cv2.cvtColor(cv2.resize(fr, (540, 960)), cv2.COLOR_BGR2GRAY)
                if len(casc.detectMultiScale(g, 1.1, 5, minSize=(70, 70))) == 0: sin_cara.append(t)
            for tag in tags:
                if tag.startswith('corte'): pairs.setdefault(int(tag[5:-1]), {})[tag[-1]] = cv2.resize(fr, (540, 960))
        i += 1
    cap.release()
    hojas = []
    for s in range(0, len(thumbs), 12):
        chunk = thumbs[s:s + 12] + [np.zeros_like(thumbs[0])] * (12 - len(thumbs[s:s + 12]))
        sheet = np.vstack([np.hstack(chunk[r * 4:(r + 1) * 4]) for r in range(3)])
        p = f'{outdir}/hojas/hoja_{s // 12 + 1:02d}.jpg'; cv2.imwrite(p, sheet, [cv2.IMWRITE_JPEG_QUALITY, 82]); hojas.append(p)
    cortes = []
    for k, pr in sorted(pairs.items()):
        if 'a' in pr and 'b' in pr:
            p = f'{outdir}/cortes/corte_{k + 1:02d}.jpg'; cv2.imwrite(p, np.hstack([pr['a'], pr['b']]), [cv2.IMWRITE_JPEG_QUALITY, 82]); cortes.append(p)
    return hojas, cortes, sin_cara


def frases(ws, src=None):
    lines, cur = [], []
    for w in ws:
        cur.append(w)
        if re.search(r'[.?!…]$', w['w']) or len(cur) >= 16:
            lines.append(cur); cur = []
    if cur: lines.append(cur)
    out = []
    for ln in lines:
        txt = ' '.join(w['w'] + (f'({w["p"]:.2f})' if w['p'] < 0.6 else '') for w in ln)
        extra = f'  · fuente {src(ln[0]["s"]):.2f} s' if src else ''
        out.append(f'- [{fmt(ln[0]["s"])}] {txt}{extra}')
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('--cuts'); ap.add_argument('--out'); ap.add_argument('--permitir', nargs='*', default=[])
    ap.add_argument('--fragmento', nargs=2, type=float)
    # varios tramos de una vez (el modelo se carga una sola vez): --fragmentos 12.5-16 26.5-35 40-44
    ap.add_argument('--fragmentos', nargs='+')
    ap.add_argument('--subtitulos', help='JSON de subtítulos en tiempo del vídeo (data/<proyecto>/captions-NN.json)')
    a = ap.parse_args()
    if a.fragmentos:
        audio = load_audio(a.video)
        for fr in a.fragmentos:
            t0, t1 = (float(x) for x in fr.split('-'))
            ws = asr(audio[int(t0 * SR):int(t1 * SR)], t0)
            print(f'[{fmt(t0)}-{fmt(t1)}] ' + ' '.join(f'{w["w"]}({w["s"]:.2f}|{w["p"]:.2f})' for w in ws))
        return
    if a.fragmento:
        t0, t1 = a.fragmento
        for w in asr(load_audio(a.video, t0, t1), t0):
            print(f'{fmt(w["s"])}-{fmt(w["e"])}  {w["w"]}  ({w["p"]:.2f})')
        return
    name = os.path.splitext(os.path.basename(a.video))[0]
    outdir = a.out or f'out/revision/{name}'
    os.makedirs(outdir, exist_ok=True)
    audio = load_audio(a.video); dur = len(audio) / SR
    cuts = json.load(open(a.cuts)) if a.cuts else []
    bounds, cum = [], 0.0
    for c in cuts[:-1]:
        cum += c['end'] - c['start']; bounds.append(cum)

    def src(t):
        acc = 0.0
        for c in cuts:
            d = c['end'] - c['start']
            if t < acc + d: return c['start'] + (t - acc)
            acc += d
        return cuts[-1]['end'] if cuts else t

    full = asr(audio)
    wins = todas_las_ventanas(audio)
    al = alertas(full, wins, dur, audio, bounds, a.permitir)
    if cuts:
        esperado = sum(c['end'] - c['start'] for c in cuts)
        if abs(esperado - dur) > 0.15:
            al.append((0, 'GRAVE', 'render desactualizado', f'el vídeo dura {dur:.2f} s y los cortes actuales suman {esperado:.2f} s: no es el render de la versión actual'))
    if a.subtitulos:
        caps = json.load(open(a.subtitulos))
        al += comparar_subtitulos(caps, full) + subtitulos_adelantados(caps, audio)
    lufs, peak = medir_audio(a.video)
    if lufs is not None and not (-17 <= lufs <= -11): al.append((0, 'GRAVE', 'volumen', f'{lufs:.1f} LUFS (objetivo -14)'))
    if peak is not None and peak > -0.3: al.append((0, 'REVISAR', 'saturación', f'pico de {peak:.1f} dBFS'))
    negro, congelado = detectar_video(a.video)
    for t in negro: al.append((t, 'GRAVE', 'negro', 'fotogramas negros'))
    for t in congelado: al.append((t, 'REVISAR', 'imagen congelada', 'la imagen no cambia durante más de 1,5 s'))
    hojas, cortes, sin_cara = fotogramas(a.video, outdir, bounds, dur)
    # caras: solo cuenta si falta 1 s seguido o más (el detector falla en algún fotograma suelto)
    run = []
    for t in sin_cara + [1e9]:
        if run and t - run[-1] > 0.51:
            if run[-1] - run[0] >= 1.0: al.append((run[0], 'REVISAR', 'cara no detectada', f'de {fmt(run[0])} a {fmt(run[-1])}: ¿algo tapa la cara?'))
            run = []
        run.append(t)
    al.sort()
    graves = [x for x in al if x[1] == 'GRAVE']

    L = [f'# Revisión automática: {os.path.basename(a.video)}', '',
         f'Duración {dur:.1f} s · volumen {lufs if lufs is not None else "?"} LUFS · pico {peak if peak is not None else "?"} dBFS · '
         f'{len(cuts)} trozos', '', f'**Alertas: {len(graves)} graves, {len(al) - len(graves)} para revisar.**', '']
    for t, g, k, d in al:
        L.append(f'- [{fmt(t)}] **{g}** · {k} · {d}' + (f' · fuente {src(t):.2f} s' if cuts else ''))
    L += ['', '## Transcripción completa (tiempo del vídeo; entre paréntesis, probabilidad de las palabras dudosas)', '']
    L += frases(full, src if cuts else None)
    L += ['', '## Transcripción por ventanas de 6 s (oye los tropiezos que la completa esconde)', '']
    for wv in [x for x in wins if x['win'] >= 6]:
        L.append(f'- [{fmt(wv["t0"])}-{fmt(wv["t1"])}] ' + ' '.join(w['w'] + (f'({w["p"]:.2f})' if w['p'] < 0.6 else '') for w in wv['words']))
    if bounds:
        L += ['', '## Cortes (lo que se oye justo antes | justo después)', '']
        for k, b in enumerate(bounds):
            bef = ' '.join(w['w'] for w in full if b - 2.5 <= w['s'] < b); aft = ' '.join(w['w'] for w in full if b <= w['s'] < b + 2.5)
            L.append(f'- corte {k + 1} en {fmt(b)} (fuente {cuts[k]["end"]:.2f} → {cuts[k + 1]["start"]:.2f}): "{bef}" | "{aft}"')
    L += ['', '## Imágenes', '', f'- portada: {outdir}/portada.jpg'] + [f'- {p}' for p in hojas] + [f'- {p}' for p in cortes]
    open(f'{outdir}/informe.md', 'w').write('\n'.join(L) + '\n')
    print('\n'.join(L[:8 + len(al)]))
    print(f'\nInforme completo: {outdir}/informe.md')
    sys.exit(1 if graves else 0)


if __name__ == '__main__':
    main()
