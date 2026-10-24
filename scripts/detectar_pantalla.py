"""Tramos de la grabación de pantalla en los que se cumple una condición visual (para difuminados por tiempo).
Uso interno: detecta(desde, hasta, condicion) -> [(t0, t1), ...] en segundos de pantalla."""
import cv2

def detecta(src, t0, t1, cond, paso=1):
    v = cv2.VideoCapture(src); v.set(cv2.CAP_PROP_POS_MSEC, t0 * 1000)
    out, ini, n = [], None, 0
    while True:
        ok, im = v.read()
        if not ok: break
        t = v.get(cv2.CAP_PROP_POS_MSEC) / 1000
        if t > t1: break
        n += 1
        if n % paso: continue
        c = cond(im)
        if c and ini is None: ini = t
        if not c and ini is not None: out.append((round(ini, 2), round(t, 2))); ini = None
    if ini is not None: out.append((round(ini, 2), round(t1, 2)))
    return out
