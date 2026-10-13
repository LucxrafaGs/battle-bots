"""Robô de batalha ESP32 — ESP32 DevKit (BLE) + 2 drivers Pololu G2 18v17 + ESC.

Fonte: "Robo_ESP32_Esquema_Visual_2.pdf" e "RoboCombateESP32.ino" de Lucas Rafael.
Ligações:
  LiPo 3S → fusível F1 → link removível → VBAT+ protegido → LM2596 IN+, VIN dos
  dois G2 e + do ESC. LM2596 ajustado em 5,0 V → 5V/VIN do ESP32 (100–470 µF).
  G2 esquerdo: PWM=GPIO25, DIR=GPIO26, FLT=GPIO32 · G2 direito: PWM=GPIO27,
  DIR=GPIO14, FLT=GPIO33. PWM com pull-down 10k ao GND, FLT com pull-up 10k ao 3V3.
  470–1000 µF / 25 V no VIN de cada G2. ESC: sinal=GPIO18 com pull-down 10k,
  BEC isolado. GPIO23 = saída extra opcional (código). Todos os GND no mesmo nó.
"""
from kit import *

W, H = 2400, 1760
ID = 'esp32'
TITLE = 'Robô de batalha — ESP32'

NETS = [
    ('vbat', 'VBAT+ protegido', '#ef3535', 7, 'LiPo 3S → fusível F1 → link removível → LM2596, VIN dos dois drivers G2 e + do ESC.'),
    ('gnd', 'GND comum', '#8b949e', 7, 'Todos os GND são o mesmo nó: bateria, LM2596, ESP32, drivers G2 e ESC.'),
    ('v5', '5 V (LM2596)', '#4ade80', 4.5, 'Saída do LM2596 ajustada em 5,0 V → pino 5V/VIN do ESP32. Meça antes de ligar.'),
    ('v33', '3V3 do ESP32', '#2dd4bf', 3, 'Saída 3,3 V do ESP32, usada só para os pull-ups de 10k dos pinos FLT.'),
    ('fltl', 'GPIO32 ← FLT esquerdo', '#c084fc', 3.5, 'Falha do driver esquerdo (ativo em LOW). Pull-up 10k ao 3V3. O código trava tudo em falha.'),
    ('dirl', 'GPIO26 → DIR esquerdo', '#22d3ee', 3.5, 'Sentido do motor esquerdo.'),
    ('pwml', 'GPIO25 → PWM esquerdo', '#3b82f6', 3.5, 'Velocidade do motor esquerdo, PWM 20 kHz. Pull-down 10k: motor parado enquanto o ESP32 inicia.'),
    ('fltr', 'GPIO33 ← FLT direito', '#e879f9', 3.5, 'Falha do driver direito (ativo em LOW). Pull-up 10k ao 3V3.'),
    ('dirr', 'GPIO14 → DIR direito', '#e5e5e5', 3.5, 'Sentido do motor direito.'),
    ('pwmr', 'GPIO27 → PWM direito', '#ff8a3d', 3.5, 'Velocidade do motor direito, PWM 20 kHz. Pull-down 10k.'),
    ('esc', 'GPIO18 → sinal do ESC', '#f472b6', 3.5, 'Pulso de servo 50 Hz, 1000–2000 µs, em 3,3 V. Pull-down 10k. O ESC precisa aceitar 3,3 V.'),
    ('ml', 'Motor esquerdo (OUTA/OUTB)', '#a3e635', 4.5, 'Saídas do G2 esquerdo para o motor DC.'),
    ('mr', 'Motor direito (OUTA/OUTB)', '#fbbf24', 4.5, 'Saídas do G2 direito para o motor DC.'),
    ('ph', 'Fases do brushless', '#c08457', 5, 'Três fases do motor da arma; trocar duas inverte o giro.'),
]
NC = {n[0]: n[2] for n in NETS}
NW = {n[0]: n[3] for n in NETS}


# ------------------------------------------------------------------ peças desta prancha
def gnd_glyph(x, y, net='gnd'):
    c = NC['gnd']
    return (f'<g data-net="{net}">' + L(x, y, x, y + 12, c, 2.4) + L(x - 14, y + 12, x + 14, y + 12, c, 2.4) +
            L(x - 9, y + 18, x + 9, y + 18, c, 2.4) + L(x - 4, y + 24, x + 4, y + 24, c, 2.4) + '</g>')


