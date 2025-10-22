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
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
          <Lightbulb className="w-5 h-5 text-[#D4A5A5]" />
          Customization (Coming Soon)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option, index) => (
          <Button 
            key={index}
            disabled 
            className="w-full justify-start bg-[#F6F3F9] text-[#B5B1C0] cursor-not-allowed border border-[#E8E4F0]"
          >
            <option.icon className="w-5 h-5 mr-3" />
            {option.text}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

