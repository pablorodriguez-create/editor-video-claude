# Vídeos horizontales (YouTube): cámara y pantalla

Componentes en `src/components/yt/` (`YtLayout.tsx`, `YtGraphics.tsx`).

## Encuadre que funciona

- Partes habladas: la cámara a pantalla completa, alternando encuadre normal y algo más cerrado en cada corte para disimular el salto.
- Partes con pantalla o gráfico: la pantalla ocupa el 70 % a la izquierda (`ContentCard`) y la cámara el 30 % a la derecha (`CamPip`), a toda altura, con la cara centrada y poco aire sobre la cabeza. Márgenes de 36 px. Detrás va la propia cámara desenfocada, nunca negro (`CamBase`).
- La pantalla se ve **entera**: si se estira para rellenar, se cortan los laterales. La tarjeta toma la proporción de la pantalla.
- Ajusta `FACE` (recorte de la cara para el panel) y `CROP` (área de trabajo de la herramienta) a tus grabaciones.

## Datos privados en la pantalla

- Recorta al área de trabajo de la herramienta: fuera pestañas, marcadores y barras laterales con cuentas.
- Difumina (`blur`) precios internos, datos de clientes y conversaciones privadas. Tapa en blanco (`cover`) los avisos del sistema.
- Paneles que aparecen y desaparecen: difuminados por tiempo (`blurT`, `coverT`), con las ventanas medidas en la propia grabación (`scripts/detectar_pantalla.py`).

## Cámara y pantalla de la misma sesión

Si la pantalla graba el audio del micro, mide el desfase con la envolvente del audio en tres puntos (principio, mitad y final). Así la pantalla salta en cada corte de la voz y siempre coincide con lo que se dice.

## Retención en el primer minuto

Un cambio visual cada 2-4 s:
- Titular grande con la promesa y la palabra clave en recuadro (`HookTitle`, la palabra entre asteriscos).
- Gráficos que cuentan lo que se dice: herramientas tachadas con contador (`AppsGraphic`), opciones descartadas (`RejectGraphic`), lista de lo que vas a saber al final (`ChecklistGraphic`).
- Montaje rápido de la herramienta en acción, con una etiqueta por cada cosa que se nombra (`ScreenLabel`).
- Rótulo con el nombre al presentarse (`NameLowerThird`) y botón de suscripción al principio y al final (`SubscribeButton`).

## Gráficos

Todo cabe dentro de la tarjeta (1290x1008) sin tocar los bordes. Los rótulos repiten lo que dice la voz: si dice "hasta un 45 %", el rótulo dice "Hasta 45 %". Si la voz no numera las partes, van iconos, no 1-2-3.

## Exportar para YouTube

- YouTube da su códec básico a los vídeos subidos en 1080p y la imagen se ensucia. Subido en 4K usa VP9/AV1 y se ve mejor, incluso en 1080p.
- Entrega la versión 4K: `scripts/pesado.sh yt-4k scripts/exportar_youtube_4k.sh out/<vídeo>.mp4 "<carpeta de entrega>/<título> (4K).mp4"` (limpieza suave de ruido, escalado lanczos y HEVC con el chip del Mac).
- Sin grano de película (`FilmLook`) en YouTube: la compresión lo convierte en ruido.
- Subtítulos para YouTube, si los quieres: `scripts/srt_desde_video.py out/<vídeo>.mp4 data/<proyecto>/subtitulos.srt`.
