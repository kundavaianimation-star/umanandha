"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface ImageZoomViewerProps {
  isOpen: boolean;
  onClose: () => void;
  photoId: string;
  sectionNumber: string | null;
  photoTitle: string;
  photoCategory: string;
}

export function ImageZoomViewer({
  isOpen,
  onClose,
  sectionNumber,
  photoTitle,
  photoCategory,
}: ImageZoomViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const rightPanel = document.querySelector(".right-scroll-h") as HTMLElement | null;
    const savedScroll = rightPanel ? rightPanel.scrollLeft : 0;

    document.body.style.overflow = "hidden";
    if (rightPanel) rightPanel.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      if (rightPanel) {
        rightPanel.style.overflow = "";
        rightPanel.scrollLeft = savedScroll;
      }
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const clampZoom = useCallback((z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)), []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom((prev) => clampZoom(prev + delta));
    },
    [clampZoom]
  );

  const handleDoubleClick = useCallback(() => {
    setZoom((prev) => (prev > 1 ? 1 : 2));
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart(pan);
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan({ x: panStart.x + dx, y: panStart.y + dy });
    },
    [dragging, dragStart, panStart]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const lastTouchDistance = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delta = (distance - lastTouchDistance.current) * 0.005;
        lastTouchDistance.current = distance;
        setZoom((prev) => clampZoom(prev + delta));
      }
    },
    [clampZoom]
  );

  if (!isOpen) return null;

  const viewerContent = (
    <div className="zoom-overlay" onClick={onClose}>
      <div className="zoom-controls">
        <button onClick={(e) => { e.stopPropagation(); setZoom((z) => clampZoom(z - 0.5)); }} className="zoom-ctrl">
          &#x2212;
        </button>
        <span className="t-caption" style={{ color: "#F9F0E2", minWidth: "40px", textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={(e) => { e.stopPropagation(); setZoom((z) => clampZoom(z + 0.5)); }} className="zoom-ctrl">
          +
        </button>
        {zoom > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="zoom-ctrl"
            style={{ fontSize: "11px", width: "auto", padding: "0 12px" }}
          >
            RESET
          </button>
        )}
        <button onClick={onClose} className="zoom-ctrl zoom-close-btn">
          &#x2715;
        </button>
      </div>

      <div
        ref={containerRef}
        className="zoom-image-area"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
      >
        <div
          className="zoom-image-inner"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "#EDE5D4" }}
          >
            <div className="text-center">
              <span
                className="t-display"
                style={{ color: "rgba(50,32,20,0.15)", fontSize: "clamp(3rem, 8vw, 6rem)" }}
              >
                {sectionNumber || ""}
              </span>
              <p className="t-caption mt-4" style={{ color: "rgba(50,32,20,0.25)" }}>
                {photoTitle}
              </p>
              <p className="t-caption mt-1" style={{ color: "rgba(50,32,20,0.2)" }}>
                {photoCategory}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="zoom-bottom-info">
        <p className="t-caption" style={{ color: "rgba(249,240,226,0.5)" }}>
          scroll to zoom · double-click to toggle · drag to pan
        </p>
      </div>
    </div>
  );

  return createPortal(viewerContent, document.body);
}
