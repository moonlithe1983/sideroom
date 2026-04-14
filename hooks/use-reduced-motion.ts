import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotionEnabled(enabled);
        }
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReduceMotionEnabled(enabled);
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
}
