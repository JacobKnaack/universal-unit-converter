/**
 * Calculates the distance from an element to the edges of the screen/viewport.
 * @param {HTMLElement} element - The target DOM element.
 * @returns {Object} An object containing pixel distances to the top, bottom, left, and right edges.
 */
function getWindowDistance(element) {
  if (!element) return null;

  // Get element's current position relative to the viewport
  const rect = element.getBoundingClientRect();

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    // Distance from top of element to top of viewport
    top: Math.max(0, rect.top),

    // Distance from left of element to left of viewport
    left: Math.max(0, rect.left),

    // Distance from bottom of element to bottom of viewport
    bottom: Math.max(0, viewportHeight - rect.bottom),

    // Distance from right of element to right of viewport
    right: Math.max(0, viewportWidth - rect.right)
  };
}

export default getWindowDistance;