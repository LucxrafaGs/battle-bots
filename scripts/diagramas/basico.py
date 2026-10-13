"""Robô de batalha BÁSICO — Arduino Nano + L298N + HC-06 + arma (A2212 + ESC 30A).

Fonte: prancha original "Robô de batalha (básico)" de Lucas Rafael, 16/11/2023.
Ligações mantidas da prancha original:
  D9→IN1  D10→IN2  D11→IN3  D12→IN4 · OUT1/OUT2→Motor A · OUT3/OUT4→Motor B
  HC-06 TXD→D2 · D3→1 kΩ→HC-06 RXD, com 2 kΩ ao GND · HC-06 VCC←5V · D5→sinal do ESC
  Bateria 3S → L298N 12V/GND e ESC · GND comum com o Nano
Acréscimos da revisão B (marcados nas pranchas):
  chave geral no positivo · 5 V do L298N alimenta o Nano (a prancha não mostrava
  de onde vinha a alimentação do Nano) · fio vermelho (BEC) do ESC isolado.
"""
from kit import *

W, H = 2400, 1760
ID = 'basico'
TITLE = 'Robô de batalha — Básico'

NETS = [
    # id, rótulo, cor, largura, descrição
    ('vbat', '12 V da bateria (VBAT)', '#ef3535', 7, 'LiPo 3S → chave geral → L298N (12V) e ESC (+). 11,1 V nominal, 12,6 V com a bateria cheia.'),
    ('gnd', 'GND comum', '#8b949e', 7, 'Negativo da bateria ligado ao GND do L298N, do ESC, do Nano e do HC-06. Sem GND comum os sinais não funcionam.'),
    ('v5', '5 V da lógica', '#f472b6', 4, 'Regulador 78M05 do L298N (jumper 5V-EN fechado) → pino 5V do Nano → VCC do HC-06.'),
    ('in1', 'D9 → IN1', '#ff8a3d', 3.5, 'Motor A, sentido 1.'),
    ('in2', 'D10 → IN2', '#e5e5e5', 3.5, 'Motor A, sentido 2.'),
    ('in3', 'D11 → IN3', '#22d3ee', 3.5, 'Motor B, sentido 1.'),
    ('in4', 'D12 → IN4', '#3b82f6', 3.5, 'Motor B, sentido 2.'),
    ('ma', 'Motor A (OUT1/OUT2)', '#a3e635', 4.5, 'Roda esquerda. Se girar ao contrário, inverta os dois fios no borne.'),
    ('mb', 'Motor B (OUT3/OUT4)', '#facc15', 4.5, 'Roda direita. Se girar ao contrário, inverta os dois fios no borne.'),
    ('tx', 'HC-06 TXD → D2', '#e879f9', 3.5, 'Dados do Bluetooth para o Nano (3,3 V, o Nano lê sem problema). SoftwareSerial RX = D2.'),
    ('rx5', 'D3 → R1 (5 V)', '#34d399', 3.5, 'Saída serial do Nano (SoftwareSerial TX = D3), ainda em 5 V.'),
    ('rx33', 'Divisor → HC-06 RXD (3,3 V)', '#86efac', 3.5, 'Depois do divisor 1 kΩ / 2 kΩ: 5 V × 2/3 ≈ 3,3 V, seguro para o RXD do HC-06.'),
    ('pwm', 'D5 → sinal do ESC', '#c084fc', 3.5, 'Pulso de servo 50 Hz, 1000–2000 µs (biblioteca Servo). 1000 µs = arma parada.'),
    ('ph', 'Fases A/B/C do A2212', '#c08457', 5, 'Três fases do motor da arma. A ordem é livre: trocar quaisquer duas inverte o giro.'),
]
NC = {n[0]: n[2] for n in NETS}
NW = {n[0]: n[3] for n in NETS}


