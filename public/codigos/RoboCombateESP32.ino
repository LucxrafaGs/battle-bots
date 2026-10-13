/* RoboCombateESP32 - Lucas Rafael
   Arduino IDE: ESP32 by Espressif Systems, versao 3.x. Placa: ESP32 Dev Module.
   ESP32 WROOM/classico, conforme ultimo diagrama; Bluetooth BLE integrado.
   Alimentacao: LM2596 ajustado a 5 V -> 5V/VIN. GND comum.
   G2 esquerdo: PWM=GPIO25, DIR=GPIO26, FLT=GPIO32.
   G2 direito:  PWM=GPIO27, DIR=GPIO14, FLT=GPIO33.
   FLT: cada um com pull-up externo 10k para 3V3, como no desenho.
   PWM: cada um com pull-down externo 10k para GND.
   ESC: sinal=GPIO18, pull-down 10k; exige entrada compativel com 3,3 V.
   Extra: GPIO23, novo pino opcional, nao desenhado no esquema anterior.
   Nao alimentar motores/solenoides/reles diretamente pelo GPIO23.

   APP: conectar via BLE ao nome RoboCombateESP32, escrever ASCII na RX.
   SERVICE_UUID e RX_UUID abaixo devem ser usados pelo futuro app.
   F frente | B tras | R direita | L esquerda | S parar tracao
   A ligar arma | D desligar arma | E extra | X parar tudo | H heartbeat
   H a cada 100 ms; repetir F/B/R/L a cada 100 ms enquanto pressionado.
   Ao soltar direcao enviar S. A/D/E/X: enviar apenas uma vez por toque.
   X tambem limpa falha travada, somente se ambos FLT estiverem HIGH.
   Desconexao/timeout/falha desligam arma, tracao e extra; sem retomada.

   ESC_STOP_US=1000 e ESC_RUN_US=1300 sao valores de referencia para
   ESC unidirecional 1000-2000 us. Confirmar manual; ESC bidirecional
   pode exigir 1500 us no neutro. Nao faz calibracao automatica.
   Testar sem mecanismo ativo acoplado; firmware nao substitui corte fisico.
*/
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <atomic>
#include <esp_arduino_version.h>
#if ESP_ARDUINO_VERSION_MAJOR < 3
#error "Use o pacote ESP32 by Espressif Systems versao 3.x."
#endif

const char *SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const char *RX_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const byte PWM_LEFT=25, DIR_LEFT=26, PWM_RIGHT=27, DIR_RIGHT=14;
const byte FLT_LEFT=32, FLT_RIGHT=33, ESC_PIN=18, EXTRA_PIN=23;
const bool INVERT_LEFT=false, INVERT_RIGHT=false;
const uint32_t DRIVE_DUTY=160; // 0..255; comecar baixo e ajustar sob teste
const int ESC_STOP_US=1000, ESC_RUN_US=1300;
const unsigned long ESC_STARTUP_MS=5000, LINK_TIMEOUT_MS=500;
const unsigned long MOVE_TIMEOUT_MS=350, REVERSAL_PAUSE_MS=100;
QueueHandle_t commandQueue;
BLEServer *bleServer;
std::atomic<bool> connected(false), disconnectedEvent(false), queueOverflow(false);
bool faultLatched=false;

void writeEsc(int us) {
  const uint32_t duty = ((uint32_t)us * 65535UL + 10000UL) / 20000UL;
  ledcWrite(ESC_PIN, duty); // 50 Hz, 16 bits; periodo de 20000 us
}
unsigned long bootTime, lastLink, lastMove, changeTime;
bool linkActive = false, moving = false, extraOn = false;
bool changing = false;
int currentLeft = 0, currentRight = 0, targetLeft = 0, targetRight = 0;

void writeMotor(byte pwm, byte dir, int direction, bool inverted) {
  if (inverted) direction = -direction;
  ledcWrite(pwm, 0);
  if (direction != 0) digitalWrite(dir, direction > 0 ? HIGH : LOW);
  ledcWrite(pwm, direction != 0 ? DRIVE_DUTY : 0);
}
void applyMotors(int left, int right) {
  writeMotor(PWM_LEFT, DIR_LEFT, left, INVERT_LEFT);
  writeMotor(PWM_RIGHT, DIR_RIGHT, right, INVERT_RIGHT);
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
  writeEsc(ESC_STOP_US);
  extraOn = false;
  digitalWrite(EXTRA_PIN, LOW);
}
void extraButton() {
  // Substitua esta funcao pela acao desejada. Padrao: alternar saida GPIO23.
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
  if (cmd == 'X') {
    stopAll();
    if (digitalRead(FLT_LEFT) == HIGH && digitalRead(FLT_RIGHT) == HIGH) faultLatched = false;
    return;
  }
  if (cmd == 'S') { stopDrive(); return; }
  if (cmd == 'D') { writeEsc(ESC_STOP_US); return; }
  if (cmd == 'H') return;
  if (faultLatched) return;
  if (now - bootTime < ESC_STARTUP_MS) return; // comandos nao ficam na fila
  switch (cmd) {
    case 'F': requestDrive( 1,  1, now); break;
    case 'B': requestDrive(-1, -1, now); break;
    case 'R': requestDrive( 1, -1, now); break; // gira no proprio eixo
    case 'L': requestDrive(-1,  1, now); break;
    case 'A': writeEsc(ESC_RUN_US); break;
    case 'E': extraButton(); break;
  }
}

