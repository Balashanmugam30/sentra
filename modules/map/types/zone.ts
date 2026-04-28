// Zone status types remain inside the map module because they are tightly
// coupled to spatial views and evacuation overlays.
export interface ZoneStatus {
  zone_id: string;
  hazard_level: string;
  occupancy_estimate: number;
}
