/* Arquivo gerado por scripts/diagramas/gen.py — não editar à mão. */
import type { DiagramNet } from '@/types/content';

export const NETS_BASICO: DiagramNet[] = [
  {
    "id": "vbat",
    "label": "12 V da bateria (VBAT)",
    "color": "#ef3535",
    "detail": "LiPo 3S → chave geral → L298N (12V) e ESC (+). 11,1 V nominal, 12,6 V com a bateria cheia."
  },
  {
    "id": "gnd",
    "label": "GND comum",
    "color": "#8b949e",
    "detail": "Negativo da bateria ligado ao GND do L298N, do ESC, do Nano e do HC-06. Sem GND comum os sinais não funcionam."
  },
  {
    "id": "v5",
    "label": "5 V da lógica",
    "color": "#f472b6",
    "detail": "Regulador 78M05 do L298N (jumper 5V-EN fechado) → pino 5V do Nano → VCC do HC-06."
  },
  {
    "id": "in1",
    "label": "D9 → IN1",
    "color": "#ff8a3d",
    "detail": "Motor A, sentido 1."
  },
  {
    "id": "in2",
    "label": "D10 → IN2",
    "color": "#e5e5e5",
    "detail": "Motor A, sentido 2."
  },
  {
    "id": "in3",
    "label": "D11 → IN3",
    "color": "#22d3ee",
    "detail": "Motor B, sentido 1."
  },
  {
    "id": "in4",
    "label": "D12 → IN4",
    "color": "#3b82f6",
    "detail": "Motor B, sentido 2."
  },
  {
    "id": "ma",
    "label": "Motor A (OUT1/OUT2)",
    "color": "#a3e635",
    "detail": "Roda esquerda. Se girar ao contrário, inverta os dois fios no borne."
  },
  {
    "id": "mb",
    "label": "Motor B (OUT3/OUT4)",
    "color": "#facc15",
    "detail": "Roda direita. Se girar ao contrário, inverta os dois fios no borne."
  },
  {
    "id": "tx",
    "label": "HC-06 TXD → D2",
    "color": "#e879f9",
    "detail": "Dados do Bluetooth para o Nano (3,3 V, o Nano lê sem problema). SoftwareSerial RX = D2."
  },
  {
    "id": "rx5",
    "label": "D3 → R1 (5 V)",
    "color": "#34d399",
    "detail": "Saída serial do Nano (SoftwareSerial TX = D3), ainda em 5 V."
  },
  {
    "id": "rx33",
    "label": "Divisor → HC-06 RXD (3,3 V)",
    "color": "#86efac",
    "detail": "Depois do divisor 1 kΩ / 2 kΩ: 5 V × 2/3 ≈ 3,3 V, seguro para o RXD do HC-06."
  },
  {
    "id": "pwm",
    "label": "D5 → sinal do ESC",
    "color": "#c084fc",
    "detail": "Pulso de servo 50 Hz, 1000–2000 µs (biblioteca Servo). 1000 µs = arma parada."
  },
  {
    "id": "ph",
    "label": "Fases A/B/C do A2212",
    "color": "#c08457",
    "detail": "Três fases do motor da arma. A ordem é livre: trocar quaisquer duas inverte o giro."
  }
];

