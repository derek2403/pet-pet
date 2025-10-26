import { useEffect, useRef } from 'react';
import { 
  getActivityColor,
  getActivityEmoji 
} from '@/lib/dogActivityHelpers';
import { 
  drawPetWithActivity, 
  drawDetectedObject, 
  drawZone 
} from '@/lib/canvasDrawing';
import {
  runDetection,
  createActivityData,
} from '@/lib/dogCameraHelpers';

/**
 * DetectionCamera Component
 * Handles video display, object detection, and canvas drawing
 */
export default function DetectionCamera({
  cameraActive,
  modelRef,
  socketRef,
  connected,
  petName,
  zones,
  onDetectionUpdate,
  onFpsUpdate,
  onRefsReady,
  manualModeRef,
  manualActivityRef,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastPositionRef = useRef(null);
  const activityHistoryRef = useRef([]);
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now(), fps: 0 });
  const lastLoggedActivityRef = useRef(null);

  // Expose refs to parent component through callback (only once)
  useEffect(() => {
    if (onRefsReady) {
      onRefsReady({
        videoRef,
        canvasRef,
        animationRef,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detection loop
  useEffect(() => {
    if (!cameraActive) return;

    const detectObjects = async () => {
      if (!modelRef.current || !videoRef.current || !canvasRef.current) {
        animationRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const refs = {
        lastPositionRef,
        fpsCounterRef,
        manualModeRef,
        manualActivityRef,
        lastLoggedActivityRef,
      };

      const detectionResult = await runDetection({
        model: modelRef.current,
        video,
        canvas,
        refs,
        zones,
        onDetection: (result) => {
          // Update parent component with detection results
          if (onDetectionUpdate) {
            onDetectionUpdate({
              dogDetected: result.dogDetected,
              activity: result.activity,
              movement: result.movement,
              confidence: result.confidence,
              detectedObjects: result.predictions.map((p) => ({ 
                class: p.class, 
                score: p.score 
              })),
            });
          }

          if (result.dogDetected) {
            // Send to server
            if (socketRef.current && connected) {
              const activityData = createActivityData(
                petName,
                result.activity,
                result.confidence,
                result.movement,
                result.position
              );

              socketRef.current.emit('pet-activity', activityData);

              // Store in history
              activityHistoryRef.current.push(activityData);
              if (activityHistoryRef.current.length > 1000) {
                activityHistoryRef.current.shift();
              }
            }

            // Draw dog bounding box with activity label
            drawPetWithActivity(
              ctx,
              result.dog,
              `${getActivityEmoji(result.activity)} ${result.activity}`,
              getActivityColor(result.activity)
            );
          }

          // Draw other objects (bowls, etc.)
          result.predictions.forEach((prediction) => {
            if (prediction.class === 'bowl' || prediction.class === 'cup' || prediction.class === 'bottle') {
              drawDetectedObject(ctx, prediction, 'object');
            }
          });

          // Draw zones
          Object.entries(zones).forEach(([name, zone]) => {
            drawZone(ctx, zone, name);
          });
        },
        onFpsUpdate: (fps) => {
          if (onFpsUpdate) {
            onFpsUpdate(fps);
          }
        },
      });

      animationRef.current = requestAnimationFrame(detectObjects);
    };

    detectObjects();

    // Cleanup on unmount or when camera stops
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, modelRef, socketRef, connected, petName, zones]);

  return (
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
  );
}