def small_res(x, y0, y1, label):
    """Resistor vertical pequeno entre (x,y0) e (x,y1)."""
    m = (y0 + y1) / 2
    return (L(x, y0, x, m - 15, '#bdbdbd', 2.4) + L(x, m + 15, x, y1, '#bdbdbd', 2.4) +
            R(x - 8, m - 15, 16, 30, '#d8c7a0', '#8b7752', 1.2, 6) +
            R(x - 8, m - 9, 16, 4, '#6b3f1d') + R(x - 8, m - 3, 16, 4, '#111') + R(x - 8, m + 3, 16, 4, '#e67e22') +
            T(x + 14, m + 5, label, 12, C['txt'], weight=700))


def ecap(x, y, label, sub='', vertical=True):
    """Capacitor eletrolítico (vista de cima)."""
    return (Ci(x, y, 22, '#1d2a44', '#7aa2e6', 2) + f'<path d="M{x - 22},{y} A22 22 0 0 1 {x - 8},{y - 20.5} L{x - 8},{y + 20.5} A22 22 0 0 1 {x - 22},{y}" fill="#c9d6ee"/>' +
            T(x + 32, y - 2, label, 12, C['txt'], weight=700) + (T(x + 32, y + 15, sub, 11, C['mut'], weight=500) if sub else ''))


def fuse(x0, x1, y):
    return (R(x0, y - 18, x1 - x0, 36, '#2a0f0f', '#e05252', 2, 18) + L(x0 + 14, y, x1 - 14, y, '#f2c4c4', 2) +
            T((x0 + x1) / 2, y - 30, 'FUSÍVEL F1', 12, C['txt'], 'middle', 800, ls=0.08) +
            T((x0 + x1) / 2, y + 40, 'proteção da bateria', 11, C['mut'], 'middle', 500))


def lm2596(x, y):
    """Módulo LM2596 (280 × 260). IN+ / IN− no topo, OUT+ / OUT− à direita."""
    s = [R(x, y, 280, 260, '#0e2340', '#3f86d8', 2.2, 12)]
    s.append(R(x + 30, y + 90, 110, 80, '#2b2f36', '#555', 1.4, 8) + T(x + 85, y + 136, 'indutor', 11, '#aab', 'middle', 600))
    s.append(Ci(x + 200, y + 120, 30, '#1b1b1b', '#6b6b6b', 2) + Ci(x + 200, y + 120, 10, '#333'))
    s.append(R(x + 40, y + 190, 50, 22, '#3b5c9e', '#9fb7e6', 1.2, 4) + T(x + 65, y + 228, 'trimpot', 10, '#9fb7e6', 'middle', 600))
    s.append(T(x + 140, y + 52, 'LM2596', 24, '#e2ebff', 'middle', 800, DISP, 0.05))
    s.append(T(x + 140, y + 72, 'ajustar a saída para 5,0 V', 12, '#8fb0f5', 'middle', 600))
    pins = {'IN+': (x + 60, y), 'IN-': (x + 140, y), 'OUT+': (x + 280, y + 80), 'OUT-': (x + 280, y + 180)}
    s.append(T(x + 60, y + 22, 'IN+', 12, '#e2ebff', 'middle', 700, MONO) + T(x + 140, y + 22, 'IN−', 12, '#e2ebff', 'middle', 700, MONO))
    s.append(T(x + 268, y + 84, 'OUT+', 12, '#e2ebff', 'end', 700, MONO) + T(x + 268, y + 184, 'OUT−', 12, '#e2ebff', 'end', 700, MONO))
    for p in pins.values():
        s.append(Ci(p[0], p[1], 7, GOLD, '#2b2410', 1.6))
    return '\n'.join(s), pins


ESP_L = [('5V/VIN', 1060), ('GND', 1140)]
ESP_R = [('GPIO32', 600), ('GPIO26', 650), ('GPIO25', 700), ('GPIO33', 750), ('GPIO14', 800), ('GPIO27', 850),
         ('GPIO18', 1000), ('GPIO23', 1060), ('3V3', 1140)]


