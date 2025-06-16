import { useState, useEffect } from 'react';

interface LoadingModalProps {
  isVisible: boolean;
  isLoading: boolean;
  requestStartTime: number | null;
  requestDescription: string;
  responseData: any;
  onClose: () => void;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isVisible,
  isLoading,
  requestStartTime,
  requestDescription,
  responseData,
  onClose
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Timer pour calculer le temps écoulé
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading && requestStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - requestStartTime);
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, requestStartTime]);

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Titre */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isLoading ? "Requête en cours..." : "Requête terminée"}
          </h3>

          {/* Description de la requête */}
          <p className="text-sm text-gray-600 mb-4">
            {requestDescription}
          </p>

          {/* Loader circulaire ou temps écoulé */}
          <div className="flex items-center justify-center mb-6">
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-lg font-mono text-blue-600">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg font-mono text-green-600">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
          </div>

          {/* Récapitulatif quand la requête est terminée */}
          {!isLoading && (
            <div className="border-t pt-4">
              <div className="text-left">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Détails de la réponse</span>
                  <svg 
                    className={`h-4 w-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDetails && (
                  <div className="mt-3">
                    <div className="bg-gray-100 rounded p-3 text-xs">
                      <div className="mb-2">
                        <strong>Temps de réponse:</strong> {formatTime(elapsedTime)}
                      </div>
                      <div className="mb-2">
                        <strong>Status:</strong> {responseData ? 'Succès' : 'Erreur'}
                      </div>
                      <div>
                        <strong>Réponse JSON:</strong>
                        <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto max-h-32 border">
                          {JSON.stringify(responseData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton de fermeture (uniquement quand terminé) */}
              <button
                onClick={onClose}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors flex items-center justify-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
