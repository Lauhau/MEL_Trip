import React, { useEffect, useRef, useState } from 'react';
import { DayItinerary } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface MapViewProps {
  day: DayItinerary;
}

const MapView: React.FC<MapViewProps> = ({ day }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Check if Leaflet is loaded
    if (!window.L || !mapRef.current) return;

    // Initialize Map only once
    if (!mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current).setView([-37.8136, 144.9631], 13); // Default Melbourne CBD
      
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Clear existing layers (except tiles)
    map.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Plot Events
    const points: [number, number][] = [];
    day.events.forEach(event => {
        if (event.lat && event.lng) {
            const marker = window.L.marker([event.lat, event.lng])
                .addTo(map)
                .bindPopup(`<b>${event.time}</b><br>${event.title}`);
            points.push([event.lat, event.lng]);
        }
    });

    // Fit bounds if points exist
    if (points.length > 0) {
        const bounds = window.L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Get User Location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setUserPos([latitude, longitude]);
            
            // Custom dot icon for user
            const userIcon = window.L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16]
            });

            window.L.marker([latitude, longitude], { icon: userIcon })
                .addTo(map)
                .bindPopup("您的位置");
        });
    }

  }, [day]);

  return (
    <div className="flex flex-col h-full relative">
        <div className="absolute top-4 left-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm">Day {day.day} 地圖總覽</h3>
            <p className="text-xs text-gray-500 truncate">{day.events.filter(e => e.lat).length} 個地點已釘選</p>
        </div>
        <div ref={mapRef} className="flex-1 w-full h-full" />
    </div>
  );
};

export default MapView;