/**
 * Dog Feeding Logic
 * Handles the feed action sequence: walk to bowl, eat, return to idle
 */

import { emitDogEvent, normalizeAngle, findDogObject } from './helpers';

/**
 * Trigger the eating animation by simulating "=" key press
 * @param {Object} splineApp - The Spline application instance
 * @param {Object} dogEventTarget - The dog event target
 * @param {Object} isFeedingRef - Ref tracking if dog is feeding
 * @param {Object} [lockPose] - Optional pose locker { target, yaw, ms, isMountedRef }
 */
function triggerEatingAnimation(splineApp, dogEventTarget, isFeedingRef, lockPose) {
  console.log('🍖 Triggering eating animation with "=" key press...');
  
  // Spline listens to keyboard events on the window/document/canvas
  // We need to dispatch both keydown and keyup events to simulate a real key press
  
  try {
    // Get the canvas element where Spline is rendered
    const canvas = document.querySelector('canvas');
    const targets = [canvas, window, document];
    
    // Dispatch keydown event on all targets
    targets.forEach(target => {
      if (target) {
        const keyDownEvent = new KeyboardEvent('keydown', {
          key: '=',
          code: 'Equal',
          keyCode: 187,
          which: 187,
          charCode: 61,
          bubbles: true,
          cancelable: true,
          composed: true
        });
        target.dispatchEvent(keyDownEvent);
      }
    });
    
    console.log('🎯 Dispatched "=" keydown event');
    
    // Dispatch keyup event after a short delay to complete the key press
    setTimeout(() => {
      targets.forEach(target => {
        if (target) {
          const keyUpEvent = new KeyboardEvent('keyup', {
            key: '=',
            code: 'Equal',
            keyCode: 187,
            which: 187,
            charCode: 61,
            bubbles: true,
            cancelable: true,
            composed: true
          });
          target.dispatchEvent(keyUpEvent);
        }
      });
      console.log('🎯 Dispatched "=" keyup event');
    }, 100);
    
  } catch (e) {
    console.error('❌ Failed to trigger eating animation:', e.message);
  }

  // Wait for eating animation to complete (assume 3 seconds)
  setTimeout(() => {
    console.log('🍖 Eating animation complete, returning to idle...');
    // Return to idle
    emitDogEvent(splineApp, 'mouseUp', dogEventTarget);
    
    // Reset feeding flag after a short cooldown
    setTimeout(() => {
      isFeedingRef.current = false;
      console.log('✅ Feed sequence complete, dog can move again');
    }, 1000);
  }, 3000); // 3 seconds for eating animation
}

/**
 * Keep the dog's yaw fixed for a duration (to prevent the eat clip from twisting it)
 * @param {Object} target - Spline object with rotation
 * @param {number} yaw - Target yaw in radians
 * @param {number} ms - How long to hold
 * @param {Object} isMountedRef - Mount guard
 */
function lockYawForMs(target, yaw, ms, isMountedRef) {
  const holdUntil = performance.now() + Math.max(0, ms || 0);
  const hold = (ts) => {
    if (!isMountedRef?.current) return;
    if (target?.rotation) {
      target.rotation.y = yaw;
    }
    if (ts < holdUntil) requestAnimationFrame(hold);
  };
  requestAnimationFrame(hold);
}

/**
 * Main feed handler - moves dog to bowl and triggers eating animation
 * @param {Object} params - Parameters object
 * @param {Object} params.splineApp - The Spline application instance
 * @param {Object} params.dogEventTarget - The dog event target
 * @param {Object} params.allObjects - Array of all objects in scene
 * @param {Object} params.isFeedingRef - Ref tracking if dog is feeding
 * @param {Object} params.isWalkingRef - Ref tracking if dog is walking
 * @param {Object} params.feedQueuedRef - Ref tracking if feed is queued
 * @param {Object} params.isMountedRef - Ref to check if component is mounted
 * @param {number} params.maxStepDistance - Maximum step distance allowed for a single move
 */
