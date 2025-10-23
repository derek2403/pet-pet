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
        <Loader2 className="w-12 h-12 text-[#FF2D95] animate-spin mx-auto mb-4" />
        <p className="text-lg font-bold text-[#4A4458]">Loading your Pet's Room...</p>
      </div>
    </div>
  ),
});

/**
 * SplineViewer Component
 * Displays the interactive 3D Spline scene with controls
 */
export default function SplineViewer({ sceneUrl }) {
  const splineRef = useRef();
  const viewerRef = useRef(null);
  const controlsRef = useRef(null);
  const zoomRef = useRef(1.9);
  const allObjectsRef = useRef([]);
  // Holds the object we will emit events on (set after first user click on dog)
  const dogEventTargetRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isPointerOverViewer, setIsPointerOverViewer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Prevent page scroll when interacting inside the 3D viewer and map wheel to zoom
  useEffect(() => {
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
    
    // Find and control the dog (Shibainu) animations
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
      
      // Try multiple possible names for the dog
      let shibainu = splineApp.findObjectByName('Shibainu') ||
                     splineApp.findObjectByName('shibainu') ||
                     splineApp.findObjectByName('Shibainu_AnimalArmature') ||
                     allObjects.find(obj => 
                       obj.name && obj.name.toLowerCase().includes('shibainu')
                     );
      
      if (shibainu) {
        console.log('Found dog object:', shibainu.name || 'unnamed');
        console.log('SplineApp methods:', Object.keys(splineApp).filter(k => typeof splineApp[k] === 'function'));
        console.log('Shibainu properties:', Object.keys(shibainu));
        
        // Stop all animations initially to prevent twitching
        if (splineApp.stopAnimation) {
          splineApp.stopAnimation();
        }
        
        // Start with idle animation
        setTimeout(() => {
          playIdleAnimation(splineApp, shibainu);
        }, 100);
        
        // Set up animation cycling: idle for 5 sec, walk for 3 sec, repeat
        setInterval(() => {
          cycleAnimations(splineApp, shibainu);
        }, 8000); // Cycle every 8 seconds
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

  // Play idle animation for the dog
  function playIdleAnimation(splineApp, shibainu) {
    try {
      // The Start event will automatically play idle animation
      console.log('Idle animation should be playing from Start event');
    } catch (error) {
      console.error('Error with idle animation:', error);
    }
  }

  // Cycle through different animations and move the dog around
  function cycleAnimations(splineApp, shibainu) {
    const shouldWalk = Math.random() > 0.5; // 50% chance to walk
    
    try {
      if (shouldWalk) {
        console.log('Starting walk cycle');
        
        // Method 1: Trigger mouseDown event on the object directly (OFFICIAL WAY)
        // This triggers the Mouse Press event you set up in Spline editor
        // Prefer the exact object coming from a real click if we have it
        const dogEventTarget = dogEventTargetRef.current || shibainu;
        if (dogEventTarget && typeof dogEventTarget.emitEvent === 'function') {
          try {
            dogEventTarget.emitEvent('mouseDown');
            console.log('✅ Triggered walk via shibainu.emitEvent("mouseDown")');
          } catch (e) {
            console.log('❌ shibainu.emitEvent failed:', e.message);
          }
        }

        // Method 1b: belt-and-suspenders — also emit on any likely child with walk action
        try {
          const candidates = (allObjectsRef.current || []).filter(o => {
            const n = String(o.name || '').toLowerCase();
            return n.includes('shiba') || n.includes('shibal') || n.includes('animalarmature');
          });
          candidates.forEach(o => {
            if (o && typeof o.emitEvent === 'function') {
              o.emitEvent('mouseDown');
            }
          });
        } catch (_) {}
        
        // Method 2: Alternative way - emit event with object name
        if (typeof splineApp.emitEvent === 'function') {
          try {
            splineApp.emitEvent('mouseDown', (dogEventTargetRef.current && dogEventTargetRef.current.name) || shibainu.name);
            console.log('✅ Triggered walk via splineApp.emitEvent("mouseDown", name)');
          } catch (e) {
            console.log('❌ splineApp.emitEvent failed:', e.message);
          }
        }
        
        // Move the dog to a new position and emit mouseUp exactly when movement ends
        moveDogToRandomPosition(shibainu, () => {
          try {
            const dogEventTarget2 = dogEventTargetRef.current || shibainu;
            if (dogEventTarget2 && typeof dogEventTarget2.emitEvent === 'function') {
              dogEventTarget2.emitEvent('mouseUp');
              console.log('🔚 Sent mouseUp to end walk');
            } else if (typeof splineApp.emitEvent === 'function') {
              splineApp.emitEvent('mouseUp', (dogEventTargetRef.current && dogEventTargetRef.current.name) || shibainu.name);
            }
            // Also send mouseUp to candidate children
            const candidates = (allObjectsRef.current || []).filter(o => {
              const n = String(o.name || '').toLowerCase();
              return n.includes('shiba') || n.includes('shibal') || n.includes('animalarmature');
            });
            candidates.forEach(o => {
              if (o && typeof o.emitEvent === 'function') {
                o.emitEvent('mouseUp');
              }
            });
          } catch (e) {}
        });
      } else {
        // Stay idle (Start event keeps idle animation running)
        console.log('Dog staying idle');
      }
    } catch (error) {
      console.error('Error cycling animations:', error);
    }
  }

  // Move the dog to a random position in the room
  function moveDogToRandomPosition(shibainu, onComplete) {
    if (!shibainu) return;
    
    try {
      // Define different spots in the room (smaller movements for testing)
      const positions = [
        { x: -100, y: 0, z: 50 },    // Near the plant
        { x: 50, y: 0, z: 100 },     // Near the desk  
        { x: 0, y: 0, z: 0 },        // Center of room
        { x: 100, y: 0, z: 50 },     // Near the lamp
        { x: -50, y: 0, z: 100 },    // Near the computer
      ];
      
      // Pick a random position
      const newPos = positions[Math.floor(Math.random() * positions.length)];
      
      // Get current position
      const startPos = { 
        x: shibainu.position?.x || 0, 
        y: shibainu.position?.y || 0, 
        z: shibainu.position?.z || 0 
      };
      
      console.log('Dog current position:', startPos);
      console.log('Dog target position:', newPos);
      
      // Smoothly move the dog over 3 seconds
      const duration = 3000; // 3 seconds
      const startTime = Date.now();
      
      // Calculate rotation to face the direction of movement
      const dx = newPos.x - startPos.x;
      const dz = newPos.z - startPos.z;
      const targetRotation = Math.atan2(dx, dz);
      
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-in-out for smooth movement
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Update position if the object has position property
        if (shibainu.position) {
          shibainu.position.x = startPos.x + (newPos.x - startPos.x) * eased;
          shibainu.position.z = startPos.z + (newPos.z - startPos.z) * eased;
          
          // Update rotation to face movement direction
          if (shibainu.rotation) {
            shibainu.rotation.y = targetRotation;
          }
          
          console.log('Dog position update:', {x: shibainu.position.x, z: shibainu.position.z});
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log('Movement complete!');
          if (typeof onComplete === 'function') onComplete();
        }
      }
      
      animate();
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
              <div className="absolute inset-0 bg-[#FF2D95]/20 rounded-xl blur-lg" />
              <div className="relative p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md">
                <CircleCheck className="w-6 h-6 text-[#FF2D95]" />
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
              className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#FF2D95] hover:shadow-md transition-all shadow-sm font-semibold"
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {/* Reset View */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#FF2D95] hover:shadow-md transition-all shadow-sm font-semibold"
              disabled={!isLoaded}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#FF2D95] hover:shadow-md transition-all shadow-sm font-semibold"
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
              <Loader2 className="w-12 h-12 text-[#FF2D95] animate-spin" />
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
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-[#E8E4F0]/50">
              <p className="text-sm font-semibold text-[#6B6B6B]">Selected Object:</p>
              <p className="text-lg font-bold text-[#FF2D95]">{selectedObject}</p>
            </div>
          )}

          {/* Loading Status Badge */}
          {!isLoaded && (
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg border border-[#E8E4F0]/50">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#FF2D95] animate-spin" />
                <span className="text-sm font-bold text-[#4A4458]">Loading scene...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

