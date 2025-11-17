import "../styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Make.com Pinterest Automation Designer",
  description:
    "Design, simulate, and document Pinterest automations for Make.com (us2 region)."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className={`${inter.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
