/**
 * Helper utility functions for SplineViewer
 * Contains reusable functions for dog animations and event handling
 */

/**
 * Emit helper that targets the calibrated dog object and falls back to name-based emit
 * @param {Object} splineApp - The Spline application instance
 * @param {string} eventName - The event name to emit (e.g., 'mouseDown', 'mouseUp')
 * @param {Object} dogEventTarget - The dog object to emit events on
 * @returns {boolean} Whether the event was successfully emitted
 */
export function emitDogEvent(splineApp, eventName, dogEventTarget) {
  const target = dogEventTarget;
  const name = target?.name;
  let emitted = false;
  
  try {
    if (target && typeof target.emitEvent === 'function') {
      target.emitEvent(eventName);
      emitted = true;
      console.log(`🎯 emitEvent(${eventName}) on`, name);
    }
  } catch (e) {
    console.warn(`emitEvent(${eventName}) on object failed:`, e?.message);
  }
  
  if (!emitted && typeof splineApp.emitEvent === 'function' && name) {
    try {
      splineApp.emitEvent(eventName, name);
      emitted = true;
      console.log(`🎯 splineApp.emitEvent(${eventName}, ${name})`);
    } catch (e) {
      console.warn(`splineApp.emitEvent(${eventName}) failed:`, e?.message);
    }
  }
  
  return emitted;
}

/**
 * Normalize angles into [-PI, PI] range
 * @param {number} angle - The angle to normalize
 * @returns {number} Normalized angle
 */
export function normalizeAngle(angle) {
  let ang = angle;
  while (ang > Math.PI) ang -= Math.PI * 2;
  while (ang < -Math.PI) ang += Math.PI * 2;
  return ang;
}

/**
 * Find the dog object in the Spline scene
 * @param {Object} splineApp - The Spline application instance
 * @param {Array} allObjects - Array of all objects in the scene
 * @returns {Object|null} The dog object or null if not found
 */
export function findDogObject(splineApp, allObjects) {
  const shibainu =
    splineApp.findObjectByName('Shibainu') ||
    splineApp.findObjectByName('shibainu') ||
    splineApp.findObjectByName('Shibalnu') ||
    splineApp.findObjectByName('ShibaInu') ||
    allObjects.find(obj => obj.name && obj.name.toLowerCase().includes('shiba'));
  
  return shibainu || null;
}

