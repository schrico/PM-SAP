"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
