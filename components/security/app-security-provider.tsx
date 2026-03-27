import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

type SecuritySnapshot = {
  appLockEnabled: boolean;
  screenCaptureBlocked: boolean;
  secureStorageAvailable: boolean;
  strongBiometricsEnrolled: boolean;
  warnings: string[];
};

type AppSecurityContextValue = {
  isReady: boolean;
  isUnlocked: boolean;
  lastUnlockError: string | null;
  snapshot: SecuritySnapshot;
  unlockApp: () => Promise<boolean>;
};

const APP_SECURITY_KEY = 'sideroom.app-root';

const initialSnapshot: SecuritySnapshot = {
  appLockEnabled: false,
  screenCaptureBlocked: false,
  secureStorageAvailable: false,
  strongBiometricsEnrolled: false,
  warnings: [],
};

const AppSecurityContext = createContext<AppSecurityContextValue | null>(null);

function mapAuthenticationError(error?: LocalAuthentication.LocalAuthenticationError) {
  switch (error) {
    case 'lockout':
      return 'Biometrics are temporarily locked. Use your device passcode, then try again.';
    case 'not_enrolled':
    case 'passcode_not_set':
      return 'Enable a device passcode and strong biometrics before storing real personal data in this app.';
    case 'user_cancel':
    case 'system_cancel':
    case 'app_cancel':
      return 'Unlock was cancelled. Private content stays hidden until device authentication succeeds.';
    case 'authentication_failed':
      return 'Authentication failed. SideRoom stayed locked.';
    default:
      return 'SideRoom could not confirm device authentication.';
  }
}

export function AppSecurityProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(Platform.OS === 'web');
  const [lastUnlockError, setLastUnlockError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const authenticationInFlight = useRef(false);

  const initializeSecurity = useCallback(async () => {
    const warnings: string[] = [];

    const secureStorageAvailable = await SecureStore.isAvailableAsync().catch(() => false);
    const hasHardware =
      Platform.OS === 'web' ? false : await LocalAuthentication.hasHardwareAsync().catch(() => false);
    const isEnrolled = hasHardware
      ? await LocalAuthentication.isEnrolledAsync().catch(() => false)
      : false;
    const enrolledLevel = isEnrolled
      ? await LocalAuthentication.getEnrolledLevelAsync().catch(() => LocalAuthentication.SecurityLevel.NONE)
      : LocalAuthentication.SecurityLevel.NONE;
    const strongBiometricsEnrolled =
      enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;

    let screenCaptureBlocked = false;
    if (Platform.OS !== 'web') {
      screenCaptureBlocked = await ScreenCapture.preventScreenCaptureAsync(APP_SECURITY_KEY)
        .then(() => true)
        .catch(() => false);
    }

    if (!secureStorageAvailable) {
      warnings.push('Secure device storage is unavailable on this platform.');
    }

    if (Platform.OS !== 'web' && !strongBiometricsEnrolled) {
      warnings.push(
        'Strong biometrics are not enrolled yet, so the automatic relock gate cannot be fully enforced on this device.'
      );
    }

    if (Constants.appOwnership === 'expo') {
      warnings.push(
        'Protected storage should be re-verified in a development build because Expo Go has biometric limitations.'
      );
    }

    const appLockEnabled =
      Platform.OS !== 'web' && secureStorageAvailable && strongBiometricsEnrolled;

    setSnapshot({
      appLockEnabled,
      screenCaptureBlocked,
      secureStorageAvailable,
      strongBiometricsEnrolled,
      warnings,
    });
    setIsUnlocked(!appLockEnabled);
    setIsReady(true);
  }, []);

  const unlockApp = useCallback(async () => {
    if (!snapshot.appLockEnabled) {
      setIsUnlocked(true);
      return true;
    }

    if (authenticationInFlight.current) {
      return false;
    }

    authenticationInFlight.current = true;
    setLastUnlockError(null);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        biometricsSecurityLevel: 'strong',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use device passcode',
        promptDescription: 'Confirm device ownership before accessing private SideRoom data.',
        promptMessage: 'Unlock SideRoom',
        requireConfirmation: false,
      });

      if (result.success) {
        setIsUnlocked(true);
        return true;
      }

      setLastUnlockError(mapAuthenticationError(result.error));
      return false;
    } catch {
      setLastUnlockError('SideRoom could not start the authentication prompt.');
      return false;
    } finally {
      authenticationInFlight.current = false;
    }
  }, [snapshot.appLockEnabled]);

  useEffect(() => {
    void initializeSecurity();

    return () => {
      if (Platform.OS !== 'web') {
        void ScreenCapture.allowScreenCaptureAsync(APP_SECURITY_KEY).catch(() => undefined);
      }
    };
  }, [initializeSecurity]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appState.current;
      appState.current = nextState;

      if (
        snapshot.appLockEnabled &&
        previousState === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        setIsUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, [snapshot.appLockEnabled]);

  useEffect(() => {
    if (!isReady || isUnlocked || !snapshot.appLockEnabled || appState.current !== 'active') {
      return;
    }

    void unlockApp();
  }, [isReady, isUnlocked, snapshot.appLockEnabled, unlockApp]);

  return (
    <AppSecurityContext.Provider
      value={{
        isReady,
        isUnlocked,
        lastUnlockError,
        snapshot,
        unlockApp,
      }}>
      {children}
    </AppSecurityContext.Provider>
  );
}

export function useAppSecurity() {
  const value = useContext(AppSecurityContext);

  if (!value) {
    throw new Error('useAppSecurity must be used inside AppSecurityProvider');
  }

  return value;
}
