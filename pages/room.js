import { Suspense, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Camera,
  Lightbulb,
  Volume2,
  VolumeX,
  Info,
  Loader2,
  ArrowLeft,
  Eye,
  Box,
  Monitor,
  Armchair,
  Flower,
  Palette,
  Image
} from "lucide-react";
import Link from 'next/link';

// Dynamically import Spline component for better performance
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#D4A5A5] animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-[#6F6B7D]">Loading your Pet's Room...</p>
      </div>
    </div>
  ),
});

export default function Room() {
  const splineRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);

  // Handle Spline scene load
  function onLoad(splineApp) {
    splineRef.current = splineApp;
    setIsLoaded(true);
    console.log('Spline scene loaded successfully');
  }

  // Reset camera view
  function handleResetView() {
    if (splineRef.current) {
      splineRef.current.setZoom(1);
      // You can add more reset logic here
    }
  }

  // Handle object interaction
  function onSplineMouseDown(e) {
    if (e.target.name) {
      setSelectedObject(e.target.name);
      console.log('Clicked on:', e.target.name);
    }
  }

  // Toggle fullscreen
  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#FFF5F7] to-[#F8F5FF]"
      style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] text-[#6F6B7D] hover:bg-[#F6F3F9]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-sm">
              <Home className="w-8 h-8 text-[#D4A5A5]" />
            </div>
            <h1 className="text-2xl font-medium text-[#4A4458]">Pet's 3D Room</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] text-[#8B7B8B] hover:bg-gradient-to-r border border-pink-100 px-4 py-2 shadow-sm">
              <Box className="w-3 h-3 mr-1" />
              Interactive
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* 3D Viewer Card */}
          <Card className={`bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl overflow-hidden shadow-sm ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                  <Camera className="w-5 h-5 text-[#D4A5A5]" />
                  Mini Room - Interactive 3D View
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Controls */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSoundOn(!isSoundOn)}
                    className="rounded-full border-[#E8E4F0] text-[#8B7B8B] hover:bg-[#F6F3F9]"
                  >
                    {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetView}
                    className="rounded-full border-[#E8E4F0] text-[#8B7B8B] hover:bg-[#F6F3F9]"
                    disabled={!isLoaded}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
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
              <div className={`relative bg-gradient-to-br from-[#FFF5F7] via-[#F8F5FF] to-[#F5E8FF] ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}>
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#D4A5A5] animate-spin" />
                  </div>
                }>
                  <Spline
                    scene="https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode"
                    onLoad={onLoad}
                    onSplineMouseDown={onSplineMouseDown}
                    className="w-full h-full"
                  />
                </Suspense>
                
                {/* Overlay Info */}
                {selectedObject && (
                  <div className="absolute top-4 left-4 bg-[#FBFAFD]/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#E8E4F0]">
                    <p className="text-sm text-[#9E9AA7]">Selected Object:</p>
                    <p className="text-lg font-semibold text-[#D4A5A5]">{selectedObject}</p>
                  </div>
                )}

                {/* Loading status badge */}
                {!isLoaded && (
                  <div className="absolute bottom-4 right-4 bg-[#FBFAFD]/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-[#E8E4F0]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#D4A5A5] animate-spin" />
                      <span className="text-sm font-medium text-[#6F6B7D]">Loading scene...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Room Info */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-sm">
                    <Home className="w-6 h-6 text-[#D4A5A5]" />
                  </div>
                  <div>
                    <div className="text-sm text-[#9E9AA7]">Room Status</div>
                    <div className="text-2xl font-semibold mt-1 text-[#4A4458]">Cozy & Clean</div>
                    <p className="text-xs text-[#B5B1C0] mt-1">Last updated: just now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Elements */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-xl shadow-sm">
                    <Eye className="w-6 h-6 text-[#C5B5D4]" />
                  </div>
                  <div>
                    <div className="text-sm text-[#9E9AA7]">Interactive Objects</div>
                    <div className="text-2xl font-semibold mt-1 text-[#4A4458]">Click to Explore</div>
                    <p className="text-xs text-[#B5B1C0] mt-1">Drag to rotate view</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lighting Control */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-xl shadow-sm">
                    <Lightbulb className="w-6 h-6 text-[#E4B5C5]" />
                  </div>
                  <div>
                    <div className="text-sm text-[#9E9AA7]">Ambient Light</div>
                    <div className="text-2xl font-semibold mt-1 text-[#4A4458]">Warm Glow</div>
                    <p className="text-xs text-[#B5B1C0] mt-1">Perfect for relaxation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          <Card className="bg-gradient-to-r from-[#FFF5F7] to-[#F8F5FF] border-pink-100 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-[#D4A5A5] shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#4A4458]">How to interact with the 3D Room</h3>
                  <ul className="space-y-2 text-sm text-[#6F6B7D]">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#D4A5A5] rounded-full"></span>
                      <span><strong>Left Click + Drag:</strong> Rotate the camera around the room</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#D4A5A5] rounded-full"></span>
                      <span><strong>Scroll:</strong> Zoom in and out to see details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#D4A5A5] rounded-full"></span>
                      <span><strong>Click Objects:</strong> Select interactive elements in the room</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#D4A5A5] rounded-full"></span>
                      <span><strong>Right Click + Drag:</strong> Pan the camera view</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Objects */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                  <Box className="w-5 h-5 text-[#D4A5A5]" />
                  Room Objects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-[#F6F3F9]/50 rounded-xl border border-[#E8E4F0]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
                        <Monitor className="w-5 h-5 text-[#D4A5A5]" />
                      </div>
                      <span className="font-medium text-[#6F6B7D]">Computer Setup</span>
                    </div>
                    <Badge variant="outline" className="border-pink-200 text-[#D4A5A5] bg-pink-50">Interactive</Badge>
                  </div>
                </div>
                <div className="p-4 bg-[#F6F3F9]/50 rounded-xl border border-[#E8E4F0]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-lg shadow-sm">
                        <Armchair className="w-5 h-5 text-[#C5B5D4]" />
                      </div>
                      <span className="font-medium text-[#6F6B7D]">Gaming Chair</span>
                    </div>
                    <Badge variant="outline" className="border-purple-200 text-[#C5B5D4] bg-purple-50">Static</Badge>
                  </div>
                </div>
                <div className="p-4 bg-[#F6F3F9]/50 rounded-xl border border-[#E8E4F0]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-lg shadow-sm">
                        <Lightbulb className="w-5 h-5 text-[#E4B5C5]" />
                      </div>
                      <span className="font-medium text-[#6F6B7D]">Desk Lamp</span>
                    </div>
                    <Badge variant="outline" className="border-pink-200 text-[#E4B5C5] bg-pink-50">Animated</Badge>
                  </div>
                </div>
                <div className="p-4 bg-[#F6F3F9]/50 rounded-xl border border-[#E8E4F0]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
                        <Flower className="w-5 h-5 text-[#D4A5A5]" />
                      </div>
                      <span className="font-medium text-[#6F6B7D]">Plant Pot</span>
                    </div>
                    <Badge variant="outline" className="border-pink-200 text-[#D4A5A5] bg-pink-50">Decoration</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customization Options */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                  <Lightbulb className="w-5 h-5 text-[#D4A5A5]" />
                  Customization (Coming Soon)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button disabled className="w-full justify-start bg-[#F6F3F9] text-[#B5B1C0] cursor-not-allowed border border-[#E8E4F0]">
                  <Palette className="w-5 h-5 mr-3" />
                  Change Wall Colors
                </Button>
                <Button disabled className="w-full justify-start bg-[#F6F3F9] text-[#B5B1C0] cursor-not-allowed border border-[#E8E4F0]">
                  <Armchair className="w-5 h-5 mr-3" />
                  Replace Furniture
                </Button>
                <Button disabled className="w-full justify-start bg-[#F6F3F9] text-[#B5B1C0] cursor-not-allowed border border-[#E8E4F0]">
                  <Image className="w-5 h-5 mr-3" />
                  Add Decorations
                </Button>
                <Button disabled className="w-full justify-start bg-[#F6F3F9] text-[#B5B1C0] cursor-not-allowed border border-[#E8E4F0]">
                  <Lightbulb className="w-5 h-5 mr-3" />
                  Adjust Lighting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

