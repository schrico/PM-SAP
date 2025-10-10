"use client";

import "./globals.css";
import { ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamically import Header to avoid SSR hydration issues
const Header = dynamic(() => import("@/components/Header"), { ssr: false });

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
