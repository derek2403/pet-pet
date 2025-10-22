import { Card, CardContent } from "@/components/ui/card";
import { Home, Eye, Lightbulb } from "lucide-react";

/**
 * RoomStatusCards Component
 * Displays three info cards showing room status, interactive elements, and lighting
 */
export default function RoomStatusCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Room Status Card */}
      <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF2D95]/20 rounded-xl blur-lg" />
              <div className="relative p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-md">
                <Home className="w-6 h-6 text-[#FF2D95]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#6B6B6B]">Room Status</div>
              <div className="text-2xl font-bold mt-1 text-[#4A4458]">Cozy & Clean</div>
              <p className="text-xs text-[#B5B1C0] mt-1.5 font-medium">Last updated: just now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements Card */}
      <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-600 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C5B5D4]/20 rounded-xl blur-lg" />
              <div className="relative p-3 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-xl shadow-md">
                <Eye className="w-6 h-6 text-[#C5B5D4]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#6B6B6B]">Interactive Objects</div>
              <div className="text-2xl font-bold mt-1 text-[#4A4458]">Click to Explore</div>
              <p className="text-xs text-[#B5B1C0] mt-1.5 font-medium">Drag to rotate view</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ambient Light Card */}
      <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-700 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#E4B5C5]/20 rounded-xl blur-lg" />
              <div className="relative p-3 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-xl shadow-md">
                <Lightbulb className="w-6 h-6 text-[#E4B5C5]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#6B6B6B]">Ambient Light</div>
              <div className="text-2xl font-bold mt-1 text-[#4A4458]">Warm Glow</div>
              <p className="text-xs text-[#B5B1C0] mt-1.5 font-medium">Perfect for relaxation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

