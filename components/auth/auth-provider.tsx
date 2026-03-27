import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { type AuthSession, type AuthUser } from '@supabase/supabase-js';
import {
  createContext,
  startTransition,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getSupabaseClient, supabaseConfig } from '@/lib/supabase/client';
import type { TableRow } from '@/types/database';

type AppAccount = TableRow<'users'> | null;
type AppProfile = TableRow<'user_profiles'> | null;
type AppTopic = Pick<TableRow<'topics'>, 'id' | 'name' | 'slug' | 'description'>;

type CompleteOnboardingInput = {
  handle: string;
  topicIds: string[];
};

type SupportedAuthProvider = 'google';

type AuthContextValue = {
  account: AppAccount;
  authError: string | null;
  completeOnboarding: (input: CompleteOnboardingInput) => Promise<boolean>;
  isConfigured: boolean;
  isHandlingAuthRedirect: boolean;
  isLoading: boolean;
  isStaff: boolean;
  lastMagicLinkEmail: string | null;
  missingEnv: string[];
  needsOnboarding: boolean;
  notice: string | null;
  profile: AppProfile;
  session: AuthSession | null;
  signInWithMagicLink: (email: string) => Promise<boolean>;
  signInWithProvider: (provider: SupportedAuthProvider) => Promise<boolean>;
  signOut: () => Promise<void>;
  topics: AppTopic[];
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_REDIRECT_URL = 'sideroom://auth/callback';

WebBrowser.maybeCompleteAuthSession();

function getQueryParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getParsedPath(parsedUrl: ReturnType<typeof Linking.parse>) {
  return [parsedUrl.hostname, parsedUrl.path]
    .filter((segment): segment is string => Boolean(segment))
    .join('/')
    .replace(/^\/+|\/+$/g, '');
}

function getProviderLabel() {
  return 'Google';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const supabase = getSupabaseClient();
  const handledAuthCodeRef = useRef<string | null>(null);
  const pendingAuthCodeRef = useRef<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [account, setAccount] = useState<AppAccount>(null);
  const [profile, setProfile] = useState<AppProfile>(null);
  const [topics, setTopics] = useState<AppTopic[]>([]);
  const [isHandlingAuthRedirect, setIsHandlingAuthRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastMagicLinkEmail, setLastMagicLinkEmail] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    if (!supabase) {
      startTransition(() => {
        setTopics([]);
      });
      return;
    }

    const { data, error } = await supabase
      .from('topics')
      .select('id, name, slug, description')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      setAuthError(error.message);
      return;
    }

    startTransition(() => {
      setTopics(data ?? []);
    });
  }, [supabase]);

  const loadUserContext = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const {
      data: { session: storedSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setAuthError(sessionError.message);
    }

    if (!storedSession) {
      startTransition(() => {
        setSession(null);
        setUser(null);
        setAccount(null);
        setProfile(null);
      });
      await loadTopics();
      setIsLoading(false);
      return;
    }

    const [{ data: userData, error: userError }, accountResult, profileResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('users')
        .select(
          'id, email, auth_provider, status, role, disclaimer_accepted_at, onboarding_completed_at, last_seen_at, created_at, updated_at'
        )
        .eq('id', storedSession.user.id)
        .maybeSingle(),
      supabase
        .from('user_profiles')
        .select('user_id, handle, bio, created_at, updated_at')
        .eq('user_id', storedSession.user.id)
        .maybeSingle(),
    ]);

    if (userError) {
      setAuthError(userError.message);
      await supabase.auth.signOut();
      startTransition(() => {
        setSession(null);
        setUser(null);
        setAccount(null);
        setProfile(null);
      });
      setIsLoading(false);
      return;
    }

    if (accountResult.error) {
      setAuthError(accountResult.error.message);
    }

    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      setAuthError(profileResult.error.message);
    }

    await loadTopics();
    void supabase.rpc('touch_last_seen').then(() => undefined);

    startTransition(() => {
      setSession(storedSession);
      setUser(userData.user ?? null);
      setAccount(accountResult.data ?? null);
      setProfile(profileResult.data ?? null);
    });
    setIsLoading(false);
  }, [loadTopics, supabase]);

  const handleAuthCallbackUrl = useCallback(
    async (url: string | null) => {
      if (!supabase || !url) {
        return;
      }

      const parsedUrl = Linking.parse(url);
      const parsedPath = getParsedPath(parsedUrl);

      if (parsedPath !== 'auth/callback') {
        return;
      }

      setIsHandlingAuthRedirect(true);

      const authCode = getQueryParamValue(parsedUrl.queryParams?.code);
      const errorDescription =
        getQueryParamValue(parsedUrl.queryParams?.error_description) ??
        getQueryParamValue(parsedUrl.queryParams?.error);

      try {
        if (errorDescription) {
          setAuthError(errorDescription);
          return;
        }

        if (!authCode) {
          return;
        }

        if (handledAuthCodeRef.current === authCode || pendingAuthCodeRef.current === authCode) {
          return;
        }

        pendingAuthCodeRef.current = authCode;

        const { error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (error) {
          setAuthError(error.message);
          return;
        }

        handledAuthCodeRef.current = authCode;
        setNotice('Authentication completed. SideRoom signed you in securely.');
        await loadUserContext();
      } finally {
        pendingAuthCodeRef.current = null;
        setIsHandlingAuthRedirect(false);
      }
    },
    [loadUserContext, supabase]
  );

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    void loadUserContext();

    const authSubscription = supabase.auth.onAuthStateChange((_event, nextSession) => {
      startTransition(() => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        if (!nextSession) {
          setAccount(null);
          setProfile(null);
        }
      });
    });

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthCallbackUrl(url);
    });

    void Linking.getInitialURL().then((url) => handleAuthCallbackUrl(url));

    return () => {
      authSubscription.data.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [handleAuthCallbackUrl, loadUserContext, supabase]);

  const sessionToken = session?.access_token ?? null;

  useEffect(() => {
    if (!sessionToken || !supabase) {
      return;
    }

    void loadUserContext();
  }, [loadUserContext, sessionToken, supabase]);

  const signInWithMagicLink = useCallback(
    async (email: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!supabase) {
        setAuthError('Supabase is not configured yet.');
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setAuthError('Enter a valid email address.');
        return false;
      }

      setAuthError(null);
      setNotice(null);

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: AUTH_REDIRECT_URL,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setAuthError(error.message);
        return false;
      }

      setLastMagicLinkEmail(normalizedEmail);
      setNotice(`Check ${normalizedEmail} for your secure sign-in link.`);
      return true;
    },
    [supabase]
  );

  const signInWithProvider = useCallback(
    async (provider: SupportedAuthProvider) => {
      if (!supabase) {
        setAuthError('Supabase is not configured yet.');
        return false;
      }

      const providerLabel = getProviderLabel();

      setAuthError(null);
      setNotice(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: AUTH_REDIRECT_URL,
          skipBrowserRedirect: true,
          queryParams:
            provider === 'google'
              ? {
                  access_type: 'offline',
                  prompt: 'consent',
                }
              : undefined,
        },
      });

      if (error) {
        setAuthError(error.message);
        return false;
      }

      if (!data?.url) {
        setAuthError(`${providerLabel} sign-in could not start.`);
        return false;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, AUTH_REDIRECT_URL);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setNotice(`${providerLabel} sign-in was canceled.`);
        return false;
      }

      if (result.type !== 'success' || !result.url) {
        setAuthError(`${providerLabel} sign-in did not finish correctly.`);
        return false;
      }

      await handleAuthCallbackUrl(result.url);
      return true;
    },
    [handleAuthCallbackUrl, supabase]
  );

  const completeOnboarding = useCallback(
    async ({ handle, topicIds }: CompleteOnboardingInput) => {
      if (!supabase) {
        setAuthError('Supabase is not configured yet.');
        return false;
      }

      const normalizedHandle = handle.trim().toLowerCase();
      const uniqueTopicIds = Array.from(new Set(topicIds));

      setAuthError(null);
      setNotice(null);

      const { error } = await supabase.rpc('complete_onboarding', {
        input_handle: normalizedHandle,
        input_topic_ids: uniqueTopicIds,
      });

      if (error) {
        setAuthError(error.message);
        return false;
      }

      setNotice('Onboarding completed. Your private account and public handle are ready.');
      await loadUserContext();
      return true;
    },
    [loadUserContext, supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    setAuthError(null);
    setNotice(null);
    await supabase.auth.signOut();
    startTransition(() => {
      setSession(null);
      setUser(null);
      setAccount(null);
      setProfile(null);
    });
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      authError,
      completeOnboarding,
      isConfigured: supabaseConfig.isConfigured,
      isHandlingAuthRedirect,
      isLoading,
      isStaff: account?.role === 'moderator' || account?.role === 'admin',
      lastMagicLinkEmail,
      missingEnv: supabaseConfig.missingVariables,
      needsOnboarding:
        Boolean(session) &&
        (!account?.onboarding_completed_at || !profile?.handle || !account?.disclaimer_accepted_at),
      notice,
      profile,
      session,
      signInWithMagicLink,
      signInWithProvider,
      signOut,
      topics,
      user,
    }),
    [
      account,
      authError,
      completeOnboarding,
      isHandlingAuthRedirect,
      isLoading,
      lastMagicLinkEmail,
      notice,
      profile,
      session,
      signInWithMagicLink,
      signInWithProvider,
      signOut,
      topics,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAppAuth must be used inside AuthProvider');
  }

  return value;
}
