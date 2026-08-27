"use client";

import { AmbientAudioProvider } from "@/context/AmbientAudioContext";
import { SplashScreen } from "@/components/SplashScreen";
import { SoundToggle } from "@/components/SoundToggle";

export function AudioShell({ children }: { children: React.ReactNode }) {
  return (
    <AmbientAudioProvider>
      <SplashScreen />
      <SoundToggle />
      {children}
    </AmbientAudioProvider>
  );
}
