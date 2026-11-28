import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../quantum/ui";
import { QuantumIdProvider } from "../quantum/id";

// Font variables live on <html> so the kit's --q-font-sans / --q-font-mono (defined on :root) resolve.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantum Mind",
  description: "AI study browser with an omnibox, reader mode and an AI tutor grounded in your tabs.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
  ],
};

// Applies the saved Quantum theme before first paint so the browser never flashes the wrong theme
// (same script as quantum-suite/apps/hub/src/app/layout.tsx).
const themeBootstrap = `(function(){try{var t=localStorage.getItem("quantum.theme")||"dark";if(t==="system"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="bg-canvas font-sans text-fg antialiased">
        {/* The browser page (src/app/page.tsx) renders the QuantumShell itself: its tabs, reader mode and
            panels are page state that the top bar, rail and assistant all read. */}
        <ThemeProvider>
          <QuantumIdProvider tool="mind">{children}</QuantumIdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