def esp32(x, y, w=360, h=740):
    s = [R(x, y, w, h, '#0c2421', '#1f9d86', 2.2, 12)]
    s.append(R(x + 90, y + 60, 180, 240, '#c7cdd2', '#8a9399', 1.4, 6))
    s.append(R(x + 90, y + 60, 180, 70, '#d6b85a', '#8a7428', 1.4, 6))
    s.append(f'<path d="M{x + 110} {y + 110} h22 v-28 h20 v28 h20 v-28 h20 v28 h40" fill="none" stroke="#3a3008" stroke-width="3"/>')
    s.append(T(x + 180, y + 200, 'ESP32', 26, '#1f2a30', 'middle', 800, DISP, 0.04))
    s.append(T(x + 180, y + 224, 'WROOM', 14, '#3a4650', 'middle', 700))
    s.append(T(x + 180, y + 360, 'ESP32 DEVKIT', 24, '#d9fff6', 'middle', 800, DISP, 0.06))
    s.append(T(x + 180, y + 384, 'Bluetooth BLE integrado', 13, '#7fd3c2', 'middle', 600))
    s.append(T(x + 180, y + 404, 'lógica 3,3 V · GPIO não tolera 5 V', 12, C['org'], 'middle', 600))
    s.append(R(x + 140, y + h - 34, 80, 40, '#9a9a9a', '#cfcfcf', 1.4, 6) + T(x + 180, y + h + 26, 'USB: desconectado ao usar 5V/VIN', 11, C['mut'], 'middle', 600))
    pins = {}
    for nm, py in ESP_L:
        s.append(pad(x, py) + T(x + 18, py + 5, nm, 13, '#d9fff6', weight=700, font=MONO))
        pins[nm] = (x, py)
    for nm, py in ESP_R:
        used = nm != 'GPIO23'
        s.append(pad(x + w, py) + T(x + w - 18, py + 5, nm, 13, '#d9fff6' if used else '#4f7c7c', 'end', 700 if used else 500, MONO))
        pins[nm] = (x + w, py)
    s.append(T(x + w - 18, 1060 + 20, 'extra (opcional)', 10, '#4f7c7c', 'end', 600))
    return '\n'.join(s), pins


def g2(x, y, name):
    """Driver Pololu G2 18v17 (400 × 300)."""
    s = [R(x, y, 400, 300, '#13301a', '#3fae5a', 2.2, 12)]
    s.append(R(x + 150, y + 120, 120, 60, '#1b1f22', '#555', 1.2, 6) + T(x + 210, y + 156, 'MOSFETs', 12, '#c8d1cc', 'middle', 700))
    s.append(R(x + 290, y + 110, 60, 80, '#c7cdd2', '#8a9399', 1.2, 8))
    s.append(T(x + 200, y + 56, 'G2 18v17', 24, '#e2f7e8', 'middle', 800, DISP, 0.05))
    s.append(T(x + 200, y + 78, f'driver {name} · 6,5–30 V', 12, '#8fd0a1', 'middle', 600))
    pins = {'VIN': (x + 100, y), 'FLT': (x, y + 90), 'DIR': (x, y + 150), 'PWM': (x, y + 210),
            'OUTA': (x + 400, y + 100), 'OUTB': (x + 400, y + 200), 'GND': (x + 400, y + 280)}
    s.append(T(x + 100, y + 22, 'VIN', 12, '#e2f7e8', 'middle', 700, MONO))
    for k in ('FLT', 'DIR', 'PWM'):
        s.append(T(x + 18, pins[k][1] + 5, k, 13, '#e2f7e8', weight=700, font=MONO))
    for k in ('OUTA', 'OUTB', 'GND'):
        s.append(T(x + 382, pins[k][1] + 5, k, 13, '#e2f7e8', 'end', 700, MONO))
    for p in pins.values():
        s.append(Ci(p[0], p[1], 7, GOLD, '#2b2410', 1.6))
    return '\n'.join(s), pins


