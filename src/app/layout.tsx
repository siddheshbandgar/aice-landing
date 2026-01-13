import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "AICE - Master AI. Stay Ahead.",
  description: "Join 10,000+ learners getting weekly AI insights. Discover cutting-edge tools, practical tips, and courses that move the needle on your AI journey.",
  keywords: ["AI", "artificial intelligence", "AI courses", "AI newsletter", "machine learning", "AI tools", "AI tutorials"],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
