import AsyncStorage from '@react-native-async-storage/async-storage';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { Platform } from 'react-native';

const ENCRYPTION_KEY_STORAGE_KEY = 'sideroom.supabase.session-key';
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'sideroom.supabase.auth',
};

const webMemoryStorage = new Map<string, string>();

type EncryptedPayload = {
  ciphertext: string;
  counter: string;
  version: 1;
};

function getCryptoApi() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure random values are unavailable.');
  }

  return globalThis.crypto;
}

function getRandomBytes(length: number) {
  const bytes = new Uint8Array(length);
  getCryptoApi().getRandomValues(bytes);
  return bytes;
}

function encryptValue(keyHex: string, value: string) {
  const keyBytes = aesjs.utils.hex.toBytes(keyHex);
  const counterBytes = getRandomBytes(16);
  const cipher = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(counterBytes));
  const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

  const payload: EncryptedPayload = {
    ciphertext: aesjs.utils.hex.fromBytes(encryptedBytes),
    counter: aesjs.utils.hex.fromBytes(counterBytes),
    version: 1,
  };

  return JSON.stringify(payload);
}

function decryptValue(keyHex: string, payloadJson: string) {
  const payload = JSON.parse(payloadJson) as EncryptedPayload;
  const keyBytes = aesjs.utils.hex.toBytes(keyHex);
  const counterBytes = aesjs.utils.hex.toBytes(payload.counter);
  const encryptedBytes = aesjs.utils.hex.toBytes(payload.ciphertext);
  const cipher = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(counterBytes));
  const decryptedBytes = cipher.decrypt(encryptedBytes);

  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

async function getEncryptionKey() {
  if (Platform.OS === 'web') {
    const existingKey = webMemoryStorage.get(ENCRYPTION_KEY_STORAGE_KEY);

    if (existingKey) {
      return existingKey;
    }

    const generatedKey = aesjs.utils.hex.fromBytes(getRandomBytes(32));
    webMemoryStorage.set(ENCRYPTION_KEY_STORAGE_KEY, generatedKey);
    return generatedKey;
  }

  const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE_KEY, SECURE_STORE_OPTIONS);

  if (existingKey) {
    return existingKey;
  }

  const generatedKey = aesjs.utils.hex.fromBytes(getRandomBytes(32));
  await SecureStore.setItemAsync(ENCRYPTION_KEY_STORAGE_KEY, generatedKey, SECURE_STORE_OPTIONS);
  return generatedKey;
}

export const encryptedAuthStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return webMemoryStorage.get(key) ?? null;
    }

    const encryptedValue = await AsyncStorage.getItem(key);

    if (!encryptedValue) {
      return null;
    }

    try {
      const encryptionKey = await getEncryptionKey();
      return decryptValue(encryptionKey, encryptedValue);
    } catch {
      await AsyncStorage.removeItem(key);
      return null;
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      webMemoryStorage.delete(key);
      return;
    }

    await AsyncStorage.removeItem(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      webMemoryStorage.set(key, value);
      return;
    }

    const encryptionKey = await getEncryptionKey();
    const encryptedValue = encryptValue(encryptionKey, value);
    await AsyncStorage.setItem(key, encryptedValue);
  },
};