def dc_motor(x, y, name):
    s = [R(x, y, 330, 200, '#1c1c1c', '#8a8a8a', 2, 14), R(x + 330, y + 70, 30, 60, '#bdbdbd', '#777', 1.2, 4)]
    for k in range(4):
        s.append(L(x + 70 + k * 60, y + 16, x + 70 + k * 60, y + 184, '#2b2b2b', 3))
    s.append(R(x - 24, y + 40, 24, 120, '#e3c552', '#7a6411', 1.4, 6))
    s.append(T(x + 165, y + 96, 'MOTOR DC', 22, C['txt'], 'middle', 800, DISP, 0.05))
    s.append(T(x + 165, y + 120, name, 13, C['mut'], 'middle', 600))
    return '\n'.join(s), {'A': (x - 24, y + 70), 'B': (x - 24, y + 130)}


def esc_cable_left(x, y, w=160, h=260):
    """ESC vertical com o cabo de sinal à esquerda e alimentação à direita."""
    s = [R(x, y, w, h, '#2a2406', '#e6c21d', 2.2, 12)]
    s.append(R(x + 18, y + 54, w - 36, h - 108, 'none', '#e6c21d', 1, 6, ' opacity="0.45"'))
    s.append(T(x + w / 2 - 8, y + h / 2 + 8, 'ESC', 26, '#fff3c2', 'middle', 800, DISP, 0.04, rot=-90))
    s.append(T(x + w / 2 + 24, y + h / 2 + 8, 'brushless', 12, '#c9b46b', 'middle', 600, rot=-90))
    s.append(R(x + 6, y + 6, 46, 26, '#141414', '#666', 1, 3) + T(x + 29, y + 46, 'sinal', 10, '#cfcfcf', 'middle', 600))
    s.append(T(x + 100, y + 24, '+', 15, '#fff', 'middle', 800, MONO) + T(x + 130, y + 24, '−', 15, '#fff', 'middle', 800, MONO))
    pins = {'S': (x + 20, y), 'c+': (x + 35, y), '+': (x + 100, y), '-': (x + 130, y),
            'A': (x + 40, y + h), 'B': (x + 80, y + h), 'C': (x + 120, y + h)}
    px = x + 35
    s.append(L(px - 6, y - 8, px + 6, y + 4, C['org'], 3) + L(px - 6, y + 4, px + 6, y - 8, C['org'], 3))
    for k in ('A', 'B', 'C'):
        s.append(T(pins[k][0], y + h - 14, k, 13, '#e8c1a0', 'middle', 800, MONO))
    return '\n'.join(s), pins


def v33_tag(x, y):
    return f'<g data-net="v33">' + R(x - 24, y - 12, 48, 24, C['bg'], NC['v33'], 1.6, 12) + T(x, y + 5, '3V3', 12, NC['v33'], 'middle', 800, MONO) + '</g>'


