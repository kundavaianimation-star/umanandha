"use client";

import { useEffect, useState, useCallback, useRef, startTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Photo } from "@/lib/types";
import { ImageEditor } from "@/components/admin/ImageEditor";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("display_order", { ascending: true });
    startTransition(() => {
      setPhotos(data ?? []);
      setLoading(false);
    });
  }, [supabase]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const resetForm = () => {
    setTitle("");
    setCaption("");
    setCategory("");
    setLocation("");
    setDisplayOrder(0);
    setExistingImageUrl("");
    setEditingPhoto(null);
    setImagePreview(null);
    setEditedBlob(null);
    setShowEditor(false);
  };

  const openAddModal = () => {
    resetForm();
    setDisplayOrder(photos.length + 1);
    setShowModal(true);
  };

  const openEditModal = (photo: Photo) => {
    setEditingPhoto(photo);
    setTitle(photo.title);
    setCaption(photo.caption);
    setCategory(photo.category);
    setLocation(photo.location);
    setDisplayOrder(photo.display_order);
    setExistingImageUrl(photo.image_url);
    setImagePreview(photo.image_url);
    setEditedBlob(null);
    setShowEditor(false);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setEditedBlob(null);
    setShowEditor(true);
  };

  const uploadImage = async (blob: Blob, fileName: string): Promise<string> => {
    const { error } = await supabase.storage
      .from("photos")
      .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) throw error;
    const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = existingImageUrl;

      if (editedBlob) {
        const fileExt = "jpg";
        const fileName = `photo_${Date.now()}.${fileExt}`;
        imageUrl = await uploadImage(editedBlob, fileName);
      } else if (imagePreview && imagePreview !== existingImageUrl) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const fileExt = "jpg";
        const fileName = `photo_${Date.now()}.${fileExt}`;
        imageUrl = await uploadImage(blob, fileName);
      }

      const photoData = {
        title,
        caption,
        category,
        location,
        display_order: displayOrder,
        image_url: imageUrl,
      };

      if (editingPhoto) {
        await supabase
          .from("photos")
          .update({ ...photoData, updated_at: new Date().toISOString() })
          .eq("id", editingPhoto.id);
      } else {
        await supabase.from("photos").insert(photoData);
      }

      setShowModal(false);
      resetForm();
      await loadPhotos();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("photos").delete().eq("id", id);
    setDeleteConfirm(null);
    await loadPhotos();
  };

  const handleMove = async (photo: Photo, direction: "up" | "down") => {
    const idx = photos.findIndex((p) => p.id === photo.id);
    if (direction === "up" && idx > 0) {
      const other = photos[idx - 1];
      await Promise.all([
        supabase.from("photos").update({ display_order: other.display_order }).eq("id", photo.id),
        supabase.from("photos").update({ display_order: photo.display_order }).eq("id", other.id),
      ]);
    } else if (direction === "down" && idx < photos.length - 1) {
      const other = photos[idx + 1];
      await Promise.all([
        supabase.from("photos").update({ display_order: other.display_order }).eq("id", photo.id),
        supabase.from("photos").update({ display_order: photo.display_order }).eq("id", other.id),
      ]);
    }
    await loadPhotos();
  };

  if (loading) {
    return <p className="t-caption" style={{ color: "#756E6B" }}>Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="t-h2" style={{ color: "#322014" }}>Photos</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 t-caption"
          style={{ backgroundColor: "#4A0B0B", color: "#F9F0E2", border: "none", cursor: "pointer" }}
        >
          <Plus size={14} />
          ADD PHOTO
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="t-p2" style={{ color: "#756E6B" }}>
          No photos yet. Click &quot;ADD PHOTO&quot; to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center gap-4 p-4 border rounded"
              style={{ borderColor: "rgba(50,32,20,0.1)", backgroundColor: "#fff" }}
            >
              <div
                className="w-16 h-12 flex-shrink-0 flex items-center justify-center rounded overflow-hidden"
                style={{ backgroundColor: "#EDE5D4" }}
              >
                {photo.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.image_url} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="t-caption" style={{ color: "rgba(50,32,20,0.2)" }}>
                    {String(photo.display_order).padStart(2, "0")}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="t-p2 font-medium truncate" style={{ color: "#322014" }}>
                  {photo.title}
                </p>
                <p className="t-caption truncate" style={{ color: "#756E6B" }}>
                  {photo.category} · {photo.location} · Order: {photo.display_order}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(photo, "up")}
                  className="p-1.5 hover:bg-gray-100 rounded"
                  title="Move up"
                >
                  <ArrowUp size={14} style={{ color: "#756E6B" }} />
                </button>
                <button
                  onClick={() => handleMove(photo, "down")}
                  className="p-1.5 hover:bg-gray-100 rounded"
                  title="Move down"
                >
                  <ArrowDown size={14} style={{ color: "#756E6B" }} />
                </button>
                <button
                  onClick={() => openEditModal(photo)}
                  className="p-1.5 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Pencil size={14} style={{ color: "#756E6B" }} />
                </button>
                {deleteConfirm === photo.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="px-2 py-1 t-caption rounded"
                      style={{ backgroundColor: "#FF423F", color: "#fff", border: "none", cursor: "pointer" }}
                    >
                      DELETE
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 t-caption rounded"
                      style={{ backgroundColor: "#EDE5D4", color: "#322014", border: "none", cursor: "pointer" }}
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(photo.id)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} style={{ color: "#FF423F" }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg p-6 rounded overflow-y-auto"
            style={{ backgroundColor: "#fff", maxHeight: "90dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="t-h3" style={{ color: "#322014" }}>
                {editingPhoto ? "Edit Photo" : "Add Photo"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={18} style={{ color: "#756E6B" }} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Image section */}
              <div className="mb-4">
                <label className="t-caption block mb-1" style={{ color: "#4A0B0B" }}>
                  IMAGE
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full t-p2"
                  style={{ color: "#322014" }}
                />
              </div>

              {/* Image preview + editor */}
              {imagePreview && (
                <div className="mb-4">
                  <p className="t-caption mb-2" style={{ color: "#756E6B" }}>
                    {editedBlob
                      ? "Edited image ready to save"
                      : showEditor
                        ? "Adjust crop, zoom and rotation below"
                        : "Current image — click Choose File to replace"}
                  </p>
                  {!showEditor && (
                    <div
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        overflow: "hidden",
                        border: "1px solid rgba(50,32,20,0.12)",
                        borderRadius: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#EDE5D4",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editedBlob ? URL.createObjectURL(editedBlob) : imagePreview}
                        alt="Preview"
                        style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "300px" }}
                      />
                    </div>
                  )}
                  {showEditor && imagePreview && (
                    <ImageEditor
                      imageSrc={imagePreview}
                      onEditComplete={(blob) => {
                        setEditedBlob(blob);
                        setShowEditor(false);
                      }}
                      onSkip={() => {
                        setShowEditor(false);
                      }}
                    />
                  )}
                  {editedBlob && !showEditor && (
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditedBlob(null);
                          setShowEditor(true);
                        }}
                        className="px-3 py-1.5 t-caption rounded"
                        style={{ border: "1px solid rgba(50,32,20,0.15)", color: "#4A0B0B", background: "#fff", cursor: "pointer" }}
                      >
                        RE-EDIT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditedBlob(null);
                          setImagePreview(null);
                          setShowEditor(false);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="px-3 py-1.5 t-caption rounded"
                        style={{ border: "1px solid rgba(50,32,20,0.15)", color: "#FF423F", background: "#fff", cursor: "pointer" }}
                      >
                        REMOVE IMAGE
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="t-caption block mb-1" style={{ color: "#4A0B0B" }}>
                  TITLE
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 t-p2 border rounded"
                  style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
                />
              </div>

              <div className="mb-4">
                <label className="t-caption block mb-1" style={{ color: "#4A0B0B" }}>
                  CAPTION
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 t-p2 border rounded resize-none"
                  style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="t-caption block mb-1" style={{ color: "#4A0B0B" }}>
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 t-p2 border rounded"
                    style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
                  />
                </div>
                <div>
                  <label className="t-caption block mb-1" style={{ color: "#4A0B0B" }}>
                    LOCATION
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 t-p2 border rounded"
                    style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="t-caption block mb-1" style={{ color: "#4A0B0B" }}>
                  DISPLAY ORDER
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  min={1}
                  className="w-24 px-3 py-2 t-p2 border rounded"
                  style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 t-caption transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#4A0B0B", color: "#F9F0E2", border: "none", cursor: "pointer" }}
              >
                {saving ? "SAVING..." : editingPhoto ? "UPDATE" : "CREATE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
