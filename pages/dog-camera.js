import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DetectionCamera from '@/components/DetectionCamera';
import {
  loadModel as loadCameraModel,
  startCamera as initializeCamera,
  stopCamera as terminateCamera,
  setupKeyboardControls,
  setupZoneSetting,
} from '@/lib/dogCameraHelpers';

export default function DogCamera() {
  const [cameraActive, setCameraActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentActivity, setCurrentActivity] = useState('Rest');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [dogDetected, setDogDetected] = useState(false);
  const [petName, setPetName] = useState('My Dog');
  const [nameSet, setNameSet] = useState(false);
  const [stats, setStats] = useState({
    movement: 0,
    confidence: 0,
    fps: 0,
  });
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [zones, setZones] = useState({
    food: null,
    water: null,
    bed: null,
  });
  const [manualMode, setManualMode] = useState(true);
  const [manualActivity, setManualActivity] = useState("Walk");

  const socketRef = useRef(null);
  const modelRef = useRef(null);
  const manualModeRef = useRef(true);
  const manualActivityRef = useRef("Walk");
  
  // Refs for DetectionCamera component (video, canvas, animation refs)
  const cameraRefsRef = useRef({
    videoRef: null,
    canvasRef: null,
    animationRef: null,
  });

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      if (cameraRefsRef.current.videoRef && cameraRefsRef.current.animationRef) {
        terminateCamera(cameraRefsRef.current.videoRef, cameraRefsRef.current.animationRef);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard controls for manual activity override
  useEffect(() => {
    const cleanup = setupKeyboardControls(
      setManualMode,
      setManualActivity,
      manualModeRef,
      manualActivityRef
    );
    return cleanup;
  }, []);

  const loadModel = async () => {
    try {
      modelRef.current = await loadCameraModel();
      setModelLoaded(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const startCamera = async () => {
    try {
      if (!cameraRefsRef.current.videoRef) {
        alert('Camera component not ready');
        return;
      }
      await initializeCamera(cameraRefsRef.current.videoRef);
      setCameraActive(true);
      if (!modelLoaded) {
        await loadModel();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const stopCamera = () => {
    if (cameraRefsRef.current.videoRef && cameraRefsRef.current.animationRef) {
      terminateCamera(cameraRefsRef.current.videoRef, cameraRefsRef.current.animationRef);
    }
    setCameraActive(false);
  };

  // Handle refs from DetectionCamera component (called once on mount)
  const handleRefsReady = useCallback((refs) => {
    cameraRefsRef.current = refs;
  }, []);

  // Handle detection updates from DetectionCamera component
  const handleDetectionUpdate = useCallback((data) => {
    if (data.dogDetected !== undefined) {
      setDogDetected(data.dogDetected);
      if (data.dogDetected) {
        setCurrentActivity(data.activity);
        setStats((prev) => ({
          ...prev,
          movement: data.movement,
          confidence: Math.round(data.confidence * 100),
        }));
      } else {
        setCurrentActivity('Rest');
      }
    }
    
    if (data.detectedObjects) {
      setDetectedObjects(data.detectedObjects);
    }
  }, []);

  const handleFpsUpdate = useCallback((fps) => {
    setStats((prev) => ({ ...prev, fps }));
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <Card className="p-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            🐕 Dog Activity Monitor
          </h1>

          {/* Status Bar */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">Connection</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-semibold">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">AI Model</div>
              <div className="text-sm font-semibold">
                {modelLoaded ? '✅ Loaded' : '⏳ Loading...'}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">Dog Status</div>
              <div className="text-sm font-semibold">
                {dogDetected ? '✅ Detected' : '❌ Not Found'}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">FPS</div>
              <div className="text-sm font-semibold">{stats.fps}</div>
            </div>
          </div>

          {/* Debug: Show detected objects */}
          {cameraActive && detectedObjects.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-700 mb-2">
                🔍 Detected Objects:
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedObjects.map((obj, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded ${
                      obj.class === 'dog' || obj.class === 'cat'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {obj.class} ({(obj.score * 100).toFixed(0)}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {cameraActive && detectedObjects.length === 0 && modelLoaded && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                ⚠️ No objects detected. Try:
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>Better lighting</li>
                  <li>Move camera closer to your dog</li>
                  <li>Ensure dog is clearly visible</li>
                  <li>Wait a few seconds for model to warm up</li>
                </ul>
              </div>
            </div>
          )}

          {/* Pet Name */}
          {!nameSet && !cameraActive && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Enter your dog's name"
                  className="flex-1"
                />
                <Button onClick={() => setNameSet(true)}>Set</Button>
              </div>
            </div>
          )}

          {/* Camera Controls */}
          <div className="mb-6 flex gap-3">
            {!cameraActive ? (
              <Button
                onClick={startCamera}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                📹 Start Camera
              </Button>
            ) : (
              <Button
                onClick={stopCamera}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                ⏹️ Stop Camera
              </Button>
            )}
          </div>

          {/* Zone Setup Buttons */}
          {cameraActive && (
            <div className="mb-4 flex gap-2 flex-wrap">
              <Button
                onClick={() => setupZoneSetting('food', cameraRefsRef.current.canvasRef, setZones)}
                variant="outline"
                className="text-sm"
              >
                📍 Set Food Zone
              </Button>
              <Button
                onClick={() => setupZoneSetting('water', cameraRefsRef.current.canvasRef, setZones)}
                variant="outline"
                className="text-sm"
              >
                💧 Set Water Zone
              </Button>
              <Button
                onClick={() => setupZoneSetting('bed', cameraRefsRef.current.canvasRef, setZones)}
                variant="outline"
                className="text-sm"
              >
                🛏️ Set Bed Zone
              </Button>
            </div>
          )}

          {/* Detection Camera Component */}
          <DetectionCamera
            cameraActive={cameraActive}
            modelRef={modelRef}
            socketRef={socketRef}
            connected={connected}
            petName={petName}
            zones={zones}
            manualModeRef={manualModeRef}
            manualActivityRef={manualActivityRef}
            onRefsReady={handleRefsReady}
            onDetectionUpdate={handleDetectionUpdate}
            onFpsUpdate={handleFpsUpdate}
          />

          {/* Activity Display */}
          {cameraActive && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="text-sm text-gray-600 mb-1">Current Activity</div>
                <div className="text-2xl font-bold text-green-800">
                  {currentActivity}
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Movement</div>
                <div className="text-2xl font-bold text-blue-800">
                  {stats.movement} px/frame
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Confidence</div>
                <div className="text-2xl font-bold text-purple-800">
                  {stats.confidence}%
                </div>
              </Card>
            </div>
          )}

          {/* Instructions */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Enter your pet's name and click "Start Camera"</li>
              <li>Point camera at your dog in the room</li>
              <li>Click zone buttons and then click on camera where food/water/bed are located</li>
              <li>AI will automatically detect and classify activities</li>
              <li>View live activity on the dog dashboard</li>
            </ol>
          </Card>
        </Card>
      </div>
    </div>
  );
}