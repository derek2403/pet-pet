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
      <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-sm">
              <Home className="w-6 h-6 text-[#D4A5A5]" />
            </div>
            <div>
              <div className="text-sm text-[#5A5A5A]">Room Status</div>
              <div className="text-2xl font-semibold mt-1 text-[#4A4458]">Cozy & Clean</div>
              <p className="text-xs text-[#B5B1C0] mt-1">Last updated: just now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements Card */}
      <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-xl shadow-sm">
              <Eye className="w-6 h-6 text-[#C5B5D4]" />
            </div>
            <div>
              <div className="text-sm text-[#5A5A5A]">Interactive Objects</div>
              <div className="text-2xl font-semibold mt-1 text-[#4A4458]">Click to Explore</div>
              <p className="text-xs text-[#B5B1C0] mt-1">Drag to rotate view</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ambient Light Card */}
      <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-xl shadow-sm">
              <Lightbulb className="w-6 h-6 text-[#E4B5C5]" />
            </div>
            <div>
              <div className="text-sm text-[#5A5A5A]">Ambient Light</div>
              <div className="text-2xl font-semibold mt-1 text-[#4A4458]">Warm Glow</div>
              <p className="text-xs text-[#B5B1C0] mt-1">Perfect for relaxation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

