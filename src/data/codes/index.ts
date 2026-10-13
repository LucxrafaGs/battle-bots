import type { CodeEntry } from '@/types/content';

/* ==========================================================================
   BIBLIOTECA DE CÓDIGOS
   Os arquivos-fonte ficam em public/codigos/. Cada entrada aponta para o
   arquivo e descreve placa, linguagem, seções explicadas e instruções.
   ========================================================================== */

const PROTOCOLO =
  'Comandos do app (ASCII): F frente · B trás · R direita · L esquerda · S parar tração · A liga arma · D desliga arma · E extra · X parar tudo · H heartbeat a cada 100 ms. Repita F/B/R/L a cada 100 ms enquanto o botão estiver pressionado.';

export const CODES: CodeEntry[] = [
  {
    id: 'robo-arduino',
    name: 'Robô de combate — Arduino',
    description:
      'Arduino Nano/Uno + HC-06 + L298N + ESC. Mesmas ligações da prancha “Robô básico” da aba Elétrica.',
    board: 'Arduino Nano / Uno (ATmega328P)',
    language: 'cpp',
    source: 'codigos/RoboCombate.ino',
    filename: 'RoboCombate.ino',
    sections: [
      { title: 'Cabeçalho e protocolo', lines: [1, 21], text: 'Pinos usados, comandos aceitos pelo app e avisos sobre os valores do ESC.' },
      { title: 'Configuração', lines: [22, 42], text: 'Pinos (BT D2/D3, IN1–IN4 em D9–D12, ESC no D5), tempos de segurança e estado.' },
      { title: 'Motores', lines: [44, 85], text: 'Sentido de cada motor pelo L298N, parada e pausa de 100 ms antes de inverter o sentido.' },
      { title: 'Comandos', lines: [86, 108], text: 'Interpreta as letras do app; ignora movimento nos 5 s iniciais enquanto o ESC arma.' },
      { title: 'setup()', lines: [109, 122], text: 'Saídas em LOW e ESC em 1000 µs antes de anexar o servo.' },
      { title: 'loop()', lines: [123, 140], text: 'Para tudo se o link cair (500 ms) ou se o movimento não for repetido (350 ms).' },
    ],
    instructions: [
      'Arduino IDE: placa Arduino Nano (ATmega328P) ou Uno.',
      'Desligue a chave geral do robô antes de gravar pelo USB.',
      'Ajuste ESC_STOP_US / ESC_RUN_US ao manual do seu ESC (ESC bidirecional usa 1500 µs como neutro).',
      'Confirme o baud do HC-06 (padrão 9600).',
      PROTOCOLO,
      'Teste primeiro sem a arma montada.',
    ],
  },
  {
    id: 'robo-esp32',
    name: 'Robô de combate — ESP32',
    description:
      'ESP32 DevKit com Bluetooth BLE integrado, dois drivers G2 18v17 e ESC. Mesmas ligações da prancha “Robô ESP32” da aba Elétrica.',
    board: 'ESP32 Dev Module (WROOM)',
    language: 'cpp',
    source: 'codigos/RoboCombateESP32.ino',
    filename: 'RoboCombateESP32.ino',
    sections: [
      { title: 'Cabeçalho e protocolo', lines: [1, 26], text: 'Pinos, resistores de pull-up/pull-down, nome BLE e comandos do app.' },
      { title: 'Configuração', lines: [27, 51], text: 'UUIDs BLE, pinos PWM/DIR/FLT dos drivers, ESC no GPIO18 e tempos de segurança.' },
      { title: 'ESC e motores', lines: [53, 104], text: 'Pulso de 50 Hz para o ESC e controle de sentido e PWM de cada driver G2.' },
      { title: 'Comandos', lines: [105, 132], text: 'Interpreta as letras; X também libera uma falha travada quando os dois FLT estão normais.' },
      { title: 'Bluetooth BLE', lines: [134, 153], text: 'Conexão, desconexão e fila de comandos recebidos.' },
      { title: 'setup()', lines: [154, 188], text: 'Canais PWM (tração 20 kHz, ESC 50 Hz) e início do anúncio BLE.' },
      { title: 'loop()', lines: [189, 219], text: 'Para tudo ao desconectar, em falha de driver, timeout ou fila cheia.' },
    ],
    instructions: [
      'Arduino IDE: pacote “ESP32 by Espressif Systems” versão 3.x, placa ESP32 Dev Module.',
      'Ajuste o LM2596 para 5,0 V e meça antes de ligar no 5V/VIN do ESP32.',
      'O ESC precisa aceitar sinal de 3,3 V.',
      'No app, conecte via BLE ao nome “RoboCombateESP32” e escreva na característica RX.',
      PROTOCOLO,
      'Comece com DRIVE_DUTY baixo e teste sem a arma montada.',
    ],
  },
];
