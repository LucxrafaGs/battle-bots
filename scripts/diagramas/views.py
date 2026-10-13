"""Vistas derivadas: esquemático, energia e sinal, tabela de ligações e passo a passo."""
import re
from kit import *

SYM = '#d4d4d4'


# ------------------------------------------------------------------ símbolos do esquemático
def frame(x, y, w, h, title):
    return (R(x, y, w, h, 'none', '#2f2f2f', 1.4, 10, ' stroke-dasharray="8 8"') +
            R(x + 18, y - 12, len(title) * 8.6 + 24, 24, C['bg']) +
            T(x + 30, y + 5, title, 13, C['mut'], weight=800, ls=0.12))


def sblock(x, y, w, h, ref, name, left=(), right=(), sub=None, color=SYM):
    """Bloco de CI/módulo. left/right: [(nome, y)]. Retorna svg e pinos na borda."""
    s = [R(x, y, w, h, '#121212', color, 2, 6)]
    s.append(T(x, y - 14, ref, 14, C['org'], weight=800, font=MONO))
    s.append(T(x + w / 2, y + 34, name, 20, C['txt'], 'middle', 800, DISP, 0.04))
    if sub:
        s.append(T(x + w / 2, y + h - 16, sub, 12, C['mut'], 'middle', 500))
    pins = {}
    for nm, py in left:
        s.append(L(x - 10, py, x, py, color, 2) + T(x + 12, py + 5, nm, 13, '#e6e6e6', weight=600, font=MONO))
        pins[nm] = (x - 10, py)
    for nm, py in right:
        s.append(L(x + w, py, x + w + 10, py, color, 2) + T(x + w - 12, py + 5, nm, 13, '#e6e6e6', 'end', 600, MONO))
        pins[nm] = (x + w + 10, py)
    return '\n'.join(s), pins


def flag(x, y, name, net, color, side='left'):
    """Rótulo de rede: mesmo nome = mesmo fio."""
    w = len(name) * 8 + 22
    if side == 'left':
        pts = f'{x},{y} {x - 10},{y - 13} {x - 10 - w},{y - 13} {x - 10 - w},{y + 13} {x - 10},{y + 13}'
        tx = x - 10 - w / 2
    else:
        pts = f'{x},{y} {x + 10},{y - 13} {x + 10 + w},{y - 13} {x + 10 + w},{y + 13} {x + 10},{y + 13}'
        tx = x + 10 + w / 2
    return (f'<g data-net="{net}"><polygon points="{pts}" fill="{C["bg"]}" stroke="{color}" stroke-width="1.8" stroke-linejoin="round"/>'
            + T(tx, y + 5, name, 13, color, 'middle', 700, MONO) + '</g>')


def gsym(x, y, net='gnd', color='#8b949e'):
    return (f'<g data-net="{net}">' + L(x, y, x, y + 14, color, 2.4) + L(x - 16, y + 14, x + 16, y + 14, color, 2.4) +
            L(x - 10, y + 21, x + 10, y + 21, color, 2.4) + L(x - 4, y + 28, x + 4, y + 28, color, 2.4) + '</g>')


def ncx(x, y, text='n.c.'):
    return (L(x - 8, y - 8, x + 8, y + 8, C['org'], 2.4) + L(x - 8, y + 8, x + 8, y - 8, C['org'], 2.4) +
            T(x, y + 26, text, 11, C['org'], 'middle', 700))


def bat_sym(x, y0, y1, ref='BT1', lines=('LiPo 3S', '11,1 V')):
    """Bateria vertical: + em y0, − em y1."""
    s = [L(x, y0, x, y0 + 50, SYM, 2), L(x, y1 - 50, x, y1, SYM, 2)]
    yy = y0 + 50
    step = (y1 - y0 - 100) / 3
    for i in range(3):
        a = yy + i * step
        s.append(L(x - 30, a + 4, x + 30, a + 4, SYM, 3) + L(x - 16, a + step - 8, x + 16, a + step - 8, SYM, 5))
        if i < 2:
            s.append(L(x, a + step - 8, x, a + step + 4, SYM, 1.6, ' stroke-dasharray="3 3"'))
    s.append(T(x - 44, y0 + 62, '+', 18, C['txt'], 'middle', 800))
    s.append(T(x + 48, (y0 + y1) / 2 - 10, ref, 14, C['org'], weight=800, font=MONO))
    for i, ln in enumerate(lines):
        s.append(T(x + 48, (y0 + y1) / 2 + 12 + 18 * i, ln, 13, C['mut'], weight=600))
    return '\n'.join(s)


def sw_sym(x0, x1, y, ref='SW1', label='chave geral'):
    return (Ci(x0 + 12, y, 5, 'none', SYM, 2) + Ci(x1 - 12, y, 5, 'none', SYM, 2) +
            L(x0, y, x0 + 7, y, SYM, 2) + L(x1 - 7, y, x1, y, SYM, 2) +
            L(x0 + 16, y - 3, x1 - 18, y - 26, SYM, 2.4) +
            T((x0 + x1) / 2, y - 40, f'{ref} · {label}', 13, C['txt'], 'middle', 700))


def res_sym(x0, y0, x1, y1, ref, value, side='top'):
    """Resistor em zigue-zague entre dois pontos (horizontal ou vertical)."""
    n = 6
    if y0 == y1:
        L_ = x1 - x0
        pts = [(x0, y0), (x0 + L_ * 0.15, y0)]
        for i in range(n):
            pts.append((x0 + L_ * 0.15 + L_ * 0.7 * (i + 0.5) / n, y0 + (-12 if i % 2 == 0 else 12)))
        pts += [(x0 + L_ * 0.85, y0), (x1, y1)]
        lab = T((x0 + x1) / 2, y0 - 22, f'{ref} · {value}', 13, C['txt'], 'middle', 700)
    else:
        L_ = y1 - y0
        pts = [(x0, y0), (x0, y0 + L_ * 0.15)]
        for i in range(n):
            pts.append((x0 + (-12 if i % 2 == 0 else 12), y0 + L_ * 0.15 + L_ * 0.7 * (i + 0.5) / n))
        pts += [(x0, y0 + L_ * 0.85), (x1, y1)]
        lab = T(x0 + 24, (y0 + y1) / 2 + 5, f'{ref} · {value}', 13, C['txt'], 'start', 700)
    d = 'M' + ' L'.join(f'{a:.1f},{b:.1f}' for a, b in pts)
    return f'<path d="{d}" fill="none" stroke="{SYM}" stroke-width="2.2" stroke-linejoin="round"/>' + lab


def mot_sym(cx, cy, r, ref, name, three=False, pins_x=None, pins_y=(), lead='#c08457'):
    """Motor: os terminais convergem da coluna pins_x até a borda do círculo."""
    s = []
    for py in pins_y:
        ang = math.atan2(py - cy, pins_x - cx)
        ex, ey = cx + math.cos(ang) * r, cy + math.sin(ang) * r
        s.append(f'<path d="M{pins_x},{py} L{ex:.1f},{ey:.1f}" stroke="{lead}" stroke-width="2.6" stroke-linecap="round"/>')
    s += [Ci(cx, cy, r, '#121212', SYM, 2.2), T(cx, cy + (2 if three else 8), 'M', 24, C['txt'], 'middle', 800)]
    if three:
        s.append(T(cx, cy + 24, '3~', 13, C['mut'], 'middle', 700))
    s.append(T(cx + r + 16, cy - 4, ref, 14, C['org'], weight=800, font=MONO))
    s.append(T(cx + r + 16, cy + 16, name, 13, C['mut'], weight=600))
    return '\n'.join(s)


