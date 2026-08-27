"use client";

import { useAmbientAudio } from "@/context/AmbientAudioContext";

export function SplashScreen() {
  const { start, isReady } = useAmbientAudio();

  if (isReady) return null;

  const handleEnter = () => {
    start();
  };

  return (
    <div className="splash-overlay">
      <div className="splash-content">
        <h1
          className="t-display mb-3"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#F9F0E2" }}
        >
          UMANANDA
        </h1>
        <p
          className="t-caption mb-8"
          style={{ color: "#F9F0E2", opacity: 0.6, letterSpacing: "0.1em" }}
        >
          ASSAM
        </p>

        <button className="splash-enter-btn" onClick={handleEnter}>
          ENTER EXPERIENCE
        </button>

        <p
          className="t-caption mt-6"
          style={{ color: "#F9F0E2", opacity: 0.35 }}
        >
          🔊 SOUND ON
        </p>
      </div>
    </div>
  );
}