def build(mini=False):
    body = [] if mini else [grid(W, H)]
    parts = []
    wires = []
    dots = []
    labels = []

    def wire(net, pts, w=None, dash=None):
        wires.append(Wire(net, pts, NC[net], w or NW[net], dash))

    # ---------------- peças
    lsvg, LP = l298n(900, 200)
    parts.append(part('l298n', ['vbat', 'gnd', 'v5', 'in1', 'in2', 'in3', 'in4', 'ma', 'mb'], lsvg, 'Ponte H L298N'))
    ma, MA = tt_motor(400, 290, False, 'MOTOR A', 'TT amarelo 1:48 · roda esquerda')
    mb, MB = tt_motor(1540, 290, True, 'MOTOR B', 'TT amarelo 1:48 · roda direita')
    parts.append(part('motor-a', ['ma'], ma, 'Motor A'))
    parts.append(part('motor-b', ['mb'], mb, 'Motor B'))

    parts.append(part('bateria', ['vbat', 'gnd'],
                      battery(60, 640) +
                      T(210, 900, 'BATERIA', 18, C['txt'], 'middle', 800, DISP, 0.06) +
                      T(210, 922, 'LiPo 3S 2200 mAh · conector XT60', 13, C['mut'], 'middle'), 'Bateria LiPo 3S'))
    parts.append(part('chave', ['vbat'], switch(390, 690, 470) +
                      pill(430, 768, 'ACRÉSCIMO', C['org'], 11), 'Chave geral'))

    nsvg, NP = nano(680, 1000, used=('D12', 'D11', 'D10', 'D9', 'D5', 'D3', 'D2', 'GND', 'B5V', 'BGND'))
    parts.append(part('nano', ['v5', 'gnd', 'in1', 'in2', 'in3', 'in4', 'tx', 'rx5', 'pwm'], nsvg, 'Arduino Nano'))
    hsvg, HP = hc06(1640, 1000)
    parts.append(part('hc06', ['v5', 'gnd', 'tx', 'rx33'], hsvg, 'Bluetooth HC-06'))
    parts.append(part('r1', ['rx5', 'rx33'], resistor(1350, 925, False, '1 kΩ', 'R1', ('#6b3f1d', '#111', '#c0392b')), 'R1 1 kΩ'))
    parts.append(part('r2', ['rx33', 'gnd'], resistor(1585, 1090, True, '2 kΩ', 'R2', ('#c0392b', '#111', '#c0392b'), left=True), 'R2 2 kΩ'))

    esvg, EP = esc_h(1760, 1420, title='ESC 30A', sub='HW30A · arma')
    parts.append(part('esc', ['vbat', 'gnd', 'pwm', 'ph'], esvg, 'ESC 30A da arma'))
    leads = [(1680, 1450), (1680, 1490), (1680, 1530)]
    parts.append(part('a2212', ['ph'], brushless(1560, 1490, 92, leads, 'A2212 · 2200KV', 'motor da arma'), 'Motor brushless A2212'))

    # ---------------- fios: alimentação
    wire('vbat', [(360, 690), (390, 690)])
    wire('vbat', [(470, 690), (520, 690), (520, 600), (950, 600), (950, 560)])
    wire('vbat', [(520, 690), (520, 1700), (2120, 1700), (2120, 1490), (2060, 1490)])
    dots.append((520, 690, 'vbat', NC['vbat']))
    wire('gnd', [(360, 800), (560, 800), (560, 630), (1010, 630), (1010, 560)])
    wire('gnd', [(560, 800), (560, 1660), (2090, 1660), (2090, 1530), (2060, 1530)])
    wire('gnd', [(560, 1350), (1280, 1350), (1280, 1240)], 4)
    dots += [(560, 800, 'gnd', NC['gnd']), (560, 1350, 'gnd', NC['gnd'])]

    # 5 V
    wire('v5', [(1070, 560), (1070, 660), (610, 660), (610, 1300), (1200, 1300), (1200, 1240)])
    wire('v5', [(1200, 1300), (1600, 1300), (1600, 1190), (1640, 1190)])
    dots.append((1200, 1300, 'v5', NC['v5']))

    # motores TT
    wire('ma', [(790, 330), (900, 330)])
    wire('ma', [(790, 410), (900, 410)])
    wire('mb', [(1420, 330), (1530, 330)])
    wire('mb', [(1420, 410), (1530, 410)])

    # IN1..IN4 (cruzam por geometria das placas: IN1 é o pino mais à esquerda
    # do L298N e D9 o mais à direita dos quatro no Nano)
    wire('in1', [(1210, 560), (1210, 690), (880, 690), (880, 1000)])
    wire('in2', [(1250, 560), (1250, 730), (840, 730), (840, 1000)])
    wire('in3', [(1290, 560), (1290, 770), (800, 770), (800, 1000)])
    wire('in4', [(1330, 560), (1330, 810), (760, 810), (760, 1000)])

    # Bluetooth
    wire('rx5', [(1120, 1000), (1120, 925), (1316, 925)])
    wire('rx33', [(1384, 925), (1560, 925), (1560, 1040), (1640, 1040)])
    wire('rx33', [(1585, 1040), (1585, 1056)], 3.5)
    wire('gnd', [(1585, 1124), (1585, 1140)], 4)
    dots.append((1585, 1040, 'rx33', NC['rx33']))
    wire('tx', [(1640, 1090), (1620, 1090), (1620, 952), (1160, 952), (1160, 1000)])
    wire('gnd', [(1200, 1000), (1200, 975), (1440, 975), (1440, 1140), (1640, 1140)], 4)
    dots.append((1585, 1140, 'gnd', NC['gnd']))

    # arma
    wire('pwm', [(1040, 1000), (1040, 860), (2160, 860), (2160, 1450), (2060, 1450)])
    for (lx, ly), k in zip(leads, ('A', 'B', 'C')):
        wire('ph', [(lx, ly), (1760, ly)])

    # ---------------- etiquetas dos fios
    labels += [
        pill(760, 600, '12 V (VBAT)', NC['vbat'], 12, net='vbat'),
        pill(790, 630, 'GND', NC['gnd'], 12, net='gnd'),
        pill(820, 660, '5 V', NC['v5'], 12, net='v5'),
        pill(1060, 690, 'IN1 ← D9', NC['in1'], 12, net='in1'),
        pill(1060, 730, 'IN2 ← D10', NC['in2'], 12, net='in2'),
        pill(1060, 770, 'IN3 ← D11', NC['in3'], 12, net='in3'),
        pill(1060, 810, 'IN4 ← D12', NC['in4'], 12, net='in4'),
        pill(1780, 860, 'D5 → sinal ESC · 50 Hz', NC['pwm'], 12, net='pwm'),
        pill(1300, 1700, '12 V → ESC (+)', NC['vbat'], 12, net='vbat'),
        pill(1300, 1660, 'GND → ESC (−)', NC['gnd'], 12, net='gnd'),
        pill(1420, 1300, '5 V → HC-06', NC['v5'], 12, net='v5'),
        pill(845, 370, 'OUT1 / OUT2', NC['ma'], 11, net='ma'),
        pill(1475, 370, 'OUT4 / OUT3', NC['mb'], 11, net='mb'),
        pill(1720, 1590, 'fases A · B · C', NC['ph'], 11, net='ph'),
    ]
    # observação do cabo de sinal do ESC
    labels.append('<g data-part="esc" data-nets="pwm">' +
                  T(2196, 1418, 'cabo de sinal: só o', 12, C['mut'], 'start', 600) +
                  T(2196, 1436, 'laranja → D5; vermelho', 12, C['mut'], 'start', 600) +
                  T(2196, 1454, '(BEC) fica isolado', 12, C['org'], 'start', 700) + '</g>')

    body.append('\n'.join(parts))
    body.append(render_wires(wires, dots, labels))

    # ---------------- textos fixos
    if mini:
        return '\n'.join(body)
    body.append(header(70, 84, TITLE.upper(), 'Ligação física · controle Bluetooth · arma ativa', 'BATTLE BOTS · ELÉTRICA'))
    body.append(legend(60, 960, 420, [(n[0], n[1], n[2], min(n[3], 6)) for n in NETS]))
    body.append(note_box(1990, 200, 350, 'REVISÃO B', [
        'Acréscimos sobre a prancha',
        'original de 16/11/2023:',
        '+ chave geral no positivo',
        '+ 5 V do L298N → 5V do Nano',
        '+ BEC do ESC isolado',
        '· demais ligações iguais',
        '· ao desenho original',
    ]))
    body.append(note_box(1990, 415, 350, 'ANTES DE LIGAR', [
        'Jumpers ENA e ENB no lugar',
        '(velocidade máxima).',
        'Jumper 5V-EN fechado.',
        'Arma: ligar com o sinal em',
        '1000 µs (parada).',
    ], '#22d3ee'))
    body.append(stamp(1990, 588, 350, [
        ('PRANCHA', '01 · Ligação física'),
        ('PROJETO', 'Robô básico'),
        ('AUTOR', 'Lucas Rafael'),
        ('REVISÃO', 'B · 2026'),
    ]))
    return '\n'.join(body)


