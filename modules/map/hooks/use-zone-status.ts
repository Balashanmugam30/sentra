"use client";

import { useEffect, useState } from "react";

import { logger } from "@/lib/logger";

import { fetchZoneStatus } from "../api/map-client";
import type { ZoneStatus } from "../types/zone";

export function useZoneStatus(buildingId: string, zoneId: string) {
  const [zoneStatus, setZoneStatus] = useState<ZoneStatus | null>(null);

  useEffect(() => {
    let isActive = true;

    void fetchZoneStatus(buildingId, zoneId).then((response) => {
      if (!isActive) {
        return;
      }

      if (response.success && response.data) {
        setZoneStatus(response.data);
        return;
      }

      logger.warn("Unable to load zone status", {
        buildingId,
        zoneId,
        error: response.error,
      });
    });

    return () => {
      isActive = false;
    };
  }, [buildingId, zoneId]);

  return zoneStatus;
}
