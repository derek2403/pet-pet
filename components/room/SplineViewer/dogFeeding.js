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
 */
function triggerEatingAnimation(splineApp, dogEventTarget, isFeedingRef) {
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
 * Main feed handler - moves dog to bowl and triggers eating animation
 * @param {Object} params - Parameters object
 * @param {Object} params.splineApp - The Spline application instance
 * @param {Object} params.dogEventTarget - The dog event target
 * @param {Object} params.allObjects - Array of all objects in scene
 * @param {Object} params.isFeedingRef - Ref tracking if dog is feeding
 * @param {Object} params.isWalkingRef - Ref tracking if dog is walking
 * @param {Object} params.feedQueuedRef - Ref tracking if feed is queued
 * @param {Object} params.isMountedRef - Ref to check if component is mounted
 */
export function handleFeedDog(params) {
  const {
    splineApp,
    dogEventTarget,
    allObjects,
    isFeedingRef,
    isWalkingRef,
    feedQueuedRef,
    isMountedRef
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

  // Find the dog object
  const shibainu = findDogObject(splineApp, allObjects);

  if (!shibainu) {
    console.error('Dog not found');
    return;
  }

  // Set feeding flag to prevent other animations
  isFeedingRef.current = true;
  console.log('🍖 Starting feed sequence...');

  // Stop current animation and go to idle
  emitDogEvent(splineApp, 'mouseUp', dogEventTarget);

  // Bowl location coordinates
  const bowlLocation = {
    x: 142,
    y: -65, // Floor level
    z: 176
  };

  // Get current position
  const startPos = {
    x: shibainu.position?.x || 0,
    y: shibainu.position?.y || 0,
    z: shibainu.position?.z || 0
  };

  console.log('🐕 Dog moving from', startPos, 'to bowl at', bowlLocation);

  // Calculate rotation to face the bowl
  const dx = bowlLocation.x - startPos.x;
  const dz = bowlLocation.z - startPos.z;
  const targetRotation = Math.atan2(dx, dz);

  // Phase 1: Rotate to face the bowl
  const currentY = shibainu?.rotation?.y || 0;
  let remainingTurn = normalizeAngle(targetRotation - currentY);
  const needTurn = Math.abs(remainingTurn) > 0.03;
  const maxTurnSpeed = 7.5; // rad/sec
  let lastTurnTs = performance.now();

  function rotateTowardsBowl(nowTs) {
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
      // Start walking to bowl
      emitDogEvent(splineApp, 'mouseDown', dogEventTarget);
      requestAnimationFrame(walkToBowl);
      return;
    }
    requestAnimationFrame(rotateTowardsBowl);
  }

  // Phase 2: Walk to the bowl
  const unitsPerSecond = 18;
  let lastWalkTs = performance.now();

  function walkToBowl(nowTs) {
    if (!isMountedRef.current) return;

    const dt = Math.min(0.05, Math.max(0, (nowTs - lastWalkTs) / 1000));
    lastWalkTs = nowTs;

    if (shibainu.position) {
      const rx = bowlLocation.x - shibainu.position.x;
      const rz = bowlLocation.z - shibainu.position.z;
      const remaining = Math.hypot(rx, rz);

      const stepDist = unitsPerSecond * dt;
      if (remaining <= stepDist + 0.5) {
        // Arrived at bowl
        shibainu.position.x = bowlLocation.x;
        shibainu.position.y = bowlLocation.y;
        shibainu.position.z = bowlLocation.z;
        if (shibainu.rotation) {
          shibainu.rotation.y = targetRotation;
        }
        console.log('✅ Arrived at bowl!');

        // Stop walking animation
        emitDogEvent(splineApp, 'mouseUp', dogEventTarget);

        // Wait a moment, then trigger eating animation
        setTimeout(() => {
          console.log('🍖 Starting eating animation...');
          triggerEatingAnimation(splineApp, dogEventTarget, isFeedingRef);
        }, 300);
        return;
      }

      // Continue walking
      const ux = remaining > 0 ? rx / remaining : 0;
      const uz = remaining > 0 ? rz / remaining : 0;
      shibainu.position.x += ux * stepDist;
      shibainu.position.z += uz * stepDist;

      if (shibainu.rotation) {
        shibainu.rotation.y = targetRotation;
      }
    }

    requestAnimationFrame(walkToBowl);
  }

  // Start the sequence
  if (needTurn) {
    requestAnimationFrame(rotateTowardsBowl);
  } else {
    emitDogEvent(splineApp, 'mouseDown', dogEventTarget);
    requestAnimationFrame(walkToBowl);
  }
}

