"use client";

import { useEffect, useState } from "react";
import { PhotoSection } from "@/components/PhotoSection";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Photo } from "@/lib/types";
import { fetchPhotos } from "@/lib/api";

export default function PerceptionsArchivePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchPhotos().then(setPhotos).catch(() => {});
  }, []);

  useEffect(() => {
    const container = document.querySelector(".right-scroll-h");
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const panelWidth = container.clientWidth;
      const idx = Math.round(scrollLeft / panelWidth);
      setActiveIndex(idx);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const totalPanels = photos.length + 1;

  return (
    <div className="gallery-track">
      {/* Intro */}
      <div className="text-panel">
        <ScrollReveal delay={0} duration={800} style="fadeUp">
          <div>
            <p className="t-caption mb-6" style={{ color: "#756E6B", letterSpacing: "0.12em" }}>
              PERCEPTIONS
            </p>
            <h1 className="t-h1 mb-8">A Collective Archive</h1>
            <p className="t-p2 max-w-md" style={{ color: "#756E6B" }}>
              Browse the photographs and the anonymous perceptions attached to
              each one. Every response is unedited, unattributed, and part of
              the work.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Photos */}
      {photos.map((photo, i) => (
        <PhotoSection
          key={photo.id}
          photo={photo}
          sectionNumber={i + 1}
        />
      ))}

      <div className="scroll-indicator">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPanels }).map((_, i) => (
            <div
              key={i}
              className={`scroll-indicator-dot ${i === activeIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
