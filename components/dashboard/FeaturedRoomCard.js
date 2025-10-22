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
    <Card className="bg-gradient-to-r from-[#FFF9E6] via-[#FFE4E8] via-[#F5E8FF] to-[#E8F0FF] border-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Boxes className="w-6 h-6 text-[#5A5A5A]" />
              <h3 className="text-2xl font-semibold text-[#2C2C2C]">Explore Your Pet's 3D Room</h3>
            </div>
            <p className="text-[#6B6B6B] mb-4">
              Step into an interactive 3D environment powered by Spline. View and interact with your pet's cozy space in real-time!
            </p>
            <Link href="/room">
              <Button className="bg-[#FF4081] hover:bg-[#F50057] hover:shadow-lg transition-all text-white font-medium rounded-full">
                <Boxes className="w-4 h-4 mr-2" />
                Enter 3D Room
              </Button>
            </Link>
          </div>
          <div className="p-4 bg-white/50 rounded-2xl backdrop-blur-sm shadow-sm hover:rotate-6 transition-transform duration-300">
            <HomeIcon className="w-20 h-20 text-[#D4A5A5]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

