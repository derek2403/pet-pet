// Shared utilities for dog activity monitoring

export const ACTIVITY_TYPES = {
  SLEEPING: 'Sleeping',
  SLEEPING_LYING: 'Sleeping/Lying',
  RESTING: 'Resting',
  EATING: 'Eating',
  DRINKING: 'Drinking',
  STANDING_SITTING: 'Standing/Sitting',
  WALKING: 'Walking',
  RUNNING_PLAYING: 'Running/Playing',
  UNKNOWN: 'Unknown',
};

export const getActivityColor = (activity) => {
  const colors = {
    [ACTIVITY_TYPES.SLEEPING]: 'bg-purple-100 text-purple-800 border-purple-300',
    [ACTIVITY_TYPES.SLEEPING_LYING]: 'bg-purple-100 text-purple-800 border-purple-300',
    [ACTIVITY_TYPES.RESTING]: 'bg-blue-100 text-blue-800 border-blue-300',
    [ACTIVITY_TYPES.EATING]: 'bg-green-100 text-green-800 border-green-300',
    [ACTIVITY_TYPES.DRINKING]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    [ACTIVITY_TYPES.STANDING_SITTING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [ACTIVITY_TYPES.WALKING]: 'bg-orange-100 text-orange-800 border-orange-300',
    [ACTIVITY_TYPES.RUNNING_PLAYING]: 'bg-red-100 text-red-800 border-red-300',
    [ACTIVITY_TYPES.UNKNOWN]: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[activity] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const getActivityEmoji = (activity) => {
  const emojis = {
    [ACTIVITY_TYPES.SLEEPING]: '😴',
    [ACTIVITY_TYPES.SLEEPING_LYING]: '😴',
    [ACTIVITY_TYPES.RESTING]: '🛋️',
    [ACTIVITY_TYPES.EATING]: '🍖',
    [ACTIVITY_TYPES.DRINKING]: '💧',
    [ACTIVITY_TYPES.STANDING_SITTING]: '🧍',
    [ACTIVITY_TYPES.WALKING]: '🚶',
    [ACTIVITY_TYPES.RUNNING_PLAYING]: '🏃',
    [ACTIVITY_TYPES.UNKNOWN]: '❓',
  };
  return emojis[activity] || '❓';
};

export const calculateMovement = (currentBox, lastBox) => {
  if (!lastBox) return 0;
  
  const dx = currentBox.centerX - lastBox.centerX;
  const dy = currentBox.centerY - lastBox.centerY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

export const classifyActivity = (dog, predictions, movement, zones) => {
  const dogBox = {
    centerX: (dog.bbox[0] + dog.bbox[2]) / 2,
    centerY: (dog.bbox[1] + dog.bbox[3]) / 2,
    width: dog.bbox[2],
    height: dog.bbox[3],
  };

  let activity = ACTIVITY_TYPES.UNKNOWN;
  let confidence = dog.score;

  // Check proximity to defined zones
  if (zones.food) {
    const distToFood = calculateDistance(dogBox.centerX, dogBox.centerY, zones.food.x, zones.food.y);
    if (distToFood < 150 && movement < 5) {
      activity = ACTIVITY_TYPES.EATING;
      confidence = 0.85;
    }
  }

  if (zones.water) {
    const distToWater = calculateDistance(dogBox.centerX, dogBox.centerY, zones.water.x, zones.water.y);
    if (distToWater < 150 && movement < 5) {
      activity = ACTIVITY_TYPES.DRINKING;
      confidence = 0.85;
    }
  }

  if (zones.bed) {
    const distToBed = calculateDistance(dogBox.centerX, dogBox.centerY, zones.bed.x, zones.bed.y);
    if (distToBed < 200) {
      if (movement < 2) {
        activity = ACTIVITY_TYPES.SLEEPING;
        confidence = 0.9;
      } else if (movement < 5) {
        activity = ACTIVITY_TYPES.RESTING;
        confidence = 0.85;
      }
    }
  }

  // Movement-based classification (fallback)
  if (activity === ACTIVITY_TYPES.UNKNOWN) {
    if (movement < 2) {
      activity = ACTIVITY_TYPES.SLEEPING_LYING;
    } else if (movement < 10) {
      activity = ACTIVITY_TYPES.STANDING_SITTING;
    } else if (movement < 30) {
      activity = ACTIVITY_TYPES.WALKING;
    } else {
      activity = ACTIVITY_TYPES.RUNNING_PLAYING;
    }
  }

  // Check for bowls nearby (auto-detection)
  const bowls = predictions.filter(p => 
    p.class === 'bowl' || p.class === 'cup' || p.class === 'bottle'
  );

  bowls.forEach(bowl => {
    const bowlBox = {
      centerX: (bowl.bbox[0] + bowl.bbox[2]) / 2,
      centerY: (bowl.bbox[1] + bowl.bbox[3]) / 2,
    };
    
    const dist = calculateDistance(dogBox.centerX, dogBox.centerY, bowlBox.centerX, bowlBox.centerY);

    if (dist < 100 && movement < 5) {
      activity = bowl.class === 'bottle' || bowl.class === 'cup' 
        ? ACTIVITY_TYPES.DRINKING
        : ACTIVITY_TYPES.EATING;
      confidence = 0.8;
    }
  });

  return { activity, confidence };
};

export const calculateStatistics = (activityHistory, currentPets) => {
  if (activityHistory.length === 0) return {};

  const stats = {};
  
  currentPets.forEach(pet => {
    const petHistory = activityHistory.filter(h => h.petName === pet.petName);
    
    if (petHistory.length === 0) {
      stats[pet.petName] = {
        total: 0,
        activities: {},
        avgConfidence: 0,
        avgMovement: 0,
      };
      return;
    }

    // Count activities
    const activities = {};
    let totalConfidence = 0;
    let totalMovement = 0;

    petHistory.forEach(activity => {
      activities[activity.activity] = (activities[activity.activity] || 0) + 1;
      totalConfidence += activity.confidence || 0;
      totalMovement += activity.movement || 0;
    });

    stats[pet.petName] = {
      total: petHistory.length,
      activities: activities,
      avgConfidence: (totalConfidence / petHistory.length * 100).toFixed(1),
      avgMovement: (totalMovement / petHistory.length).toFixed(1),
      lastUpdate: new Date(petHistory[petHistory.length - 1].timestamp).toLocaleTimeString(),
    };
  });

  return stats;
};

export const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

