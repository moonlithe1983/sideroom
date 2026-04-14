import { AccessibilityInfo } from 'react-native';

export async function announceForAccessibility(message: string | null | undefined) {
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    return;
  }

  try {
    AccessibilityInfo.announceForAccessibility(trimmedMessage);
  } catch {
    // Accessibility announcements are best-effort and should never break the main flow.
  }
}
