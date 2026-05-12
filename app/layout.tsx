import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "StepOff",
  description: "Industrial-grade marching band sync and visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="business" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
