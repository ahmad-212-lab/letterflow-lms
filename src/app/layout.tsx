import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LetterFlow - Digital Correspondence Simplified",
  description: "Enterprise-grade Letter Management System",
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
