import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import {
  Activity,
  Plus,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bell,
  TrendingUp,
  Footprints,
  Moon,
  Heart,
  Pill,
  Stethoscope,
  Users,
  Eye,
  EyeOff,
  Shield,
  Settings,
  BarChart3,
  ScrollText,
  Home as HomeIcon,
  Boxes,
  ExternalLink,
  PawPrint,
} from "lucide-react";

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
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5] rounded-xl shadow-sm">
              <PawPrint className="w-8 h-8 text-[#D4A5A5]" />
            </div>
            <h1 className="text-2xl font-medium text-[#4A4458]">Pet Pet Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/room">
              <Button className="bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] hover:shadow-lg hover:shadow-pink-200/50 transition-all text-[#8B7B8B] font-medium rounded-full border border-pink-100">
                <Boxes className="w-4 h-4 mr-2" />
                Visit 3D Room
              </Button>
            </Link>
            <Link href="/petpet">
              <Button variant="outline" className="rounded-full bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] text-[#6F6B7D] hover:bg-[#F6F3F9] transition-all">
                <ExternalLink className="w-4 h-4 mr-2" />
                Explorer
              </Button>
            </Link>
            <div className="px-4 py-2 bg-[#FBFAFD] backdrop-blur-sm rounded-full text-sm border border-[#E8E4F0] shadow-sm">
              <span className="text-[#9E9AA7]">Wallet:</span>{" "}
              <span className="font-medium text-[#6F6B7D]">0x1234...5678</span>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-[#FBFAFD] backdrop-blur-sm border border-[#E8E4F0] p-1 rounded-2xl shadow-sm">
            <TabsTrigger
              value="dashboard"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFE4E8] data-[state=active]:to-[#FFD4E5] data-[state=active]:text-[#8B7B8B] data-[state=active]:shadow-sm text-[#9E9AA7]"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFE4E8] data-[state=active]:to-[#FFD4E5] data-[state=active]:text-[#8B7B8B] data-[state=active]:shadow-sm text-[#9E9AA7]"
            >
              <ScrollText className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFE4E8] data-[state=active]:to-[#FFD4E5] data-[state=active]:text-[#8B7B8B] data-[state=active]:shadow-sm text-[#9E9AA7]"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFE4E8] data-[state=active]:to-[#FFD4E5] data-[state=active]:text-[#8B7B8B] data-[state=active]:shadow-sm text-[#9E9AA7]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Overview Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select defaultValue="1">
                  <SelectTrigger className="w-[280px] bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm text-[#6F6B7D]">
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
                <Button className="bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] hover:shadow-lg hover:shadow-pink-200/50 transition-all text-[#8B7B8B] font-medium rounded-2xl border border-pink-100">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pet
                </Button>
              </div>
            </div>

            {/* Pet Profile Card */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24 text-5xl">
                    <AvatarFallback className="bg-gradient-to-br from-[#FFE4E8] to-[#FFD4E5]">
                      {selectedPet.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-semibold text-[#4A4458]">{selectedPet.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[#D4A5A5] font-medium">{selectedPet.ens}</p>
                          <Shield className="w-4 h-4 text-[#D4A5A5]" />
                        </div>
                        <p className="text-[#9E9AA7] mt-1">
                          {selectedPet.breed} • {selectedPet.species}
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] text-[#8B7B8B] hover:bg-gradient-to-r border border-pink-100 px-4 py-1 shadow-sm">
                        <Activity className="w-3 h-3 mr-1" />
                        {selectedPet.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-[#F6F3F9] rounded-xl">
                      <div className="flex items-center gap-2">
                        {selectedPet.deviceStatus === "connected" ? (
                          <Wifi className="w-4 h-4 text-[#D4A5A5]" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-[#B5B1C0]" />
                        )}
                        <span className="text-sm font-medium text-[#6F6B7D]">{selectedPet.deviceId}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedPet.deviceStatus === "connected"
                            ? "border-pink-200 text-[#D4A5A5] bg-pink-50"
                            : "border-[#E8E4F0] text-[#9E9AA7]"
                        }
                      >
                        {selectedPet.deviceStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured 3D Room Card */}
            <Card className="bg-gradient-to-r from-[#FFE4E8] via-[#FFD4E5] to-[#F5E8FF] border border-pink-100 rounded-2xl overflow-hidden shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Boxes className="w-6 h-6 text-[#8B7B8B]" />
                      <h3 className="text-2xl font-semibold text-[#4A4458]">Explore Your Pet's 3D Room</h3>
                    </div>
                    <p className="text-[#8B7B8B] mb-4">
                      Step into an interactive 3D environment powered by Spline. View and interact with your pet's cozy space in real-time!
                    </p>
                    <Link href="/room">
                      <Button className="bg-[#FBFAFD] text-[#8B7B8B] hover:shadow-lg hover:shadow-pink-200/50 transition-all rounded-full border border-pink-100">
                        <Boxes className="w-4 h-4 mr-2" />
                        Enter 3D Room
                      </Button>
                    </Link>
                  </div>
                  <div className="p-4 bg-white/50 rounded-2xl backdrop-blur-sm shadow-sm">
                    <HomeIcon className="w-20 h-20 text-[#D4A5A5]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-Time Pet Status & Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real-Time Pet Status */}
              <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                    <Activity className="w-5 h-5 text-[#D4A5A5]" />
                    Real-Time Pet Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF] rounded-2xl border border-pink-50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Footprints className="w-8 h-8 text-[#D4A5A5] animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-[#4A4458]">{currentActivity.type}</h3>
                          <p className="text-[#9E9AA7] flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            Since: {currentActivity.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl border border-pink-50">
                      <MapPin className="w-4 h-4 text-[#D4A5A5]" />
                      <span className="text-sm font-medium text-[#6F6B7D]">
                        Location Privacy: {currentActivity.location}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-[#D4A5A5]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts & Notifications */}
              <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                    <Bell className="w-5 h-5 text-[#D4A5A5]" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl flex items-start gap-3 ${
                        alert.type === "warning"
                          ? "bg-[#FFF5F7] border border-pink-100"
                          : alert.type === "info"
                          ? "bg-[#F8F5FF] border border-purple-100"
                          : "bg-[#FFF5F7] border border-pink-100"
                      }`}
                    >
                      <alert.icon
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          alert.type === "warning"
                            ? "text-[#D4A5A5]"
                            : alert.type === "info"
                            ? "text-[#C5B5D4]"
                            : "text-[#D4A5A5]"
                        }`}
                      />
                      <p className="text-sm font-medium text-[#6F6B7D]">{alert.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Summary */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                  <TrendingUp className="w-5 h-5 text-[#D4A5A5]" />
                  Monthly Summary
                </CardTitle>
                <p className="text-sm text-[#9E9AA7] mt-1">Last 30 days</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-4 bg-gradient-to-br from-[#FFF5F7] to-[#FFE4E8] rounded-xl border border-pink-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Footprints className="w-5 h-5 text-[#D4A5A5]" />
                      <span className="text-sm font-medium text-[#6F6B7D]">Running</span>
                    </div>
                    <p className="text-2xl font-semibold text-[#D4A5A5]">{monthlyStats.running}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#F8F5FF] to-[#F0E8FF] rounded-xl border border-purple-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-5 h-5 text-[#C5B5D4]" />
                      <span className="text-sm font-medium text-[#6F6B7D]">Sleeping</span>
                    </div>
                    <p className="text-2xl font-semibold text-[#C5B5D4]">{monthlyStats.sleeping}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#FFF5F7] to-[#FFEEF5] rounded-xl border border-pink-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-[#E4B5C5]" />
                      <span className="text-sm font-medium text-[#6F6B7D]">Resting</span>
                    </div>
                    <p className="text-2xl font-semibold text-[#E4B5C5]">{monthlyStats.resting}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#FFF5F7] to-[#FFE4E8] rounded-xl border border-pink-50">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[#D4A5A5]" />
                      <span className="text-sm font-medium text-[#6F6B7D]">Distance</span>
                    </div>
                    <p className="text-2xl font-semibold text-[#D4A5A5]">{monthlyStats.distance}</p>
                  </div>
                  <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
                    <p className="text-sm text-[#9E9AA7]">Pet Interactions</p>
                    <p className="text-2xl font-semibold mt-1 text-[#6F6B7D]">{monthlyStats.interactions}</p>
                  </div>
                  <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
                    <p className="text-sm text-[#9E9AA7]">Meals Consumed</p>
                    <p className="text-2xl font-semibold mt-1 text-[#6F6B7D]">{monthlyStats.meals}</p>
                  </div>
                  <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
                    <p className="text-sm text-[#9E9AA7]">Medication</p>
                    <p className="text-2xl font-semibold mt-1 text-[#D4A5A5]">
                      {monthlyStats.medicationCompliance}
                    </p>
                  </div>
                  <div className="p-4 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
                    <p className="text-sm text-[#9E9AA7]">Vet Visits</p>
                    <p className="text-2xl font-semibold mt-1 text-[#6F6B7D]">{monthlyStats.vetVisits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Vet Appointment & Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Vet Appointment */}
              <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                    <Calendar className="w-5 h-5 text-[#D4A5A5]" />
                    Upcoming Vet Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gradient-to-br from-[#FFF5F7] to-[#F8F5FF] rounded-2xl border border-pink-50 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Stethoscope className="w-8 h-8 text-[#D4A5A5]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[#4A4458]">
                          {nextVetVisit.date} at {nextVetVisit.time}
                        </h3>
                        <p className="text-[#9E9AA7]">{nextVetVisit.clinic}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#9E9AA7]">Purpose:</span>
                        <span className="font-medium text-[#6F6B7D]">{nextVetVisit.purpose}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#9E9AA7]">Attestation Status:</span>
                        <Badge variant="outline" className="border-pink-200 text-[#D4A5A5] bg-pink-50">
                          {nextVetVisit.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                    <ScrollText className="w-5 h-5 text-[#D4A5A5]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentEvents.map((event, i) => (
                    <div
                      key={i}
                      className="p-4 bg-[#F6F3F9]/50 rounded-xl hover:bg-[#F6F3F9] transition-colors border border-[#E8E4F0]/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <event.icon className="w-5 h-5 text-[#D4A5A5]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#9E9AA7]">{event.date}</span>
                            {event.status === "verified" ? (
                              <Badge className="bg-gradient-to-r from-[#FFE4E8] to-[#FFD4E5] text-[#8B7B8B] hover:bg-gradient-to-r border border-pink-100 shadow-sm">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-[#F8F5FF] text-[#C5B5D4] hover:bg-[#F8F5FF] border border-purple-100 shadow-sm">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold text-[#4A4458]">
                            {event.type}{" "}
                            <span className="font-normal text-[#9E9AA7]">({event.details})</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Privacy & Sharing Controls */}
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#4A4458] font-medium">
                  <Shield className="w-5 h-5 text-[#D4A5A5]" />
                  Privacy & Sharing Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-[#6F6B7D]">Profile Visibility</span>
                      <Eye className="w-5 h-5 text-[#9E9AA7]" />
                    </div>
                    <Select defaultValue="private">
                      <SelectTrigger className="bg-white border-[#E8E4F0] text-[#6F6B7D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="vet">Share with Vet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-6 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-[#6F6B7D]">Proof Visibility</span>
                      <EyeOff className="w-5 h-5 text-[#9E9AA7]" />
                    </div>
                    <Select defaultValue="hide">
                      <SelectTrigger className="bg-white border-[#E8E4F0] text-[#6F6B7D]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="show">Show ZK Proofs</SelectItem>
                        <SelectItem value="hide">Hide Details</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-6 bg-[#F6F3F9] rounded-xl border border-[#E8E4F0]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-[#6F6B7D]">Share Dashboard</span>
                      <Users className="w-5 h-5 text-[#9E9AA7]" />
                    </div>
                    <Button disabled className="w-full bg-[#E8E4F0] text-[#B5B1C0] cursor-not-allowed">
                      Disabled (Demo)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab Content */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <ScrollText className="w-12 h-12 text-[#D4A5A5] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#4A4458]">Timeline View</h3>
                  <p className="text-[#9E9AA7] mt-2">
                    Chronological feed of all pet events will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab Content */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-[#D4A5A5] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#4A4458]">Insights & Analytics</h3>
                  <p className="text-[#9E9AA7] mt-2">
                    Charts and trends for pet health and activity will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-[#FBFAFD] backdrop-blur-sm border-[#E8E4F0] rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-[#D4A5A5] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#4A4458]">Settings</h3>
                  <p className="text-[#9E9AA7] mt-2">
                    Manage pet information, devices, and privacy settings here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

