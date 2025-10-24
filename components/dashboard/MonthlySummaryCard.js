import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Footprints, Moon, Heart, MapPin } from "lucide-react";

/**
 * MonthlySummaryCard Component
 * Displays monthly statistics for the pet's activities
 */
export default function MonthlySummaryCard({ stats }) {
  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden group">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
              <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
                <TrendingUp className="w-4 h-4 text-[#F85BB4]" />
              </div>
              Monthly Summary
            </CardTitle>
            <p className="text-sm text-[#6B6B6B] mt-2 font-medium">Last 30 days of verified activity</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Running - Primary stat with enhanced design */}
          <div className="relative p-5 bg-gradient-to-br from-[#FFF5F7] to-[#FFE4E8] rounded-xl border border-pink-100/50 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group/stat overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/60 rounded-lg shadow-sm">
                  <Footprints className="w-4 h-4 text-[#F85BB4]" />
                </div>
                <span className="text-xs font-semibold text-[#5A5668] uppercase tracking-wide">Running</span>
              </div>
              <p className="text-3xl font-bold text-[#F85BB4]">{stats.running}</p>
            </div>
          </div>

          {/* Sleeping */}
          <div className="relative p-5 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-xl border border-purple-100/50 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group/stat overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/60 rounded-lg shadow-sm">
                  <Moon className="w-4 h-4 text-[#C5B5D4]" />
                </div>
                <span className="text-xs font-semibold text-[#5A5668] uppercase tracking-wide">Sleeping</span>
              </div>
              <p className="text-3xl font-bold text-[#C5B5D4]">{stats.sleeping}</p>
            </div>
          </div>

          {/* Resting */}
          <div className="relative p-5 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-xl border border-pink-100/50 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group/stat overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/60 rounded-lg shadow-sm">
                  <Heart className="w-4 h-4 text-[#E4B5C5]" />
                </div>
                <span className="text-xs font-semibold text-[#5A5668] uppercase tracking-wide">Resting</span>
              </div>
              <p className="text-3xl font-bold text-[#E4B5C5]">{stats.resting}</p>
            </div>
          </div>

          {/* Distance */}
          <div className="relative p-5 bg-gradient-to-br from-[#FFF5F7] to-[#FFE4E8] rounded-xl border border-pink-100/50 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group/stat overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/60 rounded-lg shadow-sm">
                  <MapPin className="w-4 h-4 text-[#F85BB4]" />
                </div>
                <span className="text-xs font-semibold text-[#5A5668] uppercase tracking-wide">Distance</span>
              </div>
              <p className="text-3xl font-bold text-[#F85BB4]">{stats.distance}</p>
            </div>
          </div>

          {/* Additional Stats - Enhanced secondary cards */}
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#E8E4F0]/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 shadow-sm">
            <p className="text-xs text-[#6B6B6B] font-semibold uppercase tracking-wide mb-2">Pet Interactions</p>
            <p className="text-2xl font-bold text-[#4A4458]">{stats.interactions}</p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#E8E4F0]/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 shadow-sm">
            <p className="text-xs text-[#6B6B6B] font-semibold uppercase tracking-wide mb-2">Meals Consumed</p>
            <p className="text-2xl font-bold text-[#4A4458]">{stats.meals}</p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#E8E4F0]/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 shadow-sm">
            <p className="text-xs text-[#6B6B6B] font-semibold uppercase tracking-wide mb-2">Medication</p>
            <p className="text-2xl font-bold text-[#F85BB4]">
              {stats.medicationCompliance}
            </p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#E8E4F0]/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 shadow-sm">
            <p className="text-xs text-[#6B6B6B] font-semibold uppercase tracking-wide mb-2">Vet Visits</p>
            <p className="text-2xl font-bold text-[#4A4458]">{stats.vetVisits}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

