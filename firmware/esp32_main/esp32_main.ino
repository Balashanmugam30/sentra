#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Bala";
const char* password = "SINCE2007";

const char* apiUrl = "http://10.104.62.92:8000/iot/telemetry";

#define MQ_PIN        34
#define TEMP_PIN      32
#define FLAME_PIN     27
#define BUTTON_PIN    26
#define BUZZER_PIN    25

#define TRIG_PIN      5
#define ECHO_PIN      18

unsigned long lastSend = 0;

long readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) return -1;

  return duration * 0.034 / 2;
}

void setup() {
  Serial.begin(115200);

  pinMode(FLAME_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  digitalWrite(BUZZER_PIN, LOW);

  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  int gas = analogRead(MQ_PIN);
  int tempRaw = analogRead(TEMP_PIN);
  int flame = digitalRead(FLAME_PIN);
  int panic = digitalRead(BUTTON_PIN);

  long distance = readDistance();

  String risk = "SAFE";
  bool alarm = false;

  if (flame == LOW) {
    risk = "FIRE_DETECTED";
    alarm = true;
  }
  else if (gas > 2500) {
    risk = "GAS_LEAK";
    alarm = true;
  }
  else if (tempRaw > 2200) {
    risk = "HIGH_TEMP";
    alarm = true;
  }
  else if (panic == LOW) {
    risk = "PANIC_BUTTON";
    alarm = true;
  }
  else if (distance > 0 && distance < 30) {
    risk = "PATH_BLOCKED";
  }

  digitalWrite(BUZZER_PIN, alarm ? HIGH : LOW);

  Serial.println("---------------");
  Serial.print("Gas: "); Serial.println(gas);
  Serial.print("TempRaw: "); Serial.println(tempRaw);
  Serial.print("Flame: "); Serial.println(flame);
  Serial.print("Button: "); Serial.println(panic);
  Serial.print("Distance(cm): "); Serial.println(distance);
  Serial.print("Risk: "); Serial.println(risk);

  if (WiFi.status() == WL_CONNECTED && millis() - lastSend > 5000) {

    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<512> doc;

    doc["node_id"] = "utility_node_01";
    doc["gas_level"] = gas;
    doc["temperature_raw"] = tempRaw;
    doc["flame_detected"] = (flame == LOW);
    doc["button_pressed"] = (panic == LOW);
    doc["distance_cm"] = distance;
    doc["risk"] = risk;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);

    Serial.print("POST Response: ");
    Serial.println(code);

    http.end();

    lastSend = millis();
  }

  delay(2000);
}