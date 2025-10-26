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
  // State to store action functions from SplineViewer
  const [feedDogFunction, setFeedDogFunction] = useState(null);
  const [playDogFunction, setPlayDogFunction] = useState(null);
  const [walkDogFunction, setWalkDogFunction] = useState(null);
  const [runDogFunction, setRunDogFunction] = useState(null);
  
  // Cache-busting parameter forces browser to fetch updated scene with dog
  const sceneUrl = "https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode?v=33";

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
              maxStepDistance={36} 
              showNotification={showNotification}
              notificationMessage={notificationMessage}
              onFeedReady={(feedFunc) => setFeedDogFunction(() => feedFunc)}
              onPlayReady={(playFunc) => setPlayDogFunction(() => playFunc)}
              onWalkReady={(walkFunc) => setWalkDogFunction(() => walkFunc)}
              onRunReady={(runFunc) => setRunDogFunction(() => runFunc)}
            />

            {/* Pet Action Buttons */}
            <div className="grid grid-cols-5 gap-4">
              {/* Feed Button */}
              <Button
                onClick={() => {
                  console.log('Feed action triggered');
                  if (feedDogFunction) {
                    feedDogFunction();
                  } else {
                    console.log('Feed function not ready yet');
                  }
                }}
                className="w-full h-auto py-6 px-6 bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl hover:scale-105 rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3 border-0"
                title="Press 4 or 5"
              >
                <UtensilsCrossed className="w-10 h-10 text-white" />
                <div className="text-base font-bold text-white">Feed</div>
                <div className="text-xs text-white/70">Press 4/5</div>
              </Button>

              {/* Play Button */}
              <Button
                onClick={() => {
                  console.log('Play action triggered');
                  if (playDogFunction) {
                    playDogFunction();
                  } else {
                    console.log('Play function not ready yet');
                  }
                }}
                className="w-full h-auto py-6 px-6 bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl hover:scale-105 rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3 border-0"
                title="Press 6"
              >
                <Gamepad2 className="w-10 h-10 text-white" />
                <div className="text-base font-bold text-white">Play</div>
                <div className="text-xs text-white/70">Press 6</div>
              </Button>

              {/* Walk Button */}
              <Button
                onClick={() => {
                  console.log('Walk action triggered');
                  if (walkDogFunction) {
                    walkDogFunction();
                  } else {
                    console.log('Walk function not ready yet');
                  }
                }}
                className="w-full h-auto py-6 px-6 bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl hover:scale-105 rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3 border-0"
                title="Press 1"
              >
                <Footprints className="w-10 h-10 text-white" />
                <div className="text-base font-bold text-white">Walk</div>
                <div className="text-xs text-white/70">Press 1</div>
              </Button>

              {/* Run Button */}
              <Button
                onClick={() => {
                  console.log('Run action triggered');
                  if (runDogFunction) {
                    runDogFunction();
                  } else {
                    console.log('Run function not ready yet');
                  }
                }}
                className="w-full h-auto py-6 px-6 bg-[#9F7AEA] hover:bg-[#8B5CF6] hover:shadow-xl hover:scale-105 rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3 border-0"
                title="Press 2"
              >
                <Footprints className="w-10 h-10 text-white transform scale-125" />
                <div className="text-base font-bold text-white">Run</div>
                <div className="text-xs text-white/70">Press 2</div>
              </Button>

              {/* Pet Button */}
              <Button
                onClick={() => {
                  console.log('Pet action');
                  showPopupNotification('Pet affection increased!');
                }}
                className="w-full h-auto py-6 px-6 bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl hover:scale-105 rounded-2xl shadow-lg transition-all duration-300 group flex flex-col items-center gap-3 border-0"
              >
                <Heart className="w-10 h-10 text-white" />
                <div className="text-base font-bold text-white">Pet</div>
                <div className="text-xs text-white/70 opacity-0">-</div>
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

