import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  calculateMovement, 
  classifyActivity, 
  getActivityColor,
  getActivityEmoji 
} from '@/lib/dogActivityHelpers';
import { 
  drawPetWithActivity, 
  drawDetectedObject, 
  drawZone 
} from '@/lib/canvasDrawing';

export default function DogCamera() {
  const [cameraActive, setCameraActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentActivity, setCurrentActivity] = useState('Unknown');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [dogDetected, setDogDetected] = useState(false);
  const [petName, setPetName] = useState('My Dog');
  const [nameSet, setNameSet] = useState(false);
  const [stats, setStats] = useState({
    movement: 0,
    confidence: 0,
    fps: 0,
  });
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [zones, setZones] = useState<{ food: any; water: any; bed: any }>({
    food: null,
    water: null,
    bed: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const modelRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ centerX: number; centerY: number } | null>(null);
  const activityHistoryRef = useRef<any[]>([]);
  const fpsCounterRef = useRef<{ frames: number; lastTime: number; fps: number }>({ frames: 0, lastTime: Date.now(), fps: 0 });

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
      stopCamera();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModel = async () => {
    try {
      console.log('Loading TensorFlow.js...');
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      console.log('TensorFlow.js backend ready:', tf.getBackend());

      console.log('Loading COCO-SSD model...');
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      modelRef.current = await cocoSsd.load();
      setModelLoaded(true);
      console.log('Model loaded successfully!');
    } catch (error) {
      console.error('Error loading model:', error);
      alert('Failed to load AI model. Check console for details.');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream as MediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          if (!modelLoaded) {
            loadModel();
          }
          detectObjects();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCameraActive(false);
  };

  const detectObjects = async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(detectObjects);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      // Run detection
      const predictions: any[] = await modelRef.current.detect(video);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update detected objects for debugging
      setDetectedObjects(predictions.map((p) => ({ class: p.class, score: p.score })));

      // Find dog/cat/bird/person (pets)
      const dog = predictions.find(
        (p) => p.class === 'dog' || p.class === 'cat' || p.class === 'bird' || p.class === 'person'
      );

      if (dog) {
        setDogDetected(true);

        const currentBox = {
          centerX: (dog.bbox[0] + dog.bbox[2]) / 2,
          centerY: (dog.bbox[1] + dog.bbox[3]) / 2,
        };

        const movement = calculateMovement(currentBox, lastPositionRef.current);
        lastPositionRef.current = currentBox;

        const { activity, confidence } = classifyActivity(dog, predictions, movement, zones);

        setCurrentActivity(activity);
        setStats({
          movement: Number(movement.toFixed(1)),
          confidence: Math.round(confidence * 100),
          fps: fpsCounterRef.current.fps,
        });

        // Send to server
        if (socketRef.current && connected) {
          const activityData = {
            petName,
            activity,
            confidence,
            movement,
            timestamp: Date.now(),
            position: currentBox,
          };

          socketRef.current.emit('pet-activity', activityData);

          // Store in history
          activityHistoryRef.current.push(activityData);
          if (activityHistoryRef.current.length > 1000) {
            activityHistoryRef.current.shift();
          }
        }

        // Draw dog bounding box with activity label
        drawPetWithActivity(ctx, dog, `${getActivityEmoji(activity)} ${activity}`, getActivityColor(activity));
      } else {
        setDogDetected(false);
        setCurrentActivity('No dog detected');
      }

      // Draw other objects (bowls, etc.)
      predictions.forEach((prediction) => {
        if (prediction.class === 'bowl' || prediction.class === 'cup' || prediction.class === 'bottle') {
          drawDetectedObject(ctx, prediction, 'object');
        }
      });

      // Draw zones
      (Object.entries(zones) as [string, any][]).forEach(([name, zone]) => {
        drawZone(ctx, zone, name);
      });

      // Calculate FPS
      fpsCounterRef.current.frames++;
      const now = Date.now();
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        fpsCounterRef.current.fps = fpsCounterRef.current.frames;
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    animationRef.current = requestAnimationFrame(detectObjects);
  };

  const handleCanvasClick = (e: MouseEvent, zoneName: string) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

    setZones((prev) => ({
      ...prev,
      [zoneName]: { x, y },
    }));

    alert(`${zoneName.charAt(0).toUpperCase() + zoneName.slice(1)} zone set!`);
  };

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
                onClick={() => {
                  const zoneName = prompt('Click on camera to set zone. Enter zone name:', 'food');
                  if (!zoneName || !canvasRef.current) return;
                  const handler = (ev: MouseEvent) => {
                    handleCanvasClick(ev, zoneName);
                    canvasRef.current?.removeEventListener('click', handler);
                  };
                  canvasRef.current.addEventListener('click', handler);
                }}
                variant="outline"
                className="text-sm"
              >
                📍 Set Food Zone
              </Button>
              <Button
                onClick={() => {
                  if (!canvasRef.current) return;
                  const handler = (ev: MouseEvent) => {
                    handleCanvasClick(ev, 'water');
                    canvasRef.current?.removeEventListener('click', handler);
                  };
                  canvasRef.current.addEventListener('click', handler);
                }}
                variant="outline"
                className="text-sm"
              >
                💧 Set Water Zone
              </Button>
              <Button
                onClick={() => {
                  if (!canvasRef.current) return;
                  const handler = (ev: MouseEvent) => {
                    handleCanvasClick(ev, 'bed');
                    canvasRef.current?.removeEventListener('click', handler);
                  };
                  canvasRef.current.addEventListener('click', handler);
                }}
                variant="outline"
                className="text-sm"
              >
                🛏️ Set Bed Zone
              </Button>
            </div>
          )}

          {/* Video Display */}
          <div className="relative mb-6 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />

            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-lg">Camera not active</p>
                  <p className="text-sm">Click "Start Camera" to begin monitoring</p>
                </div>
              </div>
            )}
          </div>

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