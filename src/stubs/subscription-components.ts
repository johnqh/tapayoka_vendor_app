import React from 'react';
export const SubscriptionLayout = () => null;
export const SubscriptionTile = () => null;
export const SegmentedControl = () => null;
export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);
export const useSubscriptionContext = () => ({
  subscription: null,
  isLoading: false,
  error: null,
  offerings: null,
  purchasePackage: async () => {},
  restorePurchases: async () => {},
});