export const NETS_AVANCADO: DiagramNet[] = [
  {
    "id": "vbat",
    "label": "12 V da bateria (VBAT)",
    "color": "#ef3535",
    "detail": "LiPo 3S → chave geral → chicote 1→3 → + dos três ESCs."
  },
  {
    "id": "gnd",
    "label": "GND comum",
    "color": "#8b949e",
    "detail": "Negativo da bateria → − dos três ESCs."
  },
  {
    "id": "ch1",
    "label": "CH1 → ESC roda esquerda",
    "color": "#ff8a3d",
    "detail": "Saída do canal 1 do receptor. Com Elevon ligado no rádio, mistura acelerador e direção."
  },
  {
    "id": "ch2",
    "label": "CH2 → ESC roda direita",
    "color": "#22d3ee",
    "detail": "Saída do canal 2 (par do Elevon). Se o lado andar invertido, use Reverse no CH2."
  },
  {
    "id": "ch3",
    "label": "CH3 → ESC da arma",
    "color": "#c084fc",
    "detail": "Acelerador (manche esquerdo, não centraliza). Failsafe deste canal = mínimo."
  },
  {
    "id": "bec",
    "label": "BEC 5 V → receptor",
    "color": "#f472b6",
    "detail": "Fio vermelho do cabo de sinal do ESC da roda direita: 5 V que alimentam o receptor. Único BEC ligado."
  },
  {
    "id": "rxgnd",
    "label": "GND do receptor",
    "color": "#a8a29e",
    "detail": "Fio marrom do mesmo cabo: negativo do receptor (é o mesmo GND da bateria, via ESC)."
  },
  {
    "id": "ph",
    "label": "Fases A/B/C dos motores",
    "color": "#c08457",
    "detail": "Três fases por motor. Ordem livre: trocar duas inverte o sentido."
  }
];

export const NETS_ESP32: DiagramNet[] = [
  {
    "id": "vbat",
    "label": "VBAT+ protegido",
    "color": "#ef3535",
    "detail": "LiPo 3S → fusível F1 → link removível → LM2596, VIN dos dois drivers G2 e + do ESC."
  },
  {
    "id": "gnd",
    "label": "GND comum",
    "color": "#8b949e",
    "detail": "Todos os GND são o mesmo nó: bateria, LM2596, ESP32, drivers G2 e ESC."
  },
  {
    "id": "v5",
    "label": "5 V (LM2596)",
    "color": "#4ade80",
    "detail": "Saída do LM2596 ajustada em 5,0 V → pino 5V/VIN do ESP32. Meça antes de ligar."
  },
  {
    "id": "v33",
    "label": "3V3 do ESP32",
    "color": "#2dd4bf",
    "detail": "Saída 3,3 V do ESP32, usada só para os pull-ups de 10k dos pinos FLT."
  },
  {
    "id": "fltl",
    "label": "GPIO32 ← FLT esquerdo",
    "color": "#c084fc",
    "detail": "Falha do driver esquerdo (ativo em LOW). Pull-up 10k ao 3V3. O código trava tudo em falha."
  },
  {
    "id": "dirl",
    "label": "GPIO26 → DIR esquerdo",
    "color": "#22d3ee",
    "detail": "Sentido do motor esquerdo."
  },
  {
    "id": "pwml",
    "label": "GPIO25 → PWM esquerdo",
    "color": "#3b82f6",
    "detail": "Velocidade do motor esquerdo, PWM 20 kHz. Pull-down 10k: motor parado enquanto o ESP32 inicia."
  },
  {
    "id": "fltr",
    "label": "GPIO33 ← FLT direito",
    "color": "#e879f9",
    "detail": "Falha do driver direito (ativo em LOW). Pull-up 10k ao 3V3."
  },
  {
    "id": "dirr",
    "label": "GPIO14 → DIR direito",
    "color": "#e5e5e5",
    "detail": "Sentido do motor direito."
  },
  {
    "id": "pwmr",
    "label": "GPIO27 → PWM direito",
    "color": "#ff8a3d",
    "detail": "Velocidade do motor direito, PWM 20 kHz. Pull-down 10k."
  },
  {
    "id": "esc",
    "label": "GPIO18 → sinal do ESC",
    "color": "#f472b6",
    "detail": "Pulso de servo 50 Hz, 1000–2000 µs, em 3,3 V. Pull-down 10k. O ESC precisa aceitar 3,3 V."
  },
  {
    "id": "ml",
    "label": "Motor esquerdo (OUTA/OUTB)",
    "color": "#a3e635",
    "detail": "Saídas do G2 esquerdo para o motor DC."
  },
  {
    "id": "mr",
    "label": "Motor direito (OUTA/OUTB)",
    "color": "#fbbf24",
    "detail": "Saídas do G2 direito para o motor DC."
  },
  {
    "id": "ph",
    "label": "Fases do brushless",
    "color": "#c08457",
    "detail": "Três fases do motor da arma; trocar duas inverte o giro."
  }
];
