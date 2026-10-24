# Errores típicos y su arreglo

Cada punto salió de vídeos reales. Añade aquí los tuyos.

## Voz y cortes

- **Una palabra suelta de la toma descartada** en la unión ("correcta. Y… esa es la diferencia"). La unión tiene que caer donde la palabra va pegada a la siguiente en un solo golpe de voz. Escucha la unión en ventanas de 1-2 s.
- **La transcripción de corrido esconde tomas repetidas.** Transcribe siempre frase a frase.
- **Un "vale", un "eh" o un chasquido justo antes de la primera palabra de un trozo.** Mide la energía y empieza el corte en el silencio de después.
- **Cortes demasiado pegados** (menos de 0,1 s entre frases distintas): suenan atropellados. Deja unos 0,2-0,4 s.

## Subtítulos

- Una palabra que se oye y no se lee, o que se lee y no se oye (de una toma descartada), bloquea la entrega.
- Una página que empieza en mayúscula a mitad de frase: la frase viene de antes; usa minúscula o añade la palabra que falta.
- Los desfases de menos de 0,5 s y la paginación fina no suelen bloquear. Pregunta a la persona qué le importa más y apúntalo en `CLAUDE.md`.

## Animaciones e imagen

- **Emojis:** abaratan el vídeo. Siempre iconos de línea o logos oficiales.
- **Texto sobreimpreso en la versión con animaciones:** duplica los subtítulos. Solo animaciones.
- **Animaciones que contradicen la voz:** un logo de Instagram mientras se dice "LinkedIn". Usa la duración máxima para que salga antes.
- **Animaciones que se cortan al final del vídeo:** si la última no cabe, se queda fija hasta el último fotograma (`hold` en `Broll`).
- **Elementos pegados al pelo:** el mínimo es 40 px.
- **Clips generados con logos** (un portátil con una manzana, una pantalla con una forma de logo): revisa cada clip fotograma a fotograma y regenera si hace falta.
- **Gráficos que se salen de la tarjeta** al escalarlos: todo tiene que caber con margen.
- **Pantalla recortada por los lados** para rellenar: se ve entera.

## Operación

- **Un render que se cae por falta de memoria al coincidir con Whisper:** usa la cola `scripts/pesado.sh`.
- **Una espera con `pgrep` que se encuentra a sí misma:** nunca.
- **Render largo de una sola pasada que se cuelga a mitad:** por tramos con `scripts/render_tramos.sh`.
- **Audio desfasado en pistas pre-cortadas con `aselect`:** pierde medio fotograma en cada corte. Corta con `atrim` por trozo y `concat`.
- **Pistas viejas tras cambiar cortes:** vuelve a generar las pistas antes de renderizar o la pantalla y la voz no cuadran.
- **Prometer un tiempo y no avisar:** si algo se retrasa o falla, se dice en cuanto se sabe.