# ------------------------------------------------------------------ prancha
def build(mini=False):
    body = [] if mini else [grid(W, H)]
    parts, wires, dots, labels = [], [], [], []

    def wire(net, pts, w=None):
        wires.append(Wire(net, pts, NC[net], w or NW[net]))

    parts.append(part('bateria', ['vbat', 'gnd'], battery(60, 200, 300, 200, 'LiPo 3S', ('11,1 V · 12,6 V cheia',)), 'Bateria LiPo 3S'))
    parts.append(part('fusivel', ['vbat'], fuse(420, 540, 250), 'Fusível F1'))
    parts.append(part('chave', ['vbat'], switch(600, 250, 700, 'LINK REMOVÍVEL', 'corte geral'), 'Link removível'))
    ls, LP = lm2596(80, 560)
    parts.append(part('lm2596', ['vbat', 'gnd', 'v5'], ls, 'Regulador LM2596'))
    es, EP = esp32(620, 520)
    parts.append(part('esp32', ['v5', 'gnd', 'v33', 'fltl', 'dirl', 'pwml', 'fltr', 'dirr', 'pwmr', 'esc'], es, 'ESP32 DevKit'))
    gl, GL = g2(1320, 380, 'esquerdo')
    gr, GR = g2(1320, 820, 'direito')
    parts.append(part('g2-l', ['vbat', 'gnd', 'fltl', 'dirl', 'pwml', 'ml'], gl, 'Driver G2 esquerdo'))
    parts.append(part('g2-r', ['vbat', 'gnd', 'fltr', 'dirr', 'pwmr', 'mr'], gr, 'Driver G2 direito'))
    ml, MLP = dc_motor(1960, 380, 'roda esquerda')
    mr, MRP = dc_motor(1960, 820, 'roda direita')
    parts.append(part('motor-l', ['ml'], ml, 'Motor esquerdo'))
    parts.append(part('motor-r', ['mr'], mr, 'Motor direito'))
    xs, XP = esc_cable_left(1360, 1260)
    parts.append(part('esc', ['vbat', 'gnd', 'esc', 'ph'], xs, 'ESC brushless'))
    leads = [(1560, 1550), (1560, 1580), (1560, 1610)]
    parts.append(part('brushless', ['ph'], brushless(1650, 1580, 62, leads, 'BRUSHLESS', 'arma · opcional'), 'Motor brushless'))

    # VBAT+ protegido
    wire('vbat', [(360, 250), (420, 250)])
    wire('vbat', [(540, 250), (610, 250)])
    wire('vbat', [(690, 250), (2340, 250), (2340, 1200), (1460, 1200), (1460, 1260)])
    wire('vbat', [(740, 250), (740, 480), (140, 480), (140, 560)])
    wire('vbat', [(1420, 250), (1420, 380)])
    wire('vbat', [(1880, 250), (1880, 780), (1420, 780), (1420, 820)])
    dots += [(740, 250, 'vbat', NC['vbat']), (1420, 250, 'vbat', NC['vbat']), (1880, 250, 'vbat', NC['vbat'])]

    # GND comum
    wire('gnd', [(360, 350), (400, 350), (400, 1700), (1800, 1700), (1800, 660), (1720, 660)])
    wire('gnd', [(220, 560), (220, 520), (400, 520)], 4)
    wire('gnd', [(360, 740), (400, 740)], 4)
    wire('gnd', [(620, 1140), (560, 1140), (560, 1700)], 4)
    wire('gnd', [(1720, 1100), (1800, 1100)])
    wire('gnd', [(1800, 1230), (1490, 1230), (1490, 1260)])
    dots += [(400, 520, 'gnd', NC['gnd']), (400, 740, 'gnd', NC['gnd']), (560, 1700, 'gnd', NC['gnd']),
             (1800, 1100, 'gnd', NC['gnd']), (1800, 1230, 'gnd', NC['gnd'])]

    # 5 V
    wire('v5', [(360, 640), (500, 640), (500, 1060), (620, 1060)])
    wire('v5', [(500, 900), (472, 900)], 3)
    wire('gnd', [(428, 900), (400, 900)], 3)
    dots += [(500, 900, 'v5', NC['v5']), (400, 900, 'gnd', NC['gnd'])]
    parts.append(part('c1', ['v5', 'gnd'], ecap(450, 900, '', '') + T(450, 948, 'C1 100–470 µF', 11, C['txt'], 'middle', 700) +
                      T(450, 964, '10 V', 11, C['mut'], 'middle', 500), 'C1'))

    # 3V3 do ESP32
    wire('v33', [(980, 1140), (1000, 1140)], 3)
    labels.append(v33_tag(1028, 1140))

    # sinais (pinos agrupados como na prancha original)
    wire('fltl', [(980, 600), (1100, 600), (1100, 470), (1320, 470)])
    wire('dirl', [(980, 650), (1140, 650), (1140, 530), (1320, 530)])
    wire('pwml', [(980, 700), (1180, 700), (1180, 590), (1320, 590)])
    wire('fltr', [(980, 750), (1180, 750), (1180, 910), (1320, 910)])
    wire('dirr', [(980, 800), (1140, 800), (1140, 970), (1320, 970)])
    wire('pwmr', [(980, 850), (1100, 850), (1100, 1030), (1320, 1030)])
    # pull-ups (FLT) e pull-downs (PWM)
    for net, y, up in (('fltl', 470, True), ('pwml', 590, False), ('fltr', 910, True), ('pwmr', 1030, False)):
        dots.append((1262, y, net, NC[net]))
        if up:
            labels.append(f'<g data-net="{net}">' + small_res(1262, y - 62, y, '10k') + '</g>' + v33_tag(1262, y - 76))
        else:
            labels.append(f'<g data-net="{net}">' + small_res(1262, y, y + 56, '10k') + '</g>' + gnd_glyph(1262, y + 56))
    # capacitores dos drivers (entre VIN e GND, junto ao driver)
    parts.append(part('c2', ['vbat', 'gnd'], ecap(1520, 320, 'C2 470–1000 µF · 25 V', 'entre VIN e GND'), 'C2'))
    parts.append(part('c3', ['vbat', 'gnd'], ecap(1560, 735, 'C3 470–1000 µF · 25 V', 'entre VIN e GND'), 'C3'))

    # motores
    for (net, P, M) in (('ml', GL, MLP), ('mr', GR, MRP)):
        wire(net, [P['OUTA'], (1880 - 40, P['OUTA'][1]), (1880 - 40, M['A'][1]), M['A']])
        wire(net, [P['OUTB'], (1900, P['OUTB'][1]), (1900, M['B'][1]), M['B']])

    # ESC
    wire('esc', [(980, 1000), (1060, 1000), (1060, 1220), (1380, 1220), (1380, 1260)])
    dots.append((1250, 1220, 'esc', NC['esc']))
    labels.append(f'<g data-net="esc">' + small_res(1250, 1220, 1276, '') + '</g>' + gnd_glyph(1250, 1276) +
                  T(1232, 1258, '10k', 12, C['txt'], 'end', 700))
    for (lx, ly), px in zip(leads, (1400, 1440, 1480)):
        wire('ph', [(px, 1520), (px, ly), (lx, ly)])

    labels += [
        pill(1100, 250, 'VBAT+ protegido', NC['vbat'], 12, net='vbat'),
        pill(1100, 1700, 'GND comum (retorno de potência)', NC['gnd'], 12, net='gnd'),
        pill(500, 760 + 40, '5,0 V', NC['v5'], 12, net='v5'),
        pill(1720, 1200, 'VBAT → ESC +', NC['vbat'], 11, net='vbat'),
        pill(1150, 1220, 'GPIO18 → ESC', NC['esc'], 11, net='esc'),
    ]
    labels.append('<g data-part="esc" data-nets="esc">' + T(1550, 1290, 'BEC vermelho isolado', 11, C['org'], 'start', 700) +
                  T(1550, 1306, 'ESC deve aceitar 3,3 V', 11, C['mut'], 'start', 600) + '</g>')

    body.append('\n'.join(parts))
    body.append(render_wires(wires, dots, labels))
    if mini:
        return '\n'.join(body)

    body.append(header(780, 84, TITLE.upper(), 'Ligação física · Bluetooth BLE · drivers G2 18v17', 'BATTLE BOTS · ELÉTRICA'))
    body.append(legend(60, 1010 - 40, 320, [(n[0], n[1], n[2], min(n[3], 6)) for n in NETS]))
    body.append(note_box(1940, 1290, 410, 'NÃO ESQUEÇA', [
        'Medir 5,0 V no LM2596 antes',
        'de ligar o ESP32.',
        'Nunca VBAT ou 5 V nos GPIO.',
        'USB desconectado com 5V/VIN.',
    ], C['red']))
    return '\n'.join(body)


