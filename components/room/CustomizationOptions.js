import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Palette, Armchair, Image } from "lucide-react";

/**
 * CustomizationOptions Component
 * Displays future customization options (currently disabled)
 */
export default function CustomizationOptions() {
  const options = [
    { icon: Palette, text: "Change Wall Colors" },
    { icon: Armchair, text: "Replace Furniture" },
    { icon: Image, text: "Add Decorations" },
    { icon: Lightbulb, text: "Adjust Lighting" }
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-700 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-semibold">
          <div className="p-1.5 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-lg shadow-sm">
            <Lightbulb className="w-4 h-4 text-[#FF2D95]" />
          </div>
          Customization (Coming Soon)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        {options.map((option, index) => (
          <Button 
            key={index}
            disabled 
            className="w-full justify-start bg-white/60 backdrop-blur-sm text-[#B5B1C0] cursor-not-allowed border border-[#E8E4F0]/50 hover:bg-white/60 shadow-sm font-medium rounded-xl"
          >
            <option.icon className="w-5 h-5 mr-3" />
            {option.text}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

