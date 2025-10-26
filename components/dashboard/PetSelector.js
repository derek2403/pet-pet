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
    <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4">
        {/* Pet Dropdown with enhanced styling */}
        <Select defaultValue="1">
          <SelectTrigger className="w-[280px] bg-white/80 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg text-[#4A4458] font-semibold hover:bg-white hover:border-[#FF2D95] hover:shadow-xl transition-all duration-200">
            <SelectValue placeholder="Select a pet" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-[#E8E4F0]/50 rounded-xl shadow-xl">
            {pets.map((pet) => (
              <SelectItem 
                key={pet.id} 
                value={pet.id.toString()}
                className="text-[#6B6B6B] focus:bg-[#F6F3F9] focus:text-[#4A4458] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFE4E8] data-[state=checked]:to-[#FFD4E5] data-[state=checked]:text-[#FF2D95] data-[state=checked]:font-bold cursor-pointer"
              >
                {pet.name} ({pet.ens})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Pet Button with solid pink */}
        <Button className="bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold rounded-2xl shadow-lg px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add Pet
        </Button>
      </div>
    </div>
  );
}

