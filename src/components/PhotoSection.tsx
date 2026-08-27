"use client";

import { useState, useEffect, useRef } from "react";
import type { Photo, Perception } from "@/lib/types";
import { PerceptionButton } from "./PerceptionButton";
import { PerceptionModal } from "./PerceptionModal";
import { ImageZoomViewer } from "./ImageZoomViewer";
import { Caption } from "./Caption";
import { ScrollReveal } from "./ScrollReveal";
import { BreathingImage } from "./BreathingImage";
import { fetchPerceptions } from "@/lib/api";

interface PhotoSectionProps {
  photo: Photo;
  sectionNumber?: number;
}

export function PhotoSection({ photo, sectionNumber }: PhotoSectionProps) {
  const [perceptionOpen, setPerceptionOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [perceptions, setPerceptions] = useState<Perception[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchPerceptions(photo.id)
      .then(setPerceptions)
      .catch(() => {});
  }, [photo.id]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, [photo.image_url]);

  const formatted =
    sectionNumber !== undefined ? String(sectionNumber).padStart(2, "0") : null;

  return (
    <>
      <div className="photo-box">
        {/* Section number — positioned relative to the box */}
        {formatted && (
          <div className="photo-box-number">
            <span className="section-number">{formatted}</span>
          </div>
        )}

        {/* Image — click to open fullscreen zoom */}
        <ScrollReveal delay={100} duration={900} style="fadeUp">
          <BreathingImage>
            <div
              className="photo-box-image photo-box-image-clickable"
              onClick={() => setZoomOpen(true)}
            >
              {photo.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={imgRef}
                  src={photo.image_url}
                  alt={photo.title}
                  className="photo-box-img"
                  onLoad={() => setImageLoaded(true)}
                  style={{ opacity: imageLoaded ? 1 : 0, transition: "opacity 0.3s ease" }}
                />
              ) : (
                <div
                  className="w-full flex items-center justify-center"
                  style={{ backgroundColor: "#EDE5D4", padding: "4rem 2rem" }}
                >
                  <div className="text-center">
                    <div
                      className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{ border: "1px solid rgba(50,32,20,0.12)" }}
                    >
                      <span
                        className="t-h3"
                        style={{
                          color: "rgba(50,32,20,0.2)",
                          fontFamily: "var(--font-display-face), DM Serif Display, Georgia, serif",
                        }}
                      >
                        {formatted || photo.id}
                      </span>
                    </div>
                    <p className="t-caption" style={{ color: "rgba(50,32,20,0.25)" }}>
                      {photo.category}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </BreathingImage>
        </ScrollReveal>

        {/* Caption */}
        <ScrollReveal delay={200} duration={700} style="fadeUp">
          <div className="photo-box-caption">
            <p className="t-h4 mb-1">{photo.title}</p>
            <Caption location={photo.location} date={photo.created_at} />
          </div>
        </ScrollReveal>

        {/* Perceptions button */}
        <ScrollReveal delay={300} duration={600} style="fadeUp">
          <PerceptionButton
            count={perceptions.length}
            onClick={() => setPerceptionOpen(true)}
          />
        </ScrollReveal>
      </div>

      {/* Perception modal */}
      <PerceptionModal
        isOpen={perceptionOpen}
        onClose={() => {
          setPerceptionOpen(false);
          fetchPerceptions(photo.id)
            .then(setPerceptions)
            .catch(() => {});
        }}
        photo={photo}
        sectionNumber={formatted}
        perceptions={perceptions}
      />

      {/* Image zoom viewer */}
      <ImageZoomViewer
        isOpen={zoomOpen}
        onClose={() => setZoomOpen(false)}
        imageUrl={photo.image_url}
        sectionNumber={formatted}
        photoTitle={photo.title}
        photoCategory={photo.category}
      />
    </>
  );
}
