import { useState } from 'react';

export const useLoadingModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestStartTime, setRequestStartTime] = useState<number | null>(null);
  const [requestDescription, setRequestDescription] = useState('');
  const [responseData, setResponseData] = useState<any>(null);

  const startRequest = (description: string) => {
    setIsVisible(true);
    setIsLoading(true);
    setRequestStartTime(Date.now());
    setRequestDescription(description);
    setResponseData(null);
  };

  const completeRequest = (data: any) => {
    setIsLoading(false);
    setResponseData(data);
  };

  const closeModal = () => {
    setIsVisible(false);
    setIsLoading(false);
    setRequestStartTime(null);
    setRequestDescription('');
    setResponseData(null);
  };

  return {
    isVisible,
    isLoading,
    requestStartTime,
    requestDescription,
    responseData,
    startRequest,
    completeRequest,
    closeModal
  };
};
