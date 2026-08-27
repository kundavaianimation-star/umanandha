"use client";

import { useEffect, useState, startTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Camera, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ photos: 0, perceptions: 0 });

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const [photosRes, perceptionsRes] = await Promise.all([
        supabase.from("photos").select("id", { count: "exact", head: true }),
        supabase.from("perceptions").select("id", { count: "exact", head: true }),
      ]);
      startTransition(() => {
        setStats({
          photos: photosRes.count ?? 0,
          perceptions: perceptionsRes.count ?? 0,
        });
      });
    };
    load();
  }, []);

  const cards = [
    { label: "Photos", value: stats.photos, icon: Camera, href: "/admin/photos" },
    { label: "Perceptions", value: stats.perceptions, icon: MessageSquare, href: "/admin/perceptions" },
  ];

  return (
    <div>
      <h1 className="t-h2 mb-8" style={{ color: "#322014" }}>Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="block p-5 border rounded transition-colors hover:bg-gray-50"
            style={{ borderColor: "rgba(50,32,20,0.1)", backgroundColor: "#fff" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <card.icon size={18} style={{ color: "#756E6B" }} />
              <span className="t-caption" style={{ color: "#756E6B", letterSpacing: "0.05em" }}>
                {card.label.toUpperCase()}
              </span>
            </div>
            <p className="t-display" style={{ fontSize: "2rem", color: "#322014" }}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="t-h4 mb-4" style={{ color: "#322014" }}>Quick Links</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/photos"
          className="px-4 py-2 t-caption border rounded"
          style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
        >
          Manage Photos
        </Link>
        <Link
          href="/admin/perceptions"
          className="px-4 py-2 t-caption border rounded"
          style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
        >
          Moderate Perceptions
        </Link>
        <Link
          href="/admin/content"
          className="px-4 py-2 t-caption border rounded"
          style={{ borderColor: "rgba(50,32,20,0.15)", color: "#322014" }}
        >
          Edit Content
        </Link>
      </div>
    </div>
  );
}
