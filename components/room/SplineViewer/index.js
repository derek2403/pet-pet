import { Suspense, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InstructionsModal from "@/components/InstructionsModal";
import { 
  CircleCheck,
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Volume2,
  VolumeX,
  Loader2,
  Smile,
  Heart
} from "lucide-react";

// Import modularized functions
import { emitDogEvent, findDogObject } from './helpers';
import { moveDogToRandomPosition } from './dogMovement';
import { handleFeedDog } from './dogFeeding';
import { handlePlayDog } from './dogPlaying';

// Dynamically import Spline component for better performance
const Spline = dynamic(() => import('@splinetool/react-spline/dist/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#F85BB4] animate-spin mx-auto mb-4" />
        <p className="text-lg font-bold text-[#4A4458]">Loading your Pet's Room...</p>
      </div>
    </div>
  ),
});

/**
 * SplineViewer Component
 * Displays the interactive 3D Spline scene with controls
 */
export default function SplineViewer({ 
  sceneUrl, 
  maxStepDistance = 8, 
  showNotification = false, 
  notificationMessage = '',
  onFeedReady = null, // Callback to pass the feed function to parent
  onPlayReady = null,  // Callback to pass the play function to parent
  onWalkReady = null,  // Callback to pass the walk function to parent
  onRunReady = null    // Callback to pass the run function to parent
}) {
  // Refs for Spline and controls
  const splineRef = useRef();
  const viewerRef = useRef(null);
  const controlsRef = useRef(null);
  const zoomRef = useRef(1.9);
  const allObjectsRef = useRef([]);
  const dogEventTargetRef = useRef(null); // Holds the object we will emit events on
  const walkTimeoutRef = useRef(null);
  const cycleIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // State flags for dog activities
  const isWalkingRef = useRef(false); // Track if dog is currently walking or in cooldown
  const isFeedingRef = useRef(false); // Track if dog is currently feeding
  const feedQueuedRef = useRef(false); // Track if feed action is queued
  const isPlayingRef = useRef(false); // Track if dog is currently playing
  const playQueuedRef = useRef(false); // Track if play action is queued
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [selectedObject, setSelectedObject] = useState('Happy');
  const [isPointerOverViewer, setIsPointerOverViewer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Prevent page scroll when interacting inside the 3D viewer and map wheel to zoom
  useEffect(() => {
    isMountedRef.current = true;
    const el = viewerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      // Convert wheel into camera zoom and block page scroll
      e.preventDefault();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      e.stopPropagation();
      const delta = e.deltaY; // positive = zoom out, negative = zoom in
      
      // Prefer OrbitControls dolly for perspective cameras
      const controls = controlsRef.current;
      if (controls && typeof controls.dollyIn === 'function' && typeof controls.dollyOut === 'function') {
        const zoomSpeed = typeof controls.zoomSpeed === 'number' ? controls.zoomSpeed : 1;
        const scale = Math.pow(0.95, zoomSpeed);
        if (delta < 0) {
          controls.dollyIn(scale);
        } else if (delta > 0) {
          controls.dollyOut(scale);
        }
        if (typeof controls.update === 'function') controls.update();
        return;
      }
      
      // Fallback: adjust Spline zoom for orthographic cameras
      const sensitivity = 0.0015;
      let next = zoomRef.current - delta * sensitivity;
      next = Math.min(5, Math.max(0.2, next));
      zoomRef.current = next;
      try {
        if (splineRef.current && typeof splineRef.current.setZoom === 'function') {
          splineRef.current.setZoom(next);
        }
      } catch (_) {}
    };

    const handleTouchMove = (e) => {
      // Prevent touch scroll chaining to the page on mobile
      if (e.touches && e.touches.length > 0) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    
    return () => {
      el.removeEventListener('wheel', handleWheel, { capture: true });
      el.removeEventListener('touchmove', handleTouchMove, { capture: true });
    };
  }, []);

  // Global safeguard: if pointer is over the viewer, prevent page scroll
  useEffect(() => {
    const handleWindowWheel = (e) => {
      if (isPointerOverViewer) {
        e.preventDefault();
      }
    };
    const handleWindowTouchMove = (e) => {
      if (isPointerOverViewer) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', handleWindowWheel, { passive: false, capture: true });
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false, capture: true });
    
    return () => {
      window.removeEventListener('wheel', handleWindowWheel, { capture: true });
      window.removeEventListener('touchmove', handleWindowTouchMove, { capture: true });
    };
  }, [isPointerOverViewer]);

  // Global cleanup on unmount – stop timers/intervals
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      if (walkTimeoutRef.current) {
        clearTimeout(walkTimeoutRef.current);
        walkTimeoutRef.current = null;
      }
    };
  }, []);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch(e.key) {
        case '1':
          console.log('⌨️ Keyboard shortcut: Walk (1)');
          handleWalk();
          break;
        case '2':
          console.log('⌨️ Keyboard shortcut: Run (2)');
          handleRun();
          break;
        case '4':
        case '5':
          console.log('⌨️ Keyboard shortcut: Feed (4/5)');
          handleFeed();
          break;
        case '6':
          console.log('⌨️ Keyboard shortcut: Play (6)');
          handlePlay();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Cycle through different animations and move the dog around
  function cycleAnimations(splineApp, shibainu, isRunning = false) {
    // Check if dog is already walking, feeding, or in cooldown
    if (isWalkingRef.current || isFeedingRef.current || isPlayingRef.current) {
      console.log('⏸️ Skipping cycle - dog is busy (walking, feeding, or in cooldown)');
      return;
    }
    
    const shouldWalk = Math.random() > 0.5; // 50% chance to walk
    
    try {
      if (shouldWalk) {
        console.log(isRunning ? 'Starting run cycle' : 'Starting walk cycle');
        isWalkingRef.current = true; // Set walking flag
        
        // Reset to a known idle first; we will start walk AFTER a short pre-rotation
        // This prevents the dog from sliding while turning.
        emitDogEvent(splineApp, 'mouseUp', dogEventTargetRef.current);

        // Safety: ensure walk can't run forever if mouseUp is missed.
        // Compute a generous timeout based on max step distance and walk speed
        if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
        const safetyUnitsPerSecond = isRunning ? 60 : 50; // keep in sync with movement speed
        const maxDurationMs = Math.min(
          20000,
          Math.ceil((Math.max(1, maxStepDistance) / safetyUnitsPerSecond) * 1000) + 2500
        );
        walkTimeoutRef.current = setTimeout(() => {
          console.warn('⏱️ Walk safety timeout hit, forcing Idle');
          emitDogEvent(splineApp, 'mouseUp', dogEventTargetRef.current);
        }, maxDurationMs);
        
        // Move the dog to a new position; this function will handle
        // turning first, then starting walk, and finally stopping on arrival.
        moveDogToRandomPosition(
          shibainu,
          splineApp,
          dogEventTargetRef.current,
          maxStepDistance,
          () => {
            try {
              // Clear safety timeout and send single, authoritative mouseUp
              if (walkTimeoutRef.current) {
                clearTimeout(walkTimeoutRef.current);
                walkTimeoutRef.current = null;
              }
              emitDogEvent(splineApp, 'mouseUp', dogEventTargetRef.current);

              // Briefly lock the final transform to suppress any residual blend/slip
              const holdMs = 150;
              const finalX = shibainu?.position?.x;
              const finalZ = shibainu?.position?.z;
              const finalRotY = shibainu?.rotation?.y;
              const holdUntil = performance.now() + holdMs;
              const lockFinalPose = (ts) => {
                if (!isMountedRef.current) return;
                if (ts < holdUntil) {
                  if (shibainu?.position) {
                    shibainu.position.x = finalX;
                    shibainu.position.z = finalZ;
                  }
                  if (shibainu?.rotation) {
                    shibainu.rotation.y = finalRotY;
                  }
                  requestAnimationFrame(lockFinalPose);
                }
              };
              requestAnimationFrame(lockFinalPose);

              // Wait 200ms before allowing next walk (minimal cooldown for instant responsiveness)
              console.log('⏰ Starting cooldown before next walk...');
              setTimeout(() => {
                isWalkingRef.current = false;
                console.log('✅ Cooldown complete - dog can walk again');
                
                // Check if feed action is queued
                if (feedQueuedRef.current) {
                  console.log('📋 Executing queued feed action...');
                  feedQueuedRef.current = false;
                  // Execute feed after a brief moment
                  setTimeout(() => {
                    handleFeed();
                  }, 50);
              } else if (playQueuedRef.current) {
                console.log('📋 Executing queued play action...');
                playQueuedRef.current = false;
                setTimeout(() => {
                  handlePlay();
                }, 50);
                }
              }, 200); // Reduced to 200ms for instant responsiveness
              
            } catch (e) {
              console.error('Error sending mouseUp:', e);
              // Reset flag even on error
              setTimeout(() => { isWalkingRef.current = false; }, 5000);
            }
          },
          isMountedRef,
          isRunning
        );
      } else {
        // Stay idle (Start event keeps idle animation running)
        console.log('Dog staying idle');
      }
    } catch (error) {
      console.error('Error cycling animations:', error);
    }
  }

  // Wrapper function for handleFeedDog with all necessary refs
  function handleFeed() {
    handleFeedDog({
      splineApp: splineRef.current,
      dogEventTarget: dogEventTargetRef.current,
      allObjects: allObjectsRef.current,
      isFeedingRef,
      isWalkingRef,
      feedQueuedRef,
      isMountedRef,
      maxStepDistance
    });
  }

  // Wrapper function for handlePlayDog with necessary refs
  function handlePlay() {
    handlePlayDog({
      splineApp: splineRef.current,
      dogEventTarget: dogEventTargetRef.current,
      isPlayingRef,
      isWalkingRef,
      isFeedingRef,
      playQueuedRef,
      isMountedRef
    });
  }

  // Wrapper function for walk action
  function handleWalk() {
    if (!splineRef.current) {
      console.error('Spline app not loaded');
      return;
    }
    
    const allObjects = allObjectsRef.current;
    const shibainu = findDogObject(splineRef.current, allObjects);
    const armature =
      splineRef.current.findObjectByName('AnimalArmature') ||
      allObjects.find(obj => obj.name && obj.name.toLowerCase().includes('animalarmature'));
    
    cycleAnimations(splineRef.current, shibainu || armature, false);
  }

  // Wrapper function for run action
  function handleRun() {
    if (!splineRef.current) {
      console.error('Spline app not loaded');
      return;
    }
    
    const allObjects = allObjectsRef.current;
    const shibainu = findDogObject(splineRef.current, allObjects);
    const armature =
      splineRef.current.findObjectByName('AnimalArmature') ||
      allObjects.find(obj => obj.name && obj.name.toLowerCase().includes('animalarmature'));
    
    cycleAnimations(splineRef.current, shibainu || armature, true);
  }

  // Handle Spline scene load
  function onLoad(splineApp) {
    splineRef.current = splineApp;
    setIsLoaded(true);
    console.log('Spline scene loaded successfully');
    
    // Pass the action functions to parent component
    if (typeof onFeedReady === 'function') {
      onFeedReady(handleFeed);
    }
    if (typeof onPlayReady === 'function') {
      onPlayReady(handlePlay);
    }
    if (typeof onWalkReady === 'function') {
      onWalkReady(handleWalk);
    }
    if (typeof onRunReady === 'function') {
      onRunReady(handleRun);
    }
    
    // Set initial zoom
    try {
      if (typeof splineApp.setZoom === 'function') {
        splineApp.setZoom(zoomRef.current);
      }
    } catch (_) {}
    
    // Find and control the dog animations
    try {
      // Get all objects and find the dog
      const allObjects = splineApp.getAllObjects ? splineApp.getAllObjects() : [];
      allObjectsRef.current = allObjects;
      console.log('Total objects in scene:', allObjects.length);
      
      // Log first 20 object names to help debug
      if (allObjects.length > 0) {
        console.log('Sample object names:', 
          allObjects.slice(0, 20).map(obj => obj.name || 'unnamed').join(', ')
        );
      }
      
      // Find the dog object
      const shibainu = findDogObject(splineApp, allObjects);

      // Try to also grab the armature in case events are wired there
      const armature =
        splineApp.findObjectByName('AnimalArmature') ||
        allObjects.find(obj => obj.name && obj.name.toLowerCase().includes('animalarmature'));
      
      if (shibainu || armature) {
        console.log('Found dog objects:', {
          mesh: shibainu && (shibainu.name || 'unnamed'),
          armature: armature && (armature.name || 'unnamed')
        });
        console.log('SplineApp methods:', Object.keys(splineApp).filter(k => typeof splineApp[k] === 'function'));
        if (shibainu) console.log('Shiba properties:', Object.keys(shibainu));

        // Prefer emitting events on the mesh (where clips are attached); fallback to armature
        dogEventTargetRef.current = shibainu || armature || null;
        if (dogEventTargetRef.current) {
          console.log('Event target set to:', dogEventTargetRef.current.name);
          // Show dog status badge by default on load
          try {
            setSelectedObject('Happy');
          } catch (_) {}
        }
        
        // Set up animation cycling: idle for 5 sec, walk for 3 sec, repeat
        if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = setInterval(() => {
          // Skip if component unmounted
          if (!isMountedRef.current) return;
          cycleAnimations(splineApp, shibainu || armature);
        }, 2000); // Cycle every 2 second
      } else {
        console.log('Dog not found. First 10 object names:', 
          allObjects.slice(0, 10).map(obj => obj.name || 'unnamed')
        );
      }
    } catch (error) {
      console.error('Error setting up dog animations:', error);
    }
    
    // Ensure scroll zooms the camera and panning is disabled
    try {
      const controls =
        splineApp?._camera?.controls ||
        splineApp?.controls ||
        splineApp?._controls ||
        splineApp?._runtime?.controls ||
        splineApp?._runtime?._camera?.controls;
      
      if (controls) {
        controlsRef.current = controls;
        if (typeof controls.enablePan !== 'undefined') controls.enablePan = false;
        if (typeof controls.enableRotate !== 'undefined') controls.enableRotate = true;
        if (typeof controls.enableZoom !== 'undefined') controls.enableZoom = true;
        if (typeof controls.screenSpacePanning !== 'undefined') controls.screenSpacePanning = false;
        if (controls.mouseButtons) {
          if ('RIGHT' in controls.mouseButtons) controls.mouseButtons.RIGHT = -1;
          if ('MIDDLE' in controls.mouseButtons) controls.mouseButtons.MIDDLE = -1;
        }
      }
    } catch (_) {
      // Non-fatal; wheel/touch listeners already prevent page scroll
    }

    // Raise the camera slightly on the Y axis by default for a better view
    try {
      const controls = controlsRef.current;
      const cameraObj =
        (controls && controls.object) ||
        splineApp?._camera ||
        splineApp?._runtime?._camera ||
        null;
      if (cameraObj && cameraObj.position && typeof cameraObj.position.y === 'number') {
        cameraObj.position.y += 100;
        if (controls && typeof controls.update === 'function') {
          controls.update();
        }
      }
    } catch (_) {}
  }

  // Reset camera view to default
  function handleResetView() {
    if (splineRef.current) {
      splineRef.current.setZoom(1);
    }
  }

  // Handle object interaction
  function onSplineMouseDown(e) {
    if (e.target?.name) {
      console.log('Clicked on:', e.target.name);
      // If the clicked object looks like the dog, remember it as event target
      const nameLower = String(e.target.name).toLowerCase();
      if (
        nameLower.includes('shiba') ||
        nameLower.includes('shibal') ||
        nameLower.includes('dog')
      ) {
        dogEventTargetRef.current = e.target;
        console.log('Calibrated dog event target:', e.target.name);
      }
    }
  }

  // Toggle fullscreen mode
  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  return (
    <Card className={`bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 group ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F85BB4]/20 rounded-xl blur-lg" />
              <div className="relative p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md">
                <CircleCheck className="w-6 h-6 text-[#F85BB4]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#6B6B6B]">Room Status</div>
              <div className="text-2xl font-bold text-[#4A4458]">Cozy & Clean</div>
              <p className="text-xs text-[#B5B1C0] font-medium">Last updated: just now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Instructions Modal */}
            <InstructionsModal 
              open={showInstructions} 
              onOpenChange={setShowInstructions} 
            />
            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#F85BB4] hover:shadow-md transition-all shadow-sm font-semibold"
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {/* Reset View */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#F85BB4] hover:shadow-md transition-all shadow-sm font-semibold"
              disabled={!isLoaded}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#F85BB4] hover:shadow-md transition-all shadow-sm font-semibold"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Spline 3D Scene Container */}
        <div 
          ref={viewerRef}
          className={`relative overscroll-none touch-none bg-gradient-to-br from-[#FFF5F7] via-[#F8F5FF] to-[#F5E8FF] ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}
          onWheel={(e) => {
            // Prevent page scroll when scrolling inside the 3D room
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            // Only allow left click; block right/middle which pan
            if (e.button !== 0) {
              e.preventDefault();
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
          onMouseEnter={() => setIsPointerOverViewer(true)}
          onMouseLeave={() => setIsPointerOverViewer(false)}
          onTouchStart={() => setIsPointerOverViewer(true)}
          onTouchEnd={() => setIsPointerOverViewer(false)}
          onTouchCancel={() => setIsPointerOverViewer(false)}
        >
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#F85BB4] animate-spin" />
            </div>
          }>
            <Spline
              scene={sceneUrl}
              onLoad={onLoad}
              onSplineMouseDown={onSplineMouseDown}
              className="w-full h-full"
            />
          </Suspense>
          
          {/* Selected Object Overlay */}
          {selectedObject && (
            <div className="absolute bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#E8E4F0]/50 min-w-[200px] pointer-events-none">
              <p className="text-sm font-semibold text-[#6B6B6B] mb-2">Dog Status:</p>
              <p className="text-3xl font-bold text-[#F85BB4]">{selectedObject}</p>
            </div>
          )}

          {/* Loading Status Badge */}
          {!isLoaded && (
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg border border-[#E8E4F0]/50">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#F85BB4] animate-spin" />
                <span className="text-sm font-bold text-[#4A4458]">Loading scene...</span>
              </div>
            </div>
          )}

          {/* Popup Notification - Top Left */}
          {showNotification && notificationMessage && (
            <div 
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl px-5 py-3 shadow-lg border border-[#F85BB4]/30 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300"
              style={{
                animation: 'fadeInOut 2s ease-in-out forwards'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg">
                  <Heart className="w-5 h-5 text-[#F85BB4]" />
                </div>
                <span className="text-sm font-bold text-[#4A4458]">{notificationMessage}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

