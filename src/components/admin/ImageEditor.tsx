"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import {
  getCroppedImg,
  processImage,
  buildPreviewFilter,
  type PixelCrop,
  type Adjustments,
} from "@/lib/cropImage";
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

const FILTER_PRESETS = [
  { label: "Original", value: "original" },
  { label: "B&W", value: "bw" },
  { label: "Warm", value: "warm" },
  { label: "Cool", value: "cool" },
  { label: "Faded", value: "faded" },
  { label: "High Contrast", value: "high-contrast" },
];

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  filter: "original",
};

export function ImageEditor({ imageSrc, onEditComplete, onSkip }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT_ADJUSTMENTS });

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const updatePreview = useCallback(
    (adj: Adjustments, rot: number) => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(async () => {
        try {
          const blob = await processImage(imageSrc, rot, adj);
          if (blob) {
            const url = URL.createObjectURL(blob);
            setPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
          }
        } catch {
          // preview generation failed silently
        }
      }, 300);
    },
    [imageSrc]
  );

  const setBrightness = (v: number) => {
    const next = { ...adjustments, brightness: v };
    setAdjustments(next);
    updatePreview(next, rotation);
  };

  const setContrast = (v: number) => {
    const next = { ...adjustments, contrast: v };
    setAdjustments(next);
    updatePreview(next, rotation);
  };

  const setSaturation = (v: number) => {
    const next = { ...adjustments, saturation: v };
    setAdjustments(next);
    updatePreview(next, rotation);
  };

  const setFilter = (v: string) => {
    const next = { ...adjustments, filter: v };
    setAdjustments(next);
    updatePreview(next, rotation);
  };

  const handleRotate = (delta: number) => {
    const next = rotation + delta;
    setRotation(next);
    updatePreview(adjustments, next);
  };

  const hasAdjustments =
    adjustments.brightness !== 0 ||
    adjustments.contrast !== 0 ||
    adjustments.saturation !== 0 ||
    adjustments.filter !== "original" ||
    rotation !== 0;

  const handleApplyAll = async () => {
    setProcessing(true);
    try {
      if (isCropping && croppedAreaPixels) {
        const blob = await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          rotation,
          adjustments
        );
        if (blob) onEditComplete(blob);
      } else if (hasAdjustments) {
        const blob = await processImage(imageSrc, rotation, adjustments);
        if (blob) onEditComplete(blob);
      } else {
        onSkip();
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectRatio(null);
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleCropMode = () => {
    if (isCropping) {
      setIsCropping(false);
      setAspectRatio(null);
    } else {
      setIsCropping(true);
    }
  };

  const liveFilter = buildPreviewFilter(adjustments);

  return (
    <div style={{ width: "100%" }}>
      {/* Crop area with live filter overlay */}
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: liveFilter,
            zIndex: 1,
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
            showGrid={isCropping}
            style={{
              containerStyle: {
                width: "100%",
                height: "100%",
              },
            }}
          />
        </div>
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
          onClick={() => handleRotate(-90)}
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
          onClick={() => handleRotate(90)}
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
        {isCropping &&
          RATIO_PRESETS.map((preset) => (
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
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(50,32,20,0.08)", margin: "12px 0" }} />

      {/* Brightness */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="t-caption" style={{ color: "#4A0B0B" }}>BRIGHTNESS</label>
          <span className="t-caption" style={{ color: "#756E6B" }}>{adjustments.brightness}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={adjustments.brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "#4A0B0B" }}
        />
      </div>

      {/* Contrast */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="t-caption" style={{ color: "#4A0B0B" }}>CONTRAST</label>
          <span className="t-caption" style={{ color: "#756E6B" }}>{adjustments.contrast}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={adjustments.contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "#4A0B0B" }}
        />
      </div>

      {/* Saturation */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="t-caption" style={{ color: "#4A0B0B" }}>SATURATION</label>
          <span className="t-caption" style={{ color: "#756E6B" }}>{adjustments.saturation}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={adjustments.saturation}
          onChange={(e) => setSaturation(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "#4A0B0B" }}
        />
      </div>

      {/* Filters */}
      <div className="mb-3">
        <label className="t-caption block mb-1" style={{ color: "#4A0B0B" }}>FILTER</label>
        <div className="flex gap-1 flex-wrap">
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setFilter(preset.value)}
              className="px-2 py-1 t-caption rounded"
              style={{
                border:
                  adjustments.filter === preset.value
                    ? "1px solid #4A0B0B"
                    : "1px solid rgba(50,32,20,0.15)",
                color: adjustments.filter === preset.value ? "#F9F0E2" : "#756E6B",
                background: adjustments.filter === preset.value ? "#4A0B0B" : "#fff",
                cursor: "pointer",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(50,32,20,0.08)", margin: "12px 0" }} />

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
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
          onClick={handleApplyAll}
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
          {processing ? "PROCESSING..." : hasAdjustments || isCropping ? "APPLY EDIT" : "APPLY"}
        </button>
      </div>

      <canvas ref={previewCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
