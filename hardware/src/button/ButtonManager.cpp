#include "ButtonManager.h"

void ButtonManager::init() {
  pinMode(PIN_BUTTON, INPUT_PULLUP);
}

ButtonGesture ButtonManager::detectGesture() {
  if (digitalRead(PIN_BUTTON) == HIGH) {
    return GESTURE_NONE;
  }

  unsigned long pressStart = millis();

  // 1. Measure hold duration (non-blocking sampling)
  while (digitalRead(PIN_BUTTON) == LOW) {
    unsigned long heldMs = millis() - pressStart;

    if (heldMs >= HOLD_15S_FACTORY_RESET_MS) {
      // Held >= 15 seconds -> Factory Reset
      while (digitalRead(PIN_BUTTON) == LOW) delay(10);
      return GESTURE_HOLD_15S_FACTORY_RESET;
    }
    delay(10);
  }

  unsigned long totalHeldMs = millis() - pressStart;

  if (totalHeldMs >= HOLD_10S_PROVISION_MS) {
    // Held between 10s and 15s -> WiFi Provisioning Mode
    return GESTURE_HOLD_10S_PROVISION;
  }

  if (totalHeldMs >= HOLD_5S_ACTIVATE_MS) {
    // Held between 5s and 10s -> Wake / Activate Device
    return GESTURE_HOLD_5S_ACTIVATE;
  }

  if (totalHeldMs < DEBOUNCE_MS) {
    return GESTURE_NONE; // Electrical bounce noise
  }

  // 2. Button was released quickly (< 5s). Wait for possible Double-Press
  unsigned long releaseTime = millis();
  while (millis() - releaseTime < DOUBLE_PRESS_WINDOW_MS) {
    if (digitalRead(PIN_BUTTON) == LOW) {
      delay(DEBOUNCE_MS);
      while (digitalRead(PIN_BUTTON) == LOW) delay(10);
      return GESTURE_DOUBLE_PRESS; // Cancel order gesture
    }
    delay(10);
  }

  // 3. Single tap expired -> Confirmed Short Press (<800ms)
  return GESTURE_SHORT_PRESS;
}
