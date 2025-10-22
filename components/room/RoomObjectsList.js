import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, Monitor, Armchair, Lightbulb, Flower } from "lucide-react";

/**
 * RoomObjectsList Component
 * Displays a list of objects in the room with their interaction status
 */
export default function RoomObjectsList() {
  const roomObjects = [
    {
      name: "Computer Setup",
      icon: Monitor,
      gradientFrom: "#FFE4E8",
      gradientTo: "#FFD4E5",
      iconColor: "#D4A5A5",
      badgeText: "Interactive",
      badgeBorder: "border-pink-200",
      badgeColor: "text-[#D4A5A5]",
      badgeBg: "bg-pink-50"
    },
    {
      name: "Gaming Chair",
      icon: Armchair,
      gradientFrom: "#F8F5FF",
      gradientTo: "#F0E8FF",
      iconColor: "#C5B5D4",
      badgeText: "Static",
      badgeBorder: "border-purple-200",
      badgeColor: "text-[#C5B5D4]",
      badgeBg: "bg-purple-50"
    },
    {
      name: "Desk Lamp",
      icon: Lightbulb,
      gradientFrom: "#FFF5F7",
      gradientTo: "#FFEEF5",
      iconColor: "#E4B5C5",
      badgeText: "Animated",
      badgeBorder: "border-pink-200",
      badgeColor: "text-[#E4B5C5]",
      badgeBg: "bg-pink-50"
    },
    {
      name: "Plant Pot",
      icon: Flower,
      gradientFrom: "#FFE4E8",
      gradientTo: "#FFD4E5",
      iconColor: "#D4A5A5",
      badgeText: "Decoration",
      badgeBorder: "border-pink-200",
      badgeColor: "text-[#D4A5A5]",
      badgeBg: "bg-pink-50"
    }
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-4 duration-700 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
          <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
            <Box className="w-4 h-4 text-[#FF2D95]" />
          </div>
          Room Objects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        {roomObjects.map((obj, index) => (
          <div 
            key={index} 
            className="p-4 bg-gradient-to-r from-white/70 to-[#F6F3F9]/60 backdrop-blur-sm rounded-xl border border-[#E8E4F0]/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group/item relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFE4E8]/10 to-[#F8F5FF]/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-lg shadow-sm border border-[#E8E4F0]/30"
                  style={{
                    background: `linear-gradient(to bottom right, ${obj.gradientFrom}, ${obj.gradientTo})`
                  }}
                >
                  <obj.icon className="w-5 h-5" style={{ color: obj.iconColor }} />
                </div>
                <span className="font-semibold text-[#4A4458]">{obj.name}</span>
              </div>
              <Badge 
                variant="outline" 
                className={`${obj.badgeBorder} ${obj.badgeColor} ${obj.badgeBg} shadow-sm font-semibold`}
              >
                {obj.badgeText}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

