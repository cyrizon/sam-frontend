// Fonction pour appeler l'endpoint /api/hello
export const fetchHello = async (): Promise<string> => {
    return apiFetch<string>("/api/hello");
};

// Fonction pour appeler l'endpoint /api/mokeroute
export const fetchMockRoute = async (): Promise<any> => {
    return apiFetch<any>("/api/mokeroute");
};

// Fonction pour appeler l'endpoint /api/route
export const fetchRoute = async (
    start: [number, number],
    end: [number, number],
) : Promise<any> => {
    const startStr = `${start[0]},${start[1]}`;
    const endStr = `${end[0]},${end[1]}`;
    return apiFetch<any>(`/api/route?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`);
};

export const fetchRouteTollFree = async (
  coordinates: [number, number][]
): Promise<any> => {
  return apiFetch<any>("/api/route/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coordinates,
      options: { avoid_features: ["tollways"] }
    }),
  });
};

// Fonction pour appeler l'endpoint /api/tolls
export const fetchTolls = async (mockData: any): Promise<any> => {
    // Toujours envoyer un tableau de GeoJSON
    const dataToSend = Array.isArray(mockData) ? mockData : [mockData];
    return apiFetch<any>("/api/tolls", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
    });
};

// Fonction pour appeler l'endpoint /api/test-ors
export const fetchORSRoute = async (): Promise<any> => {
    return apiFetch<any>("/api/test-ors");
};

// Fonction pour appeler l'endpoint /api/test-ors-post
export const fetchORSRoutePost = async (): Promise<any> => {
    return apiFetch<any>("/api/test-ors-post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: "{}",
    });
};

// Fonction pour appeler l'endpoint /api/smart-route
export const fetchSmartRoute = async (): Promise<any> => {
    return apiFetch<any>("/api/smart-route", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordinates: [
                [7.448595, 48.262004],
                [5.037793, 47.317743]
            ],
            max_tolls: 99,
            vehicle_class: "c1"
        }),
    }
    );
};


// Fonction pour appeler l'endpoint /api/geocode/search
export const geocodeSearch = async (text: string): Promise<any> => {
    return apiFetch<any>(`/api/geocode/search?text=${encodeURIComponent(text)}`);
};

// Fonction pour appeler l'endpoint /api/geocode/autocomplete
export const geocodeAutocomplete = async (text: string): Promise<any> => {
    return apiFetch<any>(`/api/geocode/autocomplete?text=${encodeURIComponent(text)}`);
};

// Fonction générique pour appeler les endpoints
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    try {
        const response = await fetch(input, init);
        if (!response.ok) {
            // Essaye de parser l'erreur retournée par le backend
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: response.statusText };
            }
            throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        // Ici tu peux logger, envoyer à Sentry, etc.
        throw new Error(error.message || "Erreur réseau");
    }
};
