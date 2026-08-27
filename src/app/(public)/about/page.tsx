"use client";

import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { fetchSiteContent } from "@/lib/api";

const PRINCIPLES = [
  {
    title: "Seeing",
    text: "Photographs are invitations. Each image opens a space for interpretation, memory, and emotional response.",
  },
  {
    title: "Collective Perception",
    text: "Anonymous perceptions build a polyphonic understanding of place — one that resists singular narratives.",
  },
  {
    title: "Sacred Geography",
    text: "Umananda sits at the confluence of river, island, temple, and city. A threshold space.",
  },
];

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const totalPanels = 5;

  useEffect(() => {
    fetchSiteContent().then(setSiteContent).catch(() => {});
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

  return (
    <div className="gallery-track">
      {/* Panel 1 — Intro */}
      <div className="text-panel">
        <ScrollReveal delay={0} duration={800} style="fadeUp">
          <div>
            <p className="t-caption mb-6" style={{ color: "#756E6B", letterSpacing: "0.12em" }}>
              ABOUT
            </p>
            <h1 className="t-display mb-10" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Umananda
            </h1>
            <p className="t-p1 max-w-2xl" style={{ color: "#322014" }}>
              {siteContent.about_text ||
                "Umananda Perceptions is a visual ethnography project exploring the Umananda Temple on Peacock Island, Assam."}
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Panel 2 — The Place */}
      <div className="text-panel">
        <ScrollReveal delay={0} duration={800} style="fadeUp">
          <div>
            <h2 className="t-h2 mb-8">The Place</h2>
            <div className="max-w-xl">
              <p className="t-p2 mb-5" style={{ color: "#322014" }}>
                Built in 1694 by Bar Phukan Garhganya Handique, the Umananda
                Temple stands on Peacock Island — the world&apos;s smallest
                inhabited river island — in the middle of the Brahmaputra River
                at Guwahati, Assam.
              </p>
              <p className="t-p2 mb-5" style={{ color: "#322014" }}>
                Dedicated to Lord Shiva, the temple was severely damaged in the
                great earthquake of 1897 and rebuilt. It continues to serve as
                an active place of worship and pilgrimage.
              </p>
              <p className="t-p2" style={{ color: "#322014" }}>
                The island is accessible by ferry from the Umananda Ghat. The
                crossing through the Brahmaputra forms an integral part of the
                experience.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Panel 3 — Map */}
      <div className="gallery-item" style={{ flex: "0 0 60vw", maxWidth: "60vw" }}>
        <div className="image-frame">
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "#EDE5D4" }}
          >
            <p className="t-caption" style={{ color: "rgba(50,32,20,0.3)" }}>
              MAP · PEACOCK ISLAND · BRAHMAPUTRA
            </p>
          </div>
        </div>
      </div>

      {/* Panel 4 — Methodology */}
      <div className="text-panel">
        <ScrollReveal delay={0} duration={800} style="fadeUp">
          <div>
            <h2 className="t-h2 mb-8">Methodology</h2>
            <div className="max-w-xl">
              <p className="t-p2 mb-5" style={{ color: "#322014" }}>
                Visual ethnography uses photography as a primary research tool
                in the study of culture. Unlike documentary photography, it
                opens spaces for interpretation rather than telling a definitive
                story.
              </p>
              <p className="t-p2 mb-5" style={{ color: "#322014" }}>
                This project combines photographic documentation with
                participatory perception-gathering. Visitors share anonymous
                responses, creating a collective map of how sacred space is
                perceived.
              </p>
              <p className="t-p2" style={{ color: "#322014" }}>
                The result is a layered, evolving document — a visual
                ethnography shaped by many eyes.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Panel 5 — Principles */}
      <div className="text-panel" style={{ flex: "0 0 75vw", maxWidth: "75vw" }}>
        <ScrollReveal delay={0} duration={800} style="fadeUp">
          <div>
            <h2 className="t-h2 mb-12">Principles</h2>
            <div className="principles-grid flex gap-16">
              {PRINCIPLES.map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 100} duration={700} style="fadeUp">
                  <div className="max-w-xs">
                    <h3 className="t-h4 mb-3">{item.title}</h3>
                    <p className="t-p2" style={{ color: "#756E6B" }}>
                      {item.text}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

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
