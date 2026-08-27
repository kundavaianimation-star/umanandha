"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, startTransition } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/perceptions", label: "Perceptions" },
  { href: "/admin/content", label: "Content" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(() => pathname !== "/admin/login");

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      startTransition(() => {
        if (!data.user) {
          router.push("/admin/login");
        }
        setLoading(false);
      });
    });
  }, [pathname, router, isLoginPage]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  // Login page — no admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state — check auth
  if (loading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: "#F9F0E2" }}
      >
        <p className="t-caption" style={{ color: "#756E6B" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: "#F9F0E2" }}>
      <header
        className="sticky top-0 z-50 flex items-center justify-between h-14 px-5 border-b"
        style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(50,32,20,0.08)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 t-link"
          style={{ color: "#756E6B" }}
        >
          <ArrowLeft size={14} />
          Back to site
        </Link>
        <div className="flex items-center gap-3">
          <span className="t-caption" style={{ color: "#756E6B" }}>ADMIN</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#322014" }}
          >
            <span className="t-caption" style={{ color: "#F9F0E2" }}>A</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 t-caption ml-2"
            style={{ color: "#756E6B", background: "none", border: "none", cursor: "pointer" }}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="flex">
        <aside
          className="hidden lg:block w-52 fixed left-0 top-14 bottom-0 p-5 border-r"
          style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(50,32,20,0.08)" }}
        >
          <nav className="flex flex-col gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm px-3 py-2 transition-colors rounded",
                  pathname === item.href ? "font-medium" : ""
                )}
                style={{
                  color: pathname === item.href ? "#322014" : "#756E6B",
                  backgroundColor: pathname === item.href ? "#F9F0E2" : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex"
          style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(50,32,20,0.08)" }}
        >
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 text-center py-3 t-caption"
              style={{ color: pathname === item.href ? "#322014" : "#756E6B" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 lg:ml-52 p-6 lg:p-10 pb-20 lg:pb-10 overflow-y-auto" style={{ height: "calc(100dvh - 56px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
