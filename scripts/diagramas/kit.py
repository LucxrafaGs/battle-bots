"""Kit de desenho das pranchas elétricas do Battle Bots (SVG).

As pranchas são geradas por código para que todas as vistas usem
exatamente as mesmas ligações. Cada fio recebe `data-net` e cada peça
`data-part` + `data-nets`, o que permite ao site destacar uma ligação
ao passar o mouse.
"""
import html
import math

E = lambda s: html.escape(str(s), quote=True)

C = dict(
    bg='#0c0c0c', grid='#141414', grid2='#1b1b1b', frame='#2c2c2c', txt='#f2f2f2',
    mut='#9b9b9b', dim='#5f5f5f', org='#ff642f', red='#ef3535', panel='#111111',
)
FONT = "var(--f-body,'Helvetica Neue',Helvetica,Arial,sans-serif)"
MONO = "var(--f-code,'JetBrains Mono',Menlo,Consolas,monospace)"
DISP = "var(--f-display,'Arial Narrow','Helvetica Neue',Arial,sans-serif)"


def T(x, y, s, size=14, fill=None, anchor='start', weight=500, font=None, ls=None, rot=None, op=None, extra=''):
    st = f"font-family:{font}" if font else ''
    if ls is not None:
        st += f";letter-spacing:{ls}em"
    tr = f' transform="rotate({rot} {x} {y})"' if rot else ''
    o = f' opacity="{op}"' if op is not None else ''
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill or C["txt"]}" text-anchor="{anchor}" '
            f'font-weight="{weight}"{tr}{o} style="{st}"{extra}>{E(s)}</text>')


def R(x, y, w, h, fill='none', stroke=None, sw=1.5, rx=0, extra=''):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s}{extra}/>'


