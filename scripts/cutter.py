# Cortador genérico (misma lógica que duo_pieces, para cualquier grabación):
# - límites duros por palabras (nunca entra voz de la frase anterior ni de la siguiente),
# - el final de cada corte lo decide el audio (cuando termina la voz), nunca se corta una palabra,
# - los silencios internos de más de max_gap se recortan dejando `keep` a cada lado.
import json, wave
import numpy as np

class Cutter:
    def __init__(self, wav_path, transcript_path, max_gap=0.45, keep=0.12, head=0.15, tail=0.30, patches=()):
        w = wave.open(wav_path)
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        env = np.sqrt((a[: len(a) // 160 * 160].reshape(-1, 160) ** 2).mean(1))   # 100 Hz
        self.db = 20 * np.log10(env + 1e-9)
        self.thr = max(np.percentile(self.db, 97) - 32, np.percentile(self.db, 15) + 8)
        r = json.load(open(transcript_path))
        ws = [dict(s=x['start'], e=x['end'], w=x['word'].strip()) for seg in r['segments'] for x in seg['words'] if x['word'].strip()]
        # Correcciones de tiempos donde la transcripción general mezcla tomas: [((t0, t1), [(palabra, s, e), ...]), ...]
        for (p0, p1), new in patches:
            ws = [x for x in ws if not (p0 <= x['s'] < p1)] + [dict(w=t, s=s, e=e) for t, s, e in new]
        self.words = sorted(ws, key=lambda x: x['s'])
        self.max_gap, self.keep, self.head, self.tail = max_gap, keep, head, tail

    def voiced(self, t0, t1):
        seg = self.db[int(t0 * 100):int(t1 * 100)]
        on = seg > self.thr
        out = []; i = 0; n = len(on)
        while i < n:
            if on[i]:
                j = i
                while j < n and (on[j] or on[j:j + 12].any()): j += 1
                out.append((t0 + i / 100, t0 + j / 100)); i = j
            else: i += 1
        return [(a, b) for a, b in out if b - a >= 0.08]

    def pieces(self, c0, c1, fs=None, fe=None):
        W = [w for w in self.words if c0 - 0.05 <= w['s'] < c1]
        if not W: return [(c0, c1)]
        i0 = self.words.index(W[0]); i1 = self.words.index(W[-1])
        prev_end = self.words[i0 - 1]['e'] if i0 > 0 else W[0]['s'] - 1
        next_start = self.words[i1 + 1]['s'] if i1 + 1 < len(self.words) else W[-1]['e'] + 1
        lo = fs if fs is not None else max(W[0]['s'] - self.head, min(prev_end + 0.03, W[0]['s']))
        hard_hi = fe if fe is not None else next_start - 0.06
        isl = self.voiced(lo, hard_hi + 0.01)
        last_end = W[-1]['e']
        for a, b in isl:
            if a <= W[-1]['s'] + 0.05 and b > last_end: last_end = b
        hi = fe if fe is not None else min(last_end + self.tail, hard_hi)
        inner = [(max(a, lo), min(b, hi)) for a, b in isl if b > lo and a < hi]
        if not inner: return [(round(lo, 2), round(hi, 2))]
        out = [[lo, inner[0][1]]]
        for a, b in inner[1:]:
            if a - out[-1][1] > self.max_gap:
                out[-1][1] = min(out[-1][1] + self.keep, a)
                out.append([a - self.keep, b])
            else: out[-1][1] = b
        out[-1][1] = hi
        return [(round(a, 2), round(b, 2)) for a, b in out]

    def text(self, a, b):
        return ' '.join(w['w'] for w in self.words if w['s'] < b - 0.05 and w['e'] > a + 0.05)
