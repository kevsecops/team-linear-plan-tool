import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Calendar",
  description: "Team calendar for tracking marketing events, PTO, and team activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

