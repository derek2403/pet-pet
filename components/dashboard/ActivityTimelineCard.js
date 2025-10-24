import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, CheckCircle2, Clock } from "lucide-react";

/**
 * ActivityTimelineCard Component
 * Displays recent activity events for the pet
 */
export default function ActivityTimelineCard({ events }) {
  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-700 overflow-hidden group">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
          <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
            <ScrollText className="w-4 h-4 text-[#F85BB4]" />
          </div>
          Recent Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        {events.map((event, i) => (
          <div
            key={i}
            className="p-4 bg-gradient-to-r from-white/70 to-[#F6F3F9]/60 backdrop-blur-sm rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-200 border border-[#E8E4F0]/50 cursor-pointer group/event relative overflow-hidden"
          >
            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFE4E8]/10 to-[#F8F5FF]/10 opacity-0 group-hover/event:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-start gap-3 relative">
              <div className="relative">
                <div className="p-2.5 bg-white rounded-lg shadow-sm border border-[#E8E4F0]/30">
                  <event.icon className="w-4 h-4 text-[#F85BB4]" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide">{event.date}</span>
                  {event.status === "verified" ? (
                  <Badge className="bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] text-[#F85BB4] hover:shadow-md border border-pink-100 shadow-sm font-semibold">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-[#F8F5FF] to-[#F0E8FF] text-[#C5B5D4] hover:shadow-md border border-purple-100 shadow-sm font-semibold">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <p className="font-bold text-[#4A4458] text-sm">
                  {event.type}{" "}
                  <span className="font-medium text-[#6B6B6B]">({event.details})</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

