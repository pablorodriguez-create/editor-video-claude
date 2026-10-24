# Saca los vídeos más vistos de canales de YouTube (orden "Popular" de la pestaña Vídeos) y descarga sus miniaturas.
# Uso: .venv/bin/python scripts/yt_populares.py <url_canal> [<url_canal>...]  →  data/miniaturas/referencias/<canal>/
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
N = 10

def get(url, data=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data else None,
                                 headers={'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Content-Type': 'application/json'})
    return urllib.request.urlopen(req, timeout=30).read()

def busca(o, clave):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == clave: yield v
            yield from busca(v, clave)
    elif isinstance(o, list):
        for v in o: yield from busca(v, clave)

def videos(o):
    out = []
    for r in busca(o, 'richItemRenderer'):
        v = next(busca(r, 'videoRenderer'), None)
        if v:   # formato clásico
            out.append(dict(id=v['videoId'], titulo=''.join(x['text'] for x in v['title']['runs']),
                            vistas=v.get('viewCountText', {}).get('simpleText', '')))
            continue
        lv = next(busca(r, 'lockupViewModel'), None)
        if lv:  # formato nuevo
            vid = lv.get('contentId'); meta = json.dumps(lv)
            t = next(busca(lv, 'title'), {}); titulo = t.get('content', '') if isinstance(t, dict) else ''
            vis = re.search(r'"content": "([\d.,KMB]+ views)"', meta)
            out.append(dict(id=vid, titulo=titulo, vistas=vis.group(1) if vis else ''))
    return out

for url in sys.argv[1:]:
    base = url.rstrip('/').split('?')[0]
    html = get(base + '/videos?hl=en').decode('utf-8', 'ignore')
    data = json.loads(re.search(r'var ytInitialData = (\{.*?\});</script>', html).group(1))
    key = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html).group(1)
    ver = re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"', html).group(1)
    nombre = next(busca(data, 'channelMetadataRenderer'))['title']
    token = None
    for chip in busca(data, 'chipViewModel'):
        if 'Popular' in json.dumps(chip):
            token = next(busca(chip, 'token'), None)
    if not token:
        for chip in busca(data, 'chipCloudChipRenderer'):
            if 'Popular' in json.dumps(chip.get('text', {})):
                token = next(busca(chip, 'token'), None)
    if token:
        r = json.loads(get(f'https://www.youtube.com/youtubei/v1/browse?key={key}',
                           {'context': {'client': {'clientName': 'WEB', 'clientVersion': ver, 'hl': 'en'}}, 'continuation': token}))
        vs = videos(r)
    else:
        vs = videos(data)
        print('  (sin orden Popular: se usan los últimos)', file=sys.stderr)
    vs = [v for v in vs if v['id']][:N]
    carpeta = re.sub(r'[^\w-]+', '-', nombre).strip('-').lower()
    d = f'{ROOT}/data/miniaturas/referencias/{carpeta}'; os.makedirs(d, exist_ok=True)
    for i, v in enumerate(vs, 1):
        for q in ('maxresdefault', 'hqdefault'):
            try:
                img = get(f'https://i.ytimg.com/vi/{v["id"]}/{q}.jpg')
                if len(img) > 5000:
                    open(f'{d}/{i:02d}-{v["id"]}.jpg', 'wb').write(img); break
            except Exception: pass
    json.dump(vs, open(f'{d}/videos.json', 'w'), ensure_ascii=False, indent=1)
    print(f'{nombre}: {len(vs)} vídeos')
    for i, v in enumerate(vs, 1): print(f'  {i:2d}. {v["vistas"]:>14}  {v["titulo"][:80]}')