def sym_legend(x, y, w):
    s = [R(x, y, w, 300, C['panel'], C['frame'], 1.2, 8), T(x + 18, y + 32, 'COMO LER', 12, C['mut'], weight=800, ls=0.12)]
    s.append(flag(x + 120, y + 74, 'IN1', 'x', C['txt']))
    s.append(T(x + 140, y + 79, 'mesmo nome = mesmo fio', 13, C['txt'], weight=500))
    s.append(gsym(x + 70, y + 108, 'x', C['txt']))
    s.append(T(x + 140, y + 130, 'GND comum (negativo)', 13, C['txt'], weight=500))
    s.append(L(x + 54, y + 170, x + 74, y + 186, C['org'], 2.4) + L(x + 54, y + 186, x + 74, y + 170, C['org'], 2.4))
    s.append(T(x + 140, y + 183, 'não conectar (isolar)', 13, C['txt'], weight=500))
    s.append(f'<path d="M40 0 h22 a8 8 0 0 1 16 0 h22" transform="translate({x - 10} {y + 230})" fill="none" stroke="{C["txt"]}" stroke-width="2.4"/>'
             + L(x + 60, y + 214, x + 60, y + 246, C['txt'], 2.4))
    s.append(T(x + 140, y + 235, 'cruzamento sem ligação', 13, C['txt'], weight=500))
    s.append(Ci(x + 60, y + 272, 6, C['txt']) + L(x + 30, y + 272, x + 90, y + 272, C['txt'], 2.4))
    s.append(T(x + 140, y + 277, 'ponto de ligação', 13, C['txt'], weight=500))
    return '\n'.join(s)


# ------------------------------------------------------------------ esquemático: robô básico
def schematic_basico(m):
    NC = m.NC
    W, H = 2400, 1500
    body = [grid(W, H), header(70, 84, m.TITLE.upper(), 'Esquemático · ligações por nome de rede', 'BATTLE BOTS · ELÉTRICA')]
    body += [frame(60, 200, 520, 560, 'ALIMENTAÇÃO'), frame(610, 200, 1080, 560, 'TRAÇÃO · PONTE H'),
             frame(1720, 200, 620, 560, 'ARMA'), frame(60, 790, 1880, 650, 'CONTROLE · BLUETOOTH')]
    wires, dots, labels, parts = [], [], [], []
    wr = lambda net, pts, w=2.6: wires.append(Wire(net, pts, NC[net], w))

    # alimentação
    parts.append(part('bateria', ['vbat', 'gnd'], bat_sym(200, 360, 580, 'BT1', ('LiPo 3S · 2200 mAh', '11,1 V (12,6 V cheia)'))))
    parts.append(part('chave', ['vbat'], sw_sym(290, 390, 300)))
    wr('vbat', [(200, 360), (200, 300), (290, 300)])
    wr('vbat', [(390, 300), (470, 300)])
    labels.append(flag(470, 300, 'VBAT', 'vbat', NC['vbat'], 'right'))
    wr('gnd', [(200, 580), (200, 630)])
    labels.append(gsym(200, 630))
    labels.append(T(90, 720, 'GND da bateria = GND comum de todo o robô', 12, C['mut'], weight=600))

    # L298N
    lp = [('12V', 300), ('GND', 340), ('5V', 380), ('ENA', 440), ('IN1', 480), ('IN2', 520), ('IN3', 560), ('IN4', 600), ('ENB', 640)]
    rp = [('OUT1', 350), ('OUT2', 410), ('OUT3', 530), ('OUT4', 590)]
    sv, P = sblock(870, 260, 280, 430, 'U2', 'L298N', lp, rp, '78M05 → 5V (jumper 5V-EN)')
    parts.append(part('l298n', ['vbat', 'gnd', 'v5', 'in1', 'in2', 'in3', 'in4', 'ma', 'mb'], sv))
    for nm, net, lab in (('12V', 'vbat', 'VBAT'), ('GND', 'gnd', 'GND'), ('5V', 'v5', '+5V'), ('ENA', 'v5', '+5V · jumper'),
                         ('IN1', 'in1', 'IN1'), ('IN2', 'in2', 'IN2'), ('IN3', 'in3', 'IN3'), ('IN4', 'in4', 'IN4'), ('ENB', 'v5', '+5V · jumper')):
        x, y = P[nm]
        wr(net, [(x, y), (x - 50, y)])
        labels.append(flag(x - 50, y, lab, net, NC[net], 'left'))
    parts.append(part('motor-a', ['ma'], mot_sym(1330, 380, 40, 'M1', 'Motor A · TT 1:48', False, 1260, (350, 410), NC['ma'])))
    parts.append(part('motor-b', ['mb'], mot_sym(1330, 560, 40, 'M2', 'Motor B · TT 1:48', False, 1260, (530, 590), NC['mb'])))
    for nm, net in (('OUT1', 'ma'), ('OUT2', 'ma'), ('OUT3', 'mb'), ('OUT4', 'mb')):
        x, y = P[nm]
        wr(net, [(x, y), (1260, y)])
    labels.append(T(640, 735, 'ENA/ENB com jumper: motores sempre em velocidade máxima; o sentido vem de IN1–IN4.', 12, C['mut'], weight=600))

    # ESC
    sv, E_ = sblock(1890, 280, 190, 290, 'U4', 'ESC 30A', [('+', 330), ('−', 380), ('SIG', 440), ('BEC', 510)],
                    [('A', 360), ('B', 420), ('C', 480)], 'HW30A')
    parts.append(part('esc', ['vbat', 'gnd', 'pwm', 'ph'], sv))
    for nm, net, lab in (('+', 'vbat', 'VBAT'), ('−', 'gnd', 'GND'), ('SIG', 'pwm', 'PWM_ARMA')):
        x, y = E_[nm]
        wr(net, [(x, y), (x - 40, y)])
        labels.append(flag(x - 40, y, lab, net, NC[net], 'left'))
    x, y = E_['BEC']
    labels.append(L(x, y, x - 30, y, SYM, 2) + ncx(x - 38, y, 'isolar'))
    parts.append(part('a2212', ['ph'], mot_sym(2250, 420, 46, 'M3', 'A2212', True, 2170, (360, 420, 480), NC['ph'])))
    for nm in 'ABC':
        x, y = E_[nm]
        wr('ph', [(x, y), (2170, y)])
    labels.append(T(1750, 735, 'BEC 5 V do ESC não é usado: o Nano já tem 5 V.', 12, C['mut'], weight=600))

    # Nano
    sv, N = sblock(570, 860, 290, 500, 'U1', 'ARDUINO NANO', [('5V', 920), ('GND', 980), ('VIN', 1040)],
                   [('D2', 920), ('D3', 980), ('D5', 1060), ('D9', 1140), ('D10', 1190), ('D11', 1240), ('D12', 1290)], 'ATmega328P')
    parts.append(part('nano', ['v5', 'gnd', 'in1', 'in2', 'in3', 'in4', 'tx', 'rx5', 'pwm'], sv))
    for nm, net, lab in (('5V', 'v5', '+5V'), ('GND', 'gnd', 'GND')):
        x, y = N[nm]
        wr(net, [(x, y), (x - 50, y)])
        labels.append(flag(x - 50, y, lab, net, NC[net], 'left'))
    x, y = N['VIN']
    labels.append(L(x, y, x - 30, y, SYM, 2) + ncx(x - 38, y, 'não usado'))
    for nm, net, lab in (('D5', 'pwm', 'PWM_ARMA'), ('D9', 'in1', 'IN1'), ('D10', 'in2', 'IN2'), ('D11', 'in3', 'IN3'), ('D12', 'in4', 'IN4')):
        x, y = N[nm]
        wr(net, [(x, y), (x + 60, y)])
        labels.append(flag(x + 60, y, lab, net, NC[net], 'right'))

    # Bluetooth
    sv, B = sblock(1490, 880, 230, 250, 'U3', 'HC-06', [('TXD', 920), ('RXD', 980), ('VCC', 1040), ('GND', 1090)], [], 'Bluetooth · 3,3 V lógico')
    parts.append(part('hc06', ['v5', 'gnd', 'tx', 'rx33'], sv))
    wr('tx', [N['D2'], B['TXD']])
    wr('rx5', [N['D3'], (1000, 980)])
    parts.append(part('r1', ['rx5', 'rx33'], res_sym(1000, 980, 1110, 980, 'R1', '1 kΩ')))
    wr('rx33', [(1110, 980), B['RXD']])
    dots.append((1210, 980, 'rx33', NC['rx33']))
    wr('rx33', [(1210, 980), (1210, 1030)])
    parts.append(part('r2', ['rx33', 'gnd'], res_sym(1210, 1030, 1210, 1140, 'R2', '2 kΩ')))
    wr('gnd', [(1210, 1140), (1210, 1170)])
    labels.append(gsym(1210, 1170))
    labels.append(T(1290, 1010, '≈ 3,3 V', 13, NC['rx33'], weight=700))
    for nm, net, lab in (('VCC', 'v5', '+5V'), ('GND', 'gnd', 'GND')):
        x, y = B[nm]
        wr(net, [(x, y), (x - 50, y)])
        labels.append(flag(x - 50, y, lab, net, NC[net], 'left'))
    labels.append(T(960, 905, 'RX do SoftwareSerial', 12, C['mut'], weight=600))
    labels.append(T(1000, 950 + 74, 'TX do SoftwareSerial', 12, C['mut'], weight=600))
    labels.append(T(90, 1410, 'O Nano recebe 5 V pelo pino 5V (vindo do borne 5V do L298N). Para gravar pelo USB, desligue a chave geral.', 12, C['mut'], weight=600))

    body.append('\n'.join(parts))
    body.append(render_wires(wires, dots, labels))
    body.append(sym_legend(1980, 790, 360))
    body.append(stamp(1980, 1286, 360, [('PRANCHA', '02 · Esquemático'), ('PROJETO', 'Robô básico'), ('AUTOR', 'Lucas Rafael'), ('REVISÃO', 'B · 2026')]))
    return W, H, '\n'.join(body)