TABLE = [
    ('Bateria + (XT60)', 'Fusível F1', 'Protege a bateria contra curto', 'vbat', '14 AWG'),
    ('Fusível F1', 'Link removível', 'Corte geral do robô', 'vbat', '14 AWG'),
    ('Link removível', 'VBAT+ protegido', 'Barramento de potência', 'vbat', '14 AWG'),
    ('VBAT+', 'LM2596 · IN+', 'Entrada do regulador', 'vbat', '20–22 AWG'),
    ('VBAT+', 'G2 esquerdo · VIN', 'Potência do motor esquerdo', 'vbat', '14–16 AWG'),
    ('VBAT+', 'G2 direito · VIN', 'Potência do motor direito', 'vbat', '14–16 AWG'),
    ('VBAT+', 'ESC · +', 'Potência da arma', 'vbat', '14–16 AWG'),
    ('Bateria −', 'GND comum', 'Retorno de potência', 'gnd', '14 AWG'),
    ('LM2596 · OUT+', 'ESP32 · 5V/VIN', '5,0 V (medir antes)', 'v5', '22–24 AWG'),
    ('LM2596 · IN− / OUT−', 'GND comum', 'Negativo do regulador', 'gnd', '20–22 AWG'),
    ('C1 100–470 µF / 10 V', '5V ↔ GND', 'Estabiliza o 5 V do ESP32', 'v5', '—'),
    ('C2, C3 470–1000 µF / 25 V', 'VIN ↔ GND de cada G2', 'Absorve picos dos motores', 'vbat', '—'),
    ('ESP32 · GPIO25', 'G2 esquerdo · PWM', 'Velocidade (pull-down 10k)', 'pwml', 'Dupont'),
    ('ESP32 · GPIO26', 'G2 esquerdo · DIR', 'Sentido', 'dirl', 'Dupont'),
    ('G2 esquerdo · FLT', 'ESP32 · GPIO32', 'Falha (pull-up 10k ao 3V3)', 'fltl', 'Dupont'),
    ('ESP32 · GPIO27', 'G2 direito · PWM', 'Velocidade (pull-down 10k)', 'pwmr', 'Dupont'),
    ('ESP32 · GPIO14', 'G2 direito · DIR', 'Sentido', 'dirr', 'Dupont'),
    ('G2 direito · FLT', 'ESP32 · GPIO33', 'Falha (pull-up 10k ao 3V3)', 'fltr', 'Dupont'),
    ('ESP32 · 3V3', 'Pull-ups dos FLT', 'Referência 3,3 V', 'v33', 'Dupont'),
    ('ESP32 · GPIO18', 'ESC · sinal', '50 Hz, 3,3 V (pull-down 10k)', 'esc', 'cabo do ESC'),
    ('ESP32 · GND', 'GND comum', 'Referência da lógica', 'gnd', '22–24 AWG'),
    ('G2 esquerdo · OUTA / OUTB', 'Motor esquerdo', 'Tração esquerda', 'ml', '16–18 AWG'),
    ('G2 direito · OUTA / OUTB', 'Motor direito', 'Tração direita', 'mr', '16–18 AWG'),
    ('ESC · A / B / C', 'Brushless', 'Trocar 2 fases inverte o giro', 'ph', '16–18 AWG'),
]

