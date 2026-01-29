import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Clothing Store",
  description: "E-commerce platform for clothing products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Nav />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-primary-200 py-6 text-center text-sm text-gray-600">
          this is a nice footer line. don't look at me though. focus in the items!
        </footer>
      </body>
    </html>
  );
}
