import { useState } from 'react';
import RoomHeader from '@/components/room/RoomHeader';
import SplineViewer from '@/components/room/SplineViewer';
import RoomObjectsList from '@/components/room/RoomObjectsList';
import CustomizationOptions from '@/components/room/CustomizationOptions';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Gamepad2, Footprints, Heart } from "lucide-react";

/**
 * Room Page
 * Main page component that orchestrates the 3D room view and related UI
 */
export default function Room() {
  const [roomName, setRoomName] = useState("Shibaba's Room");
  // State for showing popup notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Cache-busting parameter forces browser to fetch updated scene with dog
  const sceneUrl = "https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode?v=26";

  // Helper function to show popup notification with auto-fade
  const showPopupNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    // Auto-hide after 2 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

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
            {/* 3D Spline Viewer with Room Status */}
            <SplineViewer 
              sceneUrl={sceneUrl} 
              maxStepDistance={40} 
              showNotification={showNotification}
              notificationMessage={notificationMessage}
            />

            {/* Pet Action Buttons */}
            <div className="grid grid-cols-4 gap-4">
              {/* Feed Button */}
              <Button
                onClick={() => console.log('Feed action')}
                className="w-full h-auto py-6 px-6 bg-white/60 backdrop-blur-md border border-[#E8E4F0]/50 hover:bg-white hover:border-[#F85BB4] hover:shadow-xl rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F85BB4]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <UtensilsCrossed className="w-6 h-6 text-[#F85BB4]" />
                  </div>
                </div>
                <div className="text-sm font-bold text-[#4A4458]">Feed</div>
              </Button>

              {/* Play Button */}
              <Button
                onClick={() => console.log('Play action')}
                className="w-full h-auto py-6 px-6 bg-white/60 backdrop-blur-md border border-[#E8E4F0]/50 hover:bg-white hover:border-[#F85BB4] hover:shadow-xl rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F85BB4]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Gamepad2 className="w-6 h-6 text-[#F85BB4]" />
                  </div>
                </div>
                <div className="text-sm font-bold text-[#4A4458]">Play</div>
              </Button>

              {/* Walk Button */}
              <Button
                onClick={() => console.log('Walk action')}
                className="w-full h-auto py-6 px-6 bg-white/60 backdrop-blur-md border border-[#E8E4F0]/50 hover:bg-white hover:border-[#F85BB4] hover:shadow-xl rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F85BB4]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Footprints className="w-6 h-6 text-[#F85BB4]" />
                  </div>
                </div>
                <div className="text-sm font-bold text-[#4A4458]">Walk</div>
              </Button>

              {/* Pet Button */}
              <Button
                onClick={() => {
                  console.log('Pet action');
                  showPopupNotification('Pet affection increased!');
                }}
                className="w-full h-auto py-6 px-6 bg-white/60 backdrop-blur-md border border-[#E8E4F0]/50 hover:bg-white hover:border-[#F85BB4] hover:shadow-xl rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#F85BB4]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Heart className="w-6 h-6 text-[#F85BB4]" />
                  </div>
                </div>
                <div className="text-sm font-bold text-[#4A4458]">Pet</div>
              </Button>
            </div>

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

