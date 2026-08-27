"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg, type PixelCrop } from "@/lib/cropImage";
import { RotateCcw, RotateCw, Crop, ZoomIn, ZoomOut } from "lucide-react";

interface ImageEditorProps {
  imageSrc: string;
  onEditComplete: (blob: Blob) => void;
  onSkip: () => void;
}

const RATIO_PRESETS = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
];

export function ImageEditor({ imageSrc, onEditComplete, onSkip }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (blob) onEditComplete(blob);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectRatio(null);
  };

  const handleCropMode = () => {
    if (isCropping) {
      setIsCropping(false);
      setAspectRatio(null);
    } else {
      setIsCropping(true);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Crop area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "350px",
          backgroundColor: "#1a1a1a",
          borderRadius: "2px",
          overflow: "hidden",
          marginBottom: "12px",
        }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={isCropping && aspectRatio !== null ? aspectRatio : undefined}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          cropSize={isCropping ? undefined : undefined}
          showGrid={isCropping}
          style={{
            containerStyle: {
              width: "100%",
              height: "100%",
            },
          }}
        />
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2 mb-3">
        <ZoomOut size={14} style={{ color: "#756E6B", flexShrink: 0 }} />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: "#4A0B0B" }}
        />
        <ZoomIn size={14} style={{ color: "#756E6B", flexShrink: 0 }} />
        <span className="t-caption" style={{ color: "#756E6B", minWidth: "36px", textAlign: "right" }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Rotate controls */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setRotation((r) => r - 90)}
          className="p-2 rounded"
          style={{ border: "1px solid rgba(50,32,20,0.15)", color: "#4A0B0B", background: "#fff", cursor: "pointer" }}
        >
          <RotateCcw size={14} />
        </button>
        <span className="t-caption" style={{ color: "#756E6B" }}>
          {rotation}°
        </span>
        <button
          type="button"
          onClick={() => setRotation((r) => r + 90)}
          className="p-2 rounded"
          style={{ border: "1px solid rgba(50,32,20,0.15)", color: "#4A0B0B", background: "#fff", cursor: "pointer" }}
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* Crop toggle + ratio presets */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          type="button"
          onClick={handleCropMode}
          className="flex items-center gap-1 px-3 py-1.5 t-caption rounded"
          style={{
            border: isCropping ? "1px solid #4A0B0B" : "1px solid rgba(50,32,20,0.15)",
            color: isCropping ? "#F9F0E2" : "#4A0B0B",
            background: isCropping ? "#4A0B0B" : "#fff",
            cursor: "pointer",
          }}
        >
          <Crop size={12} />
          CROP
        </button>

        {isCropping && (
          <>
            {RATIO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setAspectRatio(preset.value)}
                className="px-2 py-1 t-caption rounded"
                style={{
                  border:
                    aspectRatio === preset.value
                      ? "1px solid #4A0B0B"
                      : "1px solid rgba(50,32,20,0.15)",
                  color: aspectRatio === preset.value ? "#F9F0E2" : "#756E6B",
                  background: aspectRatio === preset.value ? "#4A0B0B" : "#fff",
                  cursor: "pointer",
                }}
              >
                {preset.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 t-caption rounded"
          style={{
            border: "1px solid rgba(50,32,20,0.15)",
            color: "#756E6B",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          RESET
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-2 t-caption rounded"
          style={{
            border: "1px solid rgba(50,32,20,0.15)",
            color: "#4A0B0B",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          USE ORIGINAL
        </button>
        <button
          type="button"
          onClick={handleApplyCrop}
          disabled={processing}
          className="px-4 py-2 t-caption rounded"
          style={{
            border: "none",
            color: "#F9F0E2",
            background: "#4A0B0B",
            cursor: "pointer",
            opacity: processing ? 0.5 : 1,
          }}
        >
          {processing ? "PROCESSING..." : "APPLY CROP"}
        </button>
      </div>
    </div>
  );
}