export function handleFeedDog(params) {
  const {
    splineApp,
    dogEventTarget,
    allObjects,
    isFeedingRef,
    isWalkingRef,
    feedQueuedRef,
    isMountedRef,
    maxStepDistance
  } = params;

  // If dog is already feeding, ignore the request
  if (isFeedingRef.current) {
    console.log('⏸️ Dog is already eating, ignoring feed request');
    return;
  }

  // If dog is walking, queue the feed action
  if (isWalkingRef.current) {
    if (!feedQueuedRef.current) {
      feedQueuedRef.current = true;
      console.log('📋 Feed action queued - will execute after walking completes');
    } else {
      console.log('📋 Feed already queued');
    }
    return;
  }

  if (!splineApp) {
    console.error('Spline app not loaded');
    return;
  }

  // Find the dog object and its armature/root; use whichever actually controls transform
  const shibainu = findDogObject(splineApp, allObjects);
  const armature =
    splineApp.findObjectByName('AnimalArmature') ||
    allObjects.find(obj => obj.name && obj.name.toLowerCase().includes('animalarmature'));

  const dogTransform = shibainu || armature || dogEventTarget;

  if (!dogTransform) {
    console.error('Dog transform target not found');
    return;
  }

  // Bowl location coordinates
  const bowlLocation = {
    x: 142,
    y: -65, // Floor level
    z: 176
  };

  // Get current position
  const startPos = {
    x: dogTransform.position?.x || 0,
    y: dogTransform.position?.y || 0,
    z: dogTransform.position?.z || 0
  };

  // Set feeding flag to prevent other animations
  isFeedingRef.current = true;
  
  const distToBowl = Math.hypot(bowlLocation.x - startPos.x, bowlLocation.z - startPos.z);
  console.log(`🍖 Starting feed sequence... Distance to bowl: ${distToBowl.toFixed(2)} units`);

  // Stop current animation and go to idle
  emitDogEvent(splineApp, 'mouseUp', dogEventTarget);

  console.log('🐕 Dog moving from', startPos, 'to bowl at', bowlLocation);

  // Calculate rotation to face the bowl
  const dx = bowlLocation.x - startPos.x;
  const dz = bowlLocation.z - startPos.z;
  const targetRotation = Math.atan2(dx, dz);

  // Set rotation immediately
  if (dogTransform?.rotation) {
    dogTransform.rotation.y = targetRotation;
  }
  
  // Start running animation immediately
  emitDogEvent(splineApp, 'mouseDown', dogEventTarget);

  // Run to the bowl at ultra high speed - instant movement
  const unitsPerSecond = 500; // ultra fast instant run to bowl
  let lastRunTs = performance.now();

  function runToBowl(nowTs) {
    if (!isMountedRef.current) return;

    const dt = Math.min(0.05, Math.max(0, (nowTs - lastRunTs) / 1000));
    lastRunTs = nowTs;

    if (dogTransform.position) {
      const rx = bowlLocation.x - dogTransform.position.x;
      const rz = bowlLocation.z - dogTransform.position.z;
      const remaining = Math.hypot(rx, rz);

      const stepDist = unitsPerSecond * dt;
      if (remaining <= stepDist + 3.0) {
        // Arrived at bowl - snap to exact position
        dogTransform.position.x = bowlLocation.x;
        dogTransform.position.y = bowlLocation.y;
        dogTransform.position.z = bowlLocation.z;
        if (dogTransform.rotation) {
          dogTransform.rotation.y = targetRotation;
        }
        console.log('✅ Arrived at bowl!');

        // Stop running animation immediately
        emitDogEvent(splineApp, 'mouseUp', dogEventTarget);

        // Immediately trigger eating animation (no delay)
        console.log('🍖 Starting eating animation...');
        // Keep facing the bowl while eating so the nose stays in the bowl
        lockYawForMs(dogTransform, targetRotation, 3300, isMountedRef);
        triggerEatingAnimation(splineApp, dogEventTarget, isFeedingRef);
        return;
      }

      // Continue running - move at full speed
      const ux = remaining > 0 ? rx / remaining : 0;
      const uz = remaining > 0 ? rz / remaining : 0;
      dogTransform.position.x += ux * stepDist;
      dogTransform.position.z += uz * stepDist;

      // Keep facing the bowl while running
      if (dogTransform.rotation) {
        dogTransform.rotation.y = targetRotation;
      }
    }

    requestAnimationFrame(runToBowl);
  }

  // Start running immediately
  requestAnimationFrame(runToBowl);
}

