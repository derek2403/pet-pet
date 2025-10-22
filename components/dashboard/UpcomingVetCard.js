import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope } from "lucide-react";

/**
 * UpcomingVetCard Component
 * Displays the next scheduled veterinary appointment
 */
export default function UpcomingVetCard({ appointment }) {
  return (
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 animate-in fade-in slide-in-from-left-4 duration-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <Calendar className="w-5 h-5 text-[#D4A5A5]" />
          Upcoming Vet Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6 bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF] rounded-2xl border border-pink-50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Stethoscope className="w-8 h-8 text-[#D4A5A5]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#4A4458]">
                {appointment.date} at {appointment.time}
              </h3>
              <p className="text-[#7C7889]">{appointment.clinic}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#7C7889]">Purpose:</span>
              <span className="font-medium text-[#5A5668]">{appointment.purpose}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#7C7889]">Attestation Status:</span>
              <Badge variant="outline" className="border-pink-200 text-[#D4A5A5] bg-pink-50">
                {appointment.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

