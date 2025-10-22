import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Footprints, Moon, Heart, MapPin } from "lucide-react";

/**
 * MonthlySummaryCard Component
 * Displays monthly statistics for the pet's activities
 */
export default function MonthlySummaryCard({ stats }) {
  return (
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <TrendingUp className="w-5 h-5 text-[#D4A5A5]" />
          Monthly Summary
        </CardTitle>
        <p className="text-sm text-[#7C7889] mt-1">Last 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Running */}
          <div className="p-4 bg-gradient-to-br from-[#FFF5F7] to-[#FFE4E8] rounded-xl border border-pink-50 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Footprints className="w-5 h-5 text-[#D4A5A5]" />
              <span className="text-sm font-medium text-[#5A5668]">Running</span>
            </div>
            <p className="text-2xl font-semibold text-[#D4A5A5]">{stats.running}</p>
          </div>

          {/* Sleeping */}
          <div className="p-4 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-xl border border-purple-50 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-5 h-5 text-[#C5B5D4]" />
              <span className="text-sm font-medium text-[#5A5668]">Sleeping</span>
            </div>
            <p className="text-2xl font-semibold text-[#C5B5D4]">{stats.sleeping}</p>
          </div>

          {/* Resting */}
          <div className="p-4 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-xl border border-pink-50 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-[#E4B5C5]" />
              <span className="text-sm font-medium text-[#5A5668]">Resting</span>
            </div>
            <p className="text-2xl font-semibold text-[#E4B5C5]">{stats.resting}</p>
          </div>

          {/* Distance */}
          <div className="p-4 bg-gradient-to-br from-[#FFF5F7] to-[#FFE4E8] rounded-xl border border-pink-50 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#D4A5A5]" />
              <span className="text-sm font-medium text-[#5A5668]">Distance</span>
            </div>
            <p className="text-2xl font-semibold text-[#D4A5A5]">{stats.distance}</p>
          </div>

          {/* Additional Stats */}
          <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
            <p className="text-sm text-[#7C7889]">Pet Interactions</p>
            <p className="text-2xl font-semibold mt-1 text-[#5A5668]">{stats.interactions}</p>
          </div>
          <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
            <p className="text-sm text-[#7C7889]">Meals Consumed</p>
            <p className="text-2xl font-semibold mt-1 text-[#5A5668]">{stats.meals}</p>
          </div>
          <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
            <p className="text-sm text-[#7C7889]">Medication</p>
            <p className="text-2xl font-semibold mt-1 text-[#D4A5A5]">
              {stats.medicationCompliance}
            </p>
          </div>
          <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
            <p className="text-sm text-[#7C7889]">Vet Visits</p>
            <p className="text-2xl font-semibold mt-1 text-[#5A5668]">{stats.vetVisits}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

