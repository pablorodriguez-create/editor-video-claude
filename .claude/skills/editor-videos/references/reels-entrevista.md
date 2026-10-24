# Clips verticales de un podcast o entrevista (Reels)

Componentes en `src/components/`. Composiciones en `src/videos/<proyecto>/`, registradas en `src/Root.tsx`.

## Estructura que funciona

- La respuesta entera y natural, solo con la última toma buena y sin tropiezos.
- **Primeros 5 s:** la pregunta abajo, como subtítulo grande, con la palabra clave subrayada a mano (`QuestionCard`). Arriba, un dock de cristal con dos iconos de línea o logos oficiales (`ContextDock`, por ejemplo "Fama vs Dinero"). Solo la pregunta, sin título.
- Después, subtítulos de una línea (unos 30 caracteres como máximo) que se encienden con la voz (`CleanCaptions`), partidos en las pausas reales y en la puntuación. Ninguna página termina en "de", "que", "a"…
- Acabado de cine (`FilmLook`) y nada sobre la cara.

## Versión C (más animaciones)

Mismo audio y subtítulos que la A, más animaciones de apoyo **sin texto**: el texto ya va en los subtítulos. Las animaciones ilustran lo que se dice (`Broll`):
- `money` (billetes), `chart-up` y `chart-down` (gráficas),
- `li-profile` y `li-message` (perfil y chat de LinkedIn estilizados, sin datos reales),
- `network` (red de conexiones), `hearts` (corazones con Instagram),
- `ads-logos` (Google y Meta que se tragan billetes),
- `pair:instagram>linkedin` (gente que pasa de una red a otra),
- `icon:<línea>` e `icon:logo:<marca>`,
- `photo:<ruta>` y `video:<ruta>` (recursos propios o de YouArt).

Dirección de arte:
- Cada elemento entra barriendo desde la izquierda, con giro 3D y un pequeño rebote, flota y sale por la derecha.
- Golpes de zoom suaves (`punch.ts`) unos 10 fotogramas después de cada entrada.
- Todo va en la franja de arriba y al menos a 40 px del pelo.

Cada animación va anclada a una palabra: `(palabra, tiempo aprox., tipo[, duración máx. en s])`. Usa la duración máxima para que una animación salga antes de que se diga algo que la contradiga (los corazones de Instagram no pueden seguir en pantalla cuando se dice "en LinkedIn").

## Ajustes finos

- `PATCHES`: corrige los tiempos de las palabras donde la transcripción mezcla tomas, y añade una palabra que falta en los subtítulos.
- `fs` y `fe` por trozo: inicio y fin medidos con la energía del audio.
- `mute`: silencia un chasquido dentro de una pausa que se quiere conservar.
- `sigue=True`: los subtítulos empiezan en minúscula porque la frase viene de antes de la pregunta.

## Flujo por clip

1. Transcripción frase a frase y elección de la última toma buena.
2. Configuración, generador, `check_cuts.py`.
3. Render con `scripts/pesado.sh`, supervisor y, con APROBADO, a la carpeta de entrega.
4. Valida el primer clip con la persona antes de hacer el resto.
