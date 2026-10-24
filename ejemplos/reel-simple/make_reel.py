# Genera src/videos/reels/Reel<V>.tsx a partir de la transcripción (Whisper, palabra a palabra) de public/reels/<V>.mp4.
# Cada corte (hook, 7 planos del desarrollo, CTA) es una TransitionSeries.Sequence con su vídeo y sus subtítulos inline.
import json, re, subprocess, sys
V = sys.argv[1]
ROOT = __file__.rsplit('/scripts/', 1)[0]
FPS = 30
meta = json.load(open(f'{ROOT}/data/meta.json'))[V]
r = json.load(open(f'{ROOT}/data/transcript-{V}.json'))
ws = [dict(w=w['word'].strip(), s=w['start'], e=w['end']) for s in r['segments'] for w in s['words'] if w['word'].strip()]
FIX = {'cloud': 'Claude', 'Cloud': 'Claude', 'ventas': 'VENTAS', 'Linkedin': 'LinkedIn', 'linkedin': 'LinkedIn'}
for i, w in enumerate(ws):
    base = re.sub(r'[.,?!]+$', '', w['w']); tail = w['w'][len(base):]
    if base in FIX: w['w'] = FIX[base] + tail
    if base == 'del' and i + 1 < len(ws) and ws[i + 1]['w'].startswith('envío'): w['w'] = 'te lo'
    if base == 'que' and i > 0 and ws[i - 1]['w'] == 'saber' and ws[i + 1]['w'].startswith('herramienta'): w['w'] = 'qué'
    if base == 'como' and i > 0 and ws[i - 1]['w'] == 'y' and ws[i + 1]['w'].startswith('utiliz'): w['w'] = 'cómo'
# frames totales del vídeo a 30 fps
probe = subprocess.run([__import__('imageio_ffmpeg').get_ffmpeg_exe(),
                        '-i', f'{ROOT}/public/reels/{V}.mp4'], capture_output=True, text=True).stderr
h, m, s = probe.split('Duration: ')[1].split(',')[0].split(':')
total = int((int(h) * 3600 + int(m) * 60 + float(s)) * FPS) - 1
H = meta['hook_len']; DEV = [4.38, 4.00, 3.68, 6.45, 3.12, 7.47, 6.82]
bounds = [0, H]
for d in DEV: bounds.append(bounds[-1] + d)
fb = [round(b * FPS) for b in bounds] + [total]
NAMES = ['Hook', 'Le puedes pedir cualquier cosa', 'Le pedimos leads nuevos', 'Busca en LinkedIn', 'Nos da los leads',
         'Enviarlos a campañas', 'La campaña automatiza', 'El agente responde', 'Cierre']
PUSH = [1.03, 1.08, 1.12, 1.12, 1.12, 1.1, 1.12, 1.12, 1.03]
# Etiqueta de cristal de cada paso de la demo (None = sin etiqueta)
CHIPS = [None, ('Le pides lo que necesitas', None), ('Le pides leads nuevos', None), ('Busca en LinkedIn', 'logos/linkedin-in-blue.png'),
         ('Leads listos', None), ('A campañas', None), ('Campaña automática', None), ('El agente responde', None), None]
GRADE = 'contrast(1.06) saturate(1.08) brightness(1.01)'
TOOLS = {'H1a': ['linkedin'], 'H1b': ['linkedin'], 'H4': ['linkedin'], 'H2': ['claude', 'linkedin'], 'H3a': ['claude', 'linkedin'], 'H3b': ['claude', 'linkedin']}[meta['hook']]
def word_frame(name):
    w = next(x for x in ws if x['w'].lower().startswith(name) and x['s'] < H)
    return max(6, round(w['s'] * FPS) - 2)
# Todos los logos del hook entran juntos en el primer frame.
tools = [{'tool': t, 'at': 0} for t in TOOLS]
teaser_from = round(next(x for x in ws if x['w'].startswith('herramienta') and x['s'] < H)['s'] * FPS)
teaser_src = round((H + 12.1) * FPS)
def caption_lines(t0, t1, ind):
    out = []
    for w in ws:
        mid = (w['s'] + w['e']) / 2
        if not (t0 <= mid < t1): continue
        brk = bool(re.search(r'[.,?!]$', w['w']))
        out.append(f'{ind}{{ text: {json.dumps(" " + w["w"], ensure_ascii=False)}, startMs: {round(w["s"] * 1000)}, endMs: {round(w["e"] * 1000)}, '
                   f'timestampMs: {round((w["s"] + w["e"]) * 500)}, confidence: null{", pageBreakAfter: true" if brk else ""} }},')
    return '\n'.join(out)
