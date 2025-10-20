import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';

// Dynamically import map to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
      // Request current devices
      socketRef.current.emit('request-devices');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    socketRef.current.on('devices-update', (devicesData) => {
      console.log('Devices update:', devicesData);
      setDevices(devicesData);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const focusDevice = (device) => {
    setSelectedDevice(device);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              🗺️ Live Location Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-blue-800">
                  {devices.length} {devices.length === 1 ? 'Device' : 'Devices'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Devices List */}
          <div className="lg:col-span-1 space-y-3">
            <Card className="p-4">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">
                Active Devices
              </h2>
              {devices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No devices tracking</p>
                  <p className="text-sm">
                    Open the tracker on a phone to start
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      onClick={() => focusDevice(device)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDevice?.id === device.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {device.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(device.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-gray-600">
                        <div className="flex justify-between">
                          <span>Lat:</span>
                          <span className="font-mono">
                            {device.latitude.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lng:</span>
                          <span className="font-mono">
                            {device.longitude.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-mono">
                            {Math.round(device.accuracy)}m
                          </span>
                        </div>
                        {device.speed > 0 && (
                          <div className="flex justify-between">
                            <span>Speed:</span>
                            <span className="font-mono">
                              {(device.speed * 3.6).toFixed(1)} km/h
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Instructions */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                📱 How to Track
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open /phone-tracker on your phone</li>
                <li>Allow location permissions</li>
                <li>Start tracking</li>
                <li>Watch live updates here!</li>
              </ol>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden h-[calc(100vh-12rem)]">
              {devices.length > 0 ? (
                <LocationMap
                  devices={devices}
                  selectedDevice={selectedDevice}
                  onDeviceSelect={setSelectedDevice}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-lg font-medium mb-2">
                      No Devices to Display
                    </p>
                    <p className="text-sm">
                      Map will appear when devices start tracking
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

