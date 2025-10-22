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
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <Box className="w-5 h-5 text-[#D4A5A5]" />
          Room Objects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {roomObjects.map((obj, index) => (
          <div 
            key={index} 
            className="p-4 bg-[#F6F3F9]/50 rounded-xl border border-[#E8E4F0]/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg shadow-sm"
                  style={{
                    background: `linear-gradient(to bottom right, ${obj.gradientFrom}, ${obj.gradientTo})`
                  }}
                >
                  <obj.icon className="w-5 h-5" style={{ color: obj.iconColor }} />
                </div>
                <span className="font-medium text-[#5A5668]">{obj.name}</span>
              </div>
              <Badge 
                variant="outline" 
                className={`${obj.badgeBorder} ${obj.badgeColor} ${obj.badgeBg}`}
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

