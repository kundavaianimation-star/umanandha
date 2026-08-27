"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/perceptions", label: "Perceptions" },
  { href: "/about", label: "About" },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 mobile-header border-b" style={{ borderColor: "rgba(50,32,20,0.08)" }}>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <span className="t-display text-base leading-none" style={{ fontSize: "1rem" }}>
            UMANANDA
          </span>
          <span
            className="t-caption ml-3"
            style={{ color: "#4A0B0B", verticalAlign: "middle" }}
          >
            ASSAM
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="t-nav"
          style={{ color: "#4A0B0B" }}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>

      {open && (
        <nav className="px-5 pb-5 anim-fade-in">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "t-nav block py-1",
                    pathname === item.href ? "font-semibold" : ""
                  )}
                  style={{
                    color:
                      pathname === item.href ? "#4A0B0B" : "#4A0B0B",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
