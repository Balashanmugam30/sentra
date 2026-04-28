import type {
  PerceptionDetectionResponse,
  PerceptionLiveResponse,
} from "@/lib/perception/types";

export async function getLivePerception(): Promise<PerceptionLiveResponse> {
  const response = await fetch("/api/perception/live");

  if (!response.ok) {
    throw new Error(`Failed to fetch perception snapshot: ${response.status}`);
  }

  return response.json() as Promise<PerceptionLiveResponse>;
}

export async function getPerceptionDetections(): Promise<PerceptionDetectionResponse> {
  const response = await fetch("/api/perception/detections");

  if (!response.ok) {
    throw new Error(`Failed to fetch detections: ${response.status}`);
  }

  return response.json() as Promise<PerceptionDetectionResponse>;
}

