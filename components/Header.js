import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";
import { AuroraText } from "@/components/ui/aurora-text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { PawPrint, ExternalLink, Bell } from "lucide-react";
import { useState } from 'react';

/**
 * Header Component
 * Displays the dashboard header with title, RainbowKit wallet, navigation buttons, and alerts popup
 */
export default function Header({ alerts = [] }) {
  // State to control the alerts dialog
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  
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
          <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-md border-[#E8E4F0]/50 text-[#6B6B6B] font-semibold hover:bg-white hover:border-[#FF2D95] hover:shadow-lg hover:text-[#F85BB4] transition-all duration-200 shadow-md group">
            <ExternalLink className="w-4 h-4 mr-2 text-[#6B6B6B] group-hover:text-[#F85BB4] group-hover:scale-110 transition-all duration-200" />
            Explorer
          </Button>
        </Link>

        {/* Alerts Dialog Trigger - Bell Icon */}
        <Dialog open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative rounded-full bg-white/80 backdrop-blur-md border border-[#E8E4F0]/50 hover:bg-white hover:border-[#FF2D95] hover:shadow-lg transition-all duration-200 shadow-md w-11 h-11 p-0 group"
            >
              <div className="relative">
                <Bell className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#F85BB4] group-hover:scale-110 transition-all duration-200" />
                {/* Notification badge - show if there are alerts */}
                {alerts.length > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[12px] h-3 px-1 bg-[#F85BB4] rounded-full flex items-center justify-center text-white text-[7px] font-bold shadow-sm">
                    {alerts.length}
                  </div>
                )}
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="bg-white/95 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-xl max-w-md"
            style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
          >
            <DialogHeader>
              <DialogTitle className="text-[#4A4458] font-semibold text-xl">
                Alerts & Notifications
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {alerts.length > 0 ? (
                alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl flex items-start gap-3 hover:scale-[1.02] hover:shadow-md transition-all duration-200 border backdrop-blur-sm relative overflow-hidden group ${
                      alert.type === "warning"
                        ? "bg-gradient-to-r from-[#FFF5F7] to-[#FFE4E8] border-pink-200/50 shadow-sm"
                        : alert.type === "info"
                        ? "bg-gradient-to-r from-[#F8F5FF] to-[#F0E8FF] border-purple-200/50 shadow-sm"
                        : "bg-gradient-to-r from-[#FFF5F7] to-[#FFE4E8] border-pink-200/50 shadow-sm"
                    }`}
                  >
                    {/* Icon container with enhanced styling */}
                    <div className={`p-2 rounded-lg shrink-0 ${
                      alert.type === "warning"
                        ? "bg-white/60 shadow-sm"
                        : alert.type === "info"
                        ? "bg-white/60 shadow-sm"
                        : "bg-white/60 shadow-sm"
                    }`}>
                      <alert.icon
                        className={`w-4 h-4 ${
                          alert.type === "warning"
                            ? "text-[#FF2D95]"
                            : alert.type === "info"
                            ? "text-[#9B7BB7]"
                            : "text-[#FF2D95]"
                        }`}
                      />
                    </div>
                    <p className="text-sm font-medium text-[#4A4458] leading-relaxed">{alert.message}</p>
                    
                    {/* Subtle hover effect */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#6B6B6B]">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-[#E8E4F0]" />
                  <p className="font-medium">No alerts at the moment</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* RainbowKit Connect Button */}
        <ConnectButton />
      </div>
    </div>
  );
}

