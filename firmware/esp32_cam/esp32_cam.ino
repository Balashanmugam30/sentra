#include "esp_camera.h"
#include <WebServer.h>
#include <WiFi.h>

// Sentra Corridor Verification Camera B.
// Use only in public/corridor/safety zones. Never install in private rooms.
const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char *NODE_ID = "corridor_cam_01";

#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

WebServer server(80);

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.printf("[sentra-cam] Connecting Wi-Fi: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < 15000) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[sentra-cam] Online. Snapshot=http://%s/snapshot Stream=http://%s/stream\n", WiFi.localIP().toString().c_str(), WiFi.localIP().toString().c_str());
  } else {
    Serial.println("[sentra-cam] Wi-Fi connect timeout. Will retry.");
  }
}

bool startCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 2;
  config.grab_mode = CAMERA_GRAB_LATEST;

  esp_err_t error = esp_camera_init(&config);
  if (error != ESP_OK) {
    Serial.printf("[sentra-cam] Camera init failed: 0x%x\n", error);
    return false;
  }

  sensor_t *sensor = esp_camera_sensor_get();
  if (sensor) {
    sensor->set_framesize(sensor, FRAMESIZE_QVGA);
    sensor->set_quality(sensor, 12);
    sensor->set_brightness(sensor, 0);
    sensor->set_contrast(sensor, 1);
  }
  return true;
}

void handleRoot() {
  String body = "{";
  body += "\"node_id\":\"" + String(NODE_ID) + "\",";
  body += "\"status\":\"online\",";
  body += "\"snapshot\":\"/snapshot\",";
  body += "\"stream\":\"/stream\",";
  body += "\"public_area_only\":true";
  body += "}";
  server.send(200, "application/json", body);
}

void handleSnapshot() {
  camera_fb_t *frame = esp_camera_fb_get();
  if (!frame) {
    server.send(503, "text/plain", "camera capture failed");
    return;
  }

  server.sendHeader("Cache-Control", "no-store");
  server.send_P(200, "image/jpeg", reinterpret_cast<const char *>(frame->buf), frame->len);
  esp_camera_fb_return(frame);
}

void handleStream() {
  WiFiClient client = server.client();
  server.sendContent("HTTP/1.1 200 OK\r\n");
  server.sendContent("Content-Type: multipart/x-mixed-replace; boundary=sentra\r\n");
  server.sendContent("Cache-Control: no-store\r\n\r\n");

  while (client.connected()) {
    camera_fb_t *frame = esp_camera_fb_get();
    if (!frame) {
      delay(150);
      continue;
    }

    server.sendContent("--sentra\r\n");
    server.sendContent("Content-Type: image/jpeg\r\n");
    server.sendContent("Content-Length: " + String(frame->len) + "\r\n\r\n");
    client.write(frame->buf, frame->len);
    server.sendContent("\r\n");
    esp_camera_fb_return(frame);
    delay(120);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[sentra-cam] Corridor camera booting");

  if (!startCamera()) {
    Serial.println("[sentra-cam] Restarting after camera init failure");
    delay(2000);
    ESP.restart();
  }

  connectWiFi();
  server.on("/", HTTP_GET, handleRoot);
  server.on("/snapshot", HTTP_GET, handleSnapshot);
  server.on("/stream", HTTP_GET, handleStream);
  server.begin();
  Serial.println("[sentra-cam] HTTP server started");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  server.handleClient();
  delay(5);
}
