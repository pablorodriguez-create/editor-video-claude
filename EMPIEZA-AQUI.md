# Editor de vídeo con Claude: empieza aquí

## Qué es

Una carpeta lista para editar tus vídeos con Claude Code. Le dices a Claude qué quieres y él corta, subtitula, anima, renderiza y revisa el vídeo antes de dártelo.

Funciona con lo que ya grabas:
- Reels y Stories hablando a cámara.
- Clips verticales de un podcast o una entrevista.
- Vídeos de YouTube con cámara y grabación de pantalla.
- Anuncios cortos.
- Miniaturas de YouTube.

## Qué hace

- **Corta por el audio:** transcribe frase a frase, se queda con la última toma buena y quita titubeos, muletillas y frases a medias. Ningún corte parte una palabra.
- **Revisa antes de renderizar:** un script escucha el montaje y avisa de tropiezos, palabras repetidas o cortes bruscos.
- **Pone tu marca:** subtítulos, rótulos, animaciones y llamadas a la acción con tus colores, tus tipografías y tu logo.
- **Revisa antes de entregarte nada:** un agente supervisor mira y escucha el vídeo terminado como un espectador exigente. Si encuentra un fallo, se corrige y se vuelve a revisar.
- **Deja el sonido a -14 LUFS**, el volumen estándar de las redes.

## Requisitos

- **Mac con chip Apple (M1 o posterior), recomendado.** La transcripción usa Whisper con MLX, que solo funciona en esos Mac. En otros ordenadores, Remotion funciona, pero tendrías que cambiar la transcripción por otra (pídeselo a Claude).
- **Claude Code**, en la app de escritorio de Claude (pestaña Code), con un plan de pago.
- **Node 20 o superior.** Descárgalo de nodejs.org (versión LTS).
- **Python 3.** En Mac suele venir instalado. Compruébalo en Terminal con `python3 --version`.
- Unos 5 GB libres: dependencias, el modelo de Whisper (se descarga la primera vez) y tus renders.

## Instalación

1. **Descomprime** el zip donde quieras tenerlo, por ejemplo en tu carpeta de usuario: `~/editor-video-claude`.
2. **Abre la carpeta en Claude Code:** app de Claude, pestaña Code, elige la carpeta `editor-video-claude`.
3. **Pega este primer mensaje** tal cual:

```
Hola. Esta carpeta es un editor de vídeo con Remotion y scripts de Python. Lee CLAUDE.md y EMPIEZA-AQUI.md y haz la primera sesión:

1. Instálalo todo:
   - npm install
   - crea el entorno de Python con: python3 -m venv .venv && .venv/bin/pip install mlx-whisper==0.4.3 opencv-python-headless==5.0.0.93 imageio-ffmpeg==0.6.0 numpy==2.0.2
   - comprueba que compila con npx tsc --noEmit y dime si algo falla.
2. Después, entrevístame para personalizarlo. Hazme las preguntas de una en una:
   - mi marca: nombre, colores, tipografías y logo (te digo dónde está o te paso mi web);
   - mi voz y mi tono, y lo que nunca diría;
   - qué cifras o resultados reales se pueden enseñar;
   - qué vídeos hago y en qué formatos;
   - dónde guardo mis grabaciones y dónde quiero recibir los vídeos terminados.
3. Con mis respuestas, rellena "MI MARCA" y "MI VOZ Y MIS REGLAS" en CLAUDE.md, cambia src/brand/tokens.ts, fonts.ts y marca.ts, y ábreme Remotion Studio con BrandReel y KitDemo para ver cómo queda.
```

4. Claude te pedirá permiso para ejecutar comandos. Acepta los de instalación. La primera vez tarda unos minutos.

## El flujo de trabajo típico

