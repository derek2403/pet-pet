import { Card, CardContent } from "@/components/ui/card";

/**
 * TabPlaceholder Component
 * Reusable placeholder for empty tab content
 */
export default function TabPlaceholder({ icon: Icon, title, description }) {
  return (
    <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="text-center py-12">
          <Icon className="w-12 h-12 text-[#D4A5A5] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#4A4458]">{title}</h3>
          <p className="text-[#7C7889] mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

