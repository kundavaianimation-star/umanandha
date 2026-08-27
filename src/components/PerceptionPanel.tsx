"use client";

import { useState } from "react";
import type { Perception } from "@/lib/types";
import { PerceptionList } from "./PerceptionList";

interface PerceptionPanelProps {
  photoId: string;
  existingPerceptions: Perception[];
}

export function PerceptionPanel({
  photoId,
  existingPerceptions,
}: PerceptionPanelProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [localPerceptions, setLocalPerceptions] = useState<Perception[]>([]);

  const allPerceptions = [...existingPerceptions, ...localPerceptions];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newPerception: Perception = {
      id: `local-${Date.now()}`,
      photo_id: photoId,
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    setLocalPerceptions((prev) => [...prev, newPerception]);
    setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="pt-8 pb-4" style={{ borderTop: "1px solid rgba(74,11,11,0.08)" }}>
      <p className="t-p1-bold mb-6">
        What does this photograph make you think or feel?
      </p>

      <form onSubmit={handleSubmit} className="mb-10">
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
            disabled={!text.trim()}
            className="t-nav transition-opacity disabled:opacity-25"
            style={{ color: "#4A0B0B" }}
          >
            SUBMIT
          </button>
          <span className="t-caption" style={{ color: "#4A0B0B" }}>
            anonymous
          </span>
          {submitted && (
            <span className="t-caption anim-fade-in" style={{ color: "#4BAF4F" }}>
              Thank you.
            </span>
          )}
        </div>
      </form>

      {allPerceptions.length > 0 && (
        <PerceptionList perceptions={allPerceptions} />
      )}
    </div>
  );
}
