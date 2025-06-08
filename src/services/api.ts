// Fonction pour appeler l'endpoint /api/hello
export const fetchHello = async (): Promise<string> => {
    return apiFetch<string>("/api/hello");
};

// Fonction pour appeler l'endpoint /api/mokeroute
export const fetchMockRoute = async (): Promise<any> => {
    return apiFetch<any>("/api/mokeroute");
};

// Fonction pour appeler l'endpoint /api/route (POST uniquement)
export const fetchRoute = async (
  coordinates: [number, number][]
): Promise<any> => {
  return apiFetch<any>("/api/route/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coordinates }),
  });
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
    console.log("Sending data to /api/tolls:", dataToSend);
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

// Fonction pour appeler l'endpoint /api/smart-route/tolls
export const fetchSmartRouteTolls = async (
    coordinates: [number, number][],
    max_tolls: number = 2,
    vehicle_class: string = "c1"
): Promise<any> => {
    return apiFetch<any>("/api/smart-route/tolls", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordinates,
            max_tolls,
            vehicle_class
        }),
    });
};

// Fonction pour appeler l'endpoint /api/smart-route/budget
export const fetchSmartRouteBudget = async (
    coordinates: [number, number][],
    max_price?: number,
    max_price_percent?: number,
    vehicle_class: string = "c1"
): Promise<any> => {
    return apiFetch<any>("/api/smart-route/budget", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordinates,
            max_price,
            max_price_percent,
            vehicle_class
        }),
    });
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
