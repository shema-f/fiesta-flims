/**
 * Storage layer public API.
 *
 * Import from `@/lib/storage` — never import a concrete provider directly.
 */

export * from './types';
export { storageManager } from './storage-manager';
export {
  getProvider,
  getConfiguredProviders,
  getProviderDefinition,
  listProviderDefinitions,
  PROVIDER_DEFINITIONS,
} from './provider-registry';
export type { ProviderDefinition } from './provider-registry';
