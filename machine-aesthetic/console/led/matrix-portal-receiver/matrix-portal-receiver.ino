#include <Adafruit_Protomatter.h>

// Matrix Portal M4 — official pinout (Adafruit_Protomatter examples)
uint8_t rgbPins[]  = {7, 8, 9, 10, 11, 12};
uint8_t addrPins[] = {17, 18, 19, 20, 21};
uint8_t clockPin   = 14;
uint8_t latchPin   = 15;
uint8_t oePin      = 16;

#define MATRIX_W 64
#define MATRIX_H 64
#define NUM_ADDR_PINS 5
#define FRAME_BYTES (MATRIX_W * MATRIX_H * 3)

Adafruit_Protomatter matrix(
  MATRIX_W, 4, 1, rgbPins, NUM_ADDR_PINS, addrPins,
  clockPin, latchPin, oePin, false);

static const uint8_t HDR0 = 0xAA;
static const uint8_t HDR1 = 0x55;

uint8_t rxFrame[FRAME_BYTES];
uint8_t showBuf[FRAME_BYTES];
size_t idx = 0;
uint8_t state = 0;
uint32_t lastSerialMs = 0;
#define SERIAL_BAUD 921600
#define DEMO_IDLE_MS 2500
#define PARTIAL_FRAME_MS 1500
#define DEMO_FRAME_MS 40

uint32_t framesReceived = 0;
uint32_t demoPhase = 0;
uint32_t lastDemoDrawMs = 0;
bool frameReady = false;

void drawDemoFrame(uint32_t phase) {
  for (int y = 0; y < MATRIX_H; y++) {
    for (int x = 0; x < MATRIX_W; x++) {
      uint8_t r = (x * 4 + phase) & 255;
      uint8_t g = (y * 4 + phase / 2) & 255;
      uint8_t b = ((x + y) * 2 + phase / 3) & 255;
      if ((y % 8) < 2) {
        r = 255;
        g = (phase / 4) & 255;
        b = 180;
      }
      matrix.drawPixel(x, y, matrix.color565(r, g, b));
    }
  }
  matrix.show();
}

void applyShowBuf() {
  uint8_t *p = showBuf;
  for (int y = 0; y < MATRIX_H; y++) {
    for (int x = 0; x < MATRIX_W; x++) {
      matrix.drawPixel(x, y, matrix.color565(p[0], p[1], p[2]));
      p += 3;
    }
  }
  matrix.show();
}

void setup() {
  Serial.begin(SERIAL_BAUD);
  while (!Serial && millis() < 3000) {}

  ProtomatterStatus status = matrix.begin();
  if (status != PROTOMATTER_OK) {
    for (;;) {
      Serial.println("ERR protomatter begin");
      delay(1000);
    }
  }

  drawDemoFrame(0);
  lastSerialMs = millis();
  lastDemoDrawMs = millis();
  Serial.println("READY 64x64 serial 0xAA 0x55 + 12288 bytes @921600");
}

void resetParser() {
  state = 0;
  idx = 0;
}

void loop() {
  // Drain USB serial before any blocking matrix.show() work.
  while (Serial.available()) {
    uint8_t b = Serial.read();
    lastSerialMs = millis();

    if (state == 0) {
      state = (b == HDR0) ? 1 : 0;
    } else if (state == 1) {
      if (b == HDR1) {
        idx = 0;
        state = 2;
      } else {
        state = (b == HDR0) ? 1 : 0;
      }
    } else {
      rxFrame[idx++] = b;
      if (idx >= FRAME_BYTES) {
        memcpy(showBuf, rxFrame, FRAME_BYTES);
        frameReady = true;
        resetParser();
      }
    }
  }

  if (state != 0 && millis() - lastSerialMs > PARTIAL_FRAME_MS) {
    resetParser();
  }

  if (frameReady) {
    applyShowBuf();
    framesReceived++;
    frameReady = false;
  }

  if (state == 0 && !frameReady && millis() - lastSerialMs > DEMO_IDLE_MS) {
    if (millis() - lastDemoDrawMs >= DEMO_FRAME_MS) {
      demoPhase += 4;
      drawDemoFrame(demoPhase);
      lastDemoDrawMs = millis();
    }
  }
}
