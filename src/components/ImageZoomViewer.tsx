"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface ImageZoomViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  photoTitle: string;
  photoCategory: string;
  sectionNumber: string | null;
}

export function ImageZoomViewer({
  isOpen,
  onClose,
  imageUrl,
  photoTitle,
  sectionNumber,
}: ImageZoomViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

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
      e.preventDefault();
      setDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...pan };
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({ x: panStartRef.current.x + dx, y: panStartRef.current.y + dy });
    },
    [dragging]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const lastTouchDistance = useRef<number>(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && zoom > 1) {
      setDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  }, [zoom, pan]);

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
      } else if (e.touches.length === 1 && dragging) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        setPan({ x: panStartRef.current.x + dx, y: panStartRef.current.y + dy });
      }
    },
    [clampZoom, dragging]
  );

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
  }, []);

  if (!isOpen) return null;

  const viewerContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(30, 18, 10, 0.95)",
      }}
    >
      {/* Controls */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 10,
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setZoom((z) => clampZoom(z - 0.5)); }}
          className="zoom-ctrl"
        >
          &#x2212;
        </button>
        <span className="t-caption" style={{ color: "#F9F0E2", minWidth: "40px", textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom((z) => clampZoom(z + 0.5)); }}
          className="zoom-ctrl"
        >
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

      {/* Image area */}
      <div
        onClick={onClose}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          userSelect: "none",
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
          touchAction: "none",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            transformOrigin: "center center",
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
            maxWidth: "90vw",
            maxHeight: "85vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={photoTitle}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              display: "block",
              pointerEvents: "none",
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom info */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        {sectionNumber && (
          <p className="t-caption" style={{ color: "rgba(249,240,226,0.4)" }}>
            {sectionNumber}
          </p>
        )}
        <p className="t-caption" style={{ color: "rgba(249,240,226,0.3)" }}>
          scroll to zoom · double-click to toggle · drag to pan
        </p>
      </div>
    </div>
  );

  return createPortal(viewerContent, document.body);
}
