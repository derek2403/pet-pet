import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PhoneTracker() {
  const [connected, setConnected] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          name: deviceName || `Device ${socketRef.current?.id?.slice(0, 6)}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };

        setLocation(locationData);

        // Send location to server
        if (socketRef.current && connected) {
          socketRef.current.emit('location-update', locationData);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(`Error: ${err.message}`);
      },
      options
    );

    setTracking(true);
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const handleSetName = () => {
    if (deviceName.trim()) {
      setNameSet(true);
      if (socketRef.current && connected) {
        socketRef.current.emit('update-name', deviceName);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card className="p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            📱 Phone Location Tracker
          </h1>

          {/* Connection Status */}
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
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
          </div>

          {/* Device Name Input */}
          {!nameSet && (
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Device Name (Optional)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter device name"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSetName()}
                />
                <Button onClick={handleSetName}>Set</Button>
              </div>
            </div>
          )}

          {nameSet && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Device:</span>
                <span className="text-sm text-gray-600">{deviceName}</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="mb-6 space-y-3">
            {!tracking ? (
              <Button
                onClick={startTracking}
                disabled={!connected}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Tracking
              </Button>
            ) : (
              <Button
                onClick={stopTracking}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Stop Tracking
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Location Display */}
          {location && tracking && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800">Current Location:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono">{location.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono">{location.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-mono">{Math.round(location.accuracy)}m</span>
                </div>
                {location.speed && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-mono">
                      {(location.speed * 3.6).toFixed(1)} km/h
                    </span>
                  </div>
                )}
                {location.heading && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heading:</span>
                    <span className="font-mono">{Math.round(location.heading)}°</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-mono text-xs">
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📍 Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Allow location permissions when prompted</li>
              <li>Click "Start Tracking" to begin streaming</li>
              <li>Keep this page open to continue sharing</li>
              <li>View location on the dashboard</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}

