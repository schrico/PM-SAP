"use client";

import "./globals.css";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";

// Dynamically import Header to avoid SSR hydration issues
const Header = dynamic(() => import("@/components/Header"), { ssr: false });

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
