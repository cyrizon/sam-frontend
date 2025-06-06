import { polylineToGeoJSON } from './polyline';

export function parseRouteToGeoJSON(data: any): any[] | any | null {
  // Si c'est la réponse globale ORS (avec plusieurs routes)
  if (data && data.routes && Array.isArray(data.routes)) {
    return data.routes.map((route: any) => {
      if (route && typeof route.geometry === "string") {
        return polylineToGeoJSON(route.geometry);
      }
      if (route && (route.type === "Feature" || route.type === "FeatureCollection")) {
        return route;
      }
      return null;
    }).filter(Boolean); // retire les null
  }
  // Si c'est un objet route ORS (avec geometry sous forme de string)
  if (data && typeof data.geometry === "string") {
    return polylineToGeoJSON(data.geometry);
  }
  // Si c'est déjà du GeoJSON
  if (data && (data.type === "Feature" || data.type === "FeatureCollection")) {
    return data;
  }
  return null;
}