TABLE = [
    # de, para, função, rede, bitola
    ('Bateria + (XT60)', 'Chave geral', 'Liga e desliga todo o robô', 'vbat', '14 AWG'),
    ('Chave geral', 'L298N · 12V', 'Alimenta a ponte H dos motores TT', 'vbat', '18–20 AWG'),
    ('Chave geral', 'ESC · + (vermelho)', 'Alimenta a arma', 'vbat', '14–16 AWG'),
    ('Bateria −', 'L298N · GND', 'Negativo comum', 'gnd', '18–20 AWG'),
    ('Bateria −', 'ESC · − (preto)', 'Negativo da arma', 'gnd', '14–16 AWG'),
    ('L298N · GND', 'Nano · GND', 'Referência da lógica', 'gnd', '22–26 AWG'),
    ('L298N · 5V', 'Nano · 5V', 'Alimenta o Nano (jumper 5V-EN fechado)', 'v5', '22–26 AWG'),
    ('Nano · 5V', 'HC-06 · VCC', 'Alimenta o Bluetooth', 'v5', '22–26 AWG'),
    ('Nano · GND', 'HC-06 · GND', 'Negativo do Bluetooth', 'gnd', '22–26 AWG'),
    ('Nano · D9', 'L298N · IN1', 'Motor A, sentido 1', 'in1', 'Dupont'),
    ('Nano · D10', 'L298N · IN2', 'Motor A, sentido 2', 'in2', 'Dupont'),
    ('Nano · D11', 'L298N · IN3', 'Motor B, sentido 1', 'in3', 'Dupont'),
    ('Nano · D12', 'L298N · IN4', 'Motor B, sentido 2', 'in4', 'Dupont'),
    ('HC-06 · TXD', 'Nano · D2', 'Bluetooth → Nano (RX do SoftwareSerial)', 'tx', 'Dupont'),
    ('Nano · D3', 'R1 1 kΩ', 'Nano → Bluetooth (TX do SoftwareSerial)', 'rx5', 'Dupont'),
    ('R1 / R2 (ponto médio)', 'HC-06 · RXD', 'Sinal reduzido para ≈3,3 V', 'rx33', 'Dupont'),
    ('R2 2 kΩ', 'GND', 'Perna de baixo do divisor', 'gnd', '—'),
    ('Nano · D5', 'ESC · sinal (laranja)', 'Pulso 1000–2000 µs, 50 Hz', 'pwm', 'cabo do ESC'),
    ('L298N · OUT1 / OUT2', 'Motor A', 'Roda esquerda', 'ma', '20–22 AWG'),
    ('L298N · OUT3 / OUT4', 'Motor B', 'Roda direita', 'mb', '20–22 AWG'),
    ('ESC · A / B / C', 'A2212 · 3 fases', 'Ordem livre; trocar 2 inverte o giro', 'ph', '16–18 AWG'),
]

