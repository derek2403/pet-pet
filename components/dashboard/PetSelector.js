import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

/**
 * PetSelector Component
 * Displays the pet selection dropdown and "Add Pet" button
 */
export default function PetSelector({ pets }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Pet Dropdown */}
        <Select defaultValue="1">
          <SelectTrigger className="w-[280px] bg-[#FBFAFD]/80 backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm text-[#4A4458] font-medium hover:bg-[#F6F3F9] hover:border-[#D4A5A5] transition-all">
            <SelectValue placeholder="Select a pet" />
          </SelectTrigger>
          <SelectContent className="bg-[#FBFAFD] border-[#E8E4F0] rounded-xl shadow-lg">
            {pets.map((pet) => (
              <SelectItem 
                key={pet.id} 
                value={pet.id.toString()}
                className="text-[#9E9AA7] focus:bg-[#F6F3F9] focus:text-[#4A4458] data-[state=checked]:bg-[#FFE4E8] data-[state=checked]:text-[#4A4458] data-[state=checked]:font-medium cursor-pointer"
              >
                {pet.name} ({pet.ens})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Pet Button */}
        <Button className="bg-[#FF4081] hover:bg-[#F50057] hover:shadow-lg hover:scale-105 transition-all duration-300 text-white font-medium rounded-2xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Pet
        </Button>
      </div>
    </div>
  );
}

