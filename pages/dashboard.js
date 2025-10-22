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
      className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 via-pink-100 to-pink-200"
      style={{ fontFamily: "'Poppins', 'Inter', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-xl">
              <PawPrint className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-2xl font-semibold">Pet Pet Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/room">
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-full">
                <Boxes className="w-4 h-4 mr-2" />
                Visit 3D Room
              </Button>
            </Link>
            <Link href="/petpet">
              <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm border-gray-200">
                <ExternalLink className="w-4 h-4 mr-2" />
                Explorer
              </Button>
            </Link>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm">
              <span className="text-gray-600">Wallet:</span>{" "}
              <span className="font-medium">0x1234...5678</span>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border-gray-200 p-1 rounded-2xl">
            <TabsTrigger
              value="dashboard"
              className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              <ScrollText className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white"
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
                  <SelectTrigger className="w-[280px] bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
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
                <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-2xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pet
                </Button>
              </div>
            </div>

            {/* Pet Profile Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24 text-5xl">
                    <AvatarFallback className="bg-gradient-to-br from-pink-200 to-pink-300">
                      {selectedPet.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold">{selectedPet.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-pink-500 font-medium">{selectedPet.ens}</p>
                          <Shield className="w-4 h-4 text-pink-500" />
                        </div>
                        <p className="text-gray-600 mt-1">
                          {selectedPet.breed} • {selectedPet.species}
                        </p>
                      </div>
                      <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 px-4 py-1">
                        <Activity className="w-3 h-3 mr-1" />
                        {selectedPet.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        {selectedPet.deviceStatus === "connected" ? (
                          <Wifi className="w-4 h-4 text-pink-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium">{selectedPet.deviceId}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedPet.deviceStatus === "connected"
                            ? "border-pink-500 text-pink-700"
                            : "border-gray-400 text-gray-600"
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
            <Card className="bg-gradient-to-r from-pink-500 via-pink-600 to-fuchsia-500 border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Boxes className="w-6 h-6" />
                      <h3 className="text-2xl font-bold">Explore Your Pet's 3D Room</h3>
                    </div>
                    <p className="text-white/90 mb-4">
                      Step into an interactive 3D environment powered by Spline. View and interact with your pet's cozy space in real-time!
                    </p>
                    <Link href="/room">
                      <Button className="bg-white text-pink-600 hover:bg-gray-100 rounded-full">
                        <Boxes className="w-4 h-4 mr-2" />
                        Enter 3D Room
                      </Button>
                    </Link>
                  </div>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <HomeIcon className="w-20 h-20 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-Time Pet Status & Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real-Time Pet Status */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-pink-500" />
                    Real-Time Pet Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Footprints className="w-8 h-8 text-pink-500 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{currentActivity.type}</h3>
                          <p className="text-gray-600 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            Since: {currentActivity.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl">
                      <MapPin className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-medium">
                        Location Privacy: {currentActivity.location}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-pink-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts & Notifications */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-pink-500" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl flex items-start gap-3 ${
                        alert.type === "warning"
                          ? "bg-pink-50 border border-pink-200"
                          : alert.type === "info"
                          ? "bg-pink-50 border border-pink-200"
                          : "bg-pink-50 border border-pink-200"
                      }`}
                    >
                      <alert.icon
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          alert.type === "warning"
                            ? "text-pink-500"
                            : alert.type === "info"
                            ? "text-pink-500"
                            : "text-pink-500"
                        }`}
                      />
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Summary */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                  Monthly Summary
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Footprints className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-medium text-gray-700">Running</span>
                    </div>
                    <p className="text-2xl font-bold text-pink-600">{monthlyStats.running}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-5 h-5 text-fuchsia-600" />
                      <span className="text-sm font-medium text-gray-700">Sleeping</span>
                    </div>
                    <p className="text-2xl font-bold text-fuchsia-600">{monthlyStats.sleeping}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-fuchsia-600" />
                      <span className="text-sm font-medium text-gray-700">Resting</span>
                    </div>
                    <p className="text-2xl font-bold text-fuchsia-600">{monthlyStats.resting}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-medium text-gray-700">Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-pink-600">{monthlyStats.distance}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">Pet Interactions</p>
                    <p className="text-2xl font-bold mt-1">{monthlyStats.interactions}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">Meals Consumed</p>
                    <p className="text-2xl font-bold mt-1">{monthlyStats.meals}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">Medication</p>
                    <p className="text-2xl font-bold mt-1 text-pink-600">
                      {monthlyStats.medicationCompliance}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">Vet Visits</p>
                    <p className="text-2xl font-bold mt-1">{monthlyStats.vetVisits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Vet Appointment & Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Vet Appointment */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    Upcoming Vet Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Stethoscope className="w-8 h-8 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {nextVetVisit.date} at {nextVetVisit.time}
                        </h3>
                        <p className="text-gray-600">{nextVetVisit.clinic}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Purpose:</span>
                        <span className="font-medium">{nextVetVisit.purpose}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Attestation Status:</span>
                        <Badge variant="outline" className="border-pink-400 text-pink-700">
                          {nextVetVisit.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-pink-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentEvents.map((event, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <event.icon className="w-5 h-5 text-pink-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-600">{event.date}</span>
                            {event.status === "verified" ? (
                              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold">
                            {event.type}{" "}
                            <span className="font-normal text-gray-600">({event.details})</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Privacy & Sharing Controls */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-pink-500" />
                  Privacy & Sharing Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Profile Visibility</span>
                      <Eye className="w-5 h-5 text-gray-600" />
                    </div>
                    <Select defaultValue="private">
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="vet">Share with Vet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Proof Visibility</span>
                      <EyeOff className="w-5 h-5 text-gray-600" />
                    </div>
                    <Select defaultValue="hide">
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="show">Show ZK Proofs</SelectItem>
                        <SelectItem value="hide">Hide Details</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Share Dashboard</span>
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                      Disabled (Demo)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab Content */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <ScrollText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">Timeline View</h3>
                  <p className="text-gray-600 mt-2">
                    Chronological feed of all pet events will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab Content */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">Insights & Analytics</h3>
                  <p className="text-gray-600 mt-2">
                    Charts and trends for pet health and activity will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">Settings</h3>
                  <p className="text-gray-600 mt-2">
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

