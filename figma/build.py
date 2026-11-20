"""Bake optimised JPEGs into the plugin and emit a self-contained code.js."""
import base64
import io
import json
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, '..', 'public', 'media')
KEYS = {
    'hero': ('hero.webp', 1440),
    'lens': ('lens.webp', 1440),
    'street': ('street.webp', 1200),
    'hand': ('hand.webp', 1200),
    'plinth': ('plinth.webp', 1200),
}


def encode(name, width):
    im = Image.open(os.path.join(MEDIA, name)).convert('RGB')
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=78, optimize=True, progressive=True)
    data = buf.getvalue()
    print(f'  {name:12s} {im.width}x{im.height}  {len(data)/1024:6.1f} kB')
    return base64.b64encode(data).decode('ascii')


def main():
    print('encoding media')
    payload = {k: encode(v[0], v[1]) for k, v in KEYS.items()}
    src = open(os.path.join(HERE, 'code.src.js')).read()
    out = src.replace('__IMG__', json.dumps(payload))
    path = os.path.join(HERE, 'code.js')
    open(path, 'w').write(out)
    print(f'code.js  {len(out)/1024/1024:.2f} MB')


if __name__ == '__main__':
    main()
