"use client";

import { useAmbientAudio } from "@/context/AmbientAudioContext";

export function SoundToggle() {
  const { isPlaying, toggle, isReady } = useAmbientAudio();

  if (!isReady) return null;

  return (
    <button
      onClick={toggle}
      className="sound-toggle"
      aria-label={isPlaying ? "Mute sound" : "Unmute sound"}
    >
      {isPlaying ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
    </button>
  );
}
