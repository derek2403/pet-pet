import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, Wifi, WifiOff, Shield, Pencil } from "lucide-react";

/**
 * PetProfileCard Component
 * Displays the selected pet's profile information and device status
 */
export default function PetProfileCard({ pet, onPetNameChange }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(pet.name);

  // Save the pet name when user presses Enter or clicks outside
  function handleSaveName(e) {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditingName(false);
      if (onPetNameChange) {
        onPetNameChange(localName);
      }
    }
  }

  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start gap-6">
          {/* Pet Avatar with enhanced styling */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF2D95]/20 rounded-full blur-xl" />
            <Avatar className="w-24 h-24 text-5xl relative ring-4 ring-white/50 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5]">
                {pet.avatar}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Pet Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                {isEditingName ? (
                  <Input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onKeyDown={handleSaveName}
                    onBlur={handleSaveName}
                    autoFocus
                    className="text-3xl font-semibold text-[#4A4458] h-12 max-w-xs border-[#E8E4F0] focus:border-[#FF4081] bg-white/80 mb-1"
                  />
                ) : (
                  <div 
                    className="group inline-flex items-center gap-2 cursor-pointer hover:bg-[#F6F3F9] px-2 py-1 rounded-lg transition-colors -ml-2 mb-1"
                    onClick={() => setIsEditingName(true)}
                  >
                    <h2 className="text-3xl font-semibold text-[#4A4458]">{pet.name}</h2>
                    <Pencil className="w-4 h-4 text-[#D4A5A5] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[#D4A5A5] font-medium">{pet.ens}</p>
                  <Shield className="w-4 h-4 text-[#D4A5A5]" />
                </div>
                <p className="text-[#5A5A5A] mt-1">
                  {pet.breed} • {pet.species}
                </p>
              </div>
              <Badge className="bg-[#F85BB4] text-white font-semibold hover:shadow-lg border-none px-4 py-2 shadow-md transition-all duration-200 hover:scale-105">
                <Activity className="w-4 h-4 mr-1.5 animate-pulse" />
                {pet.status}
              </Badge>
            </div>

            {/* Device Status with enhanced visual feedback */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F6F3F9] to-[#FBFAFD] rounded-xl border border-[#E8E4F0]/50 shadow-sm">
              <div className="flex items-center gap-2">
                {pet.deviceStatus === "connected" ? (
                  <div className="relative">
                    <Wifi className="w-4 h-4 text-[#D4A5A5]" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D4A5A5] rounded-full animate-pulse" />
                  </div>
                ) : (
                  <WifiOff className="w-4 h-4 text-[#B5B1C0]" />
                )}
                <span className="text-sm font-medium text-[#5A5668]">{pet.deviceId}</span>
              </div>
              <Badge
                variant="outline"
                className={
                  pet.deviceStatus === "connected"
                    ? "border-pink-200 text-[#D4A5A5] bg-pink-50 shadow-sm"
                    : "border-[#E8E4F0] text-[#5A5A5A]"
                }
              >
                {pet.deviceStatus}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

