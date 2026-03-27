import { BootScreen } from '@/components/boot-screen';

export default function AuthCallbackScreen() {
  return (
    <BootScreen
      body="SideRoom is validating the secure auth response and restoring your session."
      eyebrow="Finishing Sign-In"
      title="Completing secure sign-in"
    />
  );
}
