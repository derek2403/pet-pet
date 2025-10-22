import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PawPrint, Boxes, ExternalLink } from "lucide-react";

/**
 * DashboardHeader Component
 * Displays the dashboard header with title, wallet info, and navigation buttons
 */
export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      {/* Dashboard Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-sm">
          <PawPrint className="w-8 h-8 text-[#D4A5A5]" />
        </div>
        <h1 className="text-2xl font-medium text-[#4A4458]">Pet Pet Dashboard</h1>
      </div>

      {/* Navigation & Wallet Info */}
      <div className="flex items-center gap-3">
        {/* Visit 3D Room Button */}
        <Link href="/room">
          <Button className="bg-[#FF4081] hover:bg-[#F50057] hover:shadow-lg hover:scale-105 transition-all duration-300 text-white font-medium rounded-full">
            <Boxes className="w-4 h-4 mr-2" />
            Visit 3D Room
          </Button>
        </Link>

        {/* Explorer Button */}
        <Link href="/petpet">
          <Button variant="outline" className="rounded-full bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] text-[#6F6B7D] hover:bg-[#F6F3F9] transition-all">
            <ExternalLink className="w-4 h-4 mr-2" />
            Explorer
          </Button>
        </Link>

        {/* Wallet Address Display */}
        <div className="px-4 py-2 bg-[#FBFAFD] backdrop-blur-sm rounded-full text-sm border border-[#E8E4F0] shadow-sm">
          <span className="text-[#7C7889]">Wallet:</span>{" "}
          <span className="font-medium text-[#5A5668]">0x1234...5678</span>
        </div>
      </div>
    </div>
  );
}