def scale_expr(k, comp, d):
    # Hook: zoom rápido de entrada (1,12 a 1 en 10 frames) y luego empuje lento. Resto: empuje lento.
    if k == 0:
        return (f'interpolate(frame, [{comp}, {comp + 10}, {comp + d}], [1.12, 1, {PUSH[k]}], {{\n'
                f'              extrapolateLeft: "clamp",\n              extrapolateRight: "clamp",\n'
                f'              easing: Easing.bezier(0.23, 1, 0.32, 1),\n            }})')
    return (f'interpolate(frame, [{comp}, {comp + d}], [1, {PUSH[k]}], {{\n'
            f'              extrapolateLeft: "clamp",\n              extrapolateRight: "clamp",\n'
            f'              easing: Easing.bezier(0.45, 0, 0.55, 1),\n            }})')
shots = []; comp = 0
for k in range(len(fb) - 1):
    a, b = fb[k], fb[k + 1]; d = b - a
    logos = ''
    if k == 0:
        tl = ', '.join(f'{{ tool: "{t["tool"]}", at: {t["at"]} }}' for t in tools)
        logos = (f'\n        <ToolLogos tools={{[{tl}]}} end={{{d}}} />'
                 f'\n        <TeaserCard src="reels/{V}.mp4" sourceFrom={{{teaser_src}}} from={{{teaser_from}}} to={{{d}}} />')
    elif CHIPS[k]:
        label, icon = CHIPS[k]
        logos = f'\n        <GlassChip label="{label}" from={{{a}}} to={{{b}}}' + (f' icon="{icon}"' if icon else '') + ' />'
    shots.append(f'''      <TransitionSeries.Sequence name="{NAMES[k]}" trimBefore={{{a}}} durationInFrames={{{d}}}>
        <Video
          name="{NAMES[k]} (vídeo)"
          src={{staticFile("reels/{V}.mp4")}}
          objectFit="cover"
          style={{{{
            width: "100%",
            height: "100%",
            transformOrigin: "50% 33%",
            filter: "{GRADE}",
            scale: {scale_expr(k, comp, d)},
          }}}}
        />{logos}
        <CleanCaptions
          name="{NAMES[k]} (subtítulos)"
          width={{900}}
          style={{{{ position: "absolute", bottom: {420 if k == 0 else 470}, translate: "90px 0px" }}}}{' fontSize={84}' if k == 0 else ''}
          captions={{[
{caption_lines(a / FPS, b / FPS, "            ")}
          ]}}
        />
      </TransitionSeries.Sequence>''')
    comp += d
src = f'''import {{ Video }} from "@remotion/media";
import {{ TransitionSeries }} from "@remotion/transitions";
import {{ AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame }} from "remotion";
import {{ CleanCaptions }} from "../../components/CleanCaptions";
import {{ GlassChip }} from "../../components/GlassChip";
import {{ TeaserCard }} from "../../components/TeaserCard";
import {{ ToolLogos }} from "../../components/ToolLogos";

// Reel {V}: hook {meta["hook"]} + desarrollo + CTA {meta["cta"]}. Generado con scripts/make_reel.py.
export const REEL_{V}_DURATION = {comp};

export const Reel{V}: React.FC = () => {{
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{{{ backgroundColor: "#000" }}}}>
      <TransitionSeries name="Reel {V}">
{chr(10).join(shots)}
      </TransitionSeries>
      <AbsoluteFill
        name="Viñeteado"
        style={{{{ pointerEvents: "none", background: "radial-gradient(120% 85% at 50% 42%, transparent 58%, rgba(0,0,0,.28) 100%)" }}}}
      />
    </AbsoluteFill>
  );
}};
'''
open(f'{ROOT}/src/videos/reels/Reel{V}.tsx', 'w').write(src)
print(V, 'frames', comp, 'logos', tools)
