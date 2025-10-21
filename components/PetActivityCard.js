import { Card } from '@/components/ui/card';
import { getActivityColor, getActivityEmoji } from '@/lib/dogActivityHelpers';

export default function PetActivityCard({ pet, isSelected, onClick }) {
  return (
    <Card
      className={`p-6 cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-green-500 shadow-lg'
          : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {pet.petName}
          </h3>
          <p className="text-xs text-gray-500">
            Last update: {new Date(pet.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <div className="text-3xl">🐕</div>
      </div>

      <div
        className={`p-4 rounded-lg border-2 mb-3 ${getActivityColor(
          pet.activity
        )}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getActivityEmoji(pet.activity)}</span>
            <span className="font-semibold text-lg">{pet.activity}</span>
          </div>
          <div className="text-sm">
            {(pet.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-600">Movement</div>
          <div className="font-semibold">{pet.movement?.toFixed(1) || 0}</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-xs text-gray-600">Confidence</div>
          <div className="font-semibold">
            {(pet.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </Card>
  );
}

