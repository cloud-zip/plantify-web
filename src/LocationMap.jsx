import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationClick({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  const [lat, lng] = center || [];
  useEffect(() => {
    const hasLat = lat !== undefined && lat !== null && lat !== '';
    const hasLng = lng !== undefined && lng !== null && lng !== '';
    if (hasLat && hasLng) {
      map.flyTo([Number(lat), Number(lng)], 13);
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationMap({ lat, lng, onLocationSelect }) {
  const hasLat = lat !== undefined && lat !== null && lat !== '';
  const hasLng = lng !== undefined && lng !== null && lng !== '';
  const hasCoords = hasLat && hasLng;

  const mapLat = hasLat ? Number(lat) : 20.5937;
  const mapLng = hasLng ? Number(lng) : 78.9629;
  const defaultCenter = [mapLat, mapLng]; // India center fallback safely

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 mt-3 relative z-10">
      <MapContainer center={defaultCenter} zoom={hasCoords ? 13 : 4} style={{ height: '100%', width: '100%', backgroundColor: '#13140f' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={[lat, lng]} />
        <LocationClick onLocationSelect={onLocationSelect} />
        {hasCoords && (
          <Marker position={[Number(lat), Number(lng)]} />
        )}
      </MapContainer>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-control-attribution {
          background-color: rgba(0,0,0,0.5) !important;
          color: #aaa !important;
        }
        .leaflet-control-attribution a {
          color: #ddd !important;
        }
      `}} />
    </div>
  );
}
