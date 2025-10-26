# SplineViewer Component Structure

This directory contains the modularized SplineViewer component, broken down into focused, maintainable modules.

## File Structure

```
SplineViewer/
├── index.js          # Main component (UI, state management, lifecycle)
├── helpers.js        # Utility functions (event emission, angle normalization, object finding)
├── dogMovement.js    # Random dog movement logic
├── dogFeeding.js     # Feed sequence logic (walk to bowl, eat, return to idle)
└── README.md         # This file
```

## Modules

### `index.js` (Main Component)
- **Purpose**: Main React component with UI and state management
- **Responsibilities**:
  - Render Spline canvas and UI controls
  - Manage component state (loading, fullscreen, sound, etc.)
  - Handle Spline scene initialization
  - Set up animation cycling intervals
  - Coordinate between different modules
- **Exports**: `default SplineViewer` component

### `helpers.js` (Utilities)
- **Purpose**: Reusable utility functions
- **Functions**:
  - `emitDogEvent()` - Emit events on dog object (with fallbacks)
  - `normalizeAngle()` - Normalize angles to [-PI, PI] range
  - `findDogObject()` - Find the dog object in the scene
- **Exports**: Named exports for each utility function

### `dogMovement.js` (Random Movement)
- **Purpose**: Handle random dog walking around the room
- **Functions**:
  - `moveDogToRandomPosition()` - Move dog to random position within room bounds
- **Features**:
  - Room boundary detection with padding
  - Pre-rotation before walking (prevents sliding)
  - Smooth constant-speed movement
  - Arrival detection and completion callback
- **Exports**: Named export `moveDogToRandomPosition`

### `dogFeeding.js` (Feed Sequence)
- **Purpose**: Handle the complete feeding sequence
- **Functions**:
  - `handleFeedDog()` - Main feed handler with queueing support
  - `triggerEatingAnimation()` - Simulate "=" key press for eating animation
- **Features**:
  - Queue system (feed during walking queues the action)
  - Walk to bowl at specific coordinates (x=125, z=115)
  - Trigger eating animation via keyboard event
  - Return to idle after eating
  - Proper state management (prevents interruptions)
- **Exports**: Named export `handleFeedDog`

## Usage

Import the component as before:

```javascript
import SplineViewer from '@/components/room/SplineViewer';

<SplineViewer 
  sceneUrl={sceneUrl}
  maxStepDistance={36}
  showNotification={showNotification}
  notificationMessage={notificationMessage}
  onFeedReady={(feedFunc) => setFeedDogFunction(() => feedFunc)}
/>
```

The component automatically resolves to `index.js` due to Node.js module resolution.

## Benefits of Modularization

1. **Maintainability**: Each file has a single, clear purpose
2. **Readability**: Smaller files are easier to understand
3. **Testability**: Functions can be tested in isolation
4. **Reusability**: Helper functions can be used across modules
5. **Collaboration**: Multiple developers can work on different modules

## State Management

The component uses React refs for performance-critical state:
- `isWalkingRef` - Prevents random walks during controlled movement
- `isFeedingRef` - Prevents interruptions during feeding
- `feedQueuedRef` - Tracks queued feed actions
- `isMountedRef` - Prevents state updates after unmount

## Event Flow

### Random Walking
1. Timer triggers `cycleAnimations()`
2. Check if dog is busy (walking/feeding)
3. 50% chance to walk or stay idle
4. Call `moveDogToRandomPosition()`
5. Pre-rotate → Walk → Arrive → Complete

### Feeding Sequence
1. User clicks Feed button
2. Check if busy → Queue if walking
3. Call `handleFeedDog()`
4. Pre-rotate → Walk to bowl → Arrive
5. Trigger eating animation ("=" key)
6. Wait 3 seconds → Return to idle
7. Execute queued feed if any

## Adding New Features

To add new dog actions (e.g., "Play", "Sleep"):

1. Create new module: `dogPlaying.js` or `dogSleeping.js`
2. Export handler function similar to `handleFeedDog()`
3. Import in `index.js`
4. Create wrapper function with refs
5. Pass to parent via callback prop
6. Connect to button in `room.js`

