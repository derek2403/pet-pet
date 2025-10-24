import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Boxes, Home as HomeIcon } from "lucide-react";

/**
 * FeaturedRoomCard Component
 * Displays a promotional card for the 3D room feature
 */
export default function FeaturedRoomCard() {
  return (
    <Card className="relative bg-gradient-to-r from-[#FFF9E6] via-[#FFE4E8] via-[#F5E8FF] to-[#E8F0FF] border-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700 group">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-[#FF2D95]/5 opacity-0 groxup-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
      
      <CardContent className="p-8 relative">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/60 rounded-xl shadow-sm">
                <Boxes className="w-6 h-6 text-[#F85BB4]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] tracking-tight">Explore Your Pet's Room</h3>
            </div>
            <p className="text-[#6B6B6B] mb-6 leading-relaxed max-w-lg">
              View and interact with your pet's cozy space in real-time.
            </p>
            <Link href="/room">
              <Button className="bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl transition-all duration-300 text-white font-medium rounded-full px-6 py-2.5 shadow-lg">
                <Boxes className="w-4 h-4 mr-2" />
                Enter Room
              </Button>
            </Link>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-[#FF2D95]/20 rounded-2xl blur-xl" />
            <div className="relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
              <HomeIcon className="w-24 h-24 text-[#D4A5A5]" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

