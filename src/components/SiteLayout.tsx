"use client";

import { FixedNavigation } from "./FixedNavigation";
import { MobileHeader } from "./MobileHeader";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className="hidden lg:grid h-dvh overflow-hidden"
        style={{ gridTemplateColumns: "40% 60%" }}
      >
        <aside
          className="h-dvh overflow-hidden relative"
          style={{ backgroundColor: "#4A0B0B" }}
        >
          <FixedNavigation />
        </aside>

        <main
          className="h-dvh overflow-x-auto overflow-y-hidden right-scroll-h"
          style={{ backgroundColor: "#F9F0E2" }}
        >
          {children}
        </main>
      </div>

      <div className="lg:hidden min-h-dvh" style={{ backgroundColor: "#F9F0E2" }}>
        <MobileHeader />
        <main>{children}</main>
      </div>
    </>
  );
}
