import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAY IT — Smart Administration & Yield Intelligence Tracker",
  description: "Unified workplace platform combining attendance, project management, ideas, real-time chat, and analytics.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-text" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