class ServerEvents : public BLEServerCallbacks {
  void onConnect(BLEServer *) override { connected.store(true); }
  void onDisconnect(BLEServer *) override {
    connected.store(false);
    disconnectedEvent.store(true);
  }
};
class ReceiveCommands : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    if (!connected.load()) return;
    auto data = characteristic->getValue();
    for (size_t i=0; i<data.length(); i++) {
      char cmd=data[i];
      if (knownCommand(cmd) && xQueueSend(commandQueue, &cmd, 0) != pdTRUE) {
        queueOverflow.store(true);
        break;
      }
    }
  }
};
void setup() {
  Serial.begin(115200);
  const byte outputs[]={PWM_LEFT, DIR_LEFT, PWM_RIGHT, DIR_RIGHT, ESC_PIN, EXTRA_PIN};
  for (byte pin : outputs) { digitalWrite(pin, LOW); pinMode(pin, OUTPUT); }
  pinMode(FLT_LEFT, INPUT_PULLUP);
  pinMode(FLT_RIGHT, INPUT_PULLUP);
  // Canais 0/1: mesmo timer da tracao. Canal 2: outro timer para o ESC.
  bool okLeft=ledcAttachChannel(PWM_LEFT, 20000, 8, 0);
  bool okRight=ledcAttachChannel(PWM_RIGHT, 20000, 8, 1);
  bool okEsc=ledcAttachChannel(ESC_PIN, 50, 16, 2);
  if (!okLeft || !okRight || !okEsc) {
    if (okLeft) ledcWrite(PWM_LEFT, 0);
    if (okRight) ledcWrite(PWM_RIGHT, 0);
    if (okEsc) writeEsc(ESC_STOP_US);
    Serial.println("ERRO PWM: corrigir configuracao; controle bloqueado.");
    while (true) delay(1000);
  }
  stopAll();
  bootTime=lastLink=lastMove=millis();
  commandQueue=xQueueCreate(64, sizeof(char));
  if (!commandQueue) { while (true) delay(1000); }
  BLEDevice::init("RoboCombateESP32");
  bleServer=BLEDevice::createServer();
  bleServer->setCallbacks(new ServerEvents());
  BLEService *service=bleServer->createService(SERVICE_UUID);
  BLECharacteristic *rx=service->createCharacteristic(RX_UUID,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  rx->setCallbacks(new ReceiveCommands());
  service->start();
  BLEAdvertising *advertising=BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->start();
  Serial.println("BLE RoboCombateESP32 pronto; aguardando inicializacao do ESC.");
}
void loop() {
  unsigned long now=millis();
  if (disconnectedEvent.exchange(false)) {
    stopAll(); linkActive=false; xQueueReset(commandQueue);
    if (!connected.load()) bleServer->startAdvertising();
  }
  if (!connected.load()) {
    stopAll(); linkActive=false; xQueueReset(commandQueue); delay(1); return;
  }
  if (queueOverflow.exchange(false)) {
    stopAll(); linkActive=false; xQueueReset(commandQueue);
  }
  if (digitalRead(FLT_LEFT)==LOW || digitalRead(FLT_RIGHT)==LOW) {
    if (!faultLatched) Serial.println("FALHA DRIVER: parada travada; X para rearmar apos corrigir.");
    faultLatched=true; stopAll();
  }
  if (linkActive && now-lastLink>=LINK_TIMEOUT_MS) {
    stopAll(); linkActive=false; xQueueReset(commandQueue);
  }
  if (moving && now-lastMove>=MOVE_TIMEOUT_MS) stopDrive();
  char cmd;
  for (byte n=0; n<16 && xQueueReceive(commandQueue, &cmd, 0)==pdTRUE; n++) {
    if (!connected.load()) { stopAll(); break; }
    handleCommand(cmd, millis());
  }
  now=millis();
  if (changing && now-changeTime>=REVERSAL_PAUSE_MS && !faultLatched) {
    changing=false; applyMotors(targetLeft, targetRight);
  }
  delay(1);
}
