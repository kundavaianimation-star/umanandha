import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AudioShell } from "@/components/AudioShell";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nav",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Umananda — Visual Ethnography of the Sacred",
  description:
    "An interactive visual ethnography exploring the Umananda Temple on Peacock Island, Assam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <body>
        <AudioShell>{children}</AudioShell>
      </body>
    </html>
  );
}
