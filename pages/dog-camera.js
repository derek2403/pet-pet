import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SimpleDet = { class: string; score: number };

export default function DogCamera() {
  const [cameraActive, setCameraActive] = useState(false);
  const [connected, setConnected] = useState(false);

  const [modelLoaded, setModelLoaded] = useState(false);
  const [dogDetected, setDogDetected] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<SimpleDet[]>([]);
  const [petName, setPetName] = useState('My Dog');
  const [nameSet, setNameSet] = useState(false);
  const [stats, setStats] = useState<{ movement: number | string; confidence: number | string; fps: number }>({
    movement: 0,
    confidence: 0,
    fps: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const modelRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null);
  const fpsCounterRef = useRef<{ frames: number; lastTime: number; fps: number }>({
    frames: 0,
    lastTime: Date.now(),
    fps: 0,
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
      console.log('TFJS backend:', tf.getBackend());

      console.log('Loading COCO-SSD...');
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      modelRef.current = await cocoSsd.load();
      setModelLoaded(true);
      console.log('Model loaded');
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
          detectLoop();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCameraActive(false);
  };

  const detectLoop = async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const predictions: any[] = await modelRef.current.detect(video);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Debug list
      setDetectedObjects(predictions.map((p) => ({ class: p.class, score: p.score })));

      // Find pet-ish object
      const pet = predictions.find(
        (p) => p.class === 'dog' || p.class === 'cat' || p.class === 'bird' || p.class === 'person'
      );

      if (pet) {
        setDogDetected(true);

        // Simple movement estimate from bbox center delta (px/frame)
        const centerX = (pet.bbox[0] + pet.bbox[2]) / 2;
        const centerY = (pet.bbox[1] + pet.bbox[3]) / 2;
        let movement = 0;
        if (lastCenterRef.current) {
          const dx = centerX - lastCenterRef.current.x;
          const dy = centerY - lastCenterRef.current.y;
          movement = Math.sqrt(dx * dx + dy * dy);
        }
        lastCenterRef.current = { x: centerX, y: centerY };

        setStats((prev) => ({
          ...prev,
          movement: movement.toFixed(1),
          confidence: Math.round(pet.score * 100),
        }));

        // Draw a simple bounding box + label
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'lime';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.strokeRect(pet.bbox[0], pet.bbox[1], pet.bbox[2], pet.bbox[3]);
        const label = `${pet.class} ${(pet.score * 100).toFixed(0)}%`;
        const labelW = ctx.measureText(label).width + 10;
        ctx.fillRect(pet.bbox[0], Math.max(0, pet.bbox[1] - 24), labelW, 20);
        ctx.fillStyle = 'white';
        ctx.font = '14px sans-serif';
        ctx.fillText(label, pet.bbox[0] + 5, Math.max(12, pet.bbox[1] - 8));
      } else {
        setDogDetected(false);
      }

      // FPS
      fpsCounterRef.current.frames++;
      const now = Date.now();
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        fpsCounterRef.current.fps = fpsCounterRef.current.frames;
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
        setStats((prev) => ({ ...prev, fps: fpsCounterRef.current.fps }));
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    animationRef.current = requestAnimationFrame(detectLoop);
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

          {/* Stats */}
          {cameraActive && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="text-sm text-gray-600 mb-1">Current Status</div>
                <div className="text-2xl font-bold text-green-800">
                  {dogDetected ? 'Dog in view' : 'Looking for dog...'}
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Movement (px/frame)</div>
                <div className="text-2xl font-bold text-blue-800">
                  {stats.movement}
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
              <li>Ensure good lighting and keep still for best results</li>
            </ol>
          </Card>
        </Card>
      </div>
    </div>
  );
}