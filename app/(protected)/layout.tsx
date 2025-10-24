"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/layout/Header"), {
  ssr: false,
});

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <>
      <Header />
      {/* main agora sem padding-top, colado ao header */}
      <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
    </>
  );
}
