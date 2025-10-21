import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import PetActivityCard from '@/components/PetActivityCard';
import { 
  getActivityEmoji, 
  calculateStatistics 
} from '@/lib/dogActivityHelpers';

export default function DogDashboard() {
  const [connected, setConnected] = useState(false);
  const [currentPets, setCurrentPets] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedPet, setSelectedPet] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
      // Request current pet activities
      socketRef.current.emit('request-pet-activities');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('pet-activities-update', (data) => {
      console.log('Pet activities update:', data);
      setCurrentPets(data.current || []);
      setActivityHistory(data.history || []);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Calculate statistics whenever history changes
  useEffect(() => {
    const stats = calculateStatistics(activityHistory, currentPets);
    setStatistics(stats);
  }, [activityHistory, currentPets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🐕 Dog Activity Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-green-800">
                  {currentPets.length} {currentPets.length === 1 ? 'Pet' : 'Pets'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {currentPets.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🐕</div>
              <p className="text-xl font-medium mb-2">No Pets Being Monitored</p>
              <p className="text-sm mb-4">
                Start monitoring by opening the dog camera page
              </p>
              <a
                href="/dog-camera"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Open Dog Camera →
              </a>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Current Activity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPets.map((pet) => (
                <PetActivityCard
                  key={pet.id}
                  pet={pet}
                  isSelected={selectedPet?.id === pet.id}
                  onClick={() => setSelectedPet(pet)}
                />
              ))}
            </div>

            {/* Statistics */}
            {Object.keys(statistics).length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  📊 Activity Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(statistics).map(([petName, stats]) => (
                    <div key={petName} className="space-y-3">
                      <h3 className="font-semibold text-lg text-gray-700">
                        {petName}
                      </h3>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-600">Total Events:</span>
                          <span className="font-semibold ml-2">{stats.total}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Avg Confidence:</span>
                          <span className="font-semibold ml-2">{stats.avgConfidence}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Avg Movement:</span>
                          <span className="font-semibold ml-2">{stats.avgMovement}</span>
                        </div>
                      </div>

                      {stats.activities && Object.keys(stats.activities).length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-600 mb-2">
                            Activity Breakdown:
                          </div>
                          <div className="space-y-1">
                            {Object.entries(stats.activities)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([activity, count]) => (
                                <div
                                  key={activity}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="flex items-center gap-1">
                                    <span>{getActivityEmoji(activity)}</span>
                                    <span>{activity}</span>
                                  </span>
                                  <span className="font-semibold">{count}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                📅 Recent Activity Timeline
              </h2>
              {activityHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No activity history yet
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activityHistory
                    .slice()
                    .reverse()
                    .slice(0, 50)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          selectedPet?.petName === activity.petName
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getActivityEmoji(activity.activity)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {activity.petName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {activity.activity}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="text-xs font-semibold text-gray-700">
                            {(activity.confidence * 100).toFixed(0)}% confident
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            {/* Instructions */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                📱 How to Use:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Open /dog-camera on a device with a camera pointing at your dog</li>
                <li>Set zones (food, water, bed) by clicking the buttons and then the camera</li>
                <li>AI will automatically detect and classify activities</li>
                <li>This dashboard updates in real-time as activities are detected</li>
                <li>Click on pet cards to highlight their activity in the timeline</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

