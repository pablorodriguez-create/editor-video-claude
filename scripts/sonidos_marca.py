# Efectos de sonido propios (sintetizados aquí: sin licencias): sutiles, cortos y limpios.
# Idea: un sonido por idea, en el momento en que aterriza, muy por debajo de la voz.
#   pop    → el resultado (cifra destacada, botón de la llamada a la acción)
#   ding   → aparece una palabra clave o un logo
#   whoosh → entra un plano de apoyo o un pantallazo
#   golpe  → algo que se tacha o se descarta
# → public/sonidos/<nombre>.wav (48 kHz, mono)
import os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f'{ROOT}/public/sonidos'
SR = 48000
rng = np.random.default_rng(7)

def t(d): return np.arange(int(SR * d)) / SR

def env(n, a, d):   # ataque lineal y caída exponencial (segundos)
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)

def barrido(f0, f1, d):   # seno con frecuencia que baja/sube exponencialmente
    x = t(d); f = f0 * (f1 / f0) ** (x / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def paso_banda(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(X, len(x))

def guardar(nombre, x):
    x = x / np.abs(x).max() * 0.89
    fade = int(SR * 0.004); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(f'{OUT}/{nombre}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print('ok', nombre, f'{len(x) / SR:.2f} s')

os.makedirs(OUT, exist_ok=True)

d = 0.16   # pop: burbuja que baja de tono, con un clic suave delante
x = barrido(1100, 420, d) * env(int(SR * d), 0.003, 0.035)
clic = paso_banda(rng.normal(size=int(SR * d)), 2000, 6000) * env(int(SR * d), 0.0005, 0.004) * 0.25
guardar('pop', x + clic)

d = 0.9    # ding: campanita (parciales inarmónicos) con caída larga y suave
x = t(d)
x = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / dd) for f, a, dd in ((1568, 1, 0.32), (1568 * 2.76, 0.28, 0.12), (1568 * 5.4, 0.1, 0.05)))
guardar('ding', x * env(int(SR * d), 0.002, 10))

d = 0.42   # whoosh: ruido filtrado que sube y baja
n = int(SR * d); ruido = rng.normal(size=n); x = np.zeros(n)
for i, (lo, hi) in enumerate(((400, 1200), (800, 2400), (1500, 4500), (900, 2800))):
    seg = paso_banda(ruido, lo, hi); w_ = np.zeros(n)
    c = int(n * (i + 0.5) / 4); w_[max(0, c - n // 4):min(n, c + n // 4)] = np.hanning(len(w_[max(0, c - n // 4):min(n, c + n // 4)]))
    x += seg * w_
guardar('whoosh', x * np.sin(np.pi * np.arange(n) / n) ** 1.5)

d = 0.3    # golpe: grave que cae, con un transitorio corto
x = barrido(140, 55, d) * env(int(SR * d), 0.002, 0.07)
tr = paso_banda(rng.normal(size=int(SR * d)), 800, 4000) * env(int(SR * d), 0.0005, 0.008) * 0.35
guardar('golpe', x + tr)