# ------------------------------------------------------------------ esquemático: robô avançado
def schematic_avancado(m):
    NC = m.NC
    W, H = 2400, 1340
    body = [grid(W, H), header(70, 84, m.TITLE.upper(), 'Esquemático · ligações por nome de rede', 'BATTLE BOTS · ELÉTRICA')]
    body += [frame(60, 200, 520, 560, 'ALIMENTAÇÃO'), frame(610, 200, 760, 560, 'RECEPTOR'),
             frame(1400, 200, 940, 560, 'RÁDIO E SEGURANÇA'), frame(60, 790, 2280, 500, 'TRAÇÃO E ARMA')]
    wires, dots, labels, parts = [], [], [], []
    wr = lambda net, pts, w=2.6: wires.append(Wire(net, pts, NC[net], w))

    parts.append(part('bateria', ['vbat', 'gnd'], bat_sym(200, 360, 580, 'BT1', ('LiPo 3S · 2200–4400 mAh', '11,1 V (12,6 V cheia)'))))
    parts.append(part('chave', ['vbat'], sw_sym(290, 390, 300)))
    wr('vbat', [(200, 360), (200, 300), (290, 300)])
    wr('vbat', [(390, 300), (470, 300)])
    labels.append(flag(470, 300, 'VBAT', 'vbat', NC['vbat'], 'right'))
    wr('gnd', [(200, 580), (200, 630)])
    labels.append(gsym(200, 630))
    labels.append(T(90, 720, 'VBAT e GND chegam aos 3 ESCs por um chicote 1→3.', 12, C['mut'], weight=600))

    sv, P = sblock(880, 260, 240, 420, 'U1', 'FS-iA6B', [('+', 330), ('−', 390)],
                   [('CH1', 330), ('CH2', 390), ('CH3', 450), ('CH4', 510), ('CH5', 570), ('CH6', 630)], 'receptor 2,4 GHz')
    parts.append(part('receptor', ['ch1', 'ch2', 'ch3', 'bec', 'rxgnd'], sv))
    for nm, net, lab in (('+', 'bec', '+5V_RX'), ('−', 'rxgnd', 'GND')):
        x, y = P[nm]
        wr(net, [(x, y), (x - 50, y)])
        labels.append(flag(x - 50, y, lab, net, NC[net], 'left'))
    for nm, net in (('CH1', 'ch1'), ('CH2', 'ch2'), ('CH3', 'ch3')):
        x, y = P[nm]
        wr(net, [(x, y), (x + 50, y)])
        labels.append(flag(x + 50, y, nm, net, NC[net], 'right'))
    for nm in ('CH4', 'CH5', 'CH6'):
        x, y = P[nm]
        labels.append(L(x, y, x + 30, y, SYM, 2) + ncx(x + 38, y, 'livre'))
    labels.append(T(640, 735, 'O receptor é alimentado só pelo BEC do ESC da roda direita (+5V_RX).', 12, C['mut'], weight=600))

    labels.append(note_box(1430, 236, 520, 'MIXAGEM ELEVON (NO RÁDIO)', [
        'Manche direito ↑ / ↓ → as duas rodas juntas',
        'Manche direito ← / → → rodas em sentidos opostos',
        'Manche esquerdo (CH3) → arma, não volta ao centro',
        'Lado invertido? Reverse no CH1 ou no CH2',
    ], '#22d3ee'))
    labels.append(note_box(1430, 420 + 40, 520, 'FAILSAFE', [
        'CH3 no mínimo: a arma para se o sinal cair.',
        'CH1/CH2 no centro: as rodas param.',
        'Teste desligando o rádio com o robô suspenso.',
    ], C['red']))
    body.append(stamp(1980, 236, 340, [('PRANCHA', '02 · Esquemático'), ('PROJETO', 'Robô avançado'), ('AUTOR', 'Lucas Rafael'), ('REVISÃO', 'B · 2026')]))

    escs = [
        (120, 'U2', 'ESC 30A', 'bidirecional · roda E', 'ch1', 'CH1', None, 'esc-l', 'motor-l', 'M1', 'roda esquerda'),
        (880, 'U3', 'ESC 30A', 'bidirecional · roda D', 'ch2', 'CH2', '+5V_RX', 'esc-r', 'motor-r', 'M2', 'roda direita'),
        (1640, 'U4', 'ESC 30A', 'arma', 'ch3', 'CH3', None, 'esc-w', 'motor-w', 'M3', 'arma'),
    ]
    for X, ref, nm, sub, net, ch, bec, pid, mid, mref, mname in escs:
        sv, E_ = sblock(X + 220, 880, 200, 300, ref, nm, [('+', 930), ('−', 990), ('SIG', 1050), ('BEC', 1120)],
                        [('A', 960), ('B', 1030), ('C', 1100)], sub)
        nets = ['vbat', 'gnd', net, 'ph'] + (['bec', 'rxgnd'] if bec else [])
        parts.append(part(pid, nets, sv))
        for pn, nn, lab in (('+', 'vbat', 'VBAT'), ('−', 'gnd', 'GND'), ('SIG', net, ch)):
            x, y = E_[pn]
            wr(nn, [(x, y), (x - 50, y)])
            labels.append(flag(x - 50, y, lab, nn, NC[nn], 'left'))
        x, y = E_['BEC']
        if bec:
            wr('bec', [(x, y), (x - 50, y)])
            labels.append(flag(x - 50, y, bec, 'bec', NC['bec'], 'left'))
        else:
            labels.append(L(x, y, x - 30, y, SYM, 2) + ncx(x - 38, y, 'retirar'))
        parts.append(part(mid, ['ph'], mot_sym(X + 560, 1030, 46, mref, f'A2212 · {mname}', True, X + 490, (960, 1030, 1100), NC['ph'])))
        for pn in 'ABC':
            x, y = E_[pn]
            wr('ph', [(x, y), (X + 490, y)])
    labels.append(T(90, 1234, 'Os ESCs das rodas precisam ter ré (bidirecionais). O GND do receptor (fio marrom do cabo de sinal) é o mesmo GND da bateria.', 12, C['mut'], weight=600))
    labels.append(T(90, 1258, 'Os ESCs U2 e U4 entram no receptor só com S e − (pino vermelho retirado do conector).', 12, C['mut'], weight=600))

    body.append('\n'.join(parts))
    body.append(render_wires(wires, dots, labels))
    return W, H, '\n'.join(body)


