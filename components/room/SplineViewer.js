import { Suspense, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InstructionsModal from "@/components/InstructionsModal";
import { 
  Camera,
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
        <Loader2 className="w-12 h-12 text-[#D4A5A5] animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-[#5A5668]">Loading your Pet's Room...</p>
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
    }
  }

  // Toggle fullscreen mode
  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  return (
    <Card className={`bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl overflow-hidden shadow-sm ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
            <Camera className="w-5 h-5 text-[#D4A5A5]" />
            Mini Room - Interactive 3D View
          </CardTitle>
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
              className="rounded-full border-[#E8E4F0] text-[#8B7B8B] hover:bg-[#F6F3F9]"
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {/* Reset View */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="rounded-full border-[#E8E4F0] text-[#8B7B8B] hover:bg-[#F6F3F9]"
              disabled={!isLoaded}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="rounded-full border-[#E8E4F0] text-[#8B7B8B] hover:bg-[#F6F3F9]"
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
              <Loader2 className="w-12 h-12 text-[#D4A5A5] animate-spin" />
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
            <div className="absolute top-4 left-4 bg-[#FBFAFD]/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#E8E4F0]">
              <p className="text-sm text-[#5A5A5A]">Selected Object:</p>
              <p className="text-lg font-semibold text-[#D4A5A5]">{selectedObject}</p>
            </div>
          )}

          {/* Loading Status Badge */}
          {!isLoaded && (
            <div className="absolute bottom-4 right-4 bg-[#FBFAFD]/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-[#E8E4F0]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#D4A5A5] animate-spin" />
                <span className="text-sm font-medium text-[#5A5668]">Loading scene...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

