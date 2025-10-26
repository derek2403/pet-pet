import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

/**
 * AlertsCard Component
 * Displays alerts and notifications for the pet
 */
export default function AlertsCard({ alerts }) {
  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden group">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
          <div className="relative">
            <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
              <Bell className="w-4 h-4 text-[#F85BB4]" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F85BB4] rounded-full animate-pulse" />
          </div>
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl flex items-start gap-3 hover:scale-[1.02] hover:shadow-md transition-all duration-200 border backdrop-blur-sm relative overflow-hidden group/alert ${
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
                    ? "text-[#C5B5D4]"
                    : "text-[#FF2D95]"
                }`}
              />
            </div>
            <p className="text-sm font-medium text-[#4A4458] leading-relaxed">{alert.message}</p>
            
            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/alert:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

