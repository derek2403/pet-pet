import { useState } from 'react';
import RoomHeader from '@/components/room/RoomHeader';
import SplineViewer from '@/components/room/SplineViewer';
import RoomStatusCards from '@/components/room/RoomStatusCards';
import RoomObjectsList from '@/components/room/RoomObjectsList';
import CustomizationOptions from '@/components/room/CustomizationOptions';

/**
 * Room Page
 * Main page component that orchestrates the 3D room view and related UI
 */
export default function Room() {
  const [roomName, setRoomName] = useState("Pet's 3D Room");
  const sceneUrl = "https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode";

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#FFF5F7] to-[#F8F5FF]"
      style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header with editable room title */}
      <RoomHeader roomName={roomName} onRoomNameChange={setRoomName} />

      {/* Main Content Container */}
      <div className="container mx-auto px-6 pb-6">
        <div className="space-y-6">
          {/* 3D Spline Viewer */}
          <SplineViewer sceneUrl={sceneUrl} />

          {/* Status Cards (Room Status, Interactive Objects, Ambient Light) */}
          <RoomStatusCards />

          {/* Room Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Objects List */}
            <RoomObjectsList />

            {/* Customization Options */}
            <CustomizationOptions />
          </div>
        </div>
      </div>
    </div>
  );
}