def L(x1, y1, x2, y2, stroke, sw=1.5, extra=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round"{extra}/>'


def Ci(cx, cy, r, fill='none', stroke=None, sw=1.5, extra=''):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"{s}{extra}/>'


def pill(x, y, s, color, size=13, anchor='middle', net=None, bg=None):
    """Etiqueta de fio (texto em cápsula)."""
    w = len(s) * size * 0.58 + 18
    x0 = x - w / 2 if anchor == 'middle' else x
    a = f' data-net="{net}"' if net else ''
    return (f'<g{a}>' + R(round(x0, 1), y - size * 0.95, round(w, 1), size * 1.9, bg or C['bg'], color, 1.4, size * 0.95)
            + T(round(x0 + w / 2, 1), y + size * 0.36, s, size, color, 'middle', 600) + '</g>')


# ------------------------------------------------------------------ fios
class Wire:
    def __init__(self, net, pts, color, w=4, dash=None):
        self.net, self.pts, self.color, self.w, self.dash = net, pts, color, w, dash


def _verticals(wires, net):
    out = []
    for wi in wires:
        if wi.net == net:
            continue
        for (x0, y0), (x1, y1) in zip(wi.pts[:-1], wi.pts[1:]):
            if x0 == x1 and y0 != y1:
                out.append((x0, min(y0, y1), max(y0, y1)))
    return out


def wire_path(pts, verts, rf=12, rh=8):
    """Caminho ortogonal com cantos arredondados e pontes nos cruzamentos."""
    n = len(pts)
    # pontos de entrada/saída de cada canto
    corner = {}
    for i in range(1, n - 1):
        (ax, ay), (bx, by), (cx, cy) = pts[i - 1], pts[i], pts[i + 1]
        l1 = math.hypot(bx - ax, by - ay)
        l2 = math.hypot(cx - bx, cy - by)
        r = min(rf, l1 / 2, l2 / 2)
        p_in = (bx - (bx - ax) / l1 * r, by - (by - ay) / l1 * r)
        p_out = (bx + (cx - bx) / l2 * r, by + (cy - by) / l2 * r)
        corner[i] = (p_in, p_out, r)
    f = lambda v: f'{round(v, 2):g}'
    d = f'M{f(pts[0][0])},{f(pts[0][1])}'
    for i in range(n - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        s0 = corner[i][2] if i in corner else 0
        s1 = corner[i + 1][2] if (i + 1) in corner else 0
        if y0 == y1 and x0 != x1:
            dr = 1 if x1 > x0 else -1
            lo, hi = min(x0, x1), max(x0, x1)
            cs = [vx for (vx, a, b) in verts if a < y0 < b and lo + rh + 3 + (s0 if dr > 0 else s1) < vx < hi - rh - 3 - (s1 if dr > 0 else s0)]
            cs = sorted(set(cs), key=lambda v: v * dr)
            for c in cs:
                d += f' L{f(c - dr * rh)},{f(y0)} A{rh},{rh} 0 0 {1 if dr > 0 else 0} {f(c + dr * rh)},{f(y0)}'
        if (i + 1) in corner:
            p_in, p_out, r = corner[i + 1]
            d += f' L{f(p_in[0])},{f(p_in[1])} Q{f(x1)},{f(y1)} {f(p_out[0])},{f(p_out[1])}'
        else:
            d += f' L{f(x1)},{f(y1)}'
    return d


def render_wires(wires, dots=(), labels=()):
    """dots: [(x, y, net, color)]  labels: [svg strings]"""
    out = []
    for wi in wires:
        d = wire_path(wi.pts, _verticals(wires, wi.net))
        dash = f' stroke-dasharray="{wi.dash}"' if wi.dash else ''
        out.append(
            f'<g data-net="{wi.net}">'
            f'<path d="{d}" fill="none" stroke="{C["bg"]}" stroke-width="{wi.w + 7}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{wi.color}" stroke-width="{wi.w}" stroke-linecap="round" stroke-linejoin="round"{dash}/>'
            '</g>'
        )
    for x, y, net, color in dots:
        out.append(f'<g data-net="{net}">' + Ci(x, y, 7.5, color, C['bg'], 2.5) + '</g>')
    out.extend(labels)
    return '\n'.join(out)


# ------------------------------------------------------------------ documento
def grid(w, h):
    s = [R(0, 0, w, h, C['bg'])]
    s.append(f'<defs><pattern id="g20" width="20" height="20" patternUnits="userSpaceOnUse">'
             f'<path d="M20 0H0V20" fill="none" stroke="{C["grid"]}" stroke-width="1"/></pattern>'
             f'<pattern id="g100" width="100" height="100" patternUnits="userSpaceOnUse">'
             f'<rect width="100" height="100" fill="url(#g20)"/>'
             f'<path d="M100 0H0V100" fill="none" stroke="{C["grid2"]}" stroke-width="1.2"/></pattern></defs>')
    s.append(R(0, 0, w, h, 'url(#g100)'))
    s.append(R(24, 24, w - 48, h - 48, 'none', C['frame'], 1.2))
    # marcas de coordenada na moldura
    for i, x in enumerate(range(24 + 200, w - 24, 200)):
        s.append(L(x, 24, x, 34, C['frame'], 1.2) + L(x, h - 34, x, h - 24, C['frame'], 1.2))
    for y in range(24 + 200, h - 24, 200):
        s.append(L(24, y, 34, y, C['frame'], 1.2) + L(w - 34, y, w - 24, y, C['frame'], 1.2))
    return '\n'.join(s)


def header(x, y, title, sub, kicker):
    return '\n'.join([
        T(x, y, kicker, 14, C['org'], weight=700, ls=0.14),
        T(x, y + 50, title, 44, C['txt'], weight=800, font=DISP, ls=0.01),
        T(x, y + 84, sub, 18, C['mut'], weight=500),
    ])


def stamp(x, y, w, lines):
    """Carimbo de prancha (canto inferior direito)."""
    h = 34 * len(lines) + 18
    s = [R(x, y, w, h, C['panel'], C['frame'], 1.2)]
    for i, (k, v) in enumerate(lines):
        yy = y + 32 + 34 * i
        if i:
            s.append(L(x, yy - 24, x + w, yy - 24, C['frame'], 1))
        s.append(T(x + 16, yy, k, 12, C['mut'], weight=600, ls=0.08))
        s.append(T(x + w - 16, yy, v, 14, C['txt'], 'end', 600))
    return '\n'.join(s)


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'style="font-family:{FONT}" role="img" aria-label="{E(title)}">\n<title>{E(title)}</title>\n{body}\n</svg>\n')


def part(pid, nets, body, label=None):
    a = f' data-part="{pid}" data-nets="{" ".join(nets)}"'
    lab = f' aria-label="{E(label)}"' if label else ''
    return f'<g{a}{lab}>{body}</g>'


# ------------------------------------------------------------------ peças (ilustração)
GOLD = '#c9a54a'


def pad(x, y, r=8.5):
    return Ci(x, y, r, GOLD, '#2b2410', 2) + Ci(x, y, r * 0.42, '#3a3115')


def l298n(x, y):
    """Módulo L298N vermelho (520 × 360). Retorna (svg, pinos)."""
    s = [R(x, y, 520, 360, '#1a0c0b', '#c8392e', 2.4, 14)]
    for hx, hy in ((x + 22, y + 22), (x + 498, y + 22), (x + 22, y + 338), (x + 498, y + 338)):
        s.append(Ci(hx, hy, 11, C['bg'], '#5c2a25', 2))
    # dissipador
    s.append(R(x + 150, y + 18, 220, 92, '#262626', '#4a4a4a', 1.5, 4))
    for i in range(10):
        s.append(L(x + 166 + i * 21, y + 26, x + 166 + i * 21, y + 102, '#3c3c3c', 3))
    s.append(R(x + 182, y + 110, 156, 30, '#101010', '#333', 1.2, 2))
    for i in range(15):
        s.append(L(x + 188 + i * 10, y + 140, x + 188 + i * 10, y + 156, '#8d8d8d', 2))
    s.append(T(x + 260, y + 130, 'L298N', 13, '#bdbdbd', 'middle', 700, MONO))
    # capacitores e regulador
    s.append(Ci(x + 110, y + 205, 24, '#1b1b1b', '#5d5d5d', 2) + Ci(x + 110, y + 205, 9, '#333'))
    s.append(Ci(x + 420, y + 215, 20, '#1b1b1b', '#5d5d5d', 2) + Ci(x + 420, y + 215, 7, '#333'))
    s.append(R(x + 330, y + 180, 50, 44, '#161616', '#555', 1.2, 3))
    s.append(T(x + 355, y + 240, '78M05', 11, C['mut'], 'middle', 600, MONO))
    s.append(T(x + 260, y + 205, 'PONTE H DUPLA', 15, '#f0c9c5', 'middle', 700, ls=0.12))
    s.append(T(x + 260, y + 226, '2 A por canal · 5–35 V', 13, '#b98d88', 'middle', 500))
    # bornes OUT1/OUT2 (esquerda) e OUT4/OUT3 (direita)
    for bx, names in ((x + 10, ('OUT1', 'OUT2')), (x + 456, ('OUT4', 'OUT3'))):
        s.append(R(bx, y + 92, 54, 156, '#1d5fa0', '#4b94e0', 1.6, 4))
        for j, yy in enumerate((y + 130, y + 210)):
            s.append(Ci(bx + 27, yy, 15, '#c9d6e3', '#2b4c6e', 2) + L(bx + 18, yy - 9, bx + 36, yy + 9, '#2b4c6e', 3))
            tx = bx - 8 if bx < x + 100 else bx + 62
            s.append(T(bx + 27, yy + 34 if j else yy - 22, names[j], 12, '#9ec7f2', 'middle', 700, MONO))
    # borne de alimentação 12V GND 5V
    s.append(R(x + 25, y + 268, 170, 72, '#1d5fa0', '#4b94e0', 1.6, 4))
    for j, (px, nm) in enumerate(((x + 50, '12V'), (x + 110, 'GND'), (x + 170, '5V'))):
        s.append(Ci(px, y + 304, 15, '#c9d6e3', '#2b4c6e', 2) + L(px - 9, y + 295, px + 9, y + 313, '#2b4c6e', 3))
        s.append(T(px, y + 260, nm, 13, '#ffd2cc', 'middle', 700, MONO))
        s.append(L(px, y + 340, px, y + 360, '#bdbdbd', 3))
    # jumper do regulador
    s.append(R(x + 215, y + 262, 34, 20, '#0d0d0d', '#777', 1) + R(x + 213, y + 260, 38, 24, '#2d2d2d', '#bbb', 1.4, 3))
    s.append(T(x + 232, y + 300, '5V-EN', 11, '#f6b6ad', 'middle', 700, MONO))
    s.append(T(x + 232, y + 314, 'jumper', 10, '#b98d88', 'middle', 500))
    # barra de pinos ENA IN1..IN4 ENB
    names = ('ENA', 'IN1', 'IN2', 'IN3', 'IN4', 'ENB')
    s.append(R(x + 252, y + 316, 236, 30, '#0f0f0f', '#444', 1.2, 3))
    for j, nm in enumerate(names):
        px = x + 270 + 40 * j
        s.append(R(px - 6, y + 325, 12, 12, '#d0d0d0'))
        if nm in ('ENA', 'ENB'):
            s.append(R(px - 6, y + 281, 12, 12, '#d0d0d0'))
            s.append(R(px - 10, y + 277, 20, 64, '#2b2b2b', '#cfcfcf', 1.4, 3))
            s.append(T(px, y + 270, nm, 11, '#ffd2cc', 'middle', 700, MONO))
        else:
            s.append(T(px, y + 306, nm, 13, '#ffd2cc', 'middle', 700, MONO))
            s.append(L(px, y + 346, px, y + 360, '#bdbdbd', 3))
    pins = {
        'OUT1': (x, y + 130), 'OUT2': (x, y + 210), 'OUT4': (x + 520, y + 130), 'OUT3': (x + 520, y + 210),
        '12V': (x + 50, y + 360), 'GND': (x + 110, y + 360), '5V': (x + 170, y + 360),
        'IN1': (x + 310, y + 360), 'IN2': (x + 350, y + 360), 'IN3': (x + 390, y + 360), 'IN4': (x + 430, y + 360),
    }
    # pernas dos bornes laterais até a borda
    for k in ('OUT1', 'OUT2'):
        s.append(L(x, pins[k][1], x + 10, pins[k][1], '#bdbdbd', 3))
    for k in ('OUT3', 'OUT4'):
        s.append(L(x + 510, pins[k][1], x + 520, pins[k][1], '#bdbdbd', 3))
    return '\n'.join(s), pins


def tt_motor(x, y, flip=False, name='MOTOR', sub=''):
    """Motor TT amarelo com redução (380 × 160). Terminais do lado oposto à caixa."""
    s = []
    if not flip:  # caixa à esquerda, motor e terminais à direita
        gx, mx, tx = x, x + 160, x + 380
    else:
        gx, mx, tx = x + 220, x, x
    s.append(R(gx, y, 160, 160, '#2d2608', '#e6c21d', 2, 10))
    s.append(R(gx + 14, y + 14, 132, 132, 'none', '#7d6a12', 1, 6))
    s.append(Ci(gx + 80, y + 80, 22, '#ecdfa6', '#7d6a12', 2) + R(gx + 72, y + 64, 16, 32, '#7d6a12', None, 0, 2))
    s.append(T(gx + 80, y + 140, '1:48', 12, '#e6c21d', 'middle', 700, MONO))
    s.append(R(mx, y + 22, 220, 116, '#252525', '#7a7a7a', 2, 14))
    for k in range(3):
        s.append(L(mx + 30 + k * 60, y + 30, mx + 30 + k * 60, y + 130, '#333', 2))
    s.append(L(mx + 10, y + 40, mx + 210, y + 40, '#3d3d3d', 6))
    for ty in (y + 40, y + 120):
        tx0 = tx - 10 if not flip else tx
        s.append(R(tx0, ty - 7, 10, 14, '#d9a066', '#7a4b1c', 1.2, 2))
    lx = x + 190
    s.append(T(lx, y + 196, name, 18, C['txt'], 'middle', 800, DISP, 0.04))
    if sub:
        s.append(T(lx, y + 220, sub, 13, C['mut'], 'middle'))
    if not flip:
        pins = {'+': (x + 390, y + 40), '-': (x + 390, y + 120)}
    else:
        pins = {'+': (x - 10, y + 40), '-': (x - 10, y + 120)}
    for p in pins.values():
        s.append(L(p[0], p[1], p[0] + (-10 if not flip else 10), p[1], '#d9a066', 3))
    return '\n'.join(s), pins


NANO_TOP = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND', 'RST', 'RX0', 'TX1']
NANO_BOT = ['D13', '3V3', 'REF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'RST', 'GND', 'VIN']


def nano(x, y, used=()):
    """Arduino Nano (680 × 240), USB à esquerda."""
    s = [R(x, y, 680, 240, '#0a1a1c', '#21a5a5', 2.2, 12)]
    s.append(R(x - 44, y + 82, 74, 76, '#9a9a9a', '#cfcfcf', 1.4, 6) + R(x - 34, y + 98, 40, 44, '#4a4a4a', None, 0, 3))
    s.append(f'<g transform="rotate(45 {x + 250} {y + 120})">' + R(x + 214, y + 84, 72, 72, '#121212', '#3a3a3a', 1.5, 4) + '</g>')
    s.append(R(x + 120, y + 100, 40, 40, '#1a1a1a', '#555', 1.2, 4) + Ci(x + 140, y + 120, 11, '#e8e2c2'))
    s.append(T(x + 470, y + 112, 'ARDUINO NANO', 24, '#dff7f7', 'middle', 800, DISP, 0.06))
    s.append(T(x + 470, y + 138, 'ATmega328P · 5 V · 16 MHz', 13, '#7fbcbc', 'middle', 500))
    pins = {}
    for i, nm in enumerate(NANO_TOP):
        px = x + 80 + 40 * i
        on = nm in used
        s.append(pad(px, y))
        s.append(T(px, y + 34, nm, 12, '#dff7f7' if on else '#4f7c7c', 'middle', 700 if on else 500, MONO))
        pins['T' + nm] = (px, y)
    for i, nm in enumerate(NANO_BOT):
        px = x + 80 + 40 * i
        on = ('B' + nm) in used
        s.append(pad(px, y + 240))
        s.append(T(px, y + 218, nm, 12, '#dff7f7' if on else '#4f7c7c', 'middle', 700 if on else 500, MONO))
        pins['B' + nm] = (px, y + 240)
    return '\n'.join(s), pins


def hc06(x, y):
    """Módulo Bluetooth HC-06 (320 × 230), pinos na borda esquerda."""
    s = [R(x, y, 320, 230, '#0a1430', '#3f74e6', 2.2, 10)]
    s.append(R(x + 60, y + 30, 170, 170, '#0f2c1e', '#2c8b55', 1.6, 6))
    s.append(R(x + 80, y + 60, 60, 60, '#101010', '#333', 1, 3) + R(x + 150, y + 60, 60, 60, '#101010', '#333', 1, 3))
    s.append(f'<path d="M{x + 250} {y + 40} h40 v24 h-28 v24 h28 v24 h-28 v24 h28 v24 h-40" fill="none" stroke="#2c8b55" stroke-width="4"/>')
    s.append(T(x + 145, y + 160, 'HC-06', 26, '#e2ebff', 'middle', 800, DISP, 0.06))
    s.append(T(x + 145, y + 182, 'Bluetooth · 9600 baud', 12, '#8fb0f5', 'middle', 500))
    pins = {}
    for i, nm in enumerate(('RXD', 'TXD', 'GND', 'VCC')):
        py = y + 40 + 50 * i
        s.append(R(x - 2, py - 7, 30, 14, GOLD, '#2b2410', 1.2, 2))
        s.append(T(x + 36, py + 5, nm, 13, '#e2ebff', weight=700, font=MONO))
        pins[nm] = (x, py)
    s.append(T(x + 36, y + 40 - 14, 'lógica 3,3 V', 10, C['org'], weight=600))
    return '\n'.join(s), pins


def resistor(x, y, vertical=False, value='1 kΩ', ref='R1', bands=('#6b3f1d', '#111', '#c0392b'), left=False):
    """Resistor de 80 px centrado em (x, y)."""
    if not vertical:
        s = [R(x - 34, y - 12, 68, 24, '#d8c7a0', '#8b7752', 1.4, 11)]
        for i, b in enumerate(bands + ('#c9a54a',)):
            s.append(R(x - 22 + i * 13 + (6 if i == 3 else 0), y - 12, 6, 24, b))
        s.append(T(x, y - 22, f'{ref} · {value}', 13, C['txt'], 'middle', 700))
    else:
        s = [R(x - 12, y - 34, 24, 68, '#d8c7a0', '#8b7752', 1.4, 11)]
        for i, b in enumerate(bands + ('#c9a54a',)):
            s.append(R(x - 12, y - 22 + i * 13 + (6 if i == 3 else 0), 24, 6, b))
        s.append(T(x - 22 if left else x + 22, y + 5, f'{ref} · {value}', 13, C['txt'], 'end' if left else 'start', 700))
    return '\n'.join(s)


def battery(x, y, w=300, h=220, title='LiPo 3S', lines=('11,1 V nominal', '12,6 V cheia · 2200 mAh')):
    s = [R(x, y, w, h, '#0a1622', '#2f8fdc', 2.2, 14)]
    for i in range(3):
        s.append(R(x + 20 + i * 30, y + 18, 22, 10, '#1f5f94', None, 0, 2))
    s.append(T(x + w - 20, y + 30, '3 células', 11, '#5f93c2', 'end', 600))
    s.append(T(x + w / 2, y + h / 2 - 8, title, 34, '#e4f1ff', 'middle', 800, DISP, 0.04))
    for i, ln in enumerate(lines):
        s.append(T(x + w / 2, y + h / 2 + 20 + 20 * i, ln, 14, '#9cc8f0', 'middle', 600))
    return '\n'.join(s)


def xt60(x, y, vertical=False):
    if vertical:
        return R(x - 18, y - 12, 36, 24, '#e9c12a', '#7a6411', 1.4, 4) + T(x, y + 5, 'XT60', 9, '#3a3008', 'middle', 800)
    return R(x - 12, y - 18, 24, 36, '#e9c12a', '#7a6411', 1.4, 4)


def switch(x0, y, x1, label='CHAVE GERAL', sub='ou link removível', vertical=False, left=False):
    """Chave liga/desliga entre (x0,y) e (x1,y) ou vertical entre (y=x0..x1 em x=y)."""
    if not vertical:
        s = [R(x0, y - 26, x1 - x0, 52, '#191919', '#9a9a9a', 1.6, 8)]
        s.append(Ci(x0 + 18, y, 5, '#ddd') + Ci(x1 - 18, y, 5, '#ddd'))
        s.append(L(x0 + 18, y, x1 - 24, y - 16, '#f2f2f2', 3.5))
        cx = (x0 + x1) / 2
        s.append(T(cx, y - 40, label, 12, C['txt'], 'middle', 800, ls=0.08))
        s.append(T(cx, y + 46, sub, 11, C['mut'], 'middle', 500))
    else:
        xx, y0, y1 = y, x0, x1
        s = [R(xx - 26, y0, 52, y1 - y0, '#191919', '#9a9a9a', 1.6, 8)]
        s.append(Ci(xx, y0 + 18, 5, '#ddd') + Ci(xx, y1 - 18, 5, '#ddd'))
        s.append(L(xx, y0 + 18, xx + 16, y1 - 24, '#f2f2f2', 3.5))
        tx, an = (xx - 40, 'end') if left else (xx + 40, 'start')
        s.append(T(tx, (y0 + y1) / 2 - 4, label, 12, C['txt'], an, 800, ls=0.08))
        s.append(T(tx, (y0 + y1) / 2 + 14, sub, 11, C['mut'], an, 500))
    return '\n'.join(s)


def esc_h(x, y, w=300, h=140, title='ESC 30A', sub='HW30A · BEC 5 V', stroke='#e6c21d', fill='#262006'):
    """ESC horizontal: fases à esquerda (A,B,C) e alimentação/sinal à direita."""
    s = [R(x, y, w, h, fill, stroke, 2.2, 12)]
    s.append(R(x + 50, y + 22, w - 100, h - 44, 'none', stroke, 1, 6, ' opacity="0.45"'))
    s.append(T(x + w / 2, y + h / 2 - 2, title, 28, '#fff3c2' if stroke == '#e6c21d' else '#ffffff', 'middle', 800, DISP, 0.04))
    s.append(T(x + w / 2, y + h / 2 + 22, sub, 13, '#c9b46b' if stroke == '#e6c21d' else '#d9d9d9', 'middle', 600))
    pins = {'A': (x, y + 30), 'B': (x, y + 70), 'C': (x, y + 110), 'SIG': (x + w, y + 30), '+': (x + w, y + 70), '-': (x + w, y + 110)}
    for k, (px, py) in pins.items():
        s.append(L(px, py, px + (-1 if px == x else 1) * 0, py, stroke, 1))
    for k in ('A', 'B', 'C'):
        s.append(T(x + 14, pins[k][1] + 5, k, 13, '#e8c1a0', weight=800, font=MONO))
    for k, nm in (('SIG', 'S'), ('+', '+'), ('-', '−')):
        s.append(T(x + w - 14, pins[k][1] + 5, nm, 14, '#ffffff', 'end', 800, MONO))
    return '\n'.join(s), pins


def esc_v(x, y, w=160, h=300, title='ESC 30A', sub='', stroke='#e6c21d', fill='#262006', cable=('-', '+', 'S')):
    """ESC vertical: alimentação + cabo de sinal no topo, fases embaixo."""
    s = [R(x, y, w, h, fill, stroke, 2.2, 12)]
    s.append(R(x + 18, y + 54, w - 36, h - 108, 'none', stroke, 1, 6, ' opacity="0.45"'))
    tc = '#fff3c2' if stroke == '#e6c21d' else '#ffffff'
    s.append(T(x + w / 2, y + h / 2 + 8, title, 26, tc, 'middle', 800, DISP, 0.04, rot=-90))
    if sub:
        s.append(T(x + w / 2 + 30, y + h / 2 + 8, sub, 12, '#c9b46b' if stroke == '#e6c21d' else '#d0d0d0', 'middle', 600, rot=-90))
    pins = {'+': (x + 30, y), '-': (x + 60, y), 'c-': (x + 100, y), 'c+': (x + 115, y), 'cS': (x + 130, y),
            'A': (x + 40, y + h), 'B': (x + 80, y + h), 'C': (x + 120, y + h)}
    s.append(T(x + 30, y + 24, '+', 15, '#fff', 'middle', 800, MONO) + T(x + 60, y + 24, '−', 15, '#fff', 'middle', 800, MONO))
    s.append(R(x + 92, y + 6, 46, 26, '#141414', '#666', 1, 3))
    s.append(T(x + 115, y + 46, 'sinal', 10, '#cfcfcf', 'middle', 600))
    for k in ('A', 'B', 'C'):
        s.append(T(pins[k][0], y + h - 14, k, 13, '#e8c1a0', 'middle', 800, MONO))
    return '\n'.join(s), pins


def brushless(cx, cy, r=95, leads=None, name='A2212 · 2200KV', sub='', bell='#b0302a'):
    """Motor brushless visto de cima. leads: lista de ((x,y) ponto da fase)."""
    s = []
    for (lx, ly) in (leads or []):
        # perna do motor até o ponto de ligação
        ang = math.atan2(ly - cy, lx - cx)
        ex, ey = cx + math.cos(ang) * r * 0.92, cy + math.sin(ang) * r * 0.92
        s.append(f'<path d="M{ex:.1f},{ey:.1f} L{lx},{ly}" stroke="#2a2a2a" stroke-width="9" stroke-linecap="round"/>')
        s.append(f'<path d="M{ex:.1f},{ey:.1f} L{lx},{ly}" stroke="#c08457" stroke-width="3" stroke-linecap="round"/>')
    s.append(Ci(cx, cy, r, '#1a1a1a', bell, 3))
    for k in range(6):
        a = math.radians(k * 60 + 15)
        s.append(f'<path d="M{cx + math.cos(a) * r * 0.3:.1f},{cy + math.sin(a) * r * 0.3:.1f} '
                 f'L{cx + math.cos(a) * r * 0.86:.1f},{cy + math.sin(a) * r * 0.86:.1f}" stroke="{bell}" stroke-width="{r * 0.2:.1f}" stroke-linecap="round" opacity="0.85"/>')
    s.append(Ci(cx, cy, r * 0.3, '#2a2a2a', '#777', 2) + Ci(cx, cy, r * 0.09, '#d9d9d9'))
    s.append(T(cx, cy + r + 30, name, 15, C['txt'], 'middle', 800))
    if sub:
        s.append(T(cx, cy + r + 50, sub, 12, C['mut'], 'middle', 500))
    return '\n'.join(s)


def receiver(x, y, used_groups=()):
    """Receptor FlySky FS-iA6B (500 × 260) com 7 grupos de 3 pinos na borda inferior."""
    s = [R(x, y, 500, 260, '#151515', '#a5a5a5', 2.2, 12)]
    s.append(L(x + 60, y, x + 30, y - 90, '#cfcfcf', 3) + L(x + 110, y, x + 140, y - 90, '#cfcfcf', 3))
    s.append(Ci(x + 30, y - 90, 4, '#cfcfcf') + Ci(x + 140, y - 90, 4, '#cfcfcf'))
    s.append(R(x + 24, y + 26, 200, 70, '#2a1414', '#d84a3a', 1.4, 6))
    s.append(T(x + 124, y + 70, 'FS-iA6B', 26, '#ffd9d3', 'middle', 800, DISP, 0.06))
    s.append(T(x + 250, y + 124, 'Receptor 6 canais · 2,4 GHz AFHDS 2A', 13, '#c0c0c0', 'middle', 600))
    s.append(T(x + 250, y + 144, 'alimentação 4,0–8,4 V', 12, C['mut'], 'middle', 500))
    pins = {}
    groups = ('CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6', 'B/VCC')
    for g, nm in enumerate(groups):
        gx = x + 40 + 60 * g
        on = nm in used_groups
        s.append(R(gx - 8, y + 196, 52, 52, '#0e0e0e', '#555' if not on else '#bdbdbd', 1.2, 4))
        s.append(T(gx + 18, y + 186, nm, 12, '#f2f2f2' if on else '#6b6b6b', 'middle', 700, MONO))
        for j, rn in enumerate(('-', '+', 'S')):
            px = gx + 18 * j
            s.append(R(px - 4, y + 232, 8, 28, '#d0d0d0' if on else '#5c5c5c'))
            pins[f'{nm}{rn}'] = (px, y + 260)
    s.append(T(x + 470, y + 236, '− + S', 11, C['mut'], 'end', 700, MONO))
    return '\n'.join(s), pins


def radio(x, y):
    s = [f'<path d="M{x + 20} {y + 40} q0 -30 30 -30 h120 q30 0 30 30 v120 q0 40 -40 40 h-100 q-40 0 -40 -40 z" fill="#161616" stroke="#a5a5a5" stroke-width="2"/>']
    s.append(Ci(x + 65, y + 90, 22, '#0e0e0e', '#666', 1.4) + Ci(x + 155, y + 90, 22, '#0e0e0e', '#666', 1.4))
    s.append(L(x + 65, y + 90, x + 65, y + 70, '#e6e6e6', 4) + L(x + 155, y + 90, x + 170, y + 80, '#e6e6e6', 4))
    s.append(R(x + 80, y + 130, 60, 30, '#0d1d10', '#2c8b55', 1, 3))
    s.append(L(x + 160, y + 10, x + 175, y - 60, '#cfcfcf', 4))
    s.append(T(x + 110, y + 232, 'FS-i6 (rádio)', 15, C['txt'], 'middle', 800))
    s.append(T(x + 110, y + 252, 'modo avião · mixagem Elevon', 12, C['mut'], 'middle', 500))
    return '\n'.join(s)


def phone(x, y):
    s = [R(x, y, 120, 220, '#121212', '#a5a5a5', 2, 18), R(x + 10, y + 26, 100, 160, '#0d1830', '#3f74e6', 1, 6)]
    s.append(Ci(x + 40, y + 120, 18, 'none', '#8fb0f5', 2) + Ci(x + 80, y + 120, 18, 'none', '#8fb0f5', 2))
    s.append(T(x + 60, y + 250, 'Celular', 15, C['txt'], 'middle', 800))
    s.append(T(x + 60, y + 270, 'app de controle BT', 12, C['mut'], 'middle', 500))
    return '\n'.join(s)


def legend(x, y, w, nets, title='CORES DOS FIOS'):
    s = [R(x, y, w, 56 + 32 * len(nets), C['panel'], C['frame'], 1.2, 8)]
    s.append(T(x + 18, y + 32, title, 12, C['mut'], weight=700, ls=0.12))
    for i, (nid, lab, col, wd) in enumerate(nets):
        yy = y + 64 + 32 * i
        s.append(f'<g data-net="{nid}">' + L(x + 20, yy - 5, x + 62, yy - 5, col, wd) + T(x + 76, yy, lab, 13, C['txt'], weight=600) + '</g>')
    return '\n'.join(s)


def note_box(x, y, w, title, lines, color=None, size=13, lh=21):
    color = color or C['org']
    h = 52 + lh * len(lines)
    s = [R(x, y, w, h, C['panel'], C['frame'], 1.2, 8), R(x, y, 4, h, color)]
    s.append(T(x + 20, y + 30, title, 12, color, weight=800, ls=0.12))
    for i, ln in enumerate(lines):
        s.append(T(x + 20, y + 56 + lh * i, ln, size, C['txt'] if not ln.startswith('·') else C['mut'], weight=500))
    return '\n'.join(s)


def dim_wrap(body, hl):
    """Envolve um desenho para o passo a passo: dimeriza o que não está em `hl`."""
    return body
