import { useState, useMemo, type ReactNode } from 'react';
import type { NetworkClient, NetworkResponse, NetworkRequestOptions, Optional } from '@sudobility/types';
import { CONSTANTS } from '../config/constants';

export interface AuthUser {
  uid: string;
  email: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  networkClient: NetworkClient;
  baseUrl: string;
  signOut: () => void;
}

async function makeRequest<T>(
  url: string,
  options?: Optional<NetworkRequestOptions>
): Promise<NetworkResponse<T>> {
  const method = options?.method ?? 'GET';
  const body = options?.body as BodyInit | undefined;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body,
    signal: options?.signal,
  });

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let data: T | undefined;
  let error: string | undefined;

  try {
    const json = await response.json();
    if (response.ok) {
      data = json as T;
    } else {
      error = json.error || json.message || `HTTP ${response.status}`;
    }
  } catch {
    if (!response.ok) {
      error = `HTTP ${response.status}: ${response.statusText}`;
    }
  }

  return {
    success: response.ok,
    data,
    error,
    timestamp: new Date().toISOString(),
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers,
  };
}

const createNetworkClient = (): NetworkClient => ({
  request: <T,>(url: string, options?: Optional<NetworkRequestOptions>) =>
    makeRequest<T>(url, options),
  get: <T,>(url: string, options?: Optional<Omit<NetworkRequestOptions, 'method' | 'body'>>) =>
    makeRequest<T>(url, { ...options, method: 'GET' }),
  post: <T,>(url: string, body?: Optional<unknown>, options?: Optional<Omit<NetworkRequestOptions, 'method'>>) =>
    makeRequest<T>(url, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T,>(url: string, body?: Optional<unknown>, options?: Optional<Omit<NetworkRequestOptions, 'method'>>) =>
    makeRequest<T>(url, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T,>(url: string, options?: Optional<Omit<NetworkRequestOptions, 'method' | 'body'>>) =>
    makeRequest<T>(url, { ...options, method: 'DELETE' }),
});

import { AuthContext } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: Replace with real Firebase auth when available
  const [user] = useState<AuthUser | null>({ uid: 'stub-user', email: 'vendor@tapayoka.com' });
  const [token] = useState<string | null>('stub-token');
  const isReady = true; // TODO: Replace with real auth state tracking
  const networkClient = useMemo(() => createNetworkClient(), []);

  const signOut = () => {
    // TODO: Implement real sign out
    window.location.href = '/login';
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isReady,
    networkClient,
    baseUrl: CONSTANTS.API_BASE_URL,
    signOut,
  }), [user, token, isReady, networkClient]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

