import { Waypoint } from '../types';

// Convert Degrees to Radians
function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Calculate Haversine Distance between two points (in kilometers, then converted to generic units for ratio)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total length of the polyline
export function calculateRouteTotalDistance(waypoints: Waypoint[]): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += haversineDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }
  return total;
}

// Get coordinate at a specific percentage of the total route
export function getPositionAtProgress(waypoints: Waypoint[], percentage: number): [number, number] {
  if (percentage <= 0) return [waypoints[0].lat, waypoints[0].lng];
  if (percentage >= 1) return [waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng];

  const totalDist = calculateRouteTotalDistance(waypoints);
  const targetDist = totalDist * percentage;

  let currentDist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segmentDist = haversineDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );

    if (currentDist + segmentDist >= targetDist) {
      // Interpolate in this segment
      const remaining = targetDist - currentDist;
      const ratio = remaining / segmentDist;
      const lat = waypoints[i].lat + (waypoints[i + 1].lat - waypoints[i].lat) * ratio;
      const lng = waypoints[i].lng + (waypoints[i + 1].lng - waypoints[i].lng) * ratio;
      return [lat, lng];
    }
    currentDist += segmentDist;
  }

  return [waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng];
}
