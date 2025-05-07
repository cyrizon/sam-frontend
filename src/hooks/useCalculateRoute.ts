import { useState } from 'react';
import type { RouteData } from '../types/RouteData';

export const useCalculateRoute = (routesData: Record<string, RouteData>) => {
  const [customRoute, setCustomRoute] = useState<RouteData | null>(null);

  const calculateCustomRoute = (tolls: number): RouteData => {
    if (tolls === 0) return routesData.cheapest;
    if (tolls === 1) return routesData.light;
    if (tolls === 2) return routesData.moderate;
    if (tolls === 3) return routesData.heavy;
    if (tolls >= 4) return routesData.fastest;
    return routesData.moderate;
  };

  const handleCalculate = (tolls: number | null) => {
    const custom = tolls !== null ? calculateCustomRoute(tolls) : routesData.fastest;
    setCustomRoute(custom);
  };

  return { customRoute, handleCalculate };
};