STEPS = [
    ('Alimentação', {'vbat', 'gnd', 'bateria', 'chave', 'l298n'}, [
        'Solde o XT60 macho na entrada e passe o positivo pela chave geral.',
        'Da chave: um fio ao borne 12V do L298N e outro ao + do ESC.',
        'Negativo da bateria ao GND do L298N e ao − do ESC.',
        'Teste: chave desligada, multímetro entre 12V e GND = 0 V.',
    ]),
    ('Motores de tração', {'ma', 'mb', 'motor-a', 'motor-b', 'l298n'}, [
        'Motor A nos bornes OUT1 e OUT2; Motor B em OUT3 e OUT4.',
        'Deixe os jumpers ENA e ENB no lugar.',
        'Se uma roda girar ao contrário, inverta os 2 fios dela.',
    ]),
    ('Lógica 5 V', {'v5', 'gnd', 'nano', 'l298n'}, [
        'Jumper 5V-EN do L298N fechado: o borne 5V vira saída.',
        'Borne 5V → pino 5V do Nano; GND do L298N → GND do Nano.',
        'Teste: LED ON do Nano aceso com a chave ligada.',
        'Para gravar pelo USB, desligue a chave geral.',
    ]),
    ('Controle dos motores', {'in1', 'in2', 'in3', 'in4', 'nano', 'l298n'}, [
        'D9 → IN1, D10 → IN2 (Motor A).',
        'D11 → IN3, D12 → IN4 (Motor B).',
        'HIGH/LOW em cada par define o sentido; LOW/LOW para.',
    ]),
    ('Bluetooth', {'v5', 'gnd', 'tx', 'rx5', 'rx33', 'hc06', 'r1', 'r2', 'nano'}, [
        'HC-06 VCC no 5V e GND no GND do Nano.',
        'TXD do HC-06 → D2 do Nano.',
        'D3 → R1 1 kΩ → RXD do HC-06; do mesmo ponto, R2 2 kΩ ao GND.',
        'Pareamento padrão: nome HC-06, senha 1234, 9600 baud.',
    ]),
    ('Arma', {'vbat', 'gnd', 'pwm', 'ph', 'esc', 'a2212'}, [
        'Fios grossos do ESC: + e − já ligados no passo 1.',
        'Cabo de sinal: laranja no D5; vermelho (BEC) isolado.',
        'Fases A/B/C no A2212 em qualquer ordem.',
        'Arme com 1000 µs por 2–3 s. Teste sem lâmina e com proteção.',
    ]),
]
