import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DogCamera() {
  const [cameraActive, setCameraActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [petName, setPetName] = useState('My Dog');
  const [nameSet, setNameSet] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

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
    setCameraActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <Card className="p-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            🐕 Dog Activity Monitor
          </h1>

          {/* Status Bar */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
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
              <div className="text-xs text-gray-600">Camera</div>
              <div className="text-sm font-semibold">
                {cameraActive ? '🎥 Active' : '⏹️ Stopped'}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">Pet Name</div>
              <div className="text-sm font-semibold">{nameSet ? petName : 'Not set'}</div>
            </div>
          </div>

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

          {/* Instructions */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Enter your pet's name and click "Start Camera"</li>
              <li>Point camera at your dog in the room</li>
              <li>Keep the page open while monitoring</li>
            </ol>
          </Card>
        </Card>
      </div>
    </div>
  );
}