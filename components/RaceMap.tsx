import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Waypoint } from '../types';
import { getPositionAtProgress } from '../utils/geo';
import { ROUTE_WAYPOINTS, TOTAL_GOAL_MILES } from '../constants';

// Google-style marker
const iconShoe = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#EA4335" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
  className: 'drop-shadow-md',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

interface RaceMapProps {
  progressPercentage: number;
  viewMode: 'global' | 'local';
}

const RaceMap: React.FC<RaceMapProps> = ({ progressPercentage, viewMode }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false // Custom placement later if needed, but standard is fine. Let's re-add it bottomright.
      }).setView([39.8283, -98.5795], 4);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Draw Route - Google Blue
      const latLngs = ROUTE_WAYPOINTS.map(wp => [wp.lat, wp.lng] as [number, number]);
      polylineRef.current = L.polyline(latLngs, {
        color: '#4285F4', // Google Blue
        weight: 5,
        opacity: 0.8,
      }).addTo(map);

      // Add start/end markers
      L.circleMarker([ROUTE_WAYPOINTS[0].lat, ROUTE_WAYPOINTS[0].lng], { color: '#34A853', fillColor: '#34A853', fillOpacity: 1, radius: 6 }).addTo(map).bindPopup("Start: Seattle");
      L.circleMarker([ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length-1].lat, ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length-1].lng], { color: '#EA4335', fillColor: '#EA4335', fillOpacity: 1, radius: 6 }).addTo(map).bindPopup("Finish: NYC");
      
      // Waypoint Markers
      ROUTE_WAYPOINTS.slice(1, -1).forEach(wp => {
         L.circleMarker([wp.lat, wp.lng], { color: '#FBBC05', fillColor: '#FBBC05', fillOpacity: 1, radius: 4 }).addTo(map).bindPopup(wp.name);
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // Handle Updates (Progress & View Mode)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update current position marker
    const [lat, lng] = getPositionAtProgress(ROUTE_WAYPOINTS, progressPercentage);
    const milesCovered = (progressPercentage * TOTAL_GOAL_MILES).toFixed(1);
    const percentDisplay = (progressPercentage * 100).toFixed(2);
    
    // Custom Popup Content
    const popupContent = `
      <div class="text-center font-sans">
        <div class="font-bold text-gray-800 text-sm">Current Location</div>
        <div class="text-xs text-gray-500 mt-1">${percentDisplay}% Complete</div>
        <div class="text-sm font-bold text-[#4285F4] mt-1 border-t pt-1 border-gray-100">${milesCovered} miles</div>
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setPopupContent(popupContent);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: iconShoe }).addTo(mapInstanceRef.current);
      markerRef.current.bindPopup(popupContent);
    }

    // Handle View Mode Switching
    if (viewMode === 'local') {
      // Zoom in to the current location (City View)
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.5 });
      markerRef.current.openPopup();
    } else {
      // Zoom out to show the whole USA/Route (Global View)
      mapInstanceRef.current.flyTo([39.8283, -98.5795], 4, { duration: 1.5 });
      markerRef.current.closePopup();
    }
    
  }, [progressPercentage, viewMode]);

  return <div ref={mapContainerRef} className="h-[450px] w-full rounded-2xl shadow-sm border border-gray-200 z-0 bg-white" />;
};

export default RaceMap;