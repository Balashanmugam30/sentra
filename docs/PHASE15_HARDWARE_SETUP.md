# Sentra Phase 15.1 Hardware Setup

This guide connects the Sentra Smart Edge Node prototype to the production backend and the `/iot` dashboard.

## Architecture

- Node A: `utility_node_01`, ESP32 with MQ gas sensor, DHT22, flame sensor, buzzer, and emergency push button.
- Node B: `corridor_cam_01`, ESP32-CAM for public/corridor verification only.
- Backend intake: `POST /iot/telemetry` directly, or `POST /api/iot/telemetry` through the Next.js proxy.
- Dashboard: `/iot`.

## Backend Configuration

Optional environment variables:

```bash
SENTRA_IOT_STORE_PATH=./data/iot_store.json
SENTRA_IOT_NODE_TOKEN=change-me-for-field-tests
SENTRA_IOT_CAMERA_SNAPSHOT_URL=http://esp32-cam.local/snapshot
SENTRA_IOT_CAMERA_STREAM_URL=http://esp32-cam.local/stream
```

If `SENTRA_IOT_NODE_TOKEN` is unset, the prototype accepts telemetry without a token for local development. Set it before field trials and pass the same value as `X-Sentra-Node-Token` from firmware.

## Node A Wiring

| Device | ESP32 Pin | Notes |
| --- | --- | --- |
| MQ analog output | GPIO 34 | ADC input, 0-4095 |
| DHT22 data | GPIO 4 | Use a 10k pull-up if required |
| Flame sensor digital output | GPIO 27 | Firmware assumes active-low |
| Buzzer positive | GPIO 25 | Use transistor driver for louder buzzers |
| Push button | GPIO 26 | Input pull-up, button to GND |
| Common ground | GND | Shared ground for all sensors |

Power MQ sensors from the voltage recommended by your module. Many MQ modules expect 5V heater power and expose an analog output; verify voltage before connecting to ESP32 ADC.

## Node A Firmware

Open `firmware/esp32_main/esp32_main.ino` in Arduino IDE or PlatformIO.

Required libraries:

- `DHT sensor library`
- `ArduinoJson`

Board target:

- ESP32 Dev Module

Set:

```cpp
const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char *SENTRA_TELEMETRY_URL = "http://YOUR_BACKEND_IP:8000/iot/telemetry";
const char *SENTRA_NODE_TOKEN = "same-token-as-SENTRA_IOT_NODE_TOKEN";
```

Serial output uses `[sentra]` prefixes and reports Wi-Fi reconnects, risk responses, and buzzer commands.

## ESP32-CAM Firmware

Open `firmware/esp32_cam/esp32_cam.ino`.

Board target:

- AI Thinker ESP32-CAM

After flashing, open the serial monitor to find:

```text
Snapshot=http://CAMERA_IP/snapshot
Stream=http://CAMERA_IP/stream
```

Set `SENTRA_IOT_CAMERA_STREAM_URL` and `SENTRA_IOT_CAMERA_SNAPSHOT_URL` to those URLs. The camera firmware uses QVGA for stable public-area verification over unstable Wi-Fi.

## API Smoke Test

```bash
curl -X POST http://127.0.0.1:8000/iot/telemetry \
  -H "Content-Type: application/json" \
  -H "X-Sentra-Node-Token: change-me-for-field-tests" \
  -d '{
    "node_id": "utility_node_01",
    "temperature": 66.2,
    "humidity": 42,
    "gas_level": 2810,
    "flame_detected": true,
    "button_pressed": false,
    "wifi_rssi": -58
  }'
```

Expected response:

- `risk_level` becomes `CRITICAL+`.
- `buzzer_command` becomes `on`.
- `camera_snapshot_requested` becomes `true`.
- Sentra creates an incident and audit record.

## Privacy Rules

- ESP32-CAM is only for corridors, lobbies, stairwell entries, and public safety zones.
- Do not install cameras in guest rooms, bathrooms, staff changing areas, private offices, or any area where occupants expect privacy.
- Use signage and local consent/compliance review before field deployment.

## Troubleshooting

- If telemetry is missing, confirm the ESP32 can reach the backend IP from the same Wi-Fi network.
- If Wi-Fi drops, firmware reconnects automatically and continues local buzzer protection.
- If the camera stream is unstable, use `/snapshot` first and keep QVGA resolution.
- If the backend returns 401, check `SENTRA_IOT_NODE_TOKEN` and `X-Sentra-Node-Token`.
- If DHT values show null, verify sensor wiring and pull-up resistor.
