"use client";

import { useEffect, useState, useCallback, startTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { Trash2 } from "lucide-react";

interface PerceptionWithPhoto {
  id: string;
  photo_id: string;
  content: string;
  created_at: string;
  photos: { title: string } | null;
}

export default function AdminPerceptionsPage() {
  const [perceptions, setPerceptions] = useState<PerceptionWithPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const loadPerceptions = useCallback(async () => {
    const { data } = await supabase
      .from("perceptions")
      .select("*, photos(title)")
      .order("created_at", { ascending: false });
    startTransition(() => {
      setPerceptions(data ?? []);
      setLoading(false);
    });
  }, [supabase]);

  useEffect(() => {
    loadPerceptions();
  }, [loadPerceptions]);

  const handleDelete = async (id: string) => {
    await supabase.from("perceptions").delete().eq("id", id);
    setDeleteConfirm(null);
    await loadPerceptions();
  };

  if (loading) {
    return <p className="t-caption" style={{ color: "#756E6B" }}>Loading...</p>;
  }

  return (
    <div>
      <h1 className="t-h2 mb-8" style={{ color: "#322014" }}>Perceptions</h1>

      {perceptions.length === 0 ? (
        <p className="t-p2" style={{ color: "#756E6B" }}>No perceptions yet.</p>
      ) : (
        <div className="space-y-3">
          {perceptions.map((p) => (
            <div
              key={p.id}
              className="p-4 border rounded"
              style={{ borderColor: "rgba(50,32,20,0.1)", backgroundColor: "#fff" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="t-caption mb-2" style={{ color: "#756E6B" }}>
                    PHOTO: {p.photos?.title ?? "Unknown"}
                  </p>
                  <p className="t-p2" style={{ color: "#322014" }}>
                    &ldquo;{p.content}&rdquo;
                  </p>
                  <p className="t-caption mt-2" style={{ color: "#756E6B" }}>
                    {new Date(p.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {deleteConfirm === p.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(p.id)}
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
                      onClick={() => setDeleteConfirm(p.id)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} style={{ color: "#FF423F" }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
