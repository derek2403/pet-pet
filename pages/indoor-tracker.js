import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type LocationData = {
  name: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  distanceMoved?: number;
  updateCount?: number;
};

export default function IndoorTracker() {
  const [connected, setConnected] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<LocationData | null>(null);

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
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Haversine formula (meters)
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    let updateCount = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateCount++;

        const locationData: LocationData = {
          name: deviceName || `Device ${socketRef.current?.id?.slice(0, 6)}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          heading: position.coords.heading ?? null,
          speed: position.coords.speed ?? null,
          altitude: position.coords.altitude ?? null,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
        };

        // Calculate distance from last position
        if (lastPositionRef.current) {
          const distance = calculateDistance(
            lastPositionRef.current.latitude,
            lastPositionRef.current.longitude,
            locationData.latitude,
            locationData.longitude
          );
          locationData.distanceMoved = distance;
        }

        lastPositionRef.current = locationData;
        setLocation({ ...locationData, updateCount });

        // Emit every update
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
    setLocation(null);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card className="p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            📍 Enhanced Indoor Tracker
          </h1>

          {/* Connection Status */}
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Device Name */}
          {!nameSet ? (
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Device Name (Optional)</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter device name"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSetName()}
                />
                <Button onClick={handleSetName}>Set</Button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Device:</span>
                <span className="text-sm text-gray-600">{deviceName}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mb-6 space-y-3">
            {!tracking ? (
              <Button
                onClick={startTracking}
                disabled={!connected}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Enhanced Tracking
              </Button>
            ) : (
              <Button onClick={stopTracking} className="w-full bg-red-600 hover:bg-red-700">
                Stop Tracking
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* GPS Location */}
          {location && tracking && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                <span>GPS Location:</span>
                <span className="text-xs text-gray-500">Updates: {location.updateCount}</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono">{location.latitude.toFixed(7)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono">{location.longitude.toFixed(7)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span
                    className={`font-mono ${
                      location.accuracy < 10
                        ? 'text-green-600'
                        : location.accuracy < 20
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    ±{Math.round(location.accuracy)}m
                  </span>
                </div>
                {location.distanceMoved !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moved:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {location.distanceMoved.toFixed(2)}m
                    </span>
                  </div>
                )}
                {location.altitude !== null && location.altitude !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Altitude:</span>
                    <span className="font-mono">{location.altitude.toFixed(1)}m</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}