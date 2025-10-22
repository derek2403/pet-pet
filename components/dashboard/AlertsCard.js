import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

/**
 * AlertsCard Component
 * Displays alerts and notifications for the pet
 */
export default function AlertsCard({ alerts }) {
  return (
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <Bell className="w-5 h-5 text-[#D4A5A5]" />
          Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl flex items-start gap-3 hover:scale-[1.02] transition-transform duration-200 ${
              alert.type === "warning"
                ? "bg-[#FFF5F7] border border-pink-100"
                : alert.type === "info"
                ? "bg-[#F8F5FF] border border-purple-100"
                : "bg-[#FFF5F7] border border-pink-100"
            }`}
          >
            <alert.icon
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                alert.type === "warning"
                  ? "text-[#D4A5A5]"
                  : alert.type === "info"
                  ? "text-[#C5B5D4]"
                  : "text-[#D4A5A5]"
              }`}
            />
            <p className="text-sm font-medium text-[#6B6B6B]">{alert.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

