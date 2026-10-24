# Ejemplo de generador

`reel-simple/make_reel.py` monta un Reel a partir de una transcripción. Es el generador más sencillo y sirve de punto de partida para el primero.

No funciona tal cual: apunta a una grabación y a una transcripción que no vienen en el paquete. Pídele a Claude algo así:

> Mira `ejemplos/reel-simple/make_reel.py` y hazme un generador igual para mi vídeo, que está en `grabaciones/reel-01.mp4`.

Con cada vídeo nuevo (entrevistas, YouTube con pantalla, anuncios combinando ganchos y CTAs…), Claude crea su propio generador siguiendo las normas de `CLAUDE.md` y la skill `editor-videos`.

## Antes de usarlo

1. **Rutas.** Cambia las rutas a tus grabaciones. El script espera la raíz del proyecto como `ROOT` y tus archivos en `data/<proyecto>/` y `public/<proyecto>/`.
2. **Ubicación.** Cópialo a `scripts/` antes de ejecutarlo: importa `cutter.py` desde su misma carpeta.
3. **Colores.** Usa siempre los de `src/brand/tokens.ts`.
4. **Normas.** Pasa `scripts/check_cuts.py` antes de renderizar y el agente `supervisor-contenido` antes de entregar.
