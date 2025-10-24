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
          <div className="absolute inset-0 bg-[#FF2D95]/12 rounded-2xl blur-md" />
          <div className="relative p-3 bg-gradient-to-br from-[#FFE4E8]/70 to-[#FFD4E5]/70 rounded-2xl shadow-md">
            <PawPrint className="w-8 h-8 text-[#F85BB4]" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <AuroraText 
              colors={["#F85BB4", "#E14CA4", "#FF7CC7", "#FF9AD9", "#FFBDE7", "#F85BB4"]}
              speed={7}
            >
              PetPet
            </AuroraText>
          </h1>
        </div>
      </div>

      {/* Navigation & Wallet Info with enhanced styling */}
      <div className="flex items-center gap-3">
        {/* Visit 3D Room Button with solid pink */}
        <Link href="/room">
          <Button className="bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold rounded-full shadow-lg px-6">
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

