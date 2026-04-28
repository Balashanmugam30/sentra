import type {
  HardwareCommandRequest,
  HardwareCommandResponse,
  HardwareDevicesResponse,
  HardwareIngestRequest,
  HardwareIngestResponse,
  HardwareLiveResponse,
  HardwareRegisterRequest,
  HardwareRegisterResponse,
  HardwareTestRequest,
  HardwareTestResponse,
} from "@/lib/hardware/types";
import { authenticatedFetch } from "@/lib/auth/fetch";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getHardwareLive(): Promise<HardwareLiveResponse> {
  const response = await authenticatedFetch("/hardware/live");
  return parseResponse(response, "Failed to fetch hardware live state");
}

export async function getHardwareDevices(): Promise<HardwareDevicesResponse> {
  const response = await authenticatedFetch("/hardware/devices");
  return parseResponse(response, "Failed to fetch hardware devices");
}

export async function registerHardwareDevice(
  payload: HardwareRegisterRequest,
): Promise<HardwareRegisterResponse> {
  const response = await authenticatedFetch("/hardware/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to register hardware device");
}

export async function ingestHardwareTelemetry(
  payload: HardwareIngestRequest,
): Promise<HardwareIngestResponse> {
  const response = await authenticatedFetch("/hardware/ingest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to ingest hardware telemetry");
}

export async function runHardwareTest(
  payload: HardwareTestRequest,
): Promise<HardwareTestResponse> {
  const response = await authenticatedFetch("/hardware/test-sensor", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to run hardware test");
}

export async function sendHardwareCommand(
  payload: HardwareCommandRequest,
): Promise<HardwareCommandResponse> {
  const response = await authenticatedFetch("/hardware/command", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to send device command");
}
