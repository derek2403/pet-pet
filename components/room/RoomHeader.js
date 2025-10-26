import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from 'next/link';

/**
 * RoomHeader Component
 * Displays the header with back button and editable room title
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
      <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Back to Dashboard Button */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-md border-[#E8E4F0]/50 text-[#4A4458] font-semibold hover:bg-white hover:border-[#F85BB4] hover:shadow-lg transition-all duration-200 shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Centered Room Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          {isEditingName ? (
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onKeyDown={handleSaveName}
              onBlur={handleSaveName}
              autoFocus
              className="text-2xl font-bold text-[#4A4458] h-12 w-64 border-[#E8E4F0] focus:border-[#F85BB4] bg-white/80 backdrop-blur-sm rounded-xl shadow-md"
            />
          ) : (
            <div 
              className="group flex items-center gap-2 cursor-pointer hover:bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-md"
              onClick={() => setIsEditingName(true)}
            >
              <h1 className="text-2xl font-bold text-[#4A4458] tracking-tight">{roomName}</h1>
              <Pencil className="w-4 h-4 text-[#F85BB4] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Placeholder for layout balance */}
        <div className="flex items-center gap-3"></div>
      </div>
    </div>
  );
}

