import type { ScanAndInjectResponse } from "@/lib/perception/types";

export async function runScanAndInject(): Promise<ScanAndInjectResponse> {
  const response = await fetch("/api/perception/scan-and-inject", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to run autonomous scan: ${response.status}`);
  }

  return response.json() as Promise<ScanAndInjectResponse>;
}

