import { useState } from 'react';
import RoomHeader from '@/components/room/RoomHeader';
import SplineViewer from '@/components/room/SplineViewer';
import RoomObjectsList from '@/components/room/RoomObjectsList';
import CustomizationOptions from '@/components/room/CustomizationOptions';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

/**
 * Room Page
 * Main page component that orchestrates the 3D room view and related UI
 */
export default function Room() {
  const [roomName, setRoomName] = useState("Pet's Room");
  // Cache-busting parameter forces browser to fetch updated scene with dog
  const sceneUrl = "https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode?v=22";

  return (
    <>
      <BackgroundGradientAnimation
        gradientBackgroundStart="#FFF7FB"
        gradientBackgroundEnd="#EEF2FF"
        firstColor="rgb(255, 183, 197)"
        secondColor="199, 210, 254"
        thirdColor="190, 242, 234"
        fourthColor="254, 215, 170"
        fifthColor="221, 214, 254"
        pointerColor="255, 236, 244"
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
            {/* 3D Spline Viewer with Room Status */}
            <SplineViewer sceneUrl={sceneUrl} />

            {/* Room Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Room Objects List */}
              <RoomObjectsList key="room-objects-card" />

              {/* Customization Options */}
              <CustomizationOptions key="customization-card" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

