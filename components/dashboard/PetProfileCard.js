import { useState, useCallback } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Activity, Wifi, WifiOff, Shield, Pencil, Upload, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Helper function to create cropped image
 * Converts the cropped area into a blob URL
 */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 'image/jpeg');
  });
}

/**
 * PetProfileCard Component
 * Displays the selected pet's profile information and device status
 */
export default function PetProfileCard({ pet, onPetNameChange }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(pet.name);
  
  // Image cropping states
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [originalImage, setOriginalImage] = useState(null); // Store the original full image
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(pet.avatar);
  
  // Save the last crop settings so we can restore them when editing
  const [savedCrop, setSavedCrop] = useState({ x: 0, y: 0 });
  const [savedZoom, setSavedZoom] = useState(1);

  // Save the pet name when user presses Enter or clicks outside
  function handleSaveName(e) {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditingName(false);
      if (onPetNameChange) {
        onPetNameChange(localName);
      }
    }
  }

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const imageData = reader.result;
        setOriginalImage(imageData); // Store the original
        setImageSrc(imageData); // Use for cropping
        setCrop({ x: 0, y: 0 }); // Reset crop position for new image
        setZoom(1); // Reset zoom for new image
        setSavedCrop({ x: 0, y: 0 }); // Reset saved crop for new image
        setSavedZoom(1); // Reset saved zoom for new image
        setIsEditingImage(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Callback when crop completes
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Save the cropped image
  const handleSaveCrop = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImageUrl);
      // Save the current crop and zoom settings
      setSavedCrop(crop);
      setSavedZoom(zoom);
      setIsEditingImage(false);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <Card className="bg-white/60 backdrop-blur-md border-[#E8E4F0]/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFE4E8]/10 via-transparent to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start gap-6">
          {/* Pet Avatar with enhanced styling */}
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-[#F85BB4]/20 rounded-full blur-xl" />
            <div 
              className="relative cursor-pointer"
              onClick={() => {
                // If we have the original image, use that for editing
                if (originalImage) {
                  setImageSrc(originalImage);
                  // Restore the last saved crop and zoom settings
                  setCrop(savedCrop);
                  setZoom(savedZoom);
                  setIsEditingImage(true);
                } else {
                  // Otherwise trigger file upload
                  document.getElementById('avatar-upload').click();
                }
              }}
            >
              <Avatar className="w-36 h-36 text-6xl relative ring-4 ring-white/50 shadow-lg transition-all duration-300 group-hover/avatar:ring-[#F85BB4]">
                {/* Render image if avatar is a URL, otherwise render emoji */}
                {croppedImage && (croppedImage.startsWith('/') || croppedImage.startsWith('http') || croppedImage.startsWith('blob:')) ? (
                  <AvatarImage src={croppedImage} alt={pet.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5]">
                  {croppedImage && (croppedImage.startsWith('/') || croppedImage.startsWith('http') || croppedImage.startsWith('blob:')) ? pet.name.charAt(0) : croppedImage}
                </AvatarFallback>
              </Avatar>
              {/* Edit overlay on hover */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* Hidden file input */}
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Pet Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                {isEditingName ? (
                  <Input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onKeyDown={handleSaveName}
                    onBlur={handleSaveName}
                    autoFocus
                    className="text-3xl font-semibold text-[#4A4458] h-12 max-w-xs border-[#E8E4F0] focus:border-[#FF4081] bg-white/80 mb-1"
                  />
                ) : (
                  <div 
                    className="group inline-flex items-center gap-2 cursor-pointer hover:bg-[#F6F3F9] px-2 py-1 rounded-lg transition-colors -ml-2 mb-1"
                    onClick={() => setIsEditingName(true)}
                  >
                    <h2 className="text-3xl font-semibold text-[#4A4458]">{pet.name}</h2>
                    <Pencil className="w-4 h-4 text-[#D4A5A5] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[#D4A5A5] font-medium">{pet.ens}</p>
                  <Shield className="w-4 h-4 text-[#D4A5A5]" />
                </div>
                <p className="text-[#5A5A5A] mt-1">
                  {pet.breed} • {pet.species}
                </p>
              </div>
              <Badge className="bg-[#F85BB4] text-white font-semibold hover:shadow-lg border-none px-4 py-2 shadow-md transition-all duration-200 hover:scale-105">
                <Activity className="w-4 h-4 mr-1.5 animate-pulse" />
                {pet.status}
              </Badge>
            </div>

            {/* Device Status with enhanced visual feedback */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F6F3F9] to-[#FBFAFD] rounded-xl border border-[#E8E4F0]/50 shadow-sm">
              <div className="flex items-center gap-2">
                {pet.deviceStatus === "connected" ? (
                  <div className="relative">
                    <Wifi className="w-4 h-4 text-[#D4A5A5]" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D4A5A5] rounded-full animate-pulse" />
                  </div>
                ) : (
                  <WifiOff className="w-4 h-4 text-[#B5B1C0]" />
                )}
                <span className="text-sm font-medium text-[#5A5668]">{pet.deviceId}</span>
              </div>
              <Badge
                variant="outline"
                className={
                  pet.deviceStatus === "connected"
                    ? "border-pink-200 text-[#D4A5A5] bg-pink-50 shadow-sm"
                    : "border-[#E8E4F0] text-[#5A5A5A]"
                }
              >
                {pet.deviceStatus}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Image Cropping Dialog */}
      <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md border-[#E8E4F0]/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#4A4458]">Crop Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Cropper Container */}
            <div className="relative w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-4">
              <ZoomOut className="w-5 h-5 text-[#6B6B6B]" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-[#E8E4F0] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F85BB4] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#F85BB4] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
              />
              <ZoomIn className="w-5 h-5 text-[#6B6B6B]" />
            </div>

            {/* Upload New Image Button */}
            <Button
              onClick={() => document.getElementById('avatar-upload').click()}
              variant="outline"
              className="w-full border-[#E8E4F0] text-[#4A4458] hover:bg-[#F6F3F9] hover:border-[#F85BB4]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Image
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setIsEditingImage(false)}
              variant="outline"
              className="border-[#E8E4F0] text-[#4A4458] hover:bg-[#F6F3F9]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCrop}
              className="bg-[#F85BB4] text-white hover:bg-[#E74AA3] shadow-lg hover:shadow-xl transition-all"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

