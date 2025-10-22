import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Footprints, Clock, MapPin, CheckCircle2 } from "lucide-react";

/**
 * RealTimePetStatus Component
 * Displays the pet's current activity and location verification status
 */
export default function RealTimePetStatus({ currentActivity }) {
  return (
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl lg:col-span-2 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <Activity className="w-5 h-5 text-[#D4A5A5]" />
          Real-Time Pet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF] rounded-2xl border border-pink-50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm animate-bounce">
                <Footprints className="w-8 h-8 text-[#D4A5A5]" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#4A4458]">{currentActivity.type}</h3>
                <p className="text-[#6B6B6B] flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  Since: {currentActivity.duration}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl border border-pink-50">
            <MapPin className="w-4 h-4 text-[#D4A5A5]" />
            <span className="text-sm font-medium text-[#6B6B6B]">
              Location Privacy: {currentActivity.location}
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#D4A5A5]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

