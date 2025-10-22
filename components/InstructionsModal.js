import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function InstructionsModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-[#E8E4F0] text-[#8B7B8B] hover:bg-[#F6F3F9]"
        >
          <Info className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#FBFAFD] border-[#E8E4F0]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#4A4458]">
            <Info className="w-5 h-5 text-[#D4A5A5]" />
            How to interact with the 3D Room
          </DialogTitle>
          <DialogDescription className="text-[#7C7889]">
            Learn how to navigate and interact with the 3D environment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <InstructionItem
            title="Left Click + Drag"
            description="Rotate the camera"
          />
          <InstructionItem
            title="Two‑finger Scroll / Mouse Wheel"
            description="Zoom in and out"
          />
          <InstructionItem
            title="Click Objects"
            description="Select interactive elements"
          />
          <InstructionItem
            title="Panning"
            description="Disabled for smoother navigation"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for each instruction item
function InstructionItem({ title, description }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-[#FFF5F7] to-[#F8F5FF] border border-pink-100">
      <span className="w-2 h-2 bg-[#D4A5A5] rounded-full mt-1.5 flex-shrink-0"></span>
      <div>
        <p className="font-semibold text-[#4A4458] text-sm">{title}</p>
        <p className="text-sm text-[#7C7889]">{description}</p>
      </div>
    </div>
  );
}

