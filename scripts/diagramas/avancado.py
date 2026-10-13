"""Robô de batalha AVANÇADO — rádio FS-i6 + receptor FS-iA6B, 3 ESC 30A, 3 A2212.

Fonte: prancha original "Robô de batalha (avançado)" de Lucas Rafael, 16/11/2023.
Mantido da prancha: bateria 3S alimentando os 3 ESCs em paralelo, sinal de cada
ESC vindo do receptor, motores A2212/2200KV (2 rodas + arma), rádio FS-i6.
Revisão B: chave geral, canais definidos (CH1/CH2 rodas com mixagem Elevon,
CH3 arma), um único BEC alimentando o receptor, ESCs das rodas bidirecionais.
"""
from kit import *

W, H = 2400, 1700
ID = 'avancado'
TITLE = 'Robô de batalha — Avançado'

NETS = [
    ('vbat', '12 V da bateria (VBAT)', '#ef3535', 7, 'LiPo 3S → chave geral → chicote 1→3 → + dos três ESCs.'),
    ('gnd', 'GND comum', '#8b949e', 7, 'Negativo da bateria → − dos três ESCs.'),
    ('ch1', 'CH1 → ESC roda esquerda', '#ff8a3d', 3.5, 'Saída do canal 1 do receptor. Com Elevon ligado no rádio, mistura acelerador e direção.'),
    ('ch2', 'CH2 → ESC roda direita', '#22d3ee', 3.5, 'Saída do canal 2 (par do Elevon). Se o lado andar invertido, use Reverse no CH2.'),
    ('ch3', 'CH3 → ESC da arma', '#c084fc', 3.5, 'Acelerador (manche esquerdo, não centraliza). Failsafe deste canal = mínimo.'),
    ('bec', 'BEC 5 V → receptor', '#f472b6', 3.5, 'Fio vermelho do cabo de sinal do ESC da roda direita: 5 V que alimentam o receptor. Único BEC ligado.'),
    ('rxgnd', 'GND do receptor', '#a8a29e', 3.5, 'Fio marrom do mesmo cabo: negativo do receptor (é o mesmo GND da bateria, via ESC).'),
    ('ph', 'Fases A/B/C dos motores', '#c08457', 5, 'Três fases por motor. Ordem livre: trocar duas inverte o sentido.'),
]
NC = {n[0]: n[2] for n in NETS}
NW = {n[0]: n[3] for n in NETS}

ESC_X = {'l': 290, 'w': 1010, 'r': 1760}


