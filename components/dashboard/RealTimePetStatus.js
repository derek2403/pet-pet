import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Footprints, Clock, MapPin, CheckCircle2 } from "lucide-react";

/**
 * RealTimePetStatus Component
 * Displays the pet's current activity and location verification status
 */
export default function RealTimePetStatus({ currentActivity, petName }) {
  // If no activity data, show empty state
  if (!currentActivity) {
    return (
      <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-4 duration-500 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
            <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
              <Activity className="w-4 h-4 text-[#F85BB4]" />
            </div>
            Real-Time Pet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="p-8 bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF] rounded-2xl border border-pink-100/50 shadow-md relative overflow-hidden">
            <div className="text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
              <p className="text-lg font-medium text-[#4A4458]">No activity yet</p>
              <p className="text-sm text-[#6B6B6B] mt-1">
                {petName ? `${petName}'s activities will appear here` : 'Pet activities will appear here'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-4 duration-500 group overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
          <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
            <Activity className="w-4 h-4 text-[#F85BB4]" />
          </div>
          Real-Time Pet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="p-6 bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF] rounded-2xl border border-pink-100/50 shadow-md relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
          
          <div className="flex items-center justify-between mb-5 relative">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F85BB4]/12 rounded-2xl blur-md" />
                <div className="relative p-3 bg-white rounded-xl shadow-sm">
                  <Footprints className="w-7 h-7 text-[#F85BB4] animate-double-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#4A4458] tracking-tight">{currentActivity.type}</h3>
                <p className="text-[#6B6B6B] flex items-center gap-2 mt-1.5 font-medium">
                  <Clock className="w-4 h-4 text-[#D4A5A5]" />
                  <span className="text-sm">Duration: {currentActivity.duration}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* TEE Privacy indicator - aligned with blockchain theme */}
          <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-pink-100/50 shadow-sm">
            <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#F8F5FF] rounded-lg">
              <MapPin className="w-4 h-4 text-[#F85BB4]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-[#4A4458] block">TEE Location Privacy</span>
              <span className="text-xs text-[#6B6B6B]">{currentActivity.location}</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#D4A5A5]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

