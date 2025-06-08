// Utility to extract route steps (instructions) from both classic ORS and smart_route responses
// Handles both response formats and returns a flat array of steps

// Helper: recursively search for steps in any nested object
function findSteps(obj: any): any[] {
  if (!obj || typeof obj !== 'object') return [];
  // ORS classic: routes[0].segments[0].steps
  if (Array.isArray(obj.routes) && obj.routes[0]?.segments?.[0]?.steps) {
    return obj.routes[0].segments[0].steps;
  }
  // smart_route: route.features[0].properties.segments[0].steps
  if (obj.route?.features?.[0]?.properties?.segments?.[0]?.steps) {
    return obj.route.features[0].properties.segments[0].steps;
  }
  // Fallbacks
  if (obj.steps && Array.isArray(obj.steps)) {
    return obj.steps;
  }
  // Recursively search all object values
  for (const value of Object.values(obj)) {
    if (typeof value === 'object') {
      const found = findSteps(value);
      if (found.length > 0) return found;
    }
  }
  return [];
}

export function extractRouteSteps(routeData: any): any[] {
  return findSteps(routeData);
}

export default extractRouteSteps;
