import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function IndoorTracker() {
  const [connected, setConnected] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [movements, setMovements] = useState([]);
  const [motionData, setMotionData] = useState(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);

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

  // Add motion sensors for indoor movement detection
  useEffect(() => {
    if (!tracking) return;

    let lastUpdate = Date.now();
    let velocity = { x: 0, y: 0, z: 0 };
    let position = { x: 0, y: 0, z: 0 };

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const now = Date.now();
      const dt = (now - lastUpdate) / 1000; // Convert to seconds
      lastUpdate = now;

      // Simple integration for movement detection
      // (Not precise positioning, but detects movement)
      velocity.x += acc.x * dt;
      velocity.y += acc.y * dt;
      velocity.z += acc.z * dt;

      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
      position.z += velocity.z * dt;

      // Calculate movement magnitude
      const movement = Math.sqrt(
        Math.pow(velocity.x, 2) + 
        Math.pow(velocity.y, 2) + 
        Math.pow(velocity.z, 2)
      );

      setMotionData({
        acceleration: {
          x: acc.x?.toFixed(2),
          y: acc.y?.toFixed(2),
          z: acc.z?.toFixed(2),
        },
        movement: movement.toFixed(2),
        timestamp: now,
      });

      // Detect significant movement (threshold can be adjusted)
      if (movement > 0.5) {
        setMovements(prev => [...prev.slice(-20), {
          time: new Date(now).toLocaleTimeString(),
          magnitude: movement.toFixed(2),
        }]);
      }
    };

    const handleOrientation = (event) => {
      // Track device orientation changes
      if (location) {
        const updatedLocation = {
          ...location,
          deviceOrientation: {
            alpha: event.alpha?.toFixed(1), // Compass direction
            beta: event.beta?.toFixed(1),   // Front-to-back tilt
            gamma: event.gamma?.toFixed(1), // Left-to-right tilt
          }
        };
        setLocation(updatedLocation);
      }
    };

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [tracking, location]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance in meters
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);

    const options = {
      enableHighAccuracy: true,  // Force GPS usage
      timeout: 10000,
      maximumAge: 0,             // No caching - always fresh
    };

    let updateCount = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateCount++;
        
        const locationData = {
          name: deviceName || `Device ${socketRef.current?.id?.slice(0, 6)}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          heading: position.coords.heading,
          speed: position.coords.speed,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
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

        // Send ALL updates to server (even small movements)
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
    setMovements([]);
    setMotionData(null);
  };

  const handleSetName = () => {
    if (deviceName.trim()) {
      setNameSet(true);
      if (socketRef.current && connected) {
        socketRef.current.emit('update-name', deviceName);
      }
    }
  };

  const requestMotionPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          alert('Motion sensors enabled!');
        }
      } catch (error) {
        console.error('Motion permission error:', error);
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
              <>
                <Button
                  onClick={startTracking}
                  disabled={!connected}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start Enhanced Tracking
                </Button>
                <Button
                  onClick={requestMotionPermission}
                  variant="outline"
                  className="w-full"
                >
                  Enable Motion Sensors (iOS)
                </Button>
              </>
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

          {/* GPS Location Display */}
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
                  <span className={`font-mono ${location.accuracy < 10 ? 'text-green-600' : location.accuracy < 20 ? 'text-yellow-600' : 'text-red-600'}`}>
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
                {location.altitude && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Altitude:</span>
                    <span className="font-mono">{location.altitude.toFixed(1)}m</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Motion Sensor Data */}
          {motionData && tracking && (
            <div className="space-y-3 bg-purple-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800">Motion Sensors:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Movement:</span>
                  <span className="font-mono font-bold text-purple-600">
                    {motionData.movement}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-gray-500">X</div>
                    <div className="font-mono">{motionData.acceleration.x}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-gray-500">Y</div>
                    <div className="font-mono">{motionData.acceleration.y}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-gray-500">Z</div>
                    <div className="font-mono">{motionData.acceleration.z}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Movement History */}
          {movements.length > 0 && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800">Recent Movements:</h3>
              <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                {movements.slice().reverse().map((m, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span>{m.time}</span>
                    <span className="font-mono">Magnitude: {m.magnitude}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Indoor Tracking Limits:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>GPS accuracy indoors: 10-50+ meters</li>
              <li>Motion sensors detect movement but not exact position</li>
              <li>Best outdoors with clear sky view</li>
              <li>Try near windows for better signal</li>
              <li>Combining both gives best results</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

