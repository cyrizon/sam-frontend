import polyline from '@mapbox/polyline';

export function polylineToGeoJSON(encoded: string) {
  const coordinates = polyline.decode(encoded).map(([lat, lon]) => [lon, lat]);
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {},
  };
}