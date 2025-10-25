import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PetSelector from '@/components/dashboard/PetSelector';
import PetProfileCard from '@/components/dashboard/PetProfileCard';
import FeaturedRoomCard from '@/components/dashboard/FeaturedRoomCard';
import RealTimePetStatus from '@/components/dashboard/RealTimePetStatus';
import MonthlySummaryCard from '@/components/dashboard/MonthlySummaryCard';
import UpcomingVetCard from '@/components/dashboard/UpcomingVetCard';
import ActivityTimelineCard from '@/components/dashboard/ActivityTimelineCard';
import PrivacyControlsCard from '@/components/dashboard/PrivacyControlsCard';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import {
  AlertCircle,
  Pill,
  Calendar,
  Footprints,
  Heart,
  Stethoscope,
  Users,
  Settings,
  BarChart3,
  ScrollText,
  Home as HomeIcon,
} from "lucide-react";

/**
 * Dashboard Page
 * Main dashboard component that orchestrates all pet-related information
 */
export default function Dashboard() {
  // State for pet name editing
  const [petName, setPetName] = useState("Shibaba");
  
  // Track active tab for animations
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef({});
  const tabsListRef = useRef(null);
  
  // Tab order for direction-based animations
  const tabOrder = ["dashboard", "timeline", "insights", "settings"];
  const getTabDirection = (newTab) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    return newIndex > currentIndex ? 1 : -1;
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

    // Use requestAnimationFrame to ensure DOM is fully laid out
    requestAnimationFrame(() => {
      updatePillPosition();
    });
    
    // Add a small timeout as fallback for initial render
    const timeout = setTimeout(updatePillPosition, 100);
    
    window.addEventListener('resize', updatePillPosition);
    return () => {
      window.removeEventListener('resize', updatePillPosition);
      clearTimeout(timeout);
    };
  }, [activeTab]);

  // Mock data
  const pets = [
    { id: 1, name: "Shibaba", ens: "shibaba.petpet.eth" },
    { id: 2, name: "Luna", ens: "luna.petpet.eth" },
  ];

  const selectedPet = {
    name: petName,
    ens: "shibaba.petpet.eth",
    species: "Dog",
    breed: "Shiba Inu",
    status: "Active",
    deviceId: "Device #7892",
    deviceStatus: "connected",
    avatar: "/shiba2.jpeg",
  };

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
        {/* Header with navigation and wallet - pass alerts to the header for the popup */}
        <div className="container mx-auto px-6 py-6" style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}>
        <DashboardHeader alerts={alerts} />

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
            <PetSelector pets={pets} />

            {/* Pet Profile Card */}
            <PetProfileCard pet={selectedPet} onPetNameChange={setPetName} />

            {/* Featured 3D Room Card */}
            <FeaturedRoomCard />

            {/* Real-Time Pet Status & Upcoming Vet Appointment Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RealTimePetStatus currentActivity={currentActivity} />
              <UpcomingVetCard appointment={nextVetVisit} />
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