# ------------------------------------------------------------------ energia e sinal
def bbox(x, y, w, h, title, sub, color, pid=None, nets=()):
    s = (R(x, y, w, h, '#141414', '#2e2e2e', 1.4, 10) + R(x, y, w, 5, color, None, 0, 2) +
         T(x + 18, y + 40, title, 18, C['txt'], weight=800) + ''.join(
             T(x + 18, y + 64 + 19 * i, ln, 13, C['mut'], weight=500) for i, ln in enumerate(sub)))
    return part(pid, list(nets), s) if pid else s


def arrows_render(arrows):
    """arrows: [(net, pts, color, w, dashed)] — desenha fios + pontas."""
    ws = [Wire(n, p, c, w, '10 9' if d else None) for n, p, c, w, d in arrows]
    out = [render_wires(ws)]
    for n, p, c, w, d in arrows:
        (x0, y0), (x1, y1) = p[-2], p[-1]
        ang = math.atan2(y1 - y0, x1 - x0)
        a = 9 + w
        pts = [(x1, y1), (x1 - a * math.cos(ang) + a * 0.55 * math.sin(ang), y1 - a * math.sin(ang) - a * 0.55 * math.cos(ang)),
               (x1 - a * math.cos(ang) - a * 0.55 * math.sin(ang), y1 - a * math.sin(ang) + a * 0.55 * math.cos(ang))]
        out.append(f'<g data-net="{n}"><polygon points="{" ".join(f"{u:.1f},{v:.1f}" for u, v in pts)}" fill="{c}"/></g>')
    return '\n'.join(out)


def blocks_basico(m):
    NC = m.NC
    W, H = 2400, 1230
    b = [grid(W, H), header(70, 84, m.TITLE.upper(), 'Energia e sinal · de onde vem a força e por onde passa o comando', 'BATTLE BOTS · ELÉTRICA')]
    b += [frame(60, 200, 1130, 800, 'ENERGIA'), frame(1230, 200, 1110, 800, 'SINAIS DE COMANDO')]
    bw, bh = 210, 100
    box = {}

    def B(k, x, cy, title, sub, color, nets, pid=None):
        box[k] = (x, cy - bh / 2)
        b.append(bbox(x, cy - bh / 2, bw, bh, title, sub, color, pid or k, nets))

    B('bateria', 90, 600, 'Bateria', ('LiPo 3S · 11,1 V',), NC['vbat'], ['vbat', 'gnd'])
    B('chave', 380, 600, 'Chave geral', ('link removível',), NC['vbat'], ['vbat'])
    B('l298n', 670, 420, 'L298N', ('ponte H · ~2 V de queda',), '#c8392e', ['vbat', 'gnd', 'v5', 'ma', 'mb'])
    B('esc', 670, 820, 'ESC 30A', ('PWM → 3 fases',), '#e6c21d', ['vbat', 'gnd', 'ph'])
    B('motor-a', 950, 280, 'Motor A', ('TT 1:48 · roda E',), NC['ma'], ['ma'])
    B('motor-b', 950, 420, 'Motor B', ('TT 1:48 · roda D',), NC['mb'], ['mb'])
    B('nano', 950, 560, 'Lógica 5 V', ('Nano + HC-06',), NC['v5'], ['v5'])
    B('a2212', 950, 820, 'A2212', ('2200KV · arma',), NC['ph'], ['ph'])
    A = [
        ('vbat', [(300, 600), (380, 600)], NC['vbat'], 7, False),
        ('vbat', [(590, 600), (630, 600), (630, 420), (670, 420)], NC['vbat'], 7, False),
        ('vbat', [(630, 600), (630, 820), (670, 820)], NC['vbat'], 7, False),
        ('ma', [(880, 420), (915, 420), (915, 280), (950, 280)], NC['ma'], 4, False),
        ('mb', [(915, 420), (950, 420)], NC['mb'], 4, False),
        ('v5', [(915, 420), (915, 560), (950, 560)], NC['v5'], 4, False),
        ('ph', [(880, 820), (950, 820)], NC['ph'], 5, False),
    ]
    b.append(arrows_render(A))
    b.append(Ci(630, 600, 7, NC['vbat'], C['bg'], 2.5))
    b += [pill(630, 510, 'VBAT', NC['vbat'], 11, net='vbat'), pill(630, 720, 'até 30 A', NC['vbat'], 11, net='vbat'),
          pill(915, 350, 'OUT1/2', NC['ma'], 11, net='ma'), pill(915, 495, '5 V', NC['v5'], 11, net='v5')]
    b.append(T(90, 940, 'Uma fonte, dois ramos: a ponte H (motores TT e o regulador de 5 V) e o ESC da arma.', 13, C['mut'], weight=600))

    B('celular', 1260, 600, 'Celular', ('app Bluetooth',), '#3f74e6', [])
    B('hc06', 1550, 600, 'HC-06', ('9600 baud',), '#3f74e6', ['tx', 'rx33', 'v5', 'gnd'])
    B('nano2', 1840, 600, 'Arduino Nano', ('decide o movimento',), '#21a5a5', ['in1', 'in2', 'in3', 'in4', 'pwm', 'tx', 'rx5'], 'nano')
    B('l298n2', 2110, 420, 'L298N', ('IN1–IN4',), '#c8392e', ['in1', 'in2', 'in3', 'in4'], 'l298n')
    B('esc2', 2110, 820, 'ESC 30A', ('sinal de servo',), '#e6c21d', ['pwm'], 'esc')
    A = [
        ('bt', [(1470, 600), (1550, 600)], '#8fb0f5', 3, True),
        ('tx', [(1760, 585), (1840, 585)], NC['tx'], 3.5, False),
        ('rx5', [(1840, 615), (1760, 615)], NC['rx5'], 3.5, False),
        ('in1', [(2050, 600), (2080, 600), (2080, 420), (2110, 420)], NC['in1'], 4, False),
        ('pwm', [(2080, 600), (2080, 820), (2110, 820)], NC['pwm'], 4, False),
    ]
    b.append(arrows_render(A))
    b += [pill(1510, 560, '2,4 GHz', '#8fb0f5', 11), pill(1800, 548, 'TX → D2', NC['tx'], 11, net='tx'),
          pill(1800, 652, 'D3 → RX', NC['rx5'], 11, net='rx5'), pill(2080, 510, 'D9–D12', NC['in1'], 11, net='in1'),
          pill(2080, 710, 'D5 · 50 Hz', NC['pwm'], 11, net='pwm')]
    b.append(T(1260, 940, 'O celular manda comandos; o Nano traduz em sentido dos motores (IN1–IN4) e no pulso da arma (D5).', 13, C['mut'], weight=600))

    b.append(note_box(60, 1040, 1130, 'GND COMUM', [
        'Negativo da bateria, GND do L298N, − do ESC, GND do Nano e GND do HC-06 são o mesmo ponto.',
        'Sem esse retorno comum o Nano não consegue comandar a ponte H nem o ESC.',
    ], '#8b949e', 13, 22))
    b.append(note_box(1230, 1040, 1110, 'LIMITES', [
        'L298N: 2 A por canal (3 A de pico) e perde cerca de 2 a 3 V.',
        'ESC 30 A · LiPo: corrente máxima = capacidade × C (2,2 Ah × 25C = 55 A).',
        'Motores TT são de 3–6 V: em 3S recebem ~9–10 V, giram mais e esquentam.',
    ], C['org'], 13, 22))
    return W, H, '\n'.join(b)


