import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import leaflet to avoid SSR issues
const LocationMap = ({ devices, selectedDevice, onDeviceSelect }) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix for default marker icons in Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapRef.current && devices.length > 0) {
        const firstDevice = devices[0];
        
        mapRef.current = L.map('map').setView(
          [firstDevice.latitude, firstDevice.longitude],
          13
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      if (mapRef.current) {
        updateMarkers(L);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && typeof window !== 'undefined') {
      import('leaflet').then(({ default: L }) => {
        updateMarkers(L);
      });
    }
  }, [devices, selectedDevice]);

  const updateMarkers = (L) => {
    if (!mapRef.current) return;

    // Remove markers for devices that no longer exist
    Object.keys(markersRef.current).forEach((deviceId) => {
      if (!devices.find((d) => d.id === deviceId)) {
        mapRef.current.removeLayer(markersRef.current[deviceId]);
        delete markersRef.current[deviceId];
      }
    });

    // Create color palette for different devices
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    // Update or create markers for each device
    devices.forEach((device, index) => {
      const position = [device.latitude, device.longitude];

      if (markersRef.current[device.id]) {
        // Update existing marker position
        markersRef.current[device.id].setLatLng(position);
      } else {
        // Create custom icon
        const color = colors[index % colors.length];
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: 14px;
              ">${device.name.charAt(0).toUpperCase()}</span>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        // Create marker
        const marker = L.marker(position, { icon: customIcon }).addTo(mapRef.current);

        // Create popup
        const popup = L.popup({
          offset: [0, -30],
        }).setContent(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${device.name}</h3>
            <div style="font-size: 13px; line-height: 1.6;">
              <div><strong>Latitude:</strong> ${device.latitude.toFixed(6)}</div>
              <div><strong>Longitude:</strong> ${device.longitude.toFixed(6)}</div>
              <div><strong>Accuracy:</strong> ${Math.round(device.accuracy)}m</div>
              ${device.speed > 0 ? `<div><strong>Speed:</strong> ${(device.speed * 3.6).toFixed(1)} km/h</div>` : ''}
              <div style="color: #666; font-size: 11px; margin-top: 4px;">
                ${new Date(device.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        `);

        marker.bindPopup(popup);

        marker.on('click', () => {
          if (onDeviceSelect) {
            onDeviceSelect(device);
          }
        });

        markersRef.current[device.id] = marker;
      }
    });

    // Auto-fit bounds if there are devices
    if (devices.length > 0) {
      const bounds = L.latLngBounds(
        devices.map((d) => [d.latitude, d.longitude])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Focus on selected device
    if (selectedDevice) {
      const marker = markersRef.current[selectedDevice.id];
      if (marker) {
        mapRef.current.setView(
          [selectedDevice.latitude, selectedDevice.longitude],
          17,
          { animate: true }
        );
        marker.openPopup();
      }
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
      />
      <div id="map" className="w-full h-full" />
    </>
  );
};

export default LocationMap;