def build(mini=False):
    body = [] if mini else [grid(W, H)]
    parts, wires, dots, labels = [], [], [], []

    def wire(net, pts, w=None):
        wires.append(Wire(net, pts, NC[net], w or NW[net]))

    parts.append(part('bateria', ['vbat', 'gnd'],
                      battery(60, 200, 300, 180, 'LiPo 3S', ('11,1 V · 2200–4400 mAh',)) +
                      T(372, 230, 'BATERIA', 16, C['txt'], 'start', 800, DISP, 0.06) +
                      T(372, 250, 'XT60 · 25C ou mais', 12, C['mut']), 'Bateria LiPo 3S'))
    parts.append(part('chave', ['vbat'], switch(410, 160, 500, vertical=True, left=True) +
                      pill(80, 532, 'ACRÉSCIMO', C['org'], 11), 'Chave geral'))

    rsvg, RP = receiver(1560, 140, used_groups=('CH1', 'CH2', 'CH3'))
    parts.append(part('receptor', ['ch1', 'ch2', 'ch3', 'bec', 'rxgnd'], rsvg, 'Receptor FS-iA6B'))
    parts.append(part('radio', ['ch1', 'ch2', 'ch3'],
                      radio(2120, 150) +
                      f'<path d="M2290 82 C2150 10 1900 6 1716 46" fill="none" stroke="{C["org"]}" stroke-width="2" stroke-dasharray="6 7"/>' +
                      T(2000, 34, '2,4 GHz', 12, C['org'], 'middle', 700), 'Rádio FS-i6'))

    specs = {
        'l': ('ESC 30A', 'bidirecional · roda E', '#e6c21d', '#262006'),
        'w': ('ESC 30A', 'arma', '#e8e8e8', '#2a0f0f'),
        'r': ('ESC 30A', 'bidirecional · roda D', '#e6c21d', '#262006'),
    }
    EP = {}
    for k, x0 in ESC_X.items():
        t, sub, st, fi = specs[k]
        es, EP[k] = esc_v(x0, 780, 160, 300, t, sub, st, fi)
        nets = ['vbat', 'gnd', 'ph'] + (['ch1'] if k == 'l' else ['ch3'] if k == 'w' else ['ch2', 'bec', 'rxgnd'])
        if k != 'r':  # fio vermelho do cabo retirado
            px = x0 + 115
            es += L(px - 7, 773, px + 7, 787, C['org'], 3) + L(px - 7, 787, px + 7, 773, C['org'], 3)
        names = {'l': 'esc-l', 'w': 'esc-w', 'r': 'esc-r'}
        parts.append(part(names[k], nets, es, f'ESC {k}'))
        cx = x0 + 80
        leads = [(x0 + 40, 1150), (x0 + 80, 1150), (x0 + 120, 1150)]
        mname = {'l': ('MOTOR 1 · roda esquerda', 'A2212 + caixa de redução'),
                 'w': ('MOTOR DA ARMA', 'A2212 · 2200KV'),
                 'r': ('MOTOR 2 · roda direita', 'A2212 + caixa de redução')}[k]
        bell = '#7a4fc9' if k == 'w' else '#b0302a'
        parts.append(part({'l': 'motor-l', 'w': 'motor-w', 'r': 'motor-r'}[k], ['ph'],
                          brushless(cx, 1290, 100, leads, mname[0], mname[1], bell), mname[0]))
        for (lx, ly), (px, py) in zip(leads, (EP[k]['A'], EP[k]['B'], EP[k]['C'])):
            wire('ph', [(px, py), (lx, ly)])

    # alimentação (chicote 1 → 3)
    wire('vbat', [(160, 380), (160, 428)])
    wire('vbat', [(160, 482), (160, 600), (1790, 600), (1790, 780)])
    wire('vbat', [(320, 600), (320, 780)])
    wire('vbat', [(1040, 600), (1040, 780)])
    wire('gnd', [(260, 380), (260, 640), (1820, 640), (1820, 780)])
    wire('gnd', [(350, 640), (350, 780)])
    wire('gnd', [(1070, 640), (1070, 780)])
    dots += [(320, 600, 'vbat', NC['vbat']), (1040, 600, 'vbat', NC['vbat']),
             (350, 640, 'gnd', NC['gnd']), (1070, 640, 'gnd', NC['gnd'])]

    # sinais
    wire('ch1', [(420, 780), (420, 460), (1636, 460), (1636, 400)])
    wire('ch3', [(1140, 780), (1140, 500), (1756, 500), (1756, 400)])
    wire('ch2', [(1890, 780), (1890, 540), (1696, 540), (1696, 400)])
    wire('bec', [(1875, 780), (1875, 560), (1678, 560), (1678, 400)])
    wire('rxgnd', [(1860, 780), (1860, 580), (1660, 580), (1660, 400)])

    labels += [
        pill(700, 600, '12 V → 3 ESCs', NC['vbat'], 12, net='vbat'),
        pill(700, 640, 'GND → 3 ESCs', NC['gnd'], 12, net='gnd'),
        pill(960, 460, 'CH1 → ESC roda esquerda', NC['ch1'], 12, net='ch1'),
        pill(1400, 500, 'CH3 → ESC da arma', NC['ch3'], 12, net='ch3'),
        pill(1300, 570, 'chicote 1 → 3', C['mut'], 11),
    ]
    labels.append('<g data-part="esc-r" data-nets="ch2 bec rxgnd">' +
                  T(1940, 690, 'cabo completo (− + S):', 12, C['mut'], 'start', 600) +
                  T(1940, 708, 'o BEC deste ESC', 12, C['mut'], 'start', 600) +
                  T(1940, 726, 'alimenta o receptor', 12, C['bec'] if False else NC['bec'], 'start', 700) + '</g>')
    labels.append(T(470, 760, '✕ vermelho retirado do conector', 11, C['org'], 'start', 700))
    labels.append(T(1190, 760, '✕ vermelho retirado do conector', 11, C['org'], 'start', 700))

    body.append('\n'.join(parts))
    body.append(render_wires(wires, dots, labels))

    if mini:
        return '\n'.join(body)
    body.append(header(420, 84, TITLE.upper(), 'Ligação física · rádio 2,4 GHz · 3 motores brushless', 'BATTLE BOTS · ELÉTRICA'))
    body.append(legend(1990, 860, 360, [(n[0], n[1], n[2], min(n[3], 6)) for n in NETS]))
    body.append(note_box(60, 1470, 560, 'ATENÇÃO', [
        'ESCs das rodas precisam ser BIDIRECIONAIS (com ré).',
        'O HW30A de avião só gira para um lado.',
        'A2212 tem muita rotação e pouco torque:',
        'use caixa de redução nas rodas.',
    ], C['red']))
    body.append(note_box(640, 1470, 560, 'NO RÁDIO FS-i6', [
        'Modo avião · Functions setup → Elevon: ON',
        '(manche direito comanda as duas rodas).',
        'Failsafe: CH3 no mínimo (arma desliga',
        'se o sinal cair).',
    ], '#22d3ee'))
    body.append(note_box(1220, 1470, 560, 'REVISÃO B', [
        '+ chave geral no positivo da bateria',
        '+ canais definidos: CH1, CH2 rodas · CH3 arma',
        '+ só um BEC ligado ao receptor',
        '+ ESCs das rodas bidirecionais',
    ]))
    body.append(stamp(1800, 1470, 540, [
        ('PRANCHA', '01 · Ligação física'),
        ('PROJETO', 'Robô avançado'),
        ('AUTOR', 'Lucas Rafael'),
        ('REVISÃO', 'B · 2026'),
    ]))
    return '\n'.join(body)


TABLE = [
    ('Bateria + (XT60)', 'Chave geral', 'Liga e desliga todo o robô', 'vbat', '14 AWG'),
    ('Chave geral', 'Chicote 1→3 (+)', 'Distribui o positivo', 'vbat', '14 AWG'),
    ('Chicote (+)', '+ dos 3 ESCs', 'Alimentação dos motores', 'vbat', '14–16 AWG'),
    ('Bateria −', 'Chicote 1→3 (−)', 'Distribui o negativo', 'gnd', '14 AWG'),
    ('Chicote (−)', '− dos 3 ESCs', 'Negativo comum', 'gnd', '14–16 AWG'),
    ('Receptor CH1 · S', 'ESC roda esquerda · sinal', 'Roda esquerda (Elevon)', 'ch1', 'cabo do ESC'),
    ('Receptor CH2 · S', 'ESC roda direita · sinal', 'Roda direita (Elevon)', 'ch2', 'cabo do ESC'),
    ('Receptor CH3 · S', 'ESC da arma · sinal', 'Acelerador da arma', 'ch3', 'cabo do ESC'),
    ('ESC roda direita · vermelho', 'Receptor CH2 · +', 'BEC 5 V alimenta o receptor', 'bec', 'cabo do ESC'),
    ('ESC roda direita · marrom', 'Receptor CH2 · −', 'Negativo do receptor', 'rxgnd', 'cabo do ESC'),
    ('ESC roda E e arma · vermelho', '—', 'Retirar o pino (só um BEC)', 'bec', '—'),
    ('ESC roda esquerda · A/B/C', 'Motor 1', 'Ordem livre; trocar 2 inverte', 'ph', '16–18 AWG'),
    ('ESC roda direita · A/B/C', 'Motor 2', 'Ordem livre; trocar 2 inverte', 'ph', '16–18 AWG'),
    ('ESC da arma · A/B/C', 'Motor da arma', 'Ordem livre; trocar 2 inverte', 'ph', '16–18 AWG'),
]

STEPS = [
    ('Alimentação', {'vbat', 'gnd', 'bateria', 'chave', 'esc-l', 'esc-w', 'esc-r'}, [
        'XT60 da bateria → chave geral → chicote paralelo 1→3.',
        'Cada saída do chicote no + e − de um ESC.',
        'Teste: chave desligada = 0 V nos ESCs.',
    ]),
    ('Motores', {'ph', 'esc-l', 'esc-w', 'esc-r', 'motor-l', 'motor-w', 'motor-r'}, [
        'Três fases de cada ESC no seu A2212.',
        'Ordem livre; troque 2 fases se girar ao contrário.',
        'Rodas: monte a caixa de redução antes de testar no chão.',
    ]),
    ('Receptor', {'bec', 'rxgnd', 'ch2', 'receptor', 'esc-r'}, [
        'Cabo completo do ESC da roda direita no CH2 (− + S).',
        'O BEC 5 V desse ESC passa a alimentar o receptor.',
        'Nos outros dois cabos, retire o pino vermelho do conector.',
    ]),
    ('Sinais', {'ch1', 'ch2', 'ch3', 'receptor', 'esc-l', 'esc-w', 'esc-r'}, [
        'ESC roda esquerda → CH1 · ESC roda direita → CH2.',
        'ESC da arma → CH3 (acelerador).',
        'Pino S para o lado marcado “S” no receptor.',
    ]),
    ('Rádio', {'receptor', 'radio'}, [
        'Bind: jumper no B/VCC, ligue o robô, rádio com BIND KEY.',
        'Functions setup → Elevon: ON (CH1/CH2).',
        'Failsafe: CH3 no mínimo. Teste desligando o rádio.',
    ]),
    ('Primeiro teste', {'vbat', 'gnd', 'ch1', 'ch2', 'ch3', 'ph', 'esc-l', 'esc-w', 'esc-r', 'motor-l', 'motor-w', 'motor-r', 'receptor'}, [
        'Robô suspenso, sem a arma montada.',
        'Ligue o rádio primeiro, acelerador no mínimo, depois a chave.',
        'Calibre o ponto neutro dos ESCs bidirecionais (manche ao centro).',
    ]),
]
