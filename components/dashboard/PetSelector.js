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
          <SelectTrigger className="w-[280px] bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm text-[#6B6B6B]">
            <SelectValue placeholder="Select a pet" />
          </SelectTrigger>
          <SelectContent>
            {pets.map((pet) => (
              <SelectItem key={pet.id} value={pet.id.toString()}>
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

