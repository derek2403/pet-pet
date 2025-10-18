import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Box,
  Clock,
  ArrowLeftRight,
  Wallet,
  Fuel,
  Copy,
  LogIn,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function MockExplorer() {
  // Mock data for latest blocks
  const latestBlocks = [
    {
      number: "15145239",
      txn: 0,
      reward: 0,
      miner: "0xb2...589e",
      time: "3s",
    },
    {
      number: "15145238",
      txn: 0,
      reward: 0,
      miner: "0x76...70Cf",
      time: "5s",
    },
    {
      number: "15145237",
      txn: 0,
      reward: 0,
      miner: "0xa9...3b4e",
      time: "8s",
    },
  ];

  // Mock data for latest transactions
  const latestTransactions = [
    {
      hash: "0x15cf...8948",
      type: "Contract call",
      status: "Success",
      from: "0x43...A93d",
      to: "EntryPoint",
      value: "0 MOCA",
      fee: "0 MOCA",
      time: "6m",
    },
    {
      hash: "0x6dde...bbf1",
      type: "Contract call",
      status: "Success",
      from: "0x32...0b32",
      to: "0xC2...7ae7",
      value: "0.2 MOCA",
      fee: "0 MOCA",
      time: "10m",
    },
    {
      hash: "0x1dc9...8b30",
      type: "Contract call",
      status: "Success",
      from: "0x22...2c48",
      to: "0x59...eb35",
      value: "0.1 MOCA",
      fee: "0 MOCA",
      time: "21m",
    },
    {
      hash: "0x32...0b32",
      type: "Contract call",
      status: "Success",
      from: "0x32...0b32",
      to: "0xC2...7ae7",
      value: "0.1 MOCA",
      fee: "0 MOCA",
      time: "25m",
    },
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 via-purple-50 to-blue-100"
      style={{ fontFamily: "'Poppins', 'Inter', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="text-pink-500 text-3xl font-bold">▲▲</div>
            <h1 className="text-2xl font-semibold">Moca Chain</h1>
          </div>
          <Button className="bg-pink-400 hover:bg-pink-500 text-white rounded-full px-6">
            <LogIn className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Moca Chain explorer</h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by Block / Txn / Address / Bucket / Object / Group..."
              className="pl-12 py-6 text-base bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Blocks */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Box className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total blocks</div>
                    <div className="text-2xl font-semibold mt-1">15,141,882</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Block Time */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Clock className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Average block time</div>
                    <div className="text-2xl font-semibold mt-1">1.0s</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Transactions Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl row-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      Daily transactions
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="text-4xl font-semibold mt-1">147</div>
                  </div>
                </div>
                {/* Simple chart visualization */}
                <div className="h-32 flex items-end gap-1 mt-6">
                  {[40, 30, 60, 55, 70, 45, 50, 35, 40, 30, 35, 55, 75, 65, 45, 30, 25, 20].map(
                    (height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-pink-400 to-pink-300 rounded-t-sm opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Total Transactions */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <ArrowLeftRight className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total transactions</div>
                    <div className="text-2xl font-semibold mt-1">282,731</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Addresses */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Wallet className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Wallet addresses</div>
                    <div className="text-2xl font-semibold mt-1">12,617</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gas Tracker */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Fuel className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 flex items-center justify-between">
                      Gas tracker
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-semibold mt-1">&lt; 0.1 Gwei</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Blocks and Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Blocks */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Latest blocks</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Network utilization: <span className="text-pink-500">0.00%</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestBlocks.map((block, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-pink-500" />
                        <span className="text-pink-500 font-semibold">{block.number}</span>
                      </div>
                      <span className="text-sm text-gray-500">{block.time}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600">Txn</div>
                        <div className="font-medium">{block.txn}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Reward</div>
                        <div className="font-medium">{block.reward}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Miner</div>
                        <div className="font-medium text-pink-500">{block.miner}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Latest Transactions */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Latest transactions</CardTitle>
                <div className="mt-3 p-3 bg-purple-50 rounded-lg text-center">
                  <span className="text-sm text-gray-700">scanning new transactions...</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestTransactions.map((tx, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-blue-500">{tx.type}</span>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">{tx.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Box className="w-4 h-4 text-pink-500" />
                      <span className="text-pink-500 font-medium">{tx.hash}</span>
                      <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                      <span className="text-sm text-gray-500">{tx.time}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <LogIn className="w-3 h-3 text-gray-600 rotate-180" />
                          <span className="text-pink-500">{tx.from}</span>
                          <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <LogIn className="w-3 h-3 text-gray-600" />
                          <span className="text-pink-500">{tx.to}</span>
                          <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-600">Value {tx.value}</div>
                        <div className="text-gray-600">Fee {tx.fee}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

