"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAmbientAudio } from "@/context/AmbientAudioContext";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/perceptions", label: "Perceptions" },
  { href: "/about", label: "About" },
];

export function MobileHeader() {
  const pathname = usePathname();
  const { isPlaying, toggle, isReady } = useAmbientAudio();

  return (
    <header
      className="mobile-header sticky top-0 z-50 border-b"
      style={{ borderColor: "rgba(50,32,20,0.08)" }}
    >
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="t-display" style={{ fontSize: "1.05rem", lineHeight: 1 }}>
            UMANANDA
          </span>
          <span className="t-caption" style={{ color: "#4A0B0B" }}>
            ASSAM
          </span>
        </div>

        {isReady && (
          <button
            onClick={toggle}
            className="t-caption"
            style={{
              color: "#4A0B0B",
              border: "1px solid rgba(74,11,11,0.25)",
              borderRadius: "999px",
              padding: "6px 12px",
              background: "rgba(249,240,226,0.6)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            aria-label={isPlaying ? "Mute sound" : "Unmute sound"}
          >
            {isPlaying ? "🔊 ON" : "🔇 OFF"}
          </button>
        )}
      </div>

      <nav className="pb-3 px-5 flex justify-center">
        <ul
          className="inline-flex items-center"
          style={{
            border: "1px solid rgba(74,11,11,0.18)",
            borderRadius: "999px",
            padding: "6px 18px",
            background: "rgba(249,240,226,0.5)",
            whiteSpace: "nowrap",
            gap: "20px",
          }}
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn("t-nav block", active ? "font-semibold" : "")}
                  style={{
                    color: active ? "#4A0B0B" : "#756E6B",
                    borderBottom: active ? "1px solid #4A0B0B" : "none",
                    paddingBottom: "1px",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
