import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { encryptedAuthStorage } from '@/lib/supabase/auth-storage';
import type { Database } from '@/types/database';

type SupabaseConfig = {
  isConfigured: boolean;
  missingVariables: string[];
  publishableKey: string;
  url: string;
};

function readSupabaseConfig(): SupabaseConfig {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const publishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    '';

  const missingVariables: string[] = [];

  if (!url) {
    missingVariables.push('EXPO_PUBLIC_SUPABASE_URL');
  }

  if (!publishableKey) {
    missingVariables.push('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return {
    isConfigured: missingVariables.length === 0,
    missingVariables,
    publishableKey,
    url,
  };
}

export const supabaseConfig = readSupabaseConfig();

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (!supabaseConfig.isConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        persistSession: true,
        storage: encryptedAuthStorage,
        storageKey: 'sideroom.auth.session',
      },
      global: {
        headers: {
          'X-SideRoom-Client': 'mobile-mvp',
        },
      },
    });
  }

  return supabaseClient;
}
