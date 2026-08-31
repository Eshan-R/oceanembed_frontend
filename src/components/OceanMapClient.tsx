import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icon fixes...
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface OceanMapClientProps {
  date: string;
  variable: string;
  selected: { lat: number; lon: number };
  onSelect: (lat: number, lon: number) => void;
}

// A sub-component to handle map clicks for your selection feature
const MapClickHandler = ({ onSelect }: { onSelect: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const OceanMapClient = ({ date, variable, selected, onSelect }: OceanMapClientProps) => {
  return (
    <MapContainer 
      center={[selected.lat, selected.lon]} 
      zoom={5} 
      style={{ height: '100%', width: '100%' }}
    >
      <MapClickHandler onSelect={onSelect} />
      
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        
        {/* Placeholder for MoES WMS Data */}
        <LayersControl.Overlay name="Ocean Data (WMS)">
          <WMSTileLayer
            url="https://your-moes-wms-endpoint.gov.in/geoserver/wms"
            layers={`workspace:${variable}`}
            format="image/png"
            transparent={true}
          />
        </LayersControl.Overlay>
      </LayersControl>

      <Marker position={[selected.lat, selected.lon]} />
    </MapContainer>
  );
};

export default OceanMapClient;