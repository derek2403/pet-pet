import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, ArrowLeft, Pencil } from "lucide-react";
import Link from 'next/link';

/**
 * RoomHeader Component
 * Displays the header with back button, editable room title, and home icon
 */
export default function RoomHeader({ roomName, onRoomNameChange }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(roomName);

  // Save the room name when user presses Enter or clicks outside
  function handleSaveName(e) {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditingName(false);
      onRoomNameChange(localName);
    }
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        {/* Back to Dashboard Button */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] text-[#5A5668] hover:bg-[#F6F3F9]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Centered Room Title with Home Icon */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-sm">
            <Home className="w-8 h-8 text-[#D4A5A5]" />
          </div>
          {isEditingName ? (
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onKeyDown={handleSaveName}
              onBlur={handleSaveName}
              autoFocus
              className="text-2xl font-medium text-[#4A4458] h-10 w-64 border-[#E8E4F0] focus:border-[#FF4081] bg-white/80"
            />
          ) : (
            <div 
              className="group flex items-center gap-2 cursor-pointer hover:bg-[#F6F3F9] px-3 py-1 rounded-lg transition-colors"
              onClick={() => setIsEditingName(true)}
            >
              <h1 className="text-2xl font-medium text-[#4A4458]">{roomName}</h1>
              <Pencil className="w-4 h-4 text-[#D4A5A5] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Placeholder for layout balance */}
        <div className="flex items-center gap-3"></div>
      </div>
    </div>
  );
}

