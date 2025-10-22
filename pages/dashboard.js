import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PetSelector from '@/components/dashboard/PetSelector';
import PetProfileCard from '@/components/dashboard/PetProfileCard';
import FeaturedRoomCard from '@/components/dashboard/FeaturedRoomCard';
import RealTimePetStatus from '@/components/dashboard/RealTimePetStatus';
import AlertsCard from '@/components/dashboard/AlertsCard';
import MonthlySummaryCard from '@/components/dashboard/MonthlySummaryCard';
import UpcomingVetCard from '@/components/dashboard/UpcomingVetCard';
import ActivityTimelineCard from '@/components/dashboard/ActivityTimelineCard';
import PrivacyControlsCard from '@/components/dashboard/PrivacyControlsCard';
import TabPlaceholder from '@/components/dashboard/TabPlaceholder';
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
  // Mock data
  const pets = [
    { id: 1, name: "Buddy", ens: "buddy.petpet.eth" },
    { id: 2, name: "Luna", ens: "luna.petpet.eth" },
  ];

  const selectedPet = {
    name: "Buddy",
    ens: "buddy.petpet.eth",
    species: "Dog",
    breed: "Golden Retriever",
    status: "Active",
    deviceId: "Device #7892",
    deviceStatus: "connected",
    avatar: "🐕",
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
      message: "Buddy missed his last meal window.",
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
    <div
      className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#FFF5F7] to-[#F8F5FF]"
      style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header with navigation and wallet */}
      <div className="container mx-auto px-6 py-6">
        <DashboardHeader />

        {/* Main Content with Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-[#FBFAFD] backdrop-blur-sm border border-[#E8E4F0] p-1 rounded-2xl shadow-sm">
            <TabsTrigger
              value="dashboard"
              className="rounded-xl data-[state=active]:bg-[#FF4081] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B6B6B]"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="rounded-xl data-[state=active]:bg-[#FF4081] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B6B6B]"
            >
              <ScrollText className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-xl data-[state=active]:bg-[#FF4081] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B6B6B]"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-xl data-[state=active]:bg-[#FF4081] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#6B6B6B]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Pet Selector */}
            <PetSelector pets={pets} />

            {/* Pet Profile Card */}
            <PetProfileCard pet={selectedPet} />

            {/* Featured 3D Room Card */}
            <FeaturedRoomCard />

            {/* Real-Time Pet Status & Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RealTimePetStatus currentActivity={currentActivity} />
              <AlertsCard alerts={alerts} />
            </div>

            {/* Monthly Summary */}
            <MonthlySummaryCard stats={monthlyStats} />

            {/* Upcoming Vet Appointment & Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingVetCard appointment={nextVetVisit} />
              <ActivityTimelineCard events={recentEvents} />
            </div>

            {/* Privacy & Sharing Controls */}
            <PrivacyControlsCard />
          </TabsContent>

          {/* Timeline Tab Content */}
          <TabsContent value="timeline" className="space-y-6">
            <TabPlaceholder 
              icon={ScrollText}
              title="Timeline View"
              description="Chronological feed of all pet events will be displayed here"
            />
          </TabsContent>

          {/* Insights Tab Content */}
          <TabsContent value="insights" className="space-y-6">
            <TabPlaceholder 
              icon={BarChart3}
              title="Insights & Analytics"
              description="Charts and trends for pet health and activity will be displayed here"
            />
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-6">
            <TabPlaceholder 
              icon={Settings}
              title="Settings"
              description="Manage pet information, devices, and privacy settings here"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

