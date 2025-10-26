import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from '@/components/Header';
import PetSelector from '@/components/dashboard/PetSelector';
import PetProfileCard from '@/components/dashboard/PetProfileCard';
import FeaturedRoomCard from '@/components/dashboard/FeaturedRoomCard';
import RealTimePetStatus from '@/components/dashboard/RealTimePetStatus';
import MonthlySummaryCard from '@/components/dashboard/MonthlySummaryCard';
import ActivityTimelineCard from '@/components/dashboard/ActivityTimelineCard';
import PrivacyControlsCard from '@/components/dashboard/PrivacyControlsCard';
import LocationMap from '@/components/LocationMap';
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
  
  // Pet creation modal state
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [createdPets, setCreatedPets] = useState([]); // Array of created pets
  
  // State for add pet form
  const [newPetName, setNewPetName] = useState("");
  const [petImagePath, setPetImagePath] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Track active tab for animations
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});
  const tabsListRef = useRef(null);
  
  // Socket and device tracking state
  const socketRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  const [activityHistory, setActivityHistory] = useState([
    { petName: "NuNa", activity: "Eat", timestamp: 1730006400000 },
    { petName: "NuNa", activity: "Walk", timestamp: 1730005500000 },  ]);
  const [currentPets, setCurrentPets] = useState([]);
  
  // Selected pet state - default to NuNa (id: 1)
  const [selectedPetId, setSelectedPetId] = useState(1);
  
  // Pet-specific activity state
  const [petActivities, setPetActivities] = useState({
    1: { type: "Idle", duration: "40 mins", location: "Proof verified" } // NuNa default
  });
  
  // Pet-specific device setup state
  const [petDevices, setPetDevices] = useState({
    1: { deviceId: "Device #5431", deviceStatus: "connected" } // NuNa default
  });
  
  // Tab order for direction-based animations
  const tabOrder = ["dashboard", "timeline", "insights", "settings"];
  const getTabDirection = (newTab) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    return newIndex > currentIndex ? 1 : -1;
  };

  // Set up socket connection for location tracking and activity monitoring
  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
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
      
      const history = data.history || [];
      const filteredHistory = [];
      
      for (let i = 0; i < history.length; i++) {
        const currentActivity = history[i];
        const lastFiltered = filteredHistory[filteredHistory.length - 1];
        
        if (!lastFiltered || 
            currentActivity.activity !== lastFiltered.activity ||
            currentActivity.petName !== lastFiltered.petName) {
          filteredHistory.push(currentActivity);
        }
      }
      
      setActivityHistory(prevHistory => {
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

  // Handle image file selection and upload to server
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

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

    if (!isConnected || !account) {
      alert('Please connect your wallet first using the button in the header');
      return;
    }

    if (!walletClient) {
      alert('Wallet client not ready. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      
      setStatusMessage('🔍 Checking name availability...');

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      
      const network = await provider.getNetwork();
      console.log('Current network:', network.chainId);
      
      if (Number(network.chainId) !== REGISTRY_ADDRESS.chainId) {
        alert(`Wrong network! Please switch to PetPet Testnet (Chain ID: ${REGISTRY_ADDRESS.chainId})`);
        setIsLoading(false);
        return;
      }
      
      const code = await provider.getCode(REGISTRY_ADDRESS.address);
      if (code === '0x') {
        alert(`No contract found at ${REGISTRY_ADDRESS.address} on this network.`);
        setIsLoading(false);
        return;
      }
      
      const registry = new ethers.Contract(REGISTRY_ADDRESS.address, REGISTRY_ABI, signer);

      const available = await registry.isPetNameAvailable(newPetName);
      if (!available) {
        setStatusMessage(`❌ Pet name "${newPetName}" already taken!`);
        alert(`Pet name "${newPetName}" already taken! Please choose another name.`);
        setIsLoading(false);
        return;
      }
      
      console.log(`✅ Name "${newPetName}" is available`);
      setStatusMessage('⏳ Compiling contract (this may take 10-20 seconds)...');

      const compileResponse = await fetch('/api/compile-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petName: newPetName }),
      });

      const compileResult = await compileResponse.json();
      
      if (!compileResult.success) {
        throw new Error(compileResult.error || 'Compilation failed');
      }

      console.log('Contract compiled:', compileResult.contractName);
      setStatusMessage(`✅ Compiled! Now deploying with your wallet...`);

      const ContractFactory = new ethers.ContractFactory(
        compileResult.abi,
        compileResult.bytecode,
        signer
      );

      setStatusMessage('⏳ Please confirm transaction in your wallet...');
      
      const contract = await ContractFactory.deploy(newPetName, account);
      
      setStatusMessage('⏳ Waiting for deployment confirmation...');
      await contract.waitForDeployment();
      
      const petAddress = await contract.getAddress();
      console.log('Pet deployed at:', petAddress);
      setStatusMessage(`✅ Contract deployed! Registering in registry...`);

      try {
        const tx = await registry.registerPet(newPetName, petAddress, account);
        setStatusMessage('⏳ Registering pet in registry...');
        await tx.wait();
        console.log('Registration transaction:', tx.hash);
      } catch (regError) {
        if (regError.message && regError.message.includes('Pet name already exists')) {
          setStatusMessage(`❌ Pet name was taken during deployment.`);
          alert('Pet name was taken during deployment. Please try again with a different name.');
          setIsLoading(false);
          return;
        }
        throw regError;
      }

      setStatusMessage(`✅ Pet "${newPetName}" created successfully!`);
      
      // Auto-verify then cleanup
      setTimeout(async () => {
        await verifyPetContract(petAddress, newPetName, account);
        
        try {
          await fetch('/api/cleanup-temp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contractName: compileResult.contractName
            }),
          });
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }, 5000);
      
      // Add new pet to the list
      const newPet = {
        id: createdPets.length + 2, // NuNa is 1
        name: newPetName.trim(),
        species: "Dog",
        status: "Active",
        deviceId: null, // New pets have no device setup
        deviceStatus: null,
        avatar: petImagePath,
        contractAddress: petAddress,
      };
      
      setCreatedPets(prev => [...prev, newPet]);
      setSelectedPetId(newPet.id);
      
      // Close modal and reset form
      setShowAddPetModal(false);
      setNewPetName("");
      setImagePreview(null);
      setPetImagePath(null);
      setStatusMessage('');
      
    } catch (error) {
      console.error(error);
      setStatusMessage('❌ Error: ' + (error.message || 'Failed to create pet'));
      alert('Error creating pet: ' + (error.message || 'Please try again'));
    } finally {
      setIsLoading(false);
    }
  };

  // Move pill immediately on pointer down
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

  // Update pill position when active tab changes
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

    requestAnimationFrame(() => {
      updatePillPosition();
    });
    
    const timeout = setTimeout(updatePillPosition, 100);
    
    window.addEventListener('resize', updatePillPosition);
    return () => {
      window.removeEventListener('resize', updatePillPosition);
      clearTimeout(timeout);
    };
  }, [activeTab, createdPets]);

  // All pets data (NuNa + created pets)
  const allPetsData = [
    {
      id: 1,
      name: "NuNa",
      species: "Cat",
      status: "Active",
      deviceId: petDevices[1]?.deviceId || "Device #5431",
      deviceStatus: petDevices[1]?.deviceStatus || "connected",
      avatar: "/NuNa.jpeg",
      contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    },
    ...createdPets.map(pet => ({
      ...pet,
      deviceId: petDevices[pet.id]?.deviceId || null,
      deviceStatus: petDevices[pet.id]?.deviceStatus || null,
    }))
  ];

  // Get currently selected pet
  const selectedPet = allPetsData.find(pet => pet.id === selectedPetId) || allPetsData[0];

  // Pets array for PetSelector component
  const pets = allPetsData.map(pet => ({ id: pet.id, name: pet.name }));

  // Get current activity for selected pet (or null if none)
  const currentActivity = petActivities[selectedPetId] || null;

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

  // Helper function to map activity to icon
  const getActivityIcon = (activity) => {
    const activityLower = activity?.toLowerCase() || '';
    if (activityLower.includes('walk') || activityLower.includes('run')) return Footprints;
    if (activityLower.includes('eat') || activityLower.includes('food')) return Heart;
    if (activityLower.includes('play')) return Users;
    if (activityLower.includes('sleep') || activityLower.includes('rest')) return Heart;
    if (activityLower.includes('drink') || activityLower.includes('water')) return Heart;
    return Footprints;
  };

  // Transform activity history into timeline events format
  const filteredHistory = activityHistory.filter(activity => 
    activity.petName === selectedPet?.name
  );
  const reversedHistory = filteredHistory.slice().reverse();
  
  const liveCount = Math.max(0, reversedHistory.length - 2);
  const liveEntries = reversedHistory.slice(0, liveCount).map(activity => {
    const date = new Date(activity.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    return {
      date: dateStr,
      time: timeStr,
      type: activity.activity,
      details: activity.petName,
      icon: getActivityIcon(activity.activity),
    };
  });
  
  const hardcodedEntries = [];
  if (reversedHistory.length > 1) {
    const lastIndex = reversedHistory.length - 1;
    hardcodedEntries.push({
      date: "October 26",
      time: "07:18 PM",
      type: reversedHistory[lastIndex].activity,
      details: reversedHistory[lastIndex].petName,
      icon: getActivityIcon(reversedHistory[lastIndex].activity),
    });
  }
  if (reversedHistory.length > 0) {
    const secondLastIndex = Math.max(0, reversedHistory.length - 2);
    if (reversedHistory[secondLastIndex]) {
      hardcodedEntries.push({
        date: "October 26",
        time: "07:15 PM",
        type: reversedHistory[secondLastIndex].activity,
        details: reversedHistory[secondLastIndex].petName,
        icon: getActivityIcon(reversedHistory[secondLastIndex].activity),
      });
    }
  }
  
  const recentEvents = [...liveEntries, ...hardcodedEntries].slice(0, 20);

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

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <TabsList ref={tabsListRef} className="relative bg-white/80 backdrop-blur-md border border-[#E8E4F0]/50 p-1.5 rounded-2xl shadow-lg overflow-hidden">
            <div
              className="absolute rounded-xl bg-[#F85BB4] shadow-md transition-all duration-300 ease-out"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                height: 'calc(100% - 8px)',
                top: '4px',
                zIndex: 0,
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
            <PetSelector 
              pets={pets} 
              selectedPetId={selectedPetId} 
              onPetChange={setSelectedPetId}
              onAddPet={() => setShowAddPetModal(true)}
              key={selectedPetId} // Force re-render on pet change to reset camera
            />

            <PetProfileCard 
              pet={selectedPet}
              onDeviceSetup={(deviceId, deviceStatus) => {
                setPetDevices(prev => ({
                  ...prev,
                  [selectedPetId]: { deviceId, deviceStatus }
                }));
              }}
            />

            <FeaturedRoomCard />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RealTimePetStatus currentActivity={currentActivity} petName={selectedPet?.name} />
              
              <Card className="bg-white/90 backdrop-blur-md border border-[#E8E4F0]/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-[#F85BB4]">
                    📍 Live Location
                  </CardTitle>
                  <CardDescription>
                    {devices.length > 0 
                      ? `Tracking ${devices.length} device${devices.length > 1 ? 's' : ''}`
                      : 'No devices tracking yet'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200">
                    {devices.length > 0 ? (
                      <LocationMap
                        devices={devices}
                        selectedDevice={selectedDevice}
                        onDeviceSelect={setSelectedDevice}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                          <p className="text-lg mb-2">No location data</p>
                          <p className="text-sm">Start tracking your pet!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  <PetSelector 
                    pets={pets} 
                    selectedPetId={selectedPetId} 
                    onPetChange={setSelectedPetId}
                    onAddPet={() => setShowAddPetModal(true)}
                    key={selectedPetId} // Force re-render on pet change to reset camera
                  />

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
                  <PrivacyControlsCard />
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
        </div>
      </div>

      {/* Add Pet Modal */}
      <Dialog open={showAddPetModal} onOpenChange={setShowAddPetModal}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md border-2 border-[#E8E4F0]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[#F85BB4]">Welcome to PetPet! 🐾</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
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

            {statusMessage && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{statusMessage}</p>
              </div>
            )}

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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
