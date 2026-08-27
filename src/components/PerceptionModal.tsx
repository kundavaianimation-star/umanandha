"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Photo, Perception } from "@/lib/types";
import { PerceptionList } from "./PerceptionList";
import { submitPerception } from "@/lib/api";

interface PerceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: Photo;
  sectionNumber: string | null;
  perceptions: Perception[];
}

export function PerceptionModal({
  isOpen,
  onClose,
  photo,
  sectionNumber,
  perceptions,
}: PerceptionModalProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localPerceptions, setLocalPerceptions] = useState<Perception[]>([]);

  const allPerceptions = [...perceptions, ...localPerceptions];

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const rightPanel = document.querySelector(".right-scroll-h") as HTMLElement | null;
    const savedScroll = rightPanel ? rightPanel.scrollLeft : 0;

    document.body.style.overflow = "hidden";
    if (rightPanel) {
      rightPanel.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
      if (rightPanel) {
        rightPanel.style.overflow = "";
        rightPanel.scrollLeft = savedScroll;
      }
    };
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim() || submitting) return;

      setSubmitting(true);
      try {
        const newPerception = await submitPerception(photo.id, text.trim());
        setLocalPerceptions((prev) => [...prev, newPerception]);
        setText("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2500);
      } catch (err) {
        console.error("Failed to submit perception:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [text, photo.id, submitting]
  );

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="modal-close">
          &#x2715;
        </button>

        {/* Header */}
        <p
          className="t-caption mb-5"
          style={{ color: "#756E6B", letterSpacing: "0.12em" }}
        >
          PERCEPTIONS
        </p>

        {/* Mini thumbnail */}
        <div className="modal-thumb mb-5">
          {photo.image_url ? (
            <img
              src={photo.image_url}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: "#EDE5D4" }}
            >
              <span
                className="t-h3"
                style={{
                  color: "rgba(50,32,20,0.2)",
                  fontFamily: "var(--font-display-face), DM Serif Display, Georgia, serif",
                }}
              >
                {sectionNumber || photo.id}
              </span>
            </div>
          )}
        </div>

        {/* Photo context */}
        <p className="t-h4 mb-1">{photo.title}</p>
        <p className="t-caption mb-6" style={{ color: "#756E6B" }}>
          {photo.location}
          {sectionNumber ? ` · ${sectionNumber}` : ""}
        </p>

        {/* Divider */}
        <div className="mb-6" style={{ height: "1px", backgroundColor: "rgba(74,11,11,0.1)" }} />

        {/* Others saw */}
        <p
          className="t-caption mb-4"
          style={{ color: "#4A0B0B", letterSpacing: "0.1em" }}
        >
          OTHERS SAW
        </p>
        <div className="mb-8">
          {allPerceptions.length > 0 ? (
            <PerceptionList perceptions={allPerceptions} />
          ) : (
            <p className="t-p3" style={{ color: "#756E6B" }}>
              No perceptions yet. Be the first to share what you see.
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="mb-6" style={{ height: "1px", backgroundColor: "rgba(74,11,11,0.1)" }} />

        {/* Add perception */}
        <p
          className="t-caption mb-4"
          style={{ color: "#4A0B0B", letterSpacing: "0.1em" }}
        >
          WHAT DID YOU SEE?
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your perception..."
            rows={3}
            className="w-full bg-transparent px-4 py-3 t-p2 outline-none transition-colors resize-none placeholder:opacity-40"
            style={{
              color: "#4A0B0B",
              border: `1px solid ${text ? "#4A0B0B" : "rgba(74,11,11,0.15)"}`,
            }}
          />
          <div className="flex items-center gap-6 mt-3">
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="t-nav transition-opacity disabled:opacity-25"
              style={{ color: "#4A0B0B" }}
            >
              {submitting ? "SENDING..." : "SUBMIT"}
            </button>
            <span className="t-caption" style={{ color: "#756E6B" }}>
              anonymous
            </span>
            {submitted && (
              <span className="t-caption anim-fade-in" style={{ color: "#4BAF4F" }}>
                Thank you.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
