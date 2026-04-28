// src/app/layout.tsx
import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Fraunces opsz axis exposed via variable; consumers set font-variation-settings explicitly per Phase 6 verhaal mode.
// Note: next/font requires omitting `weight` (or setting weight: "variable") when `axes` is declared,
// so Fraunces ships as a full variable-weight font (300–600 range covered by the wght axis).
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DataPraat",
  description: "Praat met je gemeentedata in eenvoudig Nederlands.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
