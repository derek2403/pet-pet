import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import PetSelector from '@/components/dashboard/PetSelector';
import PetProfileCard from '@/components/dashboard/PetProfileCard';
import FeaturedRoomCard from '@/components/dashboard/FeaturedRoomCard';
import RealTimePetStatus from '@/components/dashboard/RealTimePetStatus';
import MonthlySummaryCard from '@/components/dashboard/MonthlySummaryCard';
import UpcomingVetCard from '@/components/dashboard/UpcomingVetCard';
import ActivityTimelineCard from '@/components/dashboard/ActivityTimelineCard';
import PrivacyControlsCard from '@/components/dashboard/PrivacyControlsCard';
import SplineViewer from '@/components/room/SplineViewer';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { REGISTRY_ADDRESS, PET_ABI } from '@/config/contracts';
import {
  Footprints,
  Heart,
  Users,
  Settings,
  BarChart3,
  ScrollText,
  Home as HomeIcon,
  Upload,
  Plus,
  Wallet,
  X,
} from "lucide-react";

const REGISTRY_ABI = REGISTRY_ADDRESS.abi;

/**
 * Dashboard Page
 * Main dashboard component that orchestrates all pet-related information
 */
export default function Dashboard() {
  // Wagmi hooks for wallet connection (RainbowKit)
  const { address: account, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  // Pet contract state
  const [petContractAddress, setPetContractAddress] = useState(null);
  
  // State for current session pet (not persisted - requires upload each time)
  const [hasPet, setHasPet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // State for add pet form
  const [newPetName, setNewPetName] = useState("");
  const [petImagePath, setPetImagePath] = useState(null); // Path to image in public folder
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // State for pet name editing
  const [petName, setPetName] = useState("");
  
  // Track active tab for animations
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});
  const tabsListRef = useRef(null);
  
  // State for room viewer
  const [showRoomViewer, setShowRoomViewer] = useState(false);
  
  // Cache-busting parameter forces browser to fetch updated scene with dog
  const sceneUrl = "https://prod.spline.design/E0hO4wxfp4CCDNLm/scene.splinecode?v=33";
  const [activityHistory, setActivityHistory] = useState([
    { petName: "NuNa", activity: "Eat", timestamp: 1730006400000 },  // Oct 26, 2024 8:00 PM
    { petName: "NuNa", activity: "Walk", timestamp: 1730005500000 },   // Oct 26, 2024 7:45 PM
    { petName: "NuNa", activity: "Run", timestamp: 1730004600000 },    // Oct 26, 2024 7:30 PM
    { petName: "NuNa", activity: "Walk", timestamp: 1730004000000 }, // Oct 26, 2024 7:20 PM    // Oct 26, 2024 7:18 PM - will show as hardcoded
  ]);
  const [currentPets, setCurrentPets] = useState([]);
  
  // Selected pet state for switching between pets
  const [selectedPetId, setSelectedPetId] = useState(1);
  
  // Tab order for direction-based animations
  const tabOrder = ["dashboard", "timeline", "insights", "settings"];
  const getTabDirection = (newTab) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    return newIndex > currentIndex ? 1 : -1;
  };

  // Always start fresh - no localStorage persistence
  // Each page load shows the "Create Pet" card
  useEffect(() => {
    // Clear any old persisted data on mount
    if (typeof window !== 'undefined') {
      localStorage.removeItem('petName');
      localStorage.removeItem('petContractAddress');
      localStorage.removeItem('petImagePath');
    }
  }, []);

  // Set up socket connection for location tracking and activity monitoring
  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      // Request current pet activities
      socketRef.current.emit('request-pet-activities');
    });

    socketRef.current.on('location-update', (locationData) => {
      setDevices(prevDevices => {
        const existingIndex = prevDevices.findIndex(d => d.id === locationData.name || d.name === locationData.name);
        const deviceData = {
          id: locationData.name,
          name: locationData.name,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp,
          speed: locationData.speed || 0,
        };

        if (existingIndex >= 0) {
          const updated = [...prevDevices];
          updated[existingIndex] = deviceData;
          return updated;
        } else {
          return [...prevDevices, deviceData];
        }
      });
    });

    socketRef.current.on('pet-activities-update', (data) => {
      console.log('Pet activities update:', data);
      setCurrentPets(data.current || []);
      
      // Filter activity history to only include activities when there's a change
      const history = data.history || [];
      const filteredHistory = [];
      
      for (let i = 0; i < history.length; i++) {
        const currentActivity = history[i];
        const lastFiltered = filteredHistory[filteredHistory.length - 1];
        
        // Add activity if it's the first one or if activity type or pet name changed
        if (!lastFiltered || 
            currentActivity.activity !== lastFiltered.activity ||
            currentActivity.petName !== lastFiltered.petName) {
          filteredHistory.push(currentActivity);
        }
      }
      
      // Merge socket data with existing activities (preserve NuNa's mock data)
      setActivityHistory(prevHistory => {
        // Combine socket activities with existing NuNa activities
        const nunaActivities = prevHistory.filter(activity => activity.petName === "NuNa");
        const socketActivities = filteredHistory.filter(activity => activity.petName !== "NuNa");
        return [...nunaActivities, ...socketActivities];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  // No persistence - fresh upload required each session

  // Handle image file selection and upload to server
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload-pet-image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPetImagePath(data.path);
        } else {
          alert('Error uploading image: ' + (data.error || 'Unknown error'));
          setImagePreview(null);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
        setImagePreview(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Verify pet contract on Blockscout
  const verifyPetContract = async (petAddress, petName, ownerAddress) => {
    try {
      console.log('🔍 Verifying contract on Blockscout...');
      
      const response = await fetch('/api/verify-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petAddress, petName, ownerAddress }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Contract verified! ${result.explorerUrl}`);
      } else {
        console.log(`⚠️ ${result.error || 'Verification failed. Contract may already be verified.'}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  // Create a new pet on the blockchain
  const handleAddPet = async () => {
    if (!newPetName.trim()) {
      alert('Please enter a pet name');
      return;
    }
    if (!petImagePath) {
      alert('Please upload a pet image');
      return;
    }

    // Set pet data for current session
    setPetName(newPetName.trim());
    setHasPet(true);
    
    // Clear form
    setNewPetName("");
  };

  // Handle entering the room
  const handleEnterRoom = () => {
    setShowRoomViewer(true);
  };

  // Handle exiting the room
  const handleExitRoom = () => {
    setShowRoomViewer(false);
  };

  // Move pill immediately on pointer down to reduce perceived white flash
  const movePillToTab = (tabKey) => {
    const target = tabRefs.current[tabKey];
    const tabsList = tabsListRef.current;
    if (!target || !tabsList) return;
    const tabsListRect = tabsList.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setPillStyle({
      left: targetRect.left - tabsListRect.left,
      width: targetRect.width,
    });
  };

  // Update pill position synchronously after layout (runs before paint)
  useLayoutEffect(() => {
    const updatePillPosition = () => {
      const activeTabElement = tabRefs.current[activeTab];
      const tabsList = tabsListRef.current;
      
      if (activeTabElement && tabsList) {
        const tabsListRect = tabsList.getBoundingClientRect();
        const activeTabRect = activeTabElement.getBoundingClientRect();
        
        setPillStyle({
          left: activeTabRect.left - tabsListRect.left,
          width: activeTabRect.width,
        });
      }
    };

    // Immediate update - useLayoutEffect runs synchronously after DOM mutations
    updatePillPosition();
  }, [activeTab, hasPet]);

  // Update pill position on window resize
  useEffect(() => {
    const updatePillPosition = () => {
      const activeTabElement = tabRefs.current[activeTab];
      const tabsList = tabsListRef.current;
      
      if (activeTabElement && tabsList) {
        const tabsListRect = tabsList.getBoundingClientRect();
        const activeTabRect = activeTabElement.getBoundingClientRect();
        
        setPillStyle({
          left: activeTabRect.left - tabsListRect.left,
          width: activeTabRect.width,
        });
      }
    };
    
    window.addEventListener('resize', updatePillPosition);
    return () => {
      window.removeEventListener('resize', updatePillPosition);
    };
  }, [activeTab]);

  // Multiple pets data (including created pet and NuNa)
  const allPetsData = hasPet ? [
    {
      id: 1,
      name: petName,
      species: "Cat",
      status: "Active",
      deviceId: "Device #7892",
      deviceStatus: "connected",
      avatar: petImagePath || "/shiba2.jpeg",
      contractAddress: petContractAddress,
    },
    {
      id: 2,
      name: "NuNa",
      species: "Cat",
      status: "Active",
      deviceId: "Device #5431",
      deviceStatus: "connected",
      avatar: "/shiba.jpg",
      contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    }
  ] : [];

  // Get currently selected pet
  const selectedPet = allPetsData.find(pet => pet.id === selectedPetId) || allPetsData[0];

  // Pets array for PetSelector component
  const pets = allPetsData.map(pet => ({ id: pet.id, name: pet.name }));

  const currentActivity = {
    type: "Running",
    duration: "12 mins",
    location: "Proof verified",
  };

  const monthlyStats = {
    running: "8 hours",
    sleeping: "120 hours",
    resting: "35 hours",
    distance: "15 km",
    interactions: 6,
    meals: 56,
    medicationCompliance: "90%",
    vetVisits: 1,
  };

  const nextVetVisit = {
    date: "25 Oct 2025",
    time: "2:30 PM",
    clinic: "Happy Paws Veterinary Center",
    purpose: "Annual vaccination",
    status: "Pending verification",
  };

  const recentEvents = [
    {
      date: "Oct 21",
      type: "Running",
      details: "5 mins",
      status: "verified",
      icon: Footprints,
    },
    {
      date: "Oct 20",
      type: "Feeding",
      details: "80 g",
      status: "verified",
      icon: Heart,
    },
    {
      date: "Oct 18",
      type: "Played",
      details: "with luna.petpet.eth",
      status: "verified",
      icon: Users,
    },
    {
      date: "Oct 15",
      type: "Vet Visit",
      details: "Annual checkup",
      status: "pending",
      icon: Stethoscope,
    },
  ];

  const alerts = [
    {
      type: "warning",
      message: "Shibaba missed his last meal window.",
      icon: AlertCircle,
    },
    {
      type: "info",
      message: "Medication due in 3 hours.",
      icon: Pill,
    },
    {
      type: "reminder",
      message: "Vet visit coming up in 4 days.",
      icon: Calendar,
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <>
        <BackgroundGradientAnimation
          gradientBackgroundStart="#FFE3EA"
          gradientBackgroundEnd="#C9D4FF"
          firstColor="rgb(221, 214, 254)"
          secondColor="254, 215, 170"
          thirdColor="190, 242, 234"
          fourthColor="199, 210, 254"
          fifthColor="255, 183, 197"
          pointerColor="255, 236, 244"
          size="120%"
          blendingValue="normal"
          interactive={true}
          containerClassName="fixed inset-0 z-0 pointer-events-none"
        />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-2xl text-gray-600">Registering your pet...</div>
        </div>
      </>
    );
  }

  // Show "Add Pet" screen if no pet added for this session
  if (!hasPet) {
    return (
      <>
        <BackgroundGradientAnimation
          gradientBackgroundStart="#FFE3EA"
          gradientBackgroundEnd="#C9D4FF"
          firstColor="rgb(221, 214, 254)"
          secondColor="254, 215, 170"
          thirdColor="190, 242, 234"
          fourthColor="199, 210, 254"
          fifthColor="255, 183, 197"
          pointerColor="255, 236, 244"
          size="120%"
          blendingValue="normal"
          interactive={true}
          containerClassName="fixed inset-0 z-0 pointer-events-none"
        />
        <div className="relative z-10">
          <div className="container mx-auto px-6 py-6" style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}>
            <Header />
            
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl px-4"
              >
                <Card className="w-full bg-white/90 backdrop-blur-md border border-[#E8E4F0]/50 shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-[#F85BB4]">Welcome to PetPet! 🐾</CardTitle>
                    <CardDescription className="text-lg">
                      Add your pet to get started - this will create a blockchain contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wallet Connection Status */}
                    {(!isConnected || !account) && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Wallet className="w-5 h-5" />
                          <span className="text-sm font-medium">Wallet connection required</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Please connect your wallet using the "Connect Wallet" button in the header
                        </p>
                      </div>
                    )}

                    {/* Status Message */}
                    {statusMessage && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{statusMessage}</p>
                      </div>
                    )}

                    {/* Pet Name Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Pet Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your pet's name (e.g., Buddy, Max, Luna)"
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Pet names are case-insensitive and must be unique on the blockchain
                      </p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Pet Photo
                        {isUploading && <span className="text-xs text-blue-600 ml-2">(Uploading...)</span>}
                        {petImagePath && !isUploading && <span className="text-xs text-green-600 ml-2">(Uploaded)</span>}
                      </label>
                      <div className="flex flex-col items-center space-y-4">
                        {imagePreview ? (
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#F85BB4]/30">
                            <img
                              src={imagePreview}
                              alt="Pet preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                            <Upload className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? 'Uploading...' : imagePreview ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleAddPet}
                      disabled={isUploading || !petImagePath || isLoading}
                      className="w-full bg-[#F85BB4] hover:bg-[#F85BB4]/90 text-white"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Creating Pet Contract...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Pet on Blockchain
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundGradientAnimation
        gradientBackgroundStart="#FFE3EA" /* soft pink like screenshot left */
        gradientBackgroundEnd="#C9D4FF" /* pastel lavender/blue like screenshot right */
        firstColor="rgb(221, 214, 254)" /* soft purple */
        secondColor="254, 215, 170" /* peach */
        thirdColor="190, 242, 234" /* mint/teal */
        fourthColor="199, 210, 254" /* periwinkle */
        fifthColor="255, 183, 197" /* soft rose blob */
        pointerColor="255, 236, 244" /* very light pink pointer */
        size="120%"
        blendingValue="normal"
        interactive={true}
        containerClassName="fixed inset-0 z-0 pointer-events-none"
      />
      {/* Content wrapper above background */}
      <div className="relative z-10">
        {/* Header with navigation and wallet */}
        <div className="container mx-auto px-6 py-6" style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}>
        <Header />

        {/* Main Content with Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <TabsList ref={tabsListRef} className="relative bg-white/80 backdrop-blur-md border border-[#E8E4F0]/50 p-1.5 rounded-2xl shadow-lg overflow-hidden">
            {/* Sliding Pill Background with solid pink */}
            <div
              className="absolute rounded-xl bg-[#F85BB4] shadow-md transition-all duration-300 ease-out"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                height: 'calc(100% - 8px)',
                top: '4px',
                zIndex: 0,
                opacity: pillStyle.width > 0 ? 1 : 0,
              }}
            />
            
            <TabsTrigger
              ref={(el) => (tabRefs.current.dashboard = el)}
              value="dashboard"
              onMouseDown={(e) => { e.preventDefault(); movePillToTab('dashboard'); setActiveTab('dashboard'); }}
              onTouchStart={() => { movePillToTab('dashboard'); setActiveTab('dashboard'); }}
              className="relative z-10 rounded-xl shadow-none active:shadow-none focus:shadow-none data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:bg-transparent hover:bg-transparent active:bg-transparent text-[#6B6B6B] transition-colors duration-200 outline-none focus:outline-none focus:ring-0 ring-0 ring-offset-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              ref={(el) => (tabRefs.current.timeline = el)}
              value="timeline"
              onMouseDown={(e) => { e.preventDefault(); movePillToTab('timeline'); setActiveTab('timeline'); }}
              onTouchStart={() => { movePillToTab('timeline'); setActiveTab('timeline'); }}
              className="relative z-10 rounded-xl shadow-none active:shadow-none focus:shadow-none data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:bg-transparent hover:bg-transparent active:bg-transparent text-[#6B6B6B] transition-colors duration-200 outline-none focus:outline-none focus:ring-0 ring-0 ring-offset-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <ScrollText className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              ref={(el) => (tabRefs.current.insights = el)}
              value="insights"
              onMouseDown={(e) => { e.preventDefault(); movePillToTab('insights'); setActiveTab('insights'); }}
              onTouchStart={() => { movePillToTab('insights'); setActiveTab('insights'); }}
              className="relative z-10 rounded-xl shadow-none active:shadow-none focus:shadow-none data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:bg-transparent hover:bg-transparent active:bg-transparent text-[#6B6B6B] transition-colors duration-200 outline-none focus:outline-none focus:ring-0 ring-0 ring-offset-0 focus:ring-offset-0"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              ref={(el) => (tabRefs.current.settings = el)}
              value="settings"
              onMouseDown={(e) => { e.preventDefault(); movePillToTab('settings'); setActiveTab('settings'); }}
              onTouchStart={() => { movePillToTab('settings'); setActiveTab('settings'); }}
              className="relative z-10 rounded-xl shadow-none active:shadow-none focus:shadow-none data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:bg-transparent hover:bg-transparent active:bg-transparent text-[#6B6B6B] transition-colors duration-200 outline-none focus:outline-none focus:ring-0 ring-0 ring-offset-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <TabsContent value="dashboard" className="space-y-6" forceMount>
                <motion.div
                  key="dashboard"
                  initial={{ x: getTabDirection("dashboard") * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6"
                >
            {/* Pet Selector */}
            <PetSelector pets={pets} selectedPetId={selectedPetId} onPetChange={setSelectedPetId} />

            {/* Pet Profile Card */}
            <PetProfileCard pet={selectedPet} onPetNameChange={setPetName} />

            {/* Featured 3D Room Card or Spline Viewer */}
            {!showRoomViewer ? (
              <FeaturedRoomCard onEnterRoom={handleEnterRoom} />
            ) : (
              <div className="space-y-6">
                {/* Exit Room Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#4A4458]">{petName}'s Room</h2>
                  <Button
                    onClick={handleExitRoom}
                    variant="outline"
                    className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#F85BB4] hover:shadow-md transition-all shadow-sm font-semibold"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Exit Room
                  </Button>
                </div>

                {/* 3D Spline Viewer */}
                <SplineViewer 
                  sceneUrl={sceneUrl} 
                  maxStepDistance={36}
                />

                {/* Real-Time Pet Status & Upcoming Vet Appointment Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RealTimePetStatus currentActivity={currentActivity} />
                  <UpcomingVetCard appointment={nextVetVisit} />
                </div>
              </div>
            )}

            {/* Real-Time Pet Status & Upcoming Vet Appointment Row - Show when room is not open */}
            {!showRoomViewer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RealTimePetStatus currentActivity={currentActivity} />
                <UpcomingVetCard appointment={nextVetVisit} />
              </div>
            )}
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>

          {/* Timeline Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "timeline" && (
              <TabsContent value="timeline" className="space-y-6" forceMount>
                <motion.div
                  key="timeline"
                  initial={{ x: getTabDirection("timeline") * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Pet Selector */}
                  <PetSelector pets={pets} selectedPetId={selectedPetId} onPetChange={setSelectedPetId} />

                  {/* Activity Timeline */}
                  <ActivityTimelineCard events={recentEvents} />
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>

          {/* Insights Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "insights" && (
              <TabsContent value="insights" className="space-y-6" forceMount>
                <motion.div
                  key="insights"
                  initial={{ x: getTabDirection("insights") * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Monthly Summary & Analytics */}
                  <MonthlySummaryCard stats={monthlyStats} />
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>

          {/* Settings Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "settings" && (
              <TabsContent value="settings" className="space-y-6" forceMount>
                <motion.div
                  key="settings"
                  initial={{ x: getTabDirection("settings") * 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Privacy & Sharing Controls */}
                  <PrivacyControlsCard />
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
        </div>
      </div>
    </>
  );
}

