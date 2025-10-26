import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope } from "lucide-react";

/**
 * UpcomingVetCard Component
 * Displays the next scheduled veterinary appointment
 */
export default function UpcomingVetCard({ appointment }) {
  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-4 duration-700 overflow-hidden group">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
          <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-[#F85BB4]" />
          </div>
          Upcoming Vet Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="p-6 bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF] rounded-2xl border border-pink-100/50 space-y-5 shadow-sm relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F85BB4]/12 rounded-2xl blur-md" />
              <div className="relative p-3 bg-white rounded-xl shadow-sm">
                <Stethoscope className="w-7 h-7 text-[#F85BB4]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#4A4458] tracking-tight">
                {appointment.date} at {appointment.time}
              </h3>
              <p className="text-sm text-[#6B6B6B] font-medium mt-0.5">{appointment.clinic}</p>
            </div>
          </div>
          
          <div className="space-y-3 relative">
            <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <span className="text-sm font-semibold text-[#5A5A5A]">Purpose:</span>
              <span className="font-semibold text-[#4A4458]">{appointment.purpose}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <span className="text-sm font-semibold text-[#5A5A5A]">Attestation Status:</span>
              <Badge variant="outline" className="border-pink-200 text-[#FF2D95] bg-pink-50 shadow-sm">
                {appointment.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

