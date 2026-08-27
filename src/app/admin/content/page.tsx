"use client";

import { useEffect, useState, useCallback, useRef, startTransition } from "react";
import { createClient } from "@/utils/supabase/client";

const FIELDS = [
  { key: "site_name", label: "Site Name", type: "input" },
  { key: "location", label: "Location", type: "input" },
  { key: "date", label: "Date", type: "input" },
  { key: "hero_title", label: "Homepage Title", type: "input" },
  { key: "hero_description", label: "Homepage Description", type: "textarea" },
  { key: "about_text", label: "About Text", type: "textarea" },
  { key: "credits_design", label: "Design Credit", type: "input" },
  { key: "credits_images", label: "Image & Content Credits", type: "textarea" },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const loadContent = useCallback(async () => {
    const { data } = await supabase.from("site_content").select("*");
    startTransition(() => {
      const map: Record<string, string> = {};
      data?.forEach((item) => {
        map[item.key] = item.value;
      });
      setContent(map);
      setLoading(false);
    });
  }, [supabase]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `hero_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
      setContent((prev) => ({ ...prev, hero_image_url: data.publicUrl }));
    } catch (err) {
      console.error("Hero image upload failed:", err);
    } finally {
      setUploading(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = FIELDS.map((field) =>
      supabase
        .from("site_content")
        .upsert({
          key: field.key,
          value: content[field.key] || "",
          updated_at: new Date().toISOString(),
        })
        .eq("key", field.key)
    );
    if (content.hero_image_url) {
      updates.push(
        supabase
          .from("site_content")
          .upsert({
            key: "hero_image_url",
            value: content.hero_image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("key", "hero_image_url")
      );
    }
    await Promise.all(updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return <p className="t-caption" style={{ color: "#756E6B" }}>Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="t-h2" style={{ color: "#322014" }}>Content</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 t-caption transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#4A0B0B", color: "#F9F0E2", border: "none", cursor: "pointer" }}
        >
          {saving ? "SAVING..." : saved ? "SAVED!" : "SAVE"}
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Homepage image */}
        <div>
          <label className="t-caption block mb-2" style={{ color: "#4A0B0B", letterSpacing: "0.05em" }}>
            HOMEPAGE IMAGE
          </label>
          <input
            ref={heroFileRef}
            type="file"
            accept="image/*"
            onChange={handleHeroImageChange}
            className="w-full t-p2 mb-2"
            style={{ color: "#322014" }}
          />
          {content.hero_image_url ? (
            <div
              style={{
                marginTop: "8px",
                border: "1px solid rgba(50,32,20,0.12)",
                borderRadius: "2px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#EDE5D4",
                maxHeight: "240px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.hero_image_url}
                alt="Homepage"
                style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "240px" }}
              />
            </div>
          ) : (
            <p className="t-caption" style={{ color: "#756E6B" }}>
              No homepage image uploaded yet. {uploading ? "Uploading..." : ""}
            </p>
          )}
        </div>

        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="t-caption block mb-2" style={{ color: "#4A0B0B", letterSpacing: "0.05em" }}>
              {field.label.toUpperCase()}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={content[field.key] || ""}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                rows={4}
                className="w-full px-3 py-2 t-p2 border rounded resize-none"
                style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
              />
            ) : (
              <input
                type="text"
                value={content[field.key] || ""}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full px-3 py-2 t-p2 border rounded"
                style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
