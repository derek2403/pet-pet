import { Button } from "@/components/ui/button";
import { AuroraText } from "@/components/ui/aurora-text";
import Link from 'next/link';
import { PawPrint, Boxes, ExternalLink } from "lucide-react";

/**
 * DashboardHeader Component
 * Displays the dashboard header with title, wallet info, and navigation buttons
 */
export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Dashboard Title with enhanced styling */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#FF2D95]/20 rounded-2xl blur-lg" />
          <div className="relative p-3 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-2xl shadow-lg">
            <PawPrint className="w-8 h-8 text-[#FF2D95]" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <AuroraText 
              colors={["#FF2D95", "#FF6B9D", "#C084FC", "#60A5FA", "#FF2D95"]}
              speed={1.2}
            >
              PetPet Dashboard
            </AuroraText>
          </h1>
          <p className="text-sm text-[#6B6B6B] font-medium mt-0.5">Your pet's on-chain activity hub</p>
        </div>
      </div>

      {/* Navigation & Wallet Info with enhanced styling */}
      <div className="flex items-center gap-3">
        {/* Visit 3D Room Button with solid pink */}
        <Link href="/room">
          <Button className="bg-[#FF2D95] hover:bg-[#E6298A] hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold rounded-full shadow-lg px-6">
            <Boxes className="w-4 h-4 mr-2" />
            Visit Room
          </Button>
        </Link>

        {/* Explorer Button with better styling */}
        <Link href="/petpet">
          <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-md border-[#E8E4F0]/50 text-[#4A4458] font-semibold hover:bg-white hover:border-[#FF2D95] hover:shadow-lg transition-all duration-200 shadow-md">
            <ExternalLink className="w-4 h-4 mr-2" />
            Explorer
          </Button>
        </Link>

        {/* Wallet Address Display with improved design */}
        <div className="px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full text-sm border border-[#E8E4F0]/50 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <span className="text-[#6B6B6B] font-medium">Wallet:</span>{" "}
          <span className="font-bold text-[#FF2D95]">0x1234...5678</span>
        </div>
      </div>
    </div>
  );
}

