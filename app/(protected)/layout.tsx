"use client";

import "./globals.css";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";

const Header = dynamic(() => import("@/components/layout/Header"), {
  ssr: false,
});

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        {/* main agora sem padding-top, colado ao header */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>

        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}