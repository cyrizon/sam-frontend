import { polylineToGeoJSON } from './polyline';

export function parseRouteToGeoJSON(data: any): any | null {
  if (data.routes && data.routes[0] && typeof data.routes[0].geometry === "string") {
    return polylineToGeoJSON(data.routes[0].geometry);
  } else if (data.geometry && typeof data.geometry === "string") {
    return polylineToGeoJSON(data.geometry);
  } else if (data.type === "Feature" || data.type === "FeatureCollection") {
    return data;
  }
  return null;
}