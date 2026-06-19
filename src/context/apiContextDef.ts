/**
 * App-local `useApi`.
 *
 * Delegates everything (baseUrl, token, userId, isReady, refreshToken, …) to
 * building_blocks' ApiProvider, but overrides `networkClient` with auth_lib's
 * `useFirebaseAuthNetworkClient` so the whole app standardizes on that client.
 *
 * Mirrors sudojo_app's `apiContextDef` indirection: every consumer imports
 * `useApi` from here instead of directly from building_blocks, so the network
 * client can be swapped in one place.
 */
import {
  useApi as useBuildingBlocksApi,
  type ApiContextValue,
} from '@sudobility/building_blocks/firebase';
import { useFirebaseAuthNetworkClient } from '@sudobility/auth_lib';

export type { ApiContextValue };

export function useApi(): ApiContextValue {
  const api = useBuildingBlocksApi();
  const networkClient = useFirebaseAuthNetworkClient();
  return { ...api, networkClient };
}
