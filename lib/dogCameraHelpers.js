/**
 * Dog Camera Helper Functions
 * Contains all camera, model loading, and detection logic for the dog camera page
 */

/**
 * Load TensorFlow.js and COCO-SSD model
 * @returns {Promise<Object>} The loaded model
 */
export async function loadModel() {
  try {
    console.log('Loading TensorFlow.js...');
    const tf = await import('@tensorflow/tfjs');
    await tf.ready();
    console.log('TensorFlow.js backend ready:', tf.getBackend());

    console.log('Loading COCO-SSD model...');
    const cocoSsd = await import('@tensorflow-models/coco-ssd');
    const model = await cocoSsd.load();
    console.log('Model loaded successfully!');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load AI model. Check console for details.');
  }
}

/**
 * Initialize camera stream with specified constraints
 * @param {React.RefObject} videoRef - Reference to the video element
 * @returns {Promise<MediaStream>} The camera stream
 */
export async function startCamera(videoRef) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
      },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          resolve();
        };
      });
    }

    return stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw new Error('Could not access camera. Please grant camera permissions.');
  }
}

/**
 * Stop camera stream and clean up
 * @param {React.RefObject} videoRef - Reference to the video element
 * @param {React.RefObject} animationRef - Reference to the animation frame ID
 */
export function stopCamera(videoRef, animationRef) {
  if (videoRef.current && videoRef.current.srcObject) {
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  }
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
  }
}

/**
 * Run object detection on video frame
 * @param {Object} params - Detection parameters
 * @param {Object} params.model - The COCO-SSD model
 * @param {HTMLVideoElement} params.video - Video element
 * @param {HTMLCanvasElement} params.canvas - Canvas element
 * @param {Object} params.refs - Object containing all necessary refs
 * @param {Object} params.zones - Zone locations (food, water, bed)
 * @param {Function} params.onDetection - Callback with detection results
 * @param {Function} params.onFpsUpdate - Callback with FPS update
 * @returns {Object} Detection results
 */
export async function runDetection({
  model,
  video,
  canvas,
  refs,
  zones,
  onDetection,
  onFpsUpdate,
}) {
  const {
    lastPositionRef,
    fpsCounterRef,
    manualModeRef,
    manualActivityRef,
    lastLoggedActivityRef,
  } = refs;

  if (!model || !video || !canvas) {
    return null;
  }

  const ctx = canvas.getContext('2d');

  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  try {
    // Import helper functions dynamically
    const { calculateMovement, classifyActivity } = await import('./dogActivityHelpers');

    // Run detection
    const predictions = await model.detect(video);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find dog/cat/bird/person (pets)
    const dog = predictions.find(
      (p) => p.class === 'dog' || p.class === 'cat' || p.class === 'bird' || p.class === 'person'
    );

    let detectionResult = {
      dogDetected: !!dog,
      predictions,
      activity: null,
      confidence: 0,
      movement: 0,
      position: null,
    };

    if (dog) {
      const currentBox = {
        centerX: (dog.bbox[0] + dog.bbox[2]) / 2,
        centerY: (dog.bbox[1] + dog.bbox[3]) / 2,
      };

      const movement = calculateMovement(currentBox, lastPositionRef.current);
      lastPositionRef.current = currentBox;

      // Use manual activity if manual mode is enabled, otherwise use AI detection
      let activity, confidence;
      if (manualModeRef.current && manualActivityRef.current) {
        activity = manualActivityRef.current;
        confidence = 1.0; // 100% confidence for manual override
        // Log only when activity changes
        if (lastLoggedActivityRef.current !== `MANUAL:${activity}`) {
          console.log(`🎮 Manual mode: ${activity}`);
          lastLoggedActivityRef.current = `MANUAL:${activity}`;
        }
      } else {
        const result = classifyActivity(dog, predictions, movement, zones);
        activity = result.activity;
        confidence = result.confidence;
        // Log only when activity changes
        if (lastLoggedActivityRef.current !== `AUTO:${activity}`) {
          console.log(`🤖 AI detected: ${activity} (${Math.round(confidence * 100)}%)`);
          lastLoggedActivityRef.current = `AUTO:${activity}`;
        }
      }

      detectionResult = {
        dogDetected: true,
        predictions,
        activity,
        confidence,
        movement: Number(movement.toFixed(1)),
        position: currentBox,
        dog,
      };
    }

    // Calculate FPS
    fpsCounterRef.current.frames++;
    const now = Date.now();
    if (now - fpsCounterRef.current.lastTime >= 1000) {
      fpsCounterRef.current.fps = fpsCounterRef.current.frames;
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;
      if (onFpsUpdate) {
        onFpsUpdate(fpsCounterRef.current.fps);
      }
    }

    // Call detection callback
    if (onDetection) {
      onDetection(detectionResult);
    }

    return detectionResult;
  } catch (error) {
    console.error('Detection error:', error);
    return null;
  }
}

