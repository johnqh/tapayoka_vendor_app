import React from 'react';
export const InfoBanner: React.FC = () => null;
export const initialize = () => {};
export const initializeWeb = () => {};
export const initializeFirebaseService = () => {};
export const registerServiceWorker = () => {};
export const unregisterServiceWorker = () => {};
export const getFirebaseService = () => ({
  analytics: { isSupported: () => false, logEvent: () => {}, setUserId: () => {} },
});
