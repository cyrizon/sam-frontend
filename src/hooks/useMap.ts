import { useEffect, useRef, useState } from 'react';

export const useMap = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapDetailsVisible, setMapDetailsVisible] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);

  const handleSelectRoute = (routeType: string) => {
    setSelectedRoute(routeType);
    setMapLoading(true);
    setMapDetailsVisible(false);
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedRoute) {
      const timer = setTimeout(() => {
        setMapLoading(false);
        setMapDetailsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedRoute]);

  return {
    selectedRoute,
    mapLoading,
    mapDetailsVisible,
    mapRef,
    handleSelectRoute,
  };
};