def blocks_avancado(m):
    NC = m.NC
    W, H = 2400, 1200
    b = [grid(W, H), header(70, 84, m.TITLE.upper(), 'Energia e sinal · de onde vem a força e por onde passa o comando', 'BATTLE BOTS · ELÉTRICA')]
    b += [frame(60, 200, 1240, 800, 'ENERGIA'), frame(1340, 200, 1000, 800, 'SINAIS DE COMANDO')]
    bw, bh = 190, 100

    def B(k, x, cy, title, sub, color, nets, pid=None):
        b.append(bbox(x, cy - bh / 2, bw, bh, title, sub, color, pid or k, nets))

    B('bateria', 90, 570, 'Bateria', ('LiPo 3S',), NC['vbat'], ['vbat', 'gnd'])
    B('chave', 330, 570, 'Chave geral', ('link removível',), NC['vbat'], ['vbat'])
    B('chicote', 570, 570, 'Chicote 1→3', ('ou PDB',), NC['vbat'], ['vbat', 'gnd'], 'chicote')
    B('esc-l', 810, 300, 'ESC roda E', ('bidirecional',), '#e6c21d', ['vbat', 'gnd', 'ph'])
    B('esc-r', 810, 570, 'ESC roda D', ('bidirecional · BEC',), '#e6c21d', ['vbat', 'gnd', 'ph', 'bec'])
    B('esc-w', 810, 840, 'ESC arma', ('30 A',), '#e8e8e8', ['vbat', 'gnd', 'ph'])
    B('motor-l', 1060, 300, 'Motor 1', ('A2212 + redução',), NC['ph'], ['ph'])
    B('motor-r', 1060, 500, 'Motor 2', ('A2212 + redução',), NC['ph'], ['ph'])
    B('receptor', 1060, 640, 'Receptor', ('5 V pelo BEC',), NC['bec'], ['bec'])
    B('motor-w', 1060, 840, 'Motor arma', ('A2212 2200KV',), NC['ph'], ['ph'])
    A = [
        ('vbat', [(280, 570), (330, 570)], NC['vbat'], 7, False),
        ('vbat', [(520, 570), (570, 570)], NC['vbat'], 7, False),
        ('vbat', [(760, 570), (785, 570), (785, 300), (810, 300)], NC['vbat'], 7, False),
        ('vbat', [(785, 570), (810, 570)], NC['vbat'], 7, False),
        ('vbat', [(785, 570), (785, 840), (810, 840)], NC['vbat'], 7, False),
        ('ph', [(1000, 300), (1060, 300)], NC['ph'], 5, False),
        ('ph', [(1000, 570), (1030, 570), (1030, 500), (1060, 500)], NC['ph'], 5, False),
        ('bec', [(1030, 570), (1030, 640), (1060, 640)], NC['bec'], 4, False),
        ('ph', [(1000, 840), (1060, 840)], NC['ph'], 5, False),
    ]
    b.append(arrows_render(A))
    b.append(T(90, 940, 'A bateria alimenta os 3 ESCs em paralelo; um deles também entrega 5 V ao receptor.', 13, C['mut'], weight=600))

    B('radio', 1380, 570, 'Rádio FS-i6', ('Elevon · failsafe',), '#a5a5a5', ['ch1', 'ch2', 'ch3'])
    B('receptor2', 1660, 570, 'FS-iA6B', ('CH1 · CH2 · CH3',), '#d84a3a', ['ch1', 'ch2', 'ch3'], 'receptor')
    B('esc-l2', 2110, 300, 'ESC roda E', ('CH1',), '#e6c21d', ['ch1'], 'esc-l')
    B('esc-r2', 2110, 570, 'ESC roda D', ('CH2',), '#e6c21d', ['ch2'], 'esc-r')
    B('esc-w2', 2110, 840, 'ESC arma', ('CH3',), '#e8e8e8', ['ch3'], 'esc-w')
    A = [
        ('bt', [(1570, 570), (1660, 570)], '#a5a5a5', 3, True),
        ('ch1', [(1850, 550), (1990, 550), (1990, 300), (2110, 300)], NC['ch1'], 4, False),
        ('ch2', [(1850, 570), (2110, 570)], NC['ch2'], 4, False),
        ('ch3', [(1850, 590), (1990 - 20, 590), (1970, 840), (2110, 840)], NC['ch3'], 4, False),
    ]
    b.append(arrows_render(A))
    b += [pill(1615, 530, '2,4 GHz', '#a5a5a5', 11), pill(2050, 300, 'CH1 · Elevon', NC['ch1'], 11, net='ch1'),
          pill(2040, 570, 'CH2 · Elevon', NC['ch2'], 11, net='ch2'), pill(2040, 840, 'CH3 · acelerador', NC['ch3'], 11, net='ch3')]
    b.append(T(1380, 940, 'O rádio mistura acelerador e direção nos canais 1 e 2; o canal 3 controla a arma.', 13, C['mut'], weight=600))

    b.append(note_box(60, 1040, 1240, 'LIMITES', [
        'ESC 30 A por motor · A2212 2200KV em 3S ≈ 24 000 rpm em vazio (11,1 V × 2200).',
        'LiPo: corrente máxima = capacidade × C (2,2 Ah × 25C = 55 A; 4,4 Ah × 25C = 110 A).',
    ], C['org'], 13, 22))
    b.append(note_box(1340, 1040, 1000, 'SEGURANÇA', [
        'Ligue o rádio antes do robô e desligue o robô antes do rádio.',
        'Failsafe do CH3 no mínimo: a arma para se o sinal cair.',
    ], C['red'], 13, 22))
    return W, H, '\n'.join(b)


