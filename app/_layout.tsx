import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AccountStatusScreen } from '@/components/auth/account-status-screen';
import { AuthProvider, useAppAuth } from '@/components/auth/auth-provider';
import { AuthScreen } from '@/components/auth/auth-screen';
import { MissingConfigScreen } from '@/components/auth/missing-config-screen';
import { OnboardingScreen } from '@/components/auth/onboarding-screen';
import { BootScreen } from '@/components/boot-screen';
import { AppSecurityProvider, useAppSecurity } from '@/components/security/app-security-provider';
import { SecurityGate } from '@/components/security/security-gate';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function buildNavigationTheme(colorScheme: 'light' | 'dark'): Theme {
  const palette = Colors[colorScheme];
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: palette.background,
      border: palette.border,
      card: palette.surface,
      notification: palette.danger,
      primary: palette.tint,
      text: palette.text,
    },
  };
}

function RootNavigator() {
  const security = useAppSecurity();
  const auth = useAppAuth();

  if (!security.isReady) {
    return <SecurityGate loading />;
  }

  if (auth.isHandlingAuthRedirect) {
    return (
      <BootScreen
        body="SideRoom is validating the secure auth callback and restoring the latest session."
        eyebrow="Finishing Sign-In"
        title="Completing secure sign-in"
      />
    );
  }

  if (auth.isLoading) {
    return (
      <BootScreen
        body="Verifying the encrypted auth session, loading the current user, and checking onboarding state."
        title="Checking your secure session"
      />
    );
  }

  const appContent = !auth.isConfigured ? (
    <MissingConfigScreen />
  ) : !auth.session ? (
    <AuthScreen />
  ) : auth.account?.status === 'suspended' || auth.account?.status === 'banned' ? (
    <AccountStatusScreen />
  ) : auth.needsOnboarding ? (
    <OnboardingScreen />
  ) : (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Safety' }} />
      <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />
      <Stack.Screen name="policies" options={{ title: 'Policies and Support' }} />
      <Stack.Screen name="trust" options={{ title: 'Trust Center' }} />
    </Stack>
  );

  return (
    <>
      {appContent}
      {!security.isUnlocked ? <SecurityGate /> : null}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemeProvider value={buildNavigationTheme(colorScheme)}>
      <AppSecurityProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </AppSecurityProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
