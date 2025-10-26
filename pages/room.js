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