# ------------------------------------------------------------------ tabela de ligações
def table(m, title_sub='Tabela de ligações · ponto a ponto'):
    NC = m.NC
    NL = {n[0]: n[1] for n in m.NETS}
    cols = [('#', 60), ('DE', 380), ('PARA', 380), ('FUNÇÃO', 560), ('FIO NO DESENHO', 330), ('BITOLA', 170)]
    W = 60 + sum(c[1] for c in cols) + 60
    rh = 54
    top = 230
    H = top + 56 + rh * len(m.TABLE) + 90
    b = [grid(W, H), header(70, 84, m.TITLE.upper(), title_sub, 'BATTLE BOTS · ELÉTRICA')]
    x = 60
    b.append(R(60, top, W - 120, 56, '#161616', C['frame'], 1.2))
    for name, w in cols:
        b.append(T(x + 18, top + 35, name, 12, C['mut'], weight=800, ls=0.12))
        x += w
    for i, (de, para, fn, net, aw) in enumerate(m.TABLE):
        y = top + 56 + rh * i
        row = [R(60, y, W - 120, rh, '#101010' if i % 2 else '#0d0d0d', None)]
        row.append(L(60, y + rh, W - 60, y + rh, '#1f1f1f', 1))
        x = 60
        vals = (f'{i + 1:02d}', de, para, fn, None, aw)
        for (name, w), v in zip(cols, vals):
            if v is None:
                row.append(L(x + 18, y + rh / 2, x + 62, y + rh / 2, NC[net], 6))
                row.append(T(x + 76, y + rh / 2 + 5, NL[net], 13, C['txt'], weight=600))
            else:
                row.append(T(x + 18, y + rh / 2 + 5, v, 15 if name != '#' else 13,
                             C['txt'] if name not in ('#', 'BITOLA') else C['mut'], weight=600 if name in ('DE', 'PARA') else 500,
                             font=MONO if name in ('#',) else None))
            x += w
        b.append(f'<g data-net="{net}">' + ''.join(row) + '</g>')
    b.append(T(60, H - 40, 'AWG: quanto menor o número, mais grosso o fio. Fios de potência curtos e bem presos; sinais podem usar jumpers Dupont.', 13, C['mut'], weight=600))
    return W, H, '\n'.join(b)


# ------------------------------------------------------------------ passo a passo
def _dim(svgbody, hl):
    def rep_net(mo):
        return f'<g opacity="{1 if mo.group(1) in hl else 0.1}"'

    def rep_part(mo):
        nets = mo.group(2).split()
        return f'<g opacity="{1 if mo.group(1) in hl else 0.18}"'
    s = re.sub(r'<g data-part="([^"]+)" data-nets="([^"]*)"', rep_part, svgbody)
    s = re.sub(r'<g data-net="([^"]+)"', rep_net, s)
    return s


def steps(m):
    W, H = 2400, 1960
    pw, ph = 740, 820
    b = [grid(W, H), header(70, 84, m.TITLE.upper(), 'Passo a passo da montagem elétrica', 'BATTLE BOTS · ELÉTRICA')]
    mini = m.build(mini=True)
    for i, (title, hl, lines) in enumerate(m.STEPS):
        col, row = i % 3, i // 3
        x = 60 + col * (pw + 30)
        y = 220 + row * (ph + 30)
        b.append(R(x, y, pw, ph, C['panel'], C['frame'], 1.2, 12))
        b.append(T(x + 28, y + 70, f'{i + 1:02d}', 52, C['org'], weight=800, font=DISP))
        b.append(T(x + 120, y + 62, title.upper(), 24, C['txt'], weight=800, font=DISP, ls=0.04))
        iw = pw - 40
        ih = iw * m.H / m.W
        b.append(R(x + 20, y + 96, iw, ih, '#0a0a0a', '#1f1f1f', 1, 8))
        b.append(f'<svg x="{x + 20}" y="{y + 96}" width="{iw}" height="{ih:.0f}" viewBox="0 0 {m.W} {m.H}">' + _dim(mini, hl) + '</svg>')
        for j, ln in enumerate(lines):
            yy = y + 96 + ih + 44 + 30 * j
            b.append(Ci(x + 34, yy - 5, 4, C['org']) + T(x + 50, yy, ln, 16, C['txt'], weight=500))
    return W, H, '\n'.join(b)


# ------------------------------------------------------------------ ESP32
def fuse_sym(x0, x1, y, ref='F1'):
    return (L(x0, y, x0 + 12, y, SYM, 2) + L(x1 - 12, y, x1, y, SYM, 2) + R(x0 + 12, y - 11, x1 - x0 - 24, 22, 'none', SYM, 2, 4) +
            L(x0 + 12, y, x1 - 12, y, SYM, 1.4) + T((x0 + x1) / 2, y - 22, f'{ref} · fusível', 13, C['txt'], 'middle', 700))


def cap_row(x, y, flag_name, net, ref, value, NC):
    """flag ─┤├─ GND  (capacitor entre a rede e o GND)."""
    s = [flag(x, y, flag_name, net, NC[net], 'left')]
    s.append(f'<g data-net="{net}">' + L(x, y, x + 40, y, NC[net], 2.6) + '</g>')
    s.append(L(x + 40, y - 16, x + 40, y + 16, SYM, 3) + L(x + 52, y - 16, x + 52, y + 16, SYM, 3))
    s.append(f'<g data-net="gnd">' + L(x + 52, y, x + 92, y, NC['gnd'], 2.6) + '</g>')
    s.append(gsym(x + 92, y))
    s.append(T(x + 130, y - 2, ref, 13, C['org'], weight=800, font=MONO) + T(x + 130, y + 16, value, 12, C['mut'], weight=600))
    return '\n'.join(s)


def res_row(x, y, flag_name, net, ref, to, NC):
    """flag ─/\\/\\─ GND ou 3V3."""
    s = [flag(x, y, flag_name, net, NC[net], 'left')]
    s.append(f'<g data-net="{net}">' + L(x, y, x + 20, y, NC[net], 2.6) + '</g>')
    s.append(res_sym(x + 20, y, x + 120, y, ref, '10k'))
    if to == 'gnd':
        s.append(f'<g data-net="gnd">' + L(x + 120, y, x + 150, y, NC['gnd'], 2.6) + '</g>' + gsym(x + 150, y))
    else:
        s.append(f'<g data-net="v33">' + L(x + 120, y, x + 150, y, NC['v33'], 2.6) + '</g>' + flag(x + 150, y, '3V3', 'v33', NC['v33'], 'right'))
    return '\n'.join(s)


