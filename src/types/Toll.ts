export type Toll = {
  id: string;
  nom: string;
  autoroute: string;
  longitude: number;
  latitude: number;
  operator?: string;
  type?: string; // 'ouvert' | 'fermé'
  distance_route?: number;
};