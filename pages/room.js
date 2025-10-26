import { useState, useEffect } from 'react';
import RoomHeader from '@/components/room/RoomHeader';
import SplineViewer from '@/components/room/SplineViewer';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

/**
 * Room Page
 * Main page component that orchestrates the 3D room view and related UI
 */
export default function Room() {
  const [roomName, setRoomName] = useState("My Pet's Room");
  
  // Load pet name from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPetName = localStorage.getItem('petName');
      if (savedPetName) {
        setRoomName(`${savedPetName}'s Room`);
      }
    }
  }, []);
  
  // Cache-busting parameter forces browser to fetch updated scene with dog
  const sceneUrl = "https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode?v=33";

  return (
    <>
      <BackgroundGradientAnimation
        gradientBackgroundStart="#FCE7F3" /* softer pink */
        gradientBackgroundEnd="#DBEAFE" /* pale blue */
        firstColor="rgb(255, 228, 232)" /* blush */
        secondColor="221, 214, 254" /* lavender */
        thirdColor="186, 230, 253" /* sky */
        fourthColor="199, 210, 254" /* periwinkle */
        fifthColor="255, 200, 210" /* light rose */
        pointerColor="240, 249, 255" /* very light azure */
        size="120%"
        blendingValue="normal"
        interactive={true}
        containerClassName="fixed inset-0 z-0 pointer-events-none"
      />

      <div 
        className="relative z-10 min-h-screen"
        style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
      >
        {/* Header with editable room title */}
        <div className="relative z-10">
          <RoomHeader roomName={roomName} onRoomNameChange={setRoomName} />
        </div>

        {/* Main Content Container */}
        <div className="container mx-auto px-6 pb-6 relative z-10">
          <div className="space-y-6">
            {/* 3D Spline Viewer */}
            <SplineViewer 
              sceneUrl={sceneUrl} 
              maxStepDistance={36}
            />
          </div>
        </div>
      </div>
    </>
  );
}

