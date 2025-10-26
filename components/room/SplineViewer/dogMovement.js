/**
 * Dog Movement Logic
 * Handles random dog movement around the room
 */

import { emitDogEvent, normalizeAngle } from './helpers';

/**
 * Move the dog to a random position in the room
 * @param {Object} shibainu - The dog object
 * @param {Object} splineApp - The Spline application instance
 * @param {Object} dogEventTarget - The dog event target for emitting events
 * @param {number} maxStepDistance - Maximum distance the dog can move in one step
 * @param {Function} onComplete - Callback function called when movement is complete
 * @param {Object} isMountedRef - Ref to check if component is still mounted
 */
export function moveDogToRandomPosition(
  shibainu,
  splineApp,
  dogEventTarget,
  maxStepDistance,
  onComplete,
  isMountedRef
) {
  if (!shibainu) return;
  
  try {
    // Room boundaries based on your coordinates
    // Corner 1: (22, -65, 56), Corner 2: (22, -65, 190)
    // Corner 3: (155, -65, 190), Corner 4: (155, -65, 56)
    const roomBounds = {
      xMin: 22,
      xMax: 155,
      y: -65,  // Floor level
      zMin: 56,
      zMax: 190
    };
    
    // Add padding to keep dog away from walls
    const padding = 15;

    // Get current position
    const startPos = { 
      x: shibainu.position?.x || 0, 
      y: shibainu.position?.y || 0, 
      z: shibainu.position?.z || 0 
    };

    // Always try to move the full max distance (or as much as allowed by bounds)
    const stepMax = typeof maxStepDistance === 'number' && maxStepDistance > 0 ? maxStepDistance : 12;

    // Clamp within padded room bounds so we never walk through walls
    const xMin = roomBounds.xMin + padding;
    const xMax = roomBounds.xMax - padding;
    const zMin = roomBounds.zMin + padding;
    const zMax = roomBounds.zMax - padding;

    // Pick a direction that allows the longest move; prefer one that fits stepMax
    let chosenAngle = Math.random() * Math.PI * 2;
    let bestAllowed = 0;
    let bestAngle = chosenAngle;
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dirX = Math.sin(angle);
      const dirZ = Math.cos(angle);
      const tX = dirX > 0 ? (xMax - startPos.x) / dirX : dirX < 0 ? (xMin - startPos.x) / dirX : Infinity;
      const tZ = dirZ > 0 ? (zMax - startPos.z) / dirZ : dirZ < 0 ? (zMin - startPos.z) / dirZ : Infinity;
      const allowed = Math.max(0, Math.min(tX, tZ));
      if (allowed >= stepMax) {
        chosenAngle = angle;
        bestAllowed = allowed;
        bestAngle = angle;
        break;
      }
      if (allowed > bestAllowed) {
        bestAllowed = allowed;
        bestAngle = angle;
      }
    }
    
    // Use best angle found
    const dirX = Math.sin(bestAngle);
    const dirZ = Math.cos(bestAngle);
    const tX = dirX > 0 ? (xMax - startPos.x) / dirX : dirX < 0 ? (xMin - startPos.x) / dirX : Infinity;
    const tZ = dirZ > 0 ? (zMax - startPos.z) / dirZ : dirZ < 0 ? (zMin - startPos.z) / dirZ : Infinity;
    const allowed = Math.max(0, Math.min(tX, tZ));
    const step = Math.max(0, Math.min(stepMax, allowed));

    // Final target using chosen direction and exact step length (as large as allowed)
    const proposed = {
      x: startPos.x + dirX * step,
      z: startPos.z + dirZ * step
    };
    const newPos = {
      x: Math.min(xMax, Math.max(xMin, proposed.x)),
      y: roomBounds.y,
      z: Math.min(zMax, Math.max(zMin, proposed.z))
    };
    
    console.log('Dog current position:', startPos);
    console.log('Dog target position:', newPos);
    
    // Calculate rotation to face the direction of movement
    const dx = newPos.x - startPos.x;
    const dz = newPos.z - startPos.z;
    const targetRotation = Math.atan2(dx, dz);

    // Phase 1: pre-rotation in place before starting to walk
    const currentY = shibainu?.rotation?.y || 0;
    let remainingTurn = normalizeAngle(targetRotation - currentY);
    const needTurn = Math.abs(remainingTurn) > 0.03; // small threshold
    const maxTurnSpeed = 7.5; // rad/sec – quick but noticeable
    let lastTurnTs = performance.now();

    function rotateInPlace(nowTs) {
      if (!isMountedRef.current) return;
      const dt = Math.min(0.05, Math.max(0, (nowTs - lastTurnTs) / 1000));
      lastTurnTs = nowTs;
      if (shibainu?.rotation) {
        const step = Math.sign(remainingTurn) * Math.min(Math.abs(remainingTurn), maxTurnSpeed * dt);
        shibainu.rotation.y += step;
        remainingTurn -= step;
      }
      if (Math.abs(remainingTurn) <= 0.01) {
        if (shibainu?.rotation) shibainu.rotation.y = targetRotation;
        // Start walking only AFTER the turn finishes
        emitDogEvent(splineApp, 'mouseDown', dogEventTarget);
        requestAnimationFrame(animateMove);
        return;
      }
      requestAnimationFrame(rotateInPlace);
    }

    // Phase 2: constant-speed movement with overshoot clamp so we land exactly on target
    const unitsPerSecond = 18; // tuned to match footstep rate
    let lastTs = performance.now();

    function animateMove(nowTs) {
      if (!isMountedRef.current) return; // stop if unmounted

      const dt = Math.min(0.05, Math.max(0, (nowTs - lastTs) / 1000)); // clamp dt to avoid huge jumps
      lastTs = nowTs;

      // Update position if the object has position property
      if (shibainu.position) {
        const rx = newPos.x - shibainu.position.x;
        const rz = newPos.z - shibainu.position.z;
        const remaining = Math.hypot(rx, rz);

        const stepDist = unitsPerSecond * dt;
        if (remaining <= stepDist + 0.001) {
          // Snap to final target and finish
          shibainu.position.x = newPos.x;
          shibainu.position.z = newPos.z;
          if (shibainu.rotation) {
            shibainu.rotation.y = targetRotation;
          }
          console.log('✅ Movement complete! Calling onComplete callback...');
          if (typeof onComplete === 'function') {
            onComplete();
            console.log('✅ onComplete callback executed');
          } else {
            console.warn('⚠️ No onComplete callback provided');
          }
          return;
        }

        const ux = remaining > 0 ? rx / remaining : 0;
        const uz = remaining > 0 ? rz / remaining : 0;
        shibainu.position.x += ux * stepDist;
        shibainu.position.z += uz * stepDist;

        // Update rotation to face movement direction
        if (shibainu.rotation) {
          shibainu.rotation.y = targetRotation;
        }

        console.log('Dog position update:', {x: shibainu.position.x, z: shibainu.position.z});
      }

      requestAnimationFrame(animateMove);
    }

    // Start pre-rotation if needed; otherwise begin walking immediately
    if (needTurn) {
      requestAnimationFrame(rotateInPlace);
    } else {
      emitDogEvent(splineApp, 'mouseDown', dogEventTarget);
      requestAnimationFrame(animateMove);
    }
    console.log('Starting dog movement from', startPos, 'to', newPos);
  } catch (error) {
    console.error('Error moving dog:', error);
  }
}

