import { useState } from 'react';
import RoomHeader from '@/components/room/RoomHeader';
import SplineViewer from '@/components/room/SplineViewer';
import RoomObjectsList from '@/components/room/RoomObjectsList';
import CustomizationOptions from '@/components/room/CustomizationOptions';

/**
 * Room Page
 * Main page component that orchestrates the 3D room view and related UI
 */
export default function Room() {
  const [roomName, setRoomName] = useState("Pet's Room");
  const sceneUrl = "https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode";

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#FFF5F7] to-[#F8F5FF] relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Subtle decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFE4E8]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F8F5FF]/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#FFF5F7]/20 rounded-full blur-3xl" />
      </div>

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
  );
}

