import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Footprints, Clock, MapPin, CheckCircle2 } from "lucide-react";

/**
 * RealTimePetStatus Component
 * Displays the pet's current activity and location verification status
 */
export default function RealTimePetStatus({ currentActivity }) {
  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-4 duration-500 group overflow-hidden">
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
                <div className="relative p-4 bg-white rounded-2xl shadow-sm">
                  <Footprints className="w-8 h-8 text-[#F85BB4] animate-double-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#4A4458] tracking-tight">{currentActivity.type}</h3>
                <p className="text-[#6B6B6B] flex items-center gap-2 mt-1.5 font-medium">
                  <Clock className="w-4 h-4 text-[#D4A5A5]" />
                  <span className="text-sm">Duration: {currentActivity.duration}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* ZKP Privacy indicator - aligned with blockchain theme */}
          <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-pink-100/50 shadow-sm">
            <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#F8F5FF] rounded-lg">
              <MapPin className="w-4 h-4 text-[#F85BB4]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-[#4A4458] block">Zero-Knowledge Location Privacy</span>
              <span className="text-xs text-[#6B6B6B]">{currentActivity.location}</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#D4A5A5]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

