---
name: recursos-youart
description: Genera fotos y fragmentos de vídeo de apoyo (b-roll, fondos, planos de transición, recortes sin fondo) con el conector MCP de YouArt y los deja listos en public/ para usarlos en los vídeos de Remotion. Úsala cuando pidan "una imagen", "una foto", "un plano", "un fragmento de vídeo", "b-roll", "un recurso", "un fondo", "quítale el fondo" o "genera con YouArt" para un vídeo de este proyecto.
---

# Recursos con YouArt

YouArt es un conector MCP opcional (se conecta en Claude, no en este proyecto). Sirve para generar imágenes y clips cortos que acompañan a los vídeos. Nunca sustituye a la persona ni a sus grabaciones.

Si YouArt no está conectado, el editor funciona igual: se usan las animaciones del kit (`src/components/Broll.tsx`, `IconPop.tsx`, `LineIcon.tsx`) y los logos de `public/logos/`.

## Antes de generar

1. Comprueba que las herramientas de YouArt (`mcp__YouArt__...`) están en la sesión. Si no aparecen, dilo: hay que conectar YouArt en Claude y abrir una sesión nueva en esta carpeta. No intentes llamar a la API por otra vía.
2. La primera vez en la sesión, mira qué herramientas, modelos y créditos hay (`get_credit_balance`). No supongas nombres de herramientas.
3. **Coste:** cada generación gasta créditos. Usa el presupuesto por vídeo apuntado en `CLAUDE.md` (sección "MI MARCA"). Si no hay ninguno apuntado, pregunta antes de generar y apúntalo.
   - Apunta el saldo antes y después de cada vídeo.
   - Reutiliza lo genérico, que se guarda en `public/recursos/comun/`.
4. **Qué combinar:** fotos de objetos reales recortados (para animarlos en Remotion) y clips cortos de 2-3 s para insertos. Los modelos de vídeo tienen un mínimo de 3-4 s: se genera esa duración y se recorta en Remotion.

## Cómo funciona YouArt por dentro

- **No hay un "generar" directo.** Todo va en proyectos con un lienzo de nodos:
  1. `create_project` (tipo `workflow`) con un título claro, por ejemplo "Recursos · Reel 03".
  2. `add_nodes`: un nodo `Text` con el prompt y un nodo de modelo. Con varios nodos del mismo modelo, ponles `display_name`.
  3. `add_edges`: del `Text` al modelo.
  4. `run_project_workflow` con `scope='node_ids'` y un `idempotency_key` nuevo por cada tanda aprobada.
  5. `get_workflow_run` con `wait_seconds` (una espera larga, no sondeos cortos).
  6. `list_workflow_run_results`: URLs de los archivos. Descárgalos con `curl` a `public/recursos/<proyecto>/`.
- **Catálogo de nodos:** `download_project_canvas_schemas` da un JSON grande con todos los tipos y sus parámetros. Guárdalo en una carpeta temporal y consúltalo con Python. No lo metas entero en el contexto.
- **Ver el precio antes de pagar:** al lanzar un run, YouArt reserva el precio (`reserved_credits` en `get_credit_balance`). Si se pasa del presupuesto, `cancel_workflow_run` en ese momento y la reserva vuelve.
- **Cuidado con lanzar solo un nodo de abajo:** con `scope='node_ids'` y solo el nodo final (por ejemplo `RemoveBackground`), YouArt puede volver a generar el nodo de arriba y cobrarlo otra vez. Para no pagar dos veces, descarga el resultado y súbelo a un `LoadImage` (`create_asset_upload` + `set_upload_node_asset`), o encadena todo en el mismo run desde el principio.
- **Precio de cada modelo:** el catálogo no lo dice. Mira el saldo antes y después de la primera generación de cada modelo y apúntalo en la tabla de abajo. A partir de ahí, ya puedes dar el coste por adelantado.
- **Modelos útiles** (comprueba que siguen en el catálogo):
  - Imagen fotorrealista: `NanoBananaProGenerate`, `SeedreamV5Generate`, `MidjourneyV82Generate`.
  - Recorte de objetos para animarlos en Remotion: `RemoveBackground` (entrada IMAGE, salida PNG sin fondo).
  - Vídeo: `KlingV30VideoGenerate` (con `sound` desactivado), `Veo31VideoGenerate` (con `generate_audio=false`), `SeedancePro25VideoGenerate` (lleva audio: quítalo).
  - Pasar una imagen a vídeo: entrada `first_frame` de Kling, Veo o Seedance.
- **El lienzo** es opcional. Los resultados se entregan directamente (archivo y vista previa). Solo se abre el lienzo si te lo piden, con `create_editor_signin_url`.

### Coste medido por modelo (rellénalo con tus mediciones)

| Modelo | Ajustes | Créditos por resultado | Fecha |
|---|---|---|---|
| | | | |

## Cómo pedirlo bien

Escribe el prompt en inglés, como se lo describirías a un fotógrafo o a un operador de cámara:

- **Formato:** el mismo que el vídeo de destino. 9:16 para Reels, 4:5 para posts y 16:9 para YouTube.
- **Escena:** lugar, sujeto y acción concreta.
- **Plano y cámara:** plano cerrado o general, altura y movimiento. Para clips: travelling lento, cámara fija o cámara en mano suave.
- **Luz y color:** luz suave y natural. Si encaja, tonos cercanos a los colores de la marca (`src/brand/tokens.ts`).
- **Estilo:** realista y cinematográfico. Nada de aspecto 3D brillante, foto de stock genérica ni "IA" evidente.
- **Duración de los clips:** de 3 a 6 segundos.

Prohibido en lo generado:
- Texto, rótulos o letras dentro de la imagen. Los textos los pone Remotion con el kit de marca.
- Logos de marcas. Si hacen falta, se usan los oficiales de `public/logos/`.
- Personas que parezcan la persona del vídeo, clientes reales o famosos.
- Pantallas con datos, resultados, cifras o conversaciones inventadas que puedan pasar por reales.

## Dónde se guarda

- Descarga cada resultado a `public/recursos/<proyecto>/`, por ejemplo `public/recursos/reel-03/manos-portatil-01.mp4`. Nombres cortos, en minúsculas, sin espacios y numerados.
- Al lado, en `public/recursos/<proyecto>/prompts.md`, apunta el prompt, el modelo, el coste y la fecha de cada archivo.
- Comprueba que el archivo se abre: dimensiones, duración y que no está vacío (un fotograma con OpenCV desde `.venv`). Míralo antes de enseñarlo.

## Cómo se usa en el vídeo

- **Fotos de objetos recortados:** se piden sobre "plain seamless light grey studio background" y se pasan por `RemoveBackground` en el mismo run. Se animan con `Broll` y el tipo `photo:recursos/<proyecto>/<archivo>.png`.
- **Clips:** `Broll` con `video:<proyecto>/<archivo>` o `FullBroll` en vídeos horizontales. Siempre sin sonido.
- En los vídeos grabados, el recurso es apoyo: un plano de transición o un fondo desenfocado detrás de una tarjeta. Nunca tapa la cara ni corta una frase.
- Si no encaja con el tono del vídeo, no se usa. Mejor sin recurso que con uno que parezca de stock.
- Después, el flujo normal: `check_cuts.py`, render a `out/` y `supervisor-contenido` antes de entregar.
