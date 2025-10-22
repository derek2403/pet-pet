import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, CheckCircle2, Clock } from "lucide-react";

/**
 * ActivityTimelineCard Component
 * Displays recent activity events for the pet
 */
export default function ActivityTimelineCard({ events }) {
  return (
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 animate-in fade-in slide-in-from-right-4 duration-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <ScrollText className="w-5 h-5 text-[#D4A5A5]" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event, i) => (
          <div
            key={i}
            className="p-4 bg-[#F6F3F9]/50 rounded-xl hover:bg-[#F6F3F9] hover:scale-[1.02] transition-all duration-200 border border-[#E8E4F0]/50 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <event.icon className="w-5 h-5 text-[#D4A5A5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#5A5A5A]">{event.date}</span>
                  {event.status === "verified" ? (
                    <Badge className="bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] text-[#8B7B8B] hover:bg-gradient-to-r border border-pink-100 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-[#F8F5FF] text-[#C5B5D4] hover:bg-[#F8F5FF] border border-purple-100 shadow-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-[#4A4458]">
                  {event.type}{" "}
                  <span className="font-normal text-[#5A5A5A]">({event.details})</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

