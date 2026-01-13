"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <RealtimeProvider>
      <AppShell>{children}</AppShell>
    </RealtimeProvider>
  );
}