def schematic_esp32(m):
    NC = m.NC
    W, H = 2400, 1500
    body = [grid(W, H), header(70, 84, m.TITLE.upper(), 'Esquemático · ligações por nome de rede', 'BATTLE BOTS · ELÉTRICA')]
    body += [frame(60, 200, 700, 1240, 'ALIMENTAÇÃO'), frame(790, 200, 760, 1240, 'CONTROLE · ESP32'),
             frame(1580, 200, 760, 800, 'TRAÇÃO · DRIVERS G2'), frame(1580, 1030, 760, 410, 'ARMA')]
    wires, dots, labels, parts = [], [], [], []
    wr = lambda net, pts, w=2.6: wires.append(Wire(net, pts, NC[net], w))

    # bateria → fusível → link → VBAT
    parts.append(part('bateria', ['vbat', 'gnd'], bat_sym(130, 360, 520, 'BT1', ('LiPo 3S', '11,1 V (12,6 V cheia)'))))
    wr('vbat', [(130, 360), (130, 300), (250, 300)])
    parts.append(part('fusivel', ['vbat'], fuse_sym(250, 350, 300)))
    wr('vbat', [(350, 300), (410, 300)])
    parts.append(part('chave', ['vbat'], sw_sym(410, 510, 300, 'SW1', 'link removível')))
    wr('vbat', [(510, 300), (600, 300)])
    labels.append(flag(600, 300, 'VBAT', 'vbat', NC['vbat'], 'right'))
    wr('gnd', [(130, 520), (130, 570)])
    labels.append(gsym(130, 570))

    # LM2596
    sv, P = sblock(450, 540, 180, 160, 'U1', 'LM2596', [('IN+', 590), ('IN−', 650)], [('OUT+', 590), ('OUT−', 650)], 'ajustar 5,0 V')
    parts.append(part('lm2596', ['vbat', 'gnd', 'v5'], sv))
    for nm, net, lab, side in (('IN+', 'vbat', 'VBAT', 'left'), ('IN−', 'gnd', 'GND', 'left'), ('OUT+', 'v5', '+5V', 'right'), ('OUT−', 'gnd', 'GND', 'right')):
        x, y = P[nm]
        x2 = x - 40 if side == 'left' else x + 30
        wr(net, [(x, y), (x2, y)])
        labels.append(flag(x2, y, lab, net, NC[net], side))
    labels.append(T(90, 760, 'Meça 5,0 V na saída antes de ligar o ESP32. Não use AMS1117 ou L7805 direto em 3S.', 12, C['mut'], weight=600))
    labels.append(T(90, 830, 'CAPACITORES', 12, C['mut'], weight=800, ls=0.12))
    labels.append(part('c1', ['v5', 'gnd'], cap_row(180, 890, '+5V', 'v5', 'C1', '100–470 µF / 10 V', NC)))
    labels.append(part('c2', ['vbat', 'gnd'], cap_row(180, 980, 'VBAT', 'vbat', 'C2', '470–1000 µF / 25 V · no VIN do G2 esq.', NC)))
    labels.append(part('c3', ['vbat', 'gnd'], cap_row(180, 1070, 'VBAT', 'vbat', 'C3', '470–1000 µF / 25 V · no VIN do G2 dir.', NC)))
    body.append(stamp(90, 1260, 640, [('PRANCHA', '02 · Esquemático'), ('PROJETO', 'Robô ESP32'), ('AUTOR', 'Lucas Rafael'), ('REVISÃO', 'B · 2026')]))

    # ESP32
    lp = [('5V/VIN', 320), ('GND', 380), ('3V3', 440)]
    rp = [('GPIO32', 320), ('GPIO26', 370), ('GPIO25', 420), ('GPIO33', 500), ('GPIO14', 550), ('GPIO27', 600), ('GPIO18', 700), ('GPIO23', 760)]
    sv, E_ = sblock(1010, 260, 290, 560, 'U2', 'ESP32 DEVKIT', lp, rp, 'WROOM · BLE · 3,3 V')
    parts.append(part('esp32', ['v5', 'gnd', 'v33', 'fltl', 'dirl', 'pwml', 'fltr', 'dirr', 'pwmr', 'esc'], sv))
    for nm, net, lab in (('5V/VIN', 'v5', '+5V'), ('GND', 'gnd', 'GND'), ('3V3', 'v33', '3V3')):
        x, y = E_[nm]
        wr(net, [(x, y), (x - 50, y)])
        labels.append(flag(x - 50, y, lab, net, NC[net], 'left'))
    for nm, net, lab in (('GPIO32', 'fltl', 'FLT_L'), ('GPIO26', 'dirl', 'DIR_L'), ('GPIO25', 'pwml', 'PWM_L'), ('GPIO33', 'fltr', 'FLT_R'),
                         ('GPIO14', 'dirr', 'DIR_R'), ('GPIO27', 'pwmr', 'PWM_R'), ('GPIO18', 'esc', 'PWM_ESC')):
        x, y = E_[nm]
        wr(net, [(x, y), (x + 50, y)])
        labels.append(flag(x + 50, y, lab, net, NC[net], 'right'))
    x, y = E_['GPIO23']
    labels.append(L(x, y, x + 30, y, SYM, 2) + ncx(x + 38, y, 'extra'))
    labels.append(T(820, 900, 'RESISTORES DE 10k', 12, C['mut'], weight=800, ls=0.12))
    rows = [('PWM_L', 'pwml', 'R1', 'gnd'), ('PWM_R', 'pwmr', 'R2', 'gnd'), ('PWM_ESC', 'esc', 'R3', 'gnd'),
            ('FLT_L', 'fltl', 'R4', 'v33'), ('FLT_R', 'fltr', 'R5', 'v33')]
    for i, (fl, net, ref, to) in enumerate(rows):
        labels.append(res_row(1000, 970 + 80 * i, fl, net, ref, to, NC))
    labels.append(T(820, 1400, 'PWM com pull-down: motores parados enquanto o ESP32 inicia. FLT com pull-up: LOW = falha.', 12, C['mut'], weight=600))

    # drivers
    for ref, y0, side, pid, mid, mref, nets in (('U3', 260, 'esquerdo', 'g2-l', 'motor-l', 'M1', ('pwml', 'dirl', 'fltl', 'ml', 'PWM_L', 'DIR_L', 'FLT_L')),
                                                ('U4', 620, 'direito', 'g2-r', 'motor-r', 'M2', ('pwmr', 'dirr', 'fltr', 'mr', 'PWM_R', 'DIR_R', 'FLT_R'))):
        pw, di, fl, mo, pwl, dil, fll = nets
        sv, G = sblock(1800, y0, 220, 300, ref, 'G2 18v17', [('VIN', y0 + 40), ('GND', y0 + 90), ('PWM', y0 + 150), ('DIR', y0 + 200), ('FLT', y0 + 250)],
                       [('OUTA', y0 + 110), ('OUTB', y0 + 190)], f'driver {side}')
        parts.append(part(pid, ['vbat', 'gnd', pw, di, fl, mo], sv))
        for pn, net, lab in (('VIN', 'vbat', 'VBAT'), ('GND', 'gnd', 'GND'), ('PWM', pw, pwl), ('DIR', di, dil), ('FLT', fl, fll)):
            x, y = G[pn]
            wr(net, [(x, y), (x - 40, y)])
            labels.append(flag(x - 40, y, lab, net, NC[net], 'left'))
        parts.append(part(mid, [mo], mot_sym(2220, y0 + 150, 44, mref, f'motor {side[:3]}.', False, 2100, (y0 + 110, y0 + 190), NC[mo])))
        for pn in ('OUTA', 'OUTB'):
            x, y = G[pn]
            wr(mo, [(x, y), (2100, y)])

    # ESC
    sv, X = sblock(1800, 1090, 200, 290, 'U5', 'ESC', [('+', 1140), ('−', 1190), ('SIG', 1250), ('BEC', 1320)],
                   [('A', 1170), ('B', 1240), ('C', 1310)], 'aceita sinal 3,3 V')
    parts.append(part('esc', ['vbat', 'gnd', 'esc', 'ph'], sv))
    for pn, net, lab in (('+', 'vbat', 'VBAT'), ('−', 'gnd', 'GND'), ('SIG', 'esc', 'PWM_ESC')):
        x, y = X[pn]
        wr(net, [(x, y), (x - 40, y)])
        labels.append(flag(x - 40, y, lab, net, NC[net], 'left'))
    x, y = X['BEC']
    labels.append(L(x, y, x - 30, y, SYM, 2) + ncx(x - 38, y, 'isolar'))
    parts.append(part('brushless', ['ph'], mot_sym(2220, 1240, 46, 'M3', 'arma', True, 2100, (1170, 1240, 1310), NC['ph'])))
    for pn in 'ABC':
        x, y = X[pn]
        wr('ph', [(x, y), (2100, y)])

    body.append('\n'.join(parts))
    body.append(render_wires(wires, dots, labels))
    return W, H, '\n'.join(body)


