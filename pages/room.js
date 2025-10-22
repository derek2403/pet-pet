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
  Box
} from "lucide-react";
import Link from 'next/link';

// Dynamically import Spline component for better performance
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading your Pet's Room...</p>
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
      className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 via-purple-50 to-blue-100"
      style={{ fontFamily: "'Poppins', 'Inter', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-pink-500 text-3xl font-bold">🏠</div>
            <h1 className="text-2xl font-semibold">Pet's 3D Room</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-4 py-2">
              <Box className="w-3 h-3 mr-1" />
              Interactive
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* 3D Viewer Card */}
          <Card className={`bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-pink-500" />
                  Mini Room - Interactive 3D View
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Controls */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSoundOn(!isSoundOn)}
                    className="rounded-full"
                  >
                    {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetView}
                    className="rounded-full"
                    disabled={!isLoaded}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="rounded-full"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Spline 3D Scene Container */}
              <div className={`relative bg-gradient-to-br from-orange-100 via-orange-50 to-pink-50 ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}>
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
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
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-sm text-gray-600">Selected Object:</p>
                    <p className="text-lg font-semibold text-pink-500">{selectedObject}</p>
                  </div>
                )}

                {/* Loading status badge */}
                {!isLoaded && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                      <span className="text-sm font-medium">Loading scene...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Room Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-100 rounded-xl">
                    <Home className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Room Status</div>
                    <div className="text-2xl font-semibold mt-1">Cozy & Clean</div>
                    <p className="text-xs text-gray-500 mt-1">Last updated: just now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Elements */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Interactive Objects</div>
                    <div className="text-2xl font-semibold mt-1">Click to Explore</div>
                    <p className="text-xs text-gray-500 mt-1">Drag to rotate view</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lighting Control */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Ambient Light</div>
                    <div className="text-2xl font-semibold mt-1">Warm Glow</div>
                    <p className="text-xs text-gray-500 mt-1">Perfect for relaxation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-pink-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">How to interact with the 3D Room</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      <span><strong>Left Click + Drag:</strong> Rotate the camera around the room</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      <span><strong>Scroll:</strong> Zoom in and out to see details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      <span><strong>Click Objects:</strong> Select interactive elements in the room</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
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
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-pink-500" />
                  Room Objects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💻</div>
                      <span className="font-medium">Computer Setup</span>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-700">Interactive</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🪑</div>
                      <span className="font-medium">Gaming Chair</span>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-700">Static</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💡</div>
                      <span className="font-medium">Desk Lamp</span>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">Animated</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🪴</div>
                      <span className="font-medium">Plant Pot</span>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-700">Decoration</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customization Options */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-pink-500" />
                  Customization (Coming Soon)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button disabled className="w-full justify-start bg-gray-100 text-gray-500 cursor-not-allowed">
                  <span className="text-xl mr-3">🎨</span>
                  Change Wall Colors
                </Button>
                <Button disabled className="w-full justify-start bg-gray-100 text-gray-500 cursor-not-allowed">
                  <span className="text-xl mr-3">🪑</span>
                  Replace Furniture
                </Button>
                <Button disabled className="w-full justify-start bg-gray-100 text-gray-500 cursor-not-allowed">
                  <span className="text-xl mr-3">🖼️</span>
                  Add Decorations
                </Button>
                <Button disabled className="w-full justify-start bg-gray-100 text-gray-500 cursor-not-allowed">
                  <span className="text-xl mr-3">💡</span>
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

