import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Camera, Check, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * PetSelector Component
 * Displays the pet selection dropdown, "Add Pet" button, and camera button
 */
export default function PetSelector({ pets, selectedPetId, onPetChange, onAddPet }) {
  const [cameraSetup, setCameraSetup] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showCameraSetup, setShowCameraSetup] = useState(false);
  const [showCameraPopup, setShowCameraPopup] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const setupRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load camera setup from localStorage
  useEffect(() => {
    const savedCamera = localStorage.getItem('selectedCamera');
    if (savedCamera) {
      setSelectedCamera(savedCamera);
      setCameraSetup(true);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (setupRef.current && !setupRef.current.contains(event.target)) {
        setShowCameraSetup(false);
      }
    };

    if (showCameraSetup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCameraSetup]);

  const handleCameraClick = () => {
    if (!cameraSetup) {
      // First time: show setup dropdown
      setShowCameraSetup(!showCameraSetup);
    } else {
      // Camera is set up: open camera directly
      openCamera();
    }
  };

  const handleCameraSelection = (camera) => {
    setSelectedCamera(camera);
    setCameraSetup(true);
    localStorage.setItem('selectedCamera', camera);
    setShowCameraSetup(false);
  };

  const openCamera = () => {
    setShowCameraPopup(true);
  };

  const startCamera = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      streamRef.current = stream;
      
      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCloseCamera = () => {
    stopCamera();
    setShowCameraPopup(false);
    setIsPlayingVideo(false);
  };

  // Handle V key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.key === 'v' || e.key === 'V') && showCameraPopup) {
        console.log('V pressed, isPlayingVideo:', isPlayingVideo);
        
        if (!isPlayingVideo) {
          // Switch to video playback
          stopCamera();
          setIsPlayingVideo(true);
          
          if (videoRef.current) {
            const videoPath = process.env.NEXT_PUBLIC_WEBCAM_IP_ADDRESS || '/video/video.mov';
            console.log('Loading video from:', videoPath);
            videoRef.current.src = videoPath;
            videoRef.current.load();
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
            });
          }
        } else {
          // Switch back to live camera
          console.log('Switching back to live camera');
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = '';
          }
          setIsPlayingVideo(false);
        }
      }
    };

    if (showCameraPopup) {
      window.addEventListener('keydown', handleKeyPress);
      console.log('V key listener added');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showCameraPopup, isPlayingVideo]);

  // Start camera when popup opens
  useEffect(() => {
    if (showCameraPopup && !isPlayingVideo) {
      console.log('Starting camera...');
      startCamera();
    } else if (!showCameraPopup) {
      stopCamera();
    }
  }, [showCameraPopup, isPlayingVideo]);

  return (
    <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4">
        {/* Pet Dropdown with enhanced styling */}
        <Select 
          value={selectedPetId?.toString()} 
          onValueChange={(value) => onPetChange(parseInt(value))}
        >
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
                {pet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Pet Button with solid pink */}
        <Button 
          onClick={onAddPet}
          className="bg-[#F85BB4] hover:bg-[#E14CA4] hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold rounded-2xl shadow-lg px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pet
        </Button>

        {/* Camera Button with Setup Dropdown */}
        <div className="relative" ref={setupRef}>
          <Button 
            onClick={handleCameraClick}
            variant="outline" 
            className={`rounded-2xl bg-white/80 backdrop-blur-md text-[#6B6B6B] font-semibold hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg px-6 group ${
              cameraSetup 
                ? 'border-2 border-green-500 hover:border-green-600' 
                : 'border-[#E8E4F0]/50 hover:border-[#F85BB4]'
            }`}
          >
            <Camera className={`w-4 h-4 mr-2 transition-colors ${
              cameraSetup 
                ? 'text-green-500' 
                : 'text-[#6B6B6B] group-hover:text-[#F85BB4]'
            }`} />
            Camera
            {cameraSetup && (
              <Check className="w-4 h-4 ml-2 text-green-500" />
            )}
          </Button>

          {/* Camera Setup Dropdown */}
          {showCameraSetup && !cameraSetup && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-[#E8E4F0]/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] border-b border-[#E8E4F0]">
                <p className="text-sm font-semibold text-[#4A4458]">Select Camera</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => handleCameraSelection('Logitech C270')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#F6F3F9] transition-colors text-[#4A4458] font-medium flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 mr-3 text-[#F85BB4]" />
                    <div>
                      <p className="font-semibold">Default Camera</p>
                      <p className="text-xs text-[#6B6B6B]">Logitech C270</p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-transparent group-hover:text-[#F85BB4] transition-colors" />
                </button>
                <button
                  onClick={() => handleCameraSelection('Custom Camera')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#F6F3F9] transition-colors text-[#4A4458] font-medium flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-3 text-[#F85BB4]" />
                    <div>
                      <p className="font-semibold">Set Up New Camera</p>
                      <p className="text-xs text-[#6B6B6B]">Configure custom camera</p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-transparent group-hover:text-[#F85BB4] transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Popup Modal */}
      <Dialog open={showCameraPopup} onOpenChange={handleCloseCamera}>
        <DialogContent className="max-w-4xl w-full bg-white/95 backdrop-blur-md border-2 border-[#E8E4F0] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] border-b border-[#E8E4F0]">
            <DialogTitle className="text-2xl font-bold text-[#4A4458] flex items-center">
              <Camera className="w-6 h-6 mr-3 text-[#F85BB4]" />
              Pet Camera
              {selectedCamera && (
                <span className="ml-3 text-sm font-normal text-[#6B6B6B]">
                  ({selectedCamera})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={!isPlayingVideo}
                loop={isPlayingVideo}
                className="w-full h-full object-cover"
              />
              
              {/* Camera overlay info */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">{isPlayingVideo ? 'LIVE' : 'LIVE'}</span>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