/**
 * Handle canvas click to set zone location
 * @param {MouseEvent} e - Click event
 * @param {string} zoneName - Name of the zone (food, water, bed)
 * @param {React.RefObject} canvasRef - Reference to canvas element
 * @param {Function} setZones - Function to update zones state
 */
export function handleCanvasClick(e, zoneName, canvasRef, setZones) {
  if (!canvasRef.current) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

  setZones((prev) => ({
    ...prev,
    [zoneName]: { x, y },
  }));

  alert(`${zoneName.charAt(0).toUpperCase() + zoneName.slice(1)} zone set!`);
}

/**
 * Setup keyboard event handlers for manual activity override
 * @param {Function} setManualMode - Function to set manual mode state
 * @param {Function} setManualActivity - Function to set manual activity state
 * @param {React.RefObject} manualModeRef - Reference for manual mode
 * @param {React.RefObject} manualActivityRef - Reference for manual activity
 * @returns {Function} Cleanup function to remove event listener
 */
export function setupKeyboardControls(
  setManualMode,
  setManualActivity,
  manualModeRef,
  manualActivityRef 
) {
  const activityMap = {
    '1': 'Walk',
    '2': 'Run',
    '3': 'Rest',
    '4': 'Eat',
    '5': 'Drink',
    '6': 'Interact',
  };

  const handleKeyPress = (e) => {
    if (activityMap[e.key]) {
      // Update both state (for UI) and ref (for detection function)
      setManualMode(true);
      setManualActivity(activityMap[e.key]);
      manualModeRef.current = true;
      manualActivityRef.current = activityMap[e.key];
      console.log(`Manual activity set: ${activityMap[e.key]}`);
    } else if (e.key === '0' || e.key.toLowerCase() === 'a') {
      // Press 0 or 'a' to return to auto mode
      setManualMode(false);
      setManualActivity(null);
      manualModeRef.current = false;
      manualActivityRef.current = null;
      console.log('Returned to auto detection mode');
    }
  };

  window.addEventListener('keydown', handleKeyPress);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
}

/**
 * Create activity data object for socket emission
 * @param {string} petName - Name of the pet
 * @param {string} activity - Current activity
 * @param {number} confidence - Confidence level
 * @param {number} movement - Movement value
 * @param {Object} position - Position coordinates
 * @returns {Object} Activity data object
 */
export function createActivityData(petName, activity, confidence, movement, position) {
  return {
    petName,
    activity,
    confidence,
    movement,
    timestamp: Date.now(),
    position,
  };
}

/**
 * Setup zone setting by attaching click handler to canvas
 * @param {string} zoneName - Name of the zone to set
 * @param {React.RefObject} canvasRef - Reference to canvas element
 * @param {Function} setZones - Function to update zones state
 */
export function setupZoneSetting(zoneName, canvasRef, setZones) {
  if (!canvasRef.current) return;

  const handler = (ev) => {
    handleCanvasClick(ev, zoneName, canvasRef, setZones);
    canvasRef.current.removeEventListener('click', handler);
  };

  canvasRef.current.addEventListener('click', handler);
}

