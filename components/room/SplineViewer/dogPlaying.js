/**
 * Dog Playing Logic
 * Triggers play animation by simulating '-' key press.
 * Queues if dog is not idling (walking/feeding/playing).
 */

import { emitDogEvent } from './helpers';

/**
 * Simulate '-' key press to trigger play animation in Spline.
 */
function triggerPlayAnimation() {
  try {
    const canvas = document.querySelector('canvas');
    const targets = [canvas, window, document];

    targets.forEach(target => {
      if (!target) return;
      const down = new KeyboardEvent('keydown', {
        key: '-',
        code: 'Minus',
        keyCode: 189,
        which: 189,
        charCode: 45,
        bubbles: true,
        cancelable: true,
        composed: true
      });
      target.dispatchEvent(down);
    });

    setTimeout(() => {
      targets.forEach(target => {
        if (!target) return;
        const up = new KeyboardEvent('keyup', {
          key: '-',
          code: 'Minus',
          keyCode: 189,
          which: 189,
          charCode: 45,
          bubbles: true,
          cancelable: true,
          composed: true
        });
        target.dispatchEvent(up);
      });
    }, 100);
  } catch (e) {
    console.error('Failed to trigger play animation:', e?.message);
  }
}

/**
 * Repeatedly emit idle (mouseUp) every frame for a duration.
 * Ensures the first frame after the play clip ends switches to idle instantly.
 */
function pulseIdleForMs(splineApp, dogEventTarget, ms, isMountedRef) {
  const endAt = performance.now() + Math.max(0, ms || 0);
  const pulse = (ts) => {
    if (!isMountedRef?.current) return;
    try { emitDogEvent(splineApp, 'mouseUp', dogEventTarget); } catch (_) {}
    if (ts < endAt) requestAnimationFrame(pulse);
  };
  requestAnimationFrame(pulse);
}

/**
 * Main play handler
 */
export function handlePlayDog(params) {
  const {
    splineApp,
    dogEventTarget,
    isPlayingRef,
    isWalkingRef,
    isFeedingRef,
    playQueuedRef,
    isMountedRef
  } = params;

  if (!splineApp) return;

  // If already playing or busy, queue
  if (isPlayingRef.current || isWalkingRef.current || isFeedingRef.current) {
    if (!playQueuedRef.current) {
      playQueuedRef.current = true;
      console.log('📋 Play queued - will execute when idle');
    }
    return;
  }

  try {
    // Ensure idle animation as baseline
    emitDogEvent(splineApp, 'mouseUp', dogEventTarget);

    isPlayingRef.current = true;
    console.log('🎮 Starting play animation');
    triggerPlayAnimation();

    // Seamless idle transition: frame-locked pulses across the clip boundary
    const playDurationMs = 2500; // expected '-' clip length; adjust if needed
    const preStart = Math.max(0, playDurationMs - 260);
    // Start pulsing shortly before the end and continue past it to guarantee capture
    setTimeout(() => {
      pulseIdleForMs(splineApp, dogEventTarget, 520, isMountedRef); // ~0.5s window
    }, preStart);

    // Finalize state just after expected end
    setTimeout(() => {
      if (!isMountedRef?.current) return;
      try { emitDogEvent(splineApp, 'mouseUp', dogEventTarget); } catch (_) {}
      isPlayingRef.current = false;
      console.log('✅ Play complete (returned to idle instantly)');
    }, playDurationMs + 20);
  } catch (e) {
    isPlayingRef.current = false;
    console.error('Play action error:', e);
  }
}


