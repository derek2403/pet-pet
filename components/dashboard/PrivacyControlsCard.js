import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Eye, EyeOff, Users } from "lucide-react";

/**
 * PrivacyControlsCard Component
 * Displays privacy and sharing control settings
 */
export default function PrivacyControlsCard() {
  return (
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <Shield className="w-5 h-5 text-[#D4A5A5]" />
          Privacy & Sharing Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Visibility */}
          <div className="p-6 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-[#5A5668]">Profile Visibility</span>
              <Eye className="w-5 h-5 text-[#7C7889]" />
            </div>
            <Select defaultValue="private">
              <SelectTrigger className="bg-white border-[#E8E4F0] text-[#6F6B7D]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="vet">Share with Vet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proof Visibility */}
          <div className="p-6 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-[#5A5668]">Proof Visibility</span>
              <EyeOff className="w-5 h-5 text-[#7C7889]" />
            </div>
            <Select defaultValue="hide">
              <SelectTrigger className="bg-white border-[#E8E4F0] text-[#6F6B7D]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Show ZK Proofs</SelectItem>
                <SelectItem value="hide">Hide Details</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Share Dashboard */}
          <div className="p-6 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-[#5A5668]">Share Dashboard</span>
              <Users className="w-5 h-5 text-[#7C7889]" />
            </div>
            <Button disabled className="w-full bg-[#E8E4F0] text-[#B5B1C0] cursor-not-allowed">
              Disabled (Demo)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

