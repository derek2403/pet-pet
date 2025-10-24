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
  Loader2
} from "lucide-react";

// Dynamically import Spline component for better performance
const Spline = dynamic(() => import('@splinetool/react-spline'), {
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
export default function SplineViewer({ sceneUrl, maxStepDistance = 8 }) {
  const splineRef = useRef();
  const viewerRef = useRef(null);
  const controlsRef = useRef(null);
  const zoomRef = useRef(1.9);
  const allObjectsRef = useRef([]);
  // Holds the object we will emit events on (set after first user click on dog)
  const dogEventTargetRef = useRef(null);
  const walkTimeoutRef = useRef(null);
  const cycleIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isPointerOverViewer, setIsPointerOverViewer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const isWalkingRef = useRef(false); // Track if dog is currently walking or in cooldown

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

  // Handle Spline scene load
  function onLoad(splineApp) {
    splineRef.current = splineApp;
    setIsLoaded(true);
    console.log('Spline scene loaded successfully');
    
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
      
      // Try multiple possible names for the dog mesh (click target that has animation clips)
      let shibainu =
        splineApp.findObjectByName('Shibainu') ||
        splineApp.findObjectByName('shibainu') ||
        splineApp.findObjectByName('Shibalnu') ||
        allObjects.find(obj => obj.name && obj.name.toLowerCase().includes('shiba'));

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
  }

  // Emit helper that targets the calibrated dog object and falls back to name-based emit
  function emitDogEvent(splineApp, eventName) {
    const target = dogEventTargetRef.current;
    const name = target?.name;
    let emitted = false;
    try {
      if (target && typeof target.emitEvent === 'function') {
        target.emitEvent(eventName);
        emitted = true;
        console.log(`🎯 emitEvent(${eventName}) on`, name);
      }
    } catch (e) {
      console.warn(`emitEvent(${eventName}) on object failed:`, e?.message);
    }
    if (!emitted && typeof splineApp.emitEvent === 'function' && name) {
      try {
        splineApp.emitEvent(eventName, name);
        emitted = true;
        console.log(`🎯 splineApp.emitEvent(${eventName}, ${name})`);
      } catch (e) {
        console.warn(`splineApp.emitEvent(${eventName}) failed:`, e?.message);
      }
    }
    return emitted;
  }

  // No-op fallback removed to avoid any extra motion after arrival

  // Cycle through different animations and move the dog around
  function cycleAnimations(splineApp, shibainu) {
    // Check if dog is already walking or in cooldown
    if (isWalkingRef.current) {
      console.log('⏸️ Skipping cycle - dog is walking or in cooldown');
      return;
    }
    
    const shouldWalk = Math.random() > 0.5; // 50% chance to walk
    
    try {
      if (shouldWalk) {
        console.log('Starting walk cycle');
        isWalkingRef.current = true; // Set walking flag
        
        // Reset to a known idle then emit mouseDown (guards against stuck state)
        emitDogEvent(splineApp, 'mouseUp');
        requestAnimationFrame(() => emitDogEvent(splineApp, 'mouseDown'));

        // Safety: ensure walk can't run forever if mouseUp is missed.
        // Compute a generous timeout based on max step distance and walk speed
        if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
        const safetyUnitsPerSecond = 8; // keep in sync with movement speed below
        const maxDurationMs = Math.min(
          20000,
          Math.ceil((Math.max(1, maxStepDistance) / safetyUnitsPerSecond) * 1000) + 2500
        );
        walkTimeoutRef.current = setTimeout(() => {
          console.warn('⏱️ Walk safety timeout hit, forcing Idle');
          emitDogEvent(splineApp, 'mouseUp');
        }, maxDurationMs);
        
        // Move the dog to a new position and emit mouseUp immediately on arrival
        moveDogToRandomPosition(shibainu, () => {
          try {
            // Clear safety timeout and send single, authoritative mouseUp
            if (walkTimeoutRef.current) {
              clearTimeout(walkTimeoutRef.current);
              walkTimeoutRef.current = null;
            }
            emitDogEvent(splineApp, 'mouseUp');

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

            // Wait 1 second before allowing next walk (cooldown period)
            console.log('⏰ Starting 1-second cooldown before next walk...');
            setTimeout(() => {
              isWalkingRef.current = false;
              console.log('✅ Cooldown complete - dog can walk again');
            }, 1000); // 1 second cooldown
            
          } catch (e) {
            console.error('Error sending mouseUp:', e);
            // Reset flag even on error
            setTimeout(() => { isWalkingRef.current = false; }, 5000);
          }
        });
      } else {
        // Stay idle (Start event keeps idle animation running)
        console.log('Dog staying idle');
      }
    } catch (error) {
      console.error('Error cycling animations:', error);
    }
  }

  // ensureIdleState removed; idle is controlled via Spline events

  // Move the dog to a random position in the room
  function moveDogToRandomPosition(shibainu, onComplete) {
    if (!shibainu) return;
    
    try {
      // Room boundaries based on your coordinates
      // Corner 1: (22, -65, 56), Corner 2: (22, -65, 190)
      // Corner 3: (155, -65, 190), Corner 4: (155, -65, 56)
      const roomBounds = {
        xMin: 22,
        xMax: 155,
        y: -65,  // Floor level
        zMin: 56,
        zMax: 190
      };
      
      // Add padding to keep dog away from walls
      const padding = 15;

      // Get current position
      const startPos = { 
        x: shibainu.position?.x || 0, 
        y: shibainu.position?.y || 0, 
        z: shibainu.position?.z || 0 
      };

      // Always try to move the full max distance (or as much as allowed by bounds)
      const stepMax = typeof maxStepDistance === 'number' && maxStepDistance > 0 ? maxStepDistance : 12;

      // Clamp within padded room bounds so we never walk through walls
      const xMin = roomBounds.xMin + padding;
      const xMax = roomBounds.xMax - padding;
      const zMin = roomBounds.zMin + padding;
      const zMax = roomBounds.zMax - padding;

      // Pick a direction that allows the longest move; prefer one that fits stepMax
      let chosenAngle = Math.random() * Math.PI * 2;
      let bestAllowed = 0;
      let bestAngle = chosenAngle;
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dirX = Math.sin(angle);
        const dirZ = Math.cos(angle);
        const tX = dirX > 0 ? (xMax - startPos.x) / dirX : dirX < 0 ? (xMin - startPos.x) / dirX : Infinity;
        const tZ = dirZ > 0 ? (zMax - startPos.z) / dirZ : dirZ < 0 ? (zMin - startPos.z) / dirZ : Infinity;
        const allowed = Math.max(0, Math.min(tX, tZ));
        if (allowed >= stepMax) {
          chosenAngle = angle;
          bestAllowed = allowed;
          bestAngle = angle;
          break;
        }
        if (allowed > bestAllowed) {
          bestAllowed = allowed;
          bestAngle = angle;
        }
      }
      // Use best angle found
      const dirX = Math.sin(bestAngle);
      const dirZ = Math.cos(bestAngle);
      const tX = dirX > 0 ? (xMax - startPos.x) / dirX : dirX < 0 ? (xMin - startPos.x) / dirX : Infinity;
      const tZ = dirZ > 0 ? (zMax - startPos.z) / dirZ : dirZ < 0 ? (zMin - startPos.z) / dirZ : Infinity;
      const allowed = Math.max(0, Math.min(tX, tZ));
      const step = Math.max(0, Math.min(stepMax, allowed));

      // Final target using chosen direction and exact step length (as large as allowed)
      const proposed = {
        x: startPos.x + dirX * step,
        z: startPos.z + dirZ * step
      };
      const newPos = {
        x: Math.min(xMax, Math.max(xMin, proposed.x)),
        y: roomBounds.y,
        z: Math.min(zMax, Math.max(zMin, proposed.z))
      };
      
      console.log('Dog current position:', startPos);
      console.log('Dog target position:', newPos);
      
      // Calculate rotation to face the direction of movement
      const dx = newPos.x - startPos.x;
      const dz = newPos.z - startPos.z;
      const targetRotation = Math.atan2(dx, dz);

      // Constant-speed movement with overshoot clamp so we land exactly on target
      const unitsPerSecond = 18; // slightly slower to better match foot animation
      let lastTs = performance.now();

      function animate(nowTs) {
        if (!isMountedRef.current) return; // stop if unmounted

        const dt = Math.min(0.05, Math.max(0, (nowTs - lastTs) / 1000)); // clamp dt to avoid huge jumps
        lastTs = nowTs;

        // Update position if the object has position property
        if (shibainu.position) {
          const rx = newPos.x - shibainu.position.x;
          const rz = newPos.z - shibainu.position.z;
          const remaining = Math.hypot(rx, rz);

          const stepDist = unitsPerSecond * dt;
          if (remaining <= stepDist + 0.001) {
            // Snap to final target and finish
            shibainu.position.x = newPos.x;
            shibainu.position.z = newPos.z;
            if (shibainu.rotation) {
              shibainu.rotation.y = targetRotation;
            }
            console.log('✅ Movement complete! Calling onComplete callback...');
            if (typeof onComplete === 'function') {
              onComplete();
              console.log('✅ onComplete callback executed');
            } else {
              console.warn('⚠️ No onComplete callback provided');
            }
            return;
          }

          const ux = remaining > 0 ? rx / remaining : 0;
          const uz = remaining > 0 ? rz / remaining : 0;
          shibainu.position.x += ux * stepDist;
          shibainu.position.z += uz * stepDist;

          // Update rotation to face movement direction
          if (shibainu.rotation) {
            shibainu.rotation.y = targetRotation;
          }

          console.log('Dog position update:', {x: shibainu.position.x, z: shibainu.position.z});
        }

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
      console.log('Starting dog movement from', startPos, 'to', newPos);
    } catch (error) {
      console.error('Error moving dog:', error);
    }
  }

  // Reset camera view to default
  function handleResetView() {
    if (splineRef.current) {
      splineRef.current.setZoom(1);
    }
  }

  // Handle object interaction
  function onSplineMouseDown(e) {
    if (e.target.name) {
      setSelectedObject(e.target.name);
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
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-[#E8E4F0]/50">
              <p className="text-sm font-semibold text-[#6B6B6B]">Selected Object:</p>
              <p className="text-lg font-bold text-[#F85BB4]">{selectedObject}</p>
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
        </div>
      </CardContent>
    </Card>
  );
}

