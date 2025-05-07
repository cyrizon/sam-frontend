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