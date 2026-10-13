/* RoboCombate - Lucas Rafael
   Arduino Nano/Uno ATmega328P + HC-06 + L298N + ESC RC PWM.
   Bluetooth: HC-06 TX -> D2; D3 -> divisor 1k/2k -> HC-06 RX.
   L298N: IN1=D9, IN2=D10, IN3=D11, IN4=D12. ENA/ENB com jumpers.
   ESC: sinal=D5; GND comum; isolar BEC se houver outra fonte de 5V.
   Extra: D13 (LED integrado por padrao; nao alimenta cargas diretamente).

   APP -> Arduino (ASCII, sem necessidade de quebra de linha):
   F frente | B tras | R direita | L esquerda | S parar tracao
   A ligar arma | D desligar arma | E botao extra | X parar tudo
   H heartbeat: enviar a cada 100 ms durante toda a conexao.
   Repetir F/B/R/L a cada 100 ms enquanto pressionado; ao soltar enviar S.
   A/D/E/X sao eventos: enviar uma vez por toque. E nao deve ser repetido.
   Heartbeat mantem a conexao, mas NAO mantem movimento sem F/B/R/L.
   Reconectar nao retoma comandos anteriores.

   ESC_STOP_US / ESC_RUN_US devem corresponder ao manual do seu ESC.
   Valores abaixo pressupõem ESC de aviao unidirecional, 1000-2000 us.
   ESC bidirecional pode usar 1500 us como neutro: ajustar antes de usar.
   Nao faz calibracao automatica. Testar sem mecanismo ativo acoplado.
*/
#include <SoftwareSerial.h>
#include <Servo.h>

const byte BT_RX = 2, BT_TX = 3;
const byte IN1 = 9, IN2 = 10, IN3 = 11, IN4 = 12;
const byte ESC_PIN = 5, EXTRA_PIN = 13;
const bool INVERT_LEFT = false, INVERT_RIGHT = false;
const int ESC_STOP_US = 1000;
const int ESC_RUN_US = 1300; // valor inicial de teste, ajustar ao ESC/motor
const unsigned long BT_BAUD = 9600; // confirmar baud configurado no HC-06
const unsigned long ESC_STARTUP_MS = 5000; // confirmar tempo no manual
const unsigned long LINK_TIMEOUT_MS = 500;
const unsigned long MOVE_TIMEOUT_MS = 350;
const unsigned long REVERSAL_PAUSE_MS = 100;

SoftwareSerial bluetooth(BT_RX, BT_TX);
Servo esc;
unsigned long bootTime, lastLink, lastMove, changeTime;
bool linkActive = false, moving = false, extraOn = false;
bool changing = false;
int currentLeft = 0, currentRight = 0, targetLeft = 0, targetRight = 0;

void writeMotor(byte a, byte b, int direction, bool inverted) {
  if (inverted) direction = -direction;
  digitalWrite(a, direction > 0 ? HIGH : LOW);
  digitalWrite(b, direction < 0 ? HIGH : LOW);
}
void applyMotors(int left, int right) {
  writeMotor(IN1, IN2, left, INVERT_LEFT);
  writeMotor(IN3, IN4, right, INVERT_RIGHT);
  currentLeft = left;
  currentRight = right;
}
void stopDrive() {
  moving = false;
  changing = false;
  targetLeft = targetRight = 0;
  applyMotors(0, 0);
}
void stopAll() {
  stopDrive();
  esc.writeMicroseconds(ESC_STOP_US);
  extraOn = false;
  digitalWrite(EXTRA_PIN, LOW);
}
void extraButton() {
  // Substitua esta funcao pela acao desejada. Padrao: alternar LED D13.
  extraOn = !extraOn;
  digitalWrite(EXTRA_PIN, extraOn ? HIGH : LOW);
}
void requestDrive(int left, int right, unsigned long now) {
  lastMove = now;
  moving = true;
  targetLeft = left;
  targetRight = right;
  if (changing) return; // nao reiniciar espera quando o app repete a letra
  if (currentLeft * left < 0 || currentRight * right < 0) {
    applyMotors(0, 0);
    changing = true;
    changeTime = now;
  } else {
    applyMotors(left, right);
  }
}
bool knownCommand(char cmd) {
  return cmd == 'F' || cmd == 'B' || cmd == 'R' || cmd == 'L' ||
         cmd == 'S' || cmd == 'A' || cmd == 'D' || cmd == 'E' ||
         cmd == 'X' || cmd == 'H';
}
void handleCommand(char cmd, unsigned long now) {
  if (!knownCommand(cmd)) return; // ignora CR/LF e bytes desconhecidos
  lastLink = now;
  linkActive = true;
  if (cmd == 'X') { stopAll(); return; }
  if (cmd == 'S') { stopDrive(); return; }
  if (cmd == 'D') { esc.writeMicroseconds(ESC_STOP_US); return; }
  if (cmd == 'H') return;
  if (now - bootTime < ESC_STARTUP_MS) return; // comandos nao ficam na fila
  switch (cmd) {
    case 'F': requestDrive( 1,  1, now); break;
    case 'B': requestDrive(-1, -1, now); break;
    case 'R': requestDrive( 1, -1, now); break; // gira no proprio eixo
    case 'L': requestDrive(-1,  1, now); break;
    case 'A': esc.writeMicroseconds(ESC_RUN_US); break;
    case 'E': extraButton(); break;
  }
}
void setup() {
  const byte outputs[] = {IN1, IN2, IN3, IN4, EXTRA_PIN};
  for (byte i = 0; i < sizeof(outputs); i++) {
    digitalWrite(outputs[i], LOW);
    pinMode(outputs[i], OUTPUT);
  }
  // Configurar pulso de parada ANTES de attach evita o padrao de 1500 us.
  esc.writeMicroseconds(ESC_STOP_US);
  esc.attach(ESC_PIN, 1000, 2000);
  esc.writeMicroseconds(ESC_STOP_US);
  bluetooth.begin(BT_BAUD);
  bootTime = lastLink = lastMove = millis();
  stopAll();
}
void loop() {
  unsigned long now = millis();
  // Verifica o prazo antes de consumir novos comandos.
  if (linkActive && now - lastLink >= LINK_TIMEOUT_MS) {
    stopAll();
    linkActive = false;
  }
  if (moving && now - lastMove >= MOVE_TIMEOUT_MS) stopDrive();
  // Limite de leitura mantem as verificacoes de tempo responsivas.
  for (byte n = 0; n < 16 && bluetooth.available(); n++) {
    handleCommand((char)bluetooth.read(), millis());
  }
  now = millis();
  if (changing && now - changeTime >= REVERSAL_PAUSE_MS) {
    changing = false;
    applyMotors(targetLeft, targetRight);
  }
}
