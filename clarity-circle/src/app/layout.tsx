import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: { default: "Clarity Circle", template: "%s | Clarity Circle" },
  description: "A calm, inclusive growth ecosystem for habits, challenges, community, and self-improvement.",
  keywords: ["personal development", "habits", "community", "growth", "wellness", "challenges"],
  openGraph: {
    title: "Clarity Circle",
    description: "A calm, inclusive growth ecosystem for habits, challenges, community, and self-improvement.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
