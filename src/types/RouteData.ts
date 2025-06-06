export type Duration = {
    hours: number;
    minutes: number
};
export type RouteData = {
    name: string;
    distance: number;
    duration: Duration;
    cost: number;
    tolls: number;
    color: string;
    icon: string
};
