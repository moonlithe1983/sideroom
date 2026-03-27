import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryStore = new Map<string, string>();
const KEY_PREFIX = 'sideroom.secure.';
const KEYCHAIN_SERVICE = 'sideroom.private-data';

type VaultMode = 'session' | 'protected';

function getScopedKey(key: string) {
  return `${KEY_PREFIX}${key}`;
}

function getSecureStoreOptions(mode: VaultMode): SecureStore.SecureStoreOptions {
  return {
    keychainService: KEYCHAIN_SERVICE,
    requireAuthentication: mode === 'protected',
    authenticationPrompt: 'Authenticate to access private SideRoom data.',
  };
}

export async function isSecureVaultAvailableAsync() {
  if (Platform.OS === 'web') {
    return false;
  }

  return SecureStore.isAvailableAsync().catch(() => false);
}

export async function setSecureItemAsync(key: string, value: string, mode: VaultMode = 'session') {
  const scopedKey = getScopedKey(key);

  if (!(await isSecureVaultAvailableAsync())) {
    memoryStore.set(scopedKey, value);
    return;
  }

  await SecureStore.setItemAsync(scopedKey, value, getSecureStoreOptions(mode));
}

export async function getSecureItemAsync(key: string, mode: VaultMode = 'session') {
  const scopedKey = getScopedKey(key);

  if (!(await isSecureVaultAvailableAsync())) {
    return memoryStore.get(scopedKey) ?? null;
  }

  try {
    return await SecureStore.getItemAsync(scopedKey, getSecureStoreOptions(mode));
  } catch {
    return null;
  }
}

export async function deleteSecureItemAsync(key: string, mode: VaultMode = 'session') {
  const scopedKey = getScopedKey(key);

  memoryStore.delete(scopedKey);

  if (!(await isSecureVaultAvailableAsync())) {
    return;
  }

  await SecureStore.deleteItemAsync(scopedKey, getSecureStoreOptions(mode));
}

export async function setSecureJsonAsync<T>(key: string, value: T, mode: VaultMode = 'session') {
  await setSecureItemAsync(key, JSON.stringify(value), mode);
}

export async function getSecureJsonAsync<T>(key: string, mode: VaultMode = 'session') {
  const rawValue = await getSecureItemAsync(key, mode);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}