def blocks_esp32(m):
    NC = m.NC
    W, H = 2400, 1200
    b = [grid(W, H), header(70, 84, m.TITLE.upper(), 'Energia e sinal · de onde vem a força e por onde passa o comando', 'BATTLE BOTS · ELÉTRICA')]
    b += [frame(60, 200, 1240, 800, 'ENERGIA'), frame(1340, 200, 1000, 800, 'SINAIS DE COMANDO')]
    bw, bh = 200, 100

    def B(k, x, cy, title, sub, color, nets, pid=None):
        b.append(bbox(x, cy - bh / 2, bw, bh, title, sub, color, pid or k, nets))

    B('bateria', 90, 570, 'Bateria', ('LiPo 3S',), NC['vbat'], ['vbat', 'gnd'])
    B('fusivel', 340, 570, 'Fusível + link', ('VBAT+ protegido',), NC['vbat'], ['vbat'])
    B('lm2596', 620, 300, 'LM2596', ('3S → 5,0 V',), '#3f86d8', ['vbat', 'v5'])
    B('g2-l', 620, 480, 'G2 esquerdo', ('18v17',), '#3fae5a', ['vbat', 'ml'])
    B('g2-r', 620, 660, 'G2 direito', ('18v17',), '#3fae5a', ['vbat', 'mr'])
    B('esc', 620, 840, 'ESC', ('brushless',), '#e6c21d', ['vbat', 'ph'])
    B('esp32', 900, 300, 'ESP32', ('5V/VIN',), NC['v5'], ['v5'])
    B('motor-l', 900, 480, 'Motor esq.', ('motor DC',), NC['ml'], ['ml'])
    B('motor-r', 900, 660, 'Motor dir.', ('motor DC',), NC['mr'], ['mr'])
    B('brushless', 900, 840, 'Brushless', ('arma · opcional',), NC['ph'], ['ph'])
    A = [
        ('vbat', [(290, 570), (340, 570)], NC['vbat'], 7, False),
        ('vbat', [(540, 570), (580, 570), (580, 300), (620, 300)], NC['vbat'], 7, False),
        ('vbat', [(580, 480), (620, 480)], NC['vbat'], 7, False),
        ('vbat', [(580, 570), (580, 660), (620, 660)], NC['vbat'], 7, False),
        ('vbat', [(580, 660), (580, 840), (620, 840)], NC['vbat'], 7, False),
        ('v5', [(820, 300), (900, 300)], NC['v5'], 4, False),
        ('ml', [(820, 480), (900, 480)], NC['ml'], 4.5, False),
        ('mr', [(820, 660), (900, 660)], NC['mr'], 4.5, False),
        ('ph', [(820, 840), (900, 840)], NC['ph'], 5, False),
    ]
    b.append(arrows_render(A))
    b.append(Ci(580, 570, 7, NC['vbat'], C['bg'], 2.5) + Ci(580, 480, 7, NC['vbat'], C['bg'], 2.5) + Ci(580, 660, 7, NC['vbat'], C['bg'], 2.5))
    b.append(pill(860, 262, '5,0 V', NC['v5'], 11, net='v5'))
    b.append(T(90, 940, 'O barramento protegido alimenta o regulador, os dois drivers e o ESC. O ESP32 recebe só 5 V.', 13, C['mut'], weight=600))

    B('celular', 1380, 570, 'Celular', ('app BLE',), '#3f74e6', [])
    B('esp32b', 1660, 570, 'ESP32', ('RoboCombateESP32',), '#1f9d86', ['pwml', 'dirl', 'pwmr', 'dirr', 'esc'], 'esp32')
    B('g2-lb', 2110, 330, 'G2 esquerdo', ('PWM · DIR · FLT',), '#3fae5a', ['pwml', 'dirl', 'fltl'], 'g2-l')
    B('g2-rb', 2110, 570, 'G2 direito', ('PWM · DIR · FLT',), '#3fae5a', ['pwmr', 'dirr', 'fltr'], 'g2-r')
    B('escb', 2110, 810, 'ESC', ('sinal 3,3 V',), '#e6c21d', ['esc'], 'esc')
    A = [
        ('bt', [(1580, 570), (1660, 570)], '#8fb0f5', 3, True),
        ('pwml', [(1860, 550), (1990, 550), (1990, 330), (2110, 330)], NC['pwml'], 4, False),
        ('pwmr', [(1860, 570), (2110, 570)], NC['pwmr'], 4, False),
        ('esc', [(1860, 590), (1970, 590), (1970, 810), (2110, 810)], NC['esc'], 4, False),
    ]
    b.append(arrows_render(A))
    b += [pill(1620, 530, 'BLE', '#8fb0f5', 11), pill(2050, 330, 'GPIO25/26', NC['pwml'], 11, net='pwml'),
          pill(2040, 570, 'GPIO27/14', NC['pwmr'], 11, net='pwmr'), pill(2040, 810, 'GPIO18', NC['esc'], 11, net='esc')]
    b.append(T(1380, 940, 'Os pinos FLT voltam dos drivers ao ESP32 (GPIO32/33): em falha o firmware para tudo.', 13, C['mut'], weight=600))

    b.append(note_box(60, 1040, 1240, 'LIMITES', [
        'G2 18v17: 6,5–30 V; dimensione pela corrente de bloqueio dos motores.',
        'LM2596 ajustado em 5,0 V antes de ligar o ESP32; USB desconectado quando alimentado pelo 5V/VIN.',
    ], C['org'], 13, 22))
    b.append(note_box(1340, 1040, 1000, 'SEGURANÇA', [
        'Desconexão, timeout ou falha de driver desligam tração, arma e extra.',
        'O firmware não substitui o corte físico: use o link removível.',
    ], C['red'], 13, 22))
    return W, H, '\n'.join(b)
