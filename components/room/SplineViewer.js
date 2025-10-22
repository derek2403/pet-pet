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
    <Card className={`bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 group ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF2D95]/20 rounded-xl blur-lg" />
              <div className="relative p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md">
                <Camera className="w-6 h-6 text-[#FF2D95]" />
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

