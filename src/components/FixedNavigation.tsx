"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BreathingImage } from "./BreathingImage";
import { fetchSiteContent } from "@/lib/api";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/perceptions", label: "Perceptions" },
  { href: "/about", label: "About" },
];

export function FixedNavigation() {
  const pathname = usePathname();
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSiteContent().then(setSiteContent).catch(() => {});
  }, []);

  const siteName = siteContent.site_name || "UMANANDA";
  const location = siteContent.location || "ASSAM";
  const date = siteContent.date || "23 · 08 · 2026";
  const description =
    siteContent.hero_title ||
    "A photographic perception archive documenting the Umananda Temple on Peacock Island — through collective anonymous observation.";
  const creditsDesign = siteContent.credits_design || "Kundavai";
  const creditsImages = siteContent.credits_images || "Kundavai MKS\nSabaahat Wani";

  return (
    <div
      className="h-full flex flex-col items-center px-8 lg:px-10 py-10 lg:py-12 text-center overflow-y-auto"
      style={{ color: "#F9F0E2" }}
    >
      {/* Navigation capsule — top */}
      <nav>
        <div
          className="inline-flex items-center gap-7"
          style={{
            backgroundColor: "rgba(249,240,226,0.12)",
            borderRadius: "9999px",
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingTop: "14px",
            paddingBottom: "14px",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item t-nav")}
              style={{
                color: pathname === item.href ? "#FF423F" : "#F9F0E2",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "normal",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Title block */}
      <div className="mt-10">
        <h1
          className="t-display mb-0"
          style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", color: "#F9F0E2" }}
        >
          {siteName}
        </h1>
        <p className="t-caption" style={{ color: "#F9F0E2", letterSpacing: "0.1em" }}>
          {location}
        </p>
        <p
          className="t-caption mt-4"
          style={{ color: "#F9F0E2", letterSpacing: "0.12em" }}
        >
          {date}
        </p>
      </div>

      {/* Large image area — 72% width, 3:2 ratio, centered */}
      <div className="hidden lg:flex justify-center w-full mt-10">
        <BreathingImage>
          <div
            className="flex items-center justify-center cursor-pointer border border-dashed transition-colors overflow-hidden"
            style={{
              width: "72%",
              aspectRatio: "3 / 2",
              borderColor: "rgba(249,240,226,0.18)",
              backgroundColor: "rgba(249,240,226,0.04)",
            }}
            title="Admin: Upload image"
          >
            <p
              className="t-caption text-center"
              style={{ color: "#F9F0E2", opacity: 0.5, letterSpacing: "0.1em" }}
            >
              UPLOAD IMAGE
            </p>
          </div>
        </BreathingImage>
      </div>

      {/* Description */}
      <p
        className="t-p3 mt-8"
        style={{ color: "#F9F0E2", maxWidth: "420px", lineHeight: "1.75" }}
      >
        {description}
      </p>

      {/* Credits */}
      <div className="mt-8 mb-4">
        <p className="t-caption" style={{ color: "#F9F0E2", opacity: 0.5 }}>
          &copy; 2026 {siteName} Perceptions
        </p>
        <p className="t-caption mt-3" style={{ color: "#F9F0E2", opacity: 0.5, lineHeight: "1.8" }}>
          Website Design & Development<br />
          {creditsDesign}
        </p>
        <p className="t-caption mt-3" style={{ color: "#F9F0E2", opacity: 0.5, lineHeight: "1.8" }}>
          Image & Content Credits<br />
          {creditsImages.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < creditsImages.split("\n").length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
