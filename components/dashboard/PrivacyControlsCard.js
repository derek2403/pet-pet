import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Users } from "lucide-react";

/**
 * PrivacyControlsCard Component
 * Displays privacy and sharing control settings
 */
export default function PrivacyControlsCard() {
  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-hidden group">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
          Privacy & Sharing Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Visibility */}
          <div className="relative p-6 bg-gradient-to-br from-[#FFF5F7] to-[#FFE4E8] rounded-xl border border-pink-100/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group/control">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-[#4A4458]">Profile Visibility</span>
                <div className="p-2 bg-white/60 rounded-lg shadow-sm">
                  <Eye className="w-4 h-4 text-[#F85BB4]" />
                </div>
              </div>
              <Select defaultValue="private">
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-[#E8E4F0]/50 text-[#4A4458] font-medium shadow-sm hover:shadow-md transition-shadow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="vet">Share with Vet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Proof Visibility - Emphasize ZKP theme */}
          <div className="relative p-6 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-xl border border-purple-100/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group/control">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-[#4A4458]">ZK Proof Visibility</span>
                <div className="p-2 bg-white/60 rounded-lg shadow-sm">
                  <EyeOff className="w-4 h-4 text-[#C5B5D4]" />
                </div>
              </div>
              <Select defaultValue="hide">
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-[#E8E4F0]/50 text-[#4A4458] font-medium shadow-sm hover:shadow-md transition-shadow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="show">Show ZK Proofs</SelectItem>
                  <SelectItem value="hide">Hide Details</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Share Dashboard */}
          <div className="relative p-6 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-xl border border-pink-100/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group/control">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-[#4A4458]">Share Dashboard</span>
                <div className="p-2 bg-white/60 rounded-lg shadow-sm">
                  <Users className="w-4 h-4 text-[#E4B5C5]" />
                </div>
              </div>
              <Button disabled className="w-full bg-[#E8E4F0] text-[#B5B1C0] cursor-not-allowed font-medium rounded-lg shadow-sm">
                Disabled (Demo)
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