STEPS = [
    ('Proteção e potência', {'vbat', 'gnd', 'bateria', 'fusivel', 'chave'}, [
        'Bateria → fusível F1 → link removível → VBAT+ protegido.',
        'Negativo da bateria no barramento de GND comum.',
        'Teste: link fora = 0 V no barramento.',
    ]),
    ('Regulador 5 V', {'vbat', 'gnd', 'v5', 'lm2596', 'c1'}, [
        'VBAT+ no IN+ e GND no IN− do LM2596.',
        'Gire o trimpot até medir 5,0 V em OUT+, SEM o ESP32 ligado.',
        'Só então: OUT+ no 5V/VIN do ESP32 e C1 entre 5 V e GND.',
    ]),
    ('Drivers e motores', {'vbat', 'gnd', 'ml', 'mr', 'g2-l', 'g2-r', 'motor-l', 'motor-r'}, [
        'VIN de cada G2 no VBAT+, GND no GND comum.',
        'C2/C3 de 470–1000 µF / 25 V perto do VIN.',
        'OUTA/OUTB de cada driver no seu motor DC.',
    ]),
    ('Sinais dos drivers', {'pwml', 'dirl', 'fltl', 'pwmr', 'dirr', 'fltr', 'v33', 'esp32', 'g2-l', 'g2-r'}, [
        'Esq.: GPIO25 PWM · GPIO26 DIR · GPIO32 FLT.',
        'Dir.: GPIO27 PWM · GPIO14 DIR · GPIO33 FLT.',
        'PWM com 10k ao GND; FLT com 10k ao 3V3.',
    ]),
    ('Arma', {'vbat', 'gnd', 'esc', 'ph', 'esp32', 'brushless'}, [
        'ESC: + no VBAT+, − no GND comum.',
        'Sinal no GPIO18 com 10k ao GND; vermelho (BEC) isolado.',
        'Confirme que o ESC aceita sinal de 3,3 V.',
    ]),
    ('Firmware e teste', {'esp32'}, [
        'Grave o RoboCombateESP32.ino (pacote ESP32 3.x).',
        'App BLE: “RoboCombateESP32”, comandos F/B/R/L/S/A/D/E/X/H.',
        'Comece com DRIVE_DUTY baixo e a arma desmontada.',
    ]),
]
