// Fonction pour appeler l'endpoint /api/hello
export const fetchHello = async (): Promise<string> => {
    return fetch("/api/hello").then(
        res => res.json()
    ).then(
        data => data.message
    ).catch(
        error => `Erreur lors de l'appel à /api/hello: ${error}`
    );
};

// Fonction pour appeler l'endpoint /api/mokeroute
export const fetchMockRoute = async (): Promise<any> => {
    return fetch("/api/mokeroute").then(
        res => res.json()
    ).then(
        data => data
    ).catch(
        error => `Erreur lors de l'appel à /api/mokeroute: ${error}`
    );
}

// Fonction pour appeler l'endpoint /api/tolls
export const fetchTolls = async (mockData: any): Promise<any> => {
    try {
        const response = await fetch("/api/tolls", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(mockData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        return `Erreur lors de l'appel à /api/tolls: ${error}`;
    }
};
