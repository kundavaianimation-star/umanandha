"use client";

import { useEffect, useState } from "react";
import { PhotoSection } from "@/components/PhotoSection";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Photo } from "@/lib/types";

interface HomePageClientProps {
  photos: Photo[];
  siteContent: Record<string, string>;
}

export function HomePageClient({ photos, siteContent }: HomePageClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalPanels = photos.length + 1;

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

  const siteName = siteContent.site_name || "UMANANDA";
  const location = siteContent.location || "ASSAM";
  const date = siteContent.date || "23 · 08 · 2026";
  const heroTitle = siteContent.hero_title || "";
  const heroDescription = siteContent.hero_description || "";
  const heroImage = siteContent.hero_image_url || "";

  return (
    <div className="gallery-track">
      {/* Intro panel */}
      <div className="photo-box" style={{ flex: "0 0 60vw", maxWidth: "60vw" }}>
        <div className="photo-box-image">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={siteName}
              className="photo-box-img object-cover"
              style={{ maxHeight: "48vh" }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{
                background: "linear-gradient(160deg, #E8DDCA 0%, #DDD2BC 40%, #D4C8AE 100%)",
                minHeight: "220px",
              }}
            >
              <p
                className="t-display text-center px-8"
                style={{ color: "rgba(50,32,20,0.1)", fontSize: "clamp(2rem, 5vw, 4rem)" }}
              >
                UM A NAND A
              </p>
            </div>
          )}
        </div>
        <div className="photo-box-caption">
          <ScrollReveal delay={0} duration={700} style="fadeUp">
            <p className="t-caption mb-3" style={{ color: "#756E6B", letterSpacing: "0.12em" }}>
              {siteName}, {location}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100} duration={700} style="fadeUp">
            <p className="t-caption mb-5" style={{ color: "#756E6B", letterSpacing: "0.12em" }}>
              {date}
            </p>
          </ScrollReveal>
          {heroTitle && (
            <ScrollReveal delay={200} duration={900} style="fadeUp">
              <h2 className="t-display mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                {heroTitle}
              </h2>
            </ScrollReveal>
          )}
          {heroDescription && (
            <ScrollReveal delay={300} duration={900} style="fadeUp">
              <p className="t-p1" style={{ color: "#322014", maxWidth: "44ch" }}>
                {heroDescription}
              </p>
            </ScrollReveal>
          )}
        </div>
      </div>

      {/* Photos */}
      {photos.map((photo, i) => (
        <PhotoSection
          key={photo.id}
          photo={photo}
          sectionNumber={i + 1}
        />
      ))}

      {/* Scroll indicator */}
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