1. **Grabación.** Graba como siempre. Deja el archivo en tu carpeta de grabaciones (o en `public/<proyecto>/`) y díselo a Claude: "Edita `entrevista-03.mp4` y saca 3 Reels".
2. **Cortes.** Claude transcribe frase a frase, elige las mejores tomas y te propone el montaje. Puedes pedir cambios con tus palabras: "quita la parte del principio", "empieza en la pregunta del precio".
3. **check_cuts.** Antes de renderizar, Claude pasa `scripts/check_cuts.py`. Si hay una alerta grave, escucha el tramo y lo corrige.
4. **Render.** El vídeo se renderiza en `out/`. Si quieres verlo antes, pide una vista previa en Remotion Studio.
5. **Supervisor.** El agente `supervisor-contenido` revisa el vídeo terminado. Si dice NO APROBADO, Claude corrige y vuelve a renderizar.
6. **Entrega.** Solo con APROBADO, el vídeo se copia a tu carpeta de entrega con un nombre claro.

Frases que funcionan:
- "Edita este vídeo como Reel con subtítulos."
- "Haz la versión con animaciones, sin texto encima."
- "Saca los 5 mejores momentos de esta entrevista."
- "Monta el vídeo de YouTube con la grabación de pantalla."
- "Hazme 3 miniaturas para este vídeo."
- "Revisa este vídeo antes de que lo publique."

## Qué puedes hacer sin ninguna herramienta externa

Con lo obligatorio (Claude Code, Node y Python) ya puedes:
- Cortar y montar tus grabaciones sin titubeos.
- Subtitular con tu marca.
- Añadir animaciones del kit: gráficas, billetes, iconos, logos oficiales, notificaciones, calendario, botón de reserva, barra de progreso.
- Montar vídeos horizontales con cámara y pantalla, con difuminado de datos privados.
- Normalizar el volumen y añadir efectos de sonido propios.
- Revisar cada vídeo con el supervisor.
- Hacer miniaturas con Remotion.

Las herramientas opcionales (YouArt para imágenes con IA, Claude in Chrome, Google Drive…) están en `HERRAMIENTAS-Y-CONEXIONES.md`. Puedes empezar sin ninguna.

## Dónde está cada cosa

| Carpeta o archivo | Qué es |
|---|---|
| `CLAUDE.md` | Las normas del proyecto y tu marca y tu voz (se rellena en la primera sesión) |
| `src/brand/` | Tu kit de marca: colores, tipografías, logo, animaciones base |
| `src/components/` | Subtítulos, animaciones y plantillas de vídeo reutilizables |
| `src/videos/` | Tus vídeos (cada uno es una composición de Remotion) |
| `scripts/` | Transcripción, cortes, revisión, volumen, render por tramos |
| `.claude/skills/editor-videos/` | El método de edición que sigue Claude |
| `.claude/agents/` | El supervisor de contenido y el diseñador de miniaturas |
| `ejemplos/` | Un generador de ejemplo (Reel sencillo) para que Claude lo adapte |
| `public/` | Logos oficiales, sonidos y grano de cine. Tus grabaciones y recursos van aquí, en una carpeta por proyecto |
| `out/` | Renders (se crea sola) |

## Licencia de Remotion

Remotion es gratis para particulares y empresas pequeñas. Las empresas más grandes necesitan una licencia de empresa. Compruébalo en remotion.dev/license antes de usarlo en tu negocio.

## Si algo falla

- **"command not found: npm"**: falta Node. Instálalo desde nodejs.org y abre una sesión nueva.
- **Error al instalar mlx-whisper**: tu Mac no tiene chip Apple o Python es muy antiguo. Pídele a Claude que te ayude con otra opción.
- **La primera transcripción tarda mucho**: está descargando el modelo de Whisper (una sola vez).
- **Un render se cae a mitad**: pide a Claude que lo lance por la cola (`scripts/pesado.sh`) y sin otra tarea pesada a la vez.
- Para cualquier otra cosa, cuéntaselo a Claude con tus palabras y pégale el